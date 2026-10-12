class TasksController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource except: [ :index, :create, :update ]

  def index
    return render json: {}, status: :bad_request unless params[:release_id]

    release = Release.find(params[:release_id])
    authorize! :index, Task.new(workspace_id: release.workspace_id)

    @tasks = release.tasks
  end

  def create
    release = Release.find(tasks_params[:release_id]) if tasks_params[:release_id].present?
    workspace_id = release ? release.workspace_id : tasks_params[:workspace_id]
    authorize! :create, Task.new(workspace_id: workspace_id)

    attrs = tasks_params.to_h.except(:order).merge(workspace_id: workspace_id)
    attrs[:status] = Task.statuses[:backlog] unless release

    ActiveRecord::Base.transaction do
      locked_orders = Task.where(
        workspace_id: workspace_id,
        status: attrs[:status],
        release_id: attrs[:release_id]
      ).lock.pluck(:order)

      @task = Task.create!(attrs.merge(order: (locked_orders.max || -1) + 1))
      Document.create!(task: @task, name: @task.code_name, owner: current_user, workspace_id: workspace_id)
    end

    @task.broadcast_to_release("task_created", current_user)
    @task
  end

  def update
    @task = Task.includes(:user).find(params[:id])
    authorize! :update, @task

    ActiveRecord::Base.transaction do
      if tasks_params[:order].present?
        old_status = @task.status
        old_order  = @task.order
        new_status = tasks_params[:status] || old_status
        new_order  = tasks_params[:order]

        if old_status == new_status
          if new_order != old_order
            if new_order < old_order
              @task.workspace.tasks
                  .where(status: old_status, release_id: @task.release_id)
                  .where("\"order\" >= ? AND \"order\" < ?", new_order, old_order)
                  .where.not(id: @task.id)
                  .update_all("\"order\" = \"order\" + 1")
            else
              @task.workspace.tasks
                  .where(status: old_status, release_id: @task.release_id)
                  .where("\"order\" > ? AND \"order\" <= ?", old_order, new_order)
                  .where.not(id: @task.id)
                  .update_all("\"order\" = \"order\" - 1")
            end
          end
        else
          @task.workspace.tasks
              .where(status: old_status, release_id: @task.release_id)
              .where("\"order\" > ?", old_order)
              .update_all("\"order\" = \"order\" - 1")

          @task.workspace.tasks
              .where(status: new_status, release_id: @task.release_id)
              .where("\"order\" >= ?", new_order)
              .update_all("\"order\" = \"order\" + 1")
        end

        @task.update!(order: new_order, status: new_status)
      elsif tasks_params[:status].present? && tasks_params[:status] != @task.status
        @task.update!(status: tasks_params[:status])
      end
    end

    attrs = tasks_params.to_h.except(:order, :status)

    if attrs[:user_id].present?
      attrs[:user_id] = nil if attrs[:user_id].to_i == @task.user_id
    end

    @task.update!(attrs) if attrs.present?
    @task.broadcast_to_release("task_updated", current_user)
    render json: { task: @task, user: @task.user }, status: :created
  end

  def destroy
    task = Task.find(params[:id])
    task.broadcast_to_release("task_destroyed", current_user)
    task.destroy!

    render json: {}, status: :ok
  end

  def move_to_next_release
    task = Task.find(params[:id])
    next_release = task.release.next_release
    if next_release
      task.update!(release_id: next_release.id)
    end
  end

  private

  ALLOWED_PARAMS = [:name, :status, :priority, :order, :user_id, :release_id, :workspace_id]

  def tasks_params
    params.permit(ALLOWED_PARAMS)
  end
end
