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
    release_id = tasks_params[:release_id]
    status = release_id.present? ? tasks_params[:status] : "backlog"

    @task = Task.new(
      name: tasks_params[:name],
      release_id: release_id,
      status: status,
      workspace_id: tasks_params[:workspace_id]
    )
    authorize! :create, @task

    @task.save!
    Document.create!(task: @task, name: @task.code_name, owner: current_user, workspace_id: @task.workspace_id)

    @task.broadcast_to_release("task_created", current_user)
    render "show"
  end

  def update
    @task = Task.includes(:user).find(params[:id])
    authorize! :update, @task

    attrs = tasks_params.to_h.except(:position, :status)
    attrs[:user_id] = nil if attrs[:user_id].present? && attrs[:user_id].to_i == @task.user_id

    old_status = @task.status
    new_status = tasks_params[:status].presence || old_status

    ActiveRecord::Base.transaction do
      if new_status != old_status
        status_attrs = { status: new_status }

        if new_status == "in_progress" && old_status == "todo" &&
           @task.user_id.nil? && @task.workspace.auto_assign
          status_attrs[:user] = current_user
        end

        @task.update!(status_attrs)
      end

      @task.insert_at(tasks_params[:position].to_i) if tasks_params[:position].present?
      @task.update!(attrs) if attrs.present?
    end

    @task.broadcast_to_release("task_updated", current_user)
    render json: { task: @task, user: @task.user }, status: :created
  end

  def destroy
    task = Task.find(params[:id])
    task.broadcast_to_release("task_destroyed", current_user)
    task.destroy!
  end

  def move_to_next_release
    task = Task.find(params[:id])
    next_release = task.release.next_release
    if next_release
      task.update!(release_id: next_release.id)
    end
  end

  private

  ALLOWED_PARAMS = [:name, :status, :priority, :position, :start_date, :due_date, :user_id, :release_id, :workspace_id]

  def tasks_params
    params.permit(ALLOWED_PARAMS)
  end
end
