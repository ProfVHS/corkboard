class TasksController < ApplicationController

  def index
    if params[:release_id]
      @tasks = Release.find(params[:release_id]).tasks
    else
      render json: {}, status: :bad_request
    end

    @tasks
  end

  def create
    if tasks_params[:release_id]
      release = Release.find(tasks_params[:release_id])
    else
      tasks_params[:status] = Task.statuses[:backlog]
    end

    workspace_id = release.present? ? release.workspace_id : tasks_params[:workspace_id]

    @task = Task.create!(tasks_params.merge(workspace_id: workspace_id))

    Document.create!(task: @task, owner: current_user, workspace_id: workspace_id)

    @task.broadcast_to_release("task_created", current_user)

    @task
  end

  def update
    task = Task.includes(:user).find(params[:id])

    if tasks_params[:order]
      if tasks_params[:status]
        if task.status != tasks_params[:status]
          task.workspace.tasks.where(status: task.status, order: task.order..., release_id: task.release_id).where.not(id: params[:id]).each do |t|
            order = t.order - 1
            t.update_column(:order, order)
          end
        end
      end

      order = tasks_params[:order]
      task.workspace.tasks.where(status: tasks_params[:status] || task.status, order: tasks_params[:order]..., release_id: task.release_id).where.not(id: params[:id]).each do |t|
        order = order + 1
        t.update_column(:order, order)
      end
    end

    attrs = tasks_params.to_h

    if attrs[:user_id].present?
      attrs[:user_id] = nil if attrs[:user_id].to_i == task.user_id
    end

    task.update!(attrs)
    task.broadcast_to_release("task_updated", current_user)
    render json: { task: task, user: task.user }, status: :created
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

  def tasks_params
    params.require(:task).permit(:name, :release_id, :status, :priority, :order, :user_id, :workspace_id)
  end
end
