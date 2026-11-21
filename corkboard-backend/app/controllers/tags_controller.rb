class TagsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  def index
    @tags = Tag.where(workspace_id: params[:workspace_id])
  end

  def update
    @tag = Tag.find(params[:id])
    @tag.update(tag_params)

    WorkspaceBroadcaster.broadcast(@tag.workspace_id, "update_tag", tag: @tag.as_broadcast)
    render :show
  end

  def create
    @tag = Tag.create!(tag_params.to_h)

    WorkspaceBroadcaster.broadcast(@tag.workspace_id, "create_tag", tag: @tag.as_broadcast)
    render :show
  end

  def destroy
    tag = @tag.destroy

    WorkspaceBroadcaster.broadcast(tag.workspace_id, "delete_tag", tag: tag.as_broadcast)
  end

  def assign
    @task = Task.find(params[:task_id])
    @tag = Tag.find(params[:id])

    @tasks_tag = TasksTag.create!(task: @task, tag: @tag)

    if @task.release_id.present?
      ReleaseBroadcaster.broadcast(@task.release_id, "update_task_tag", task: @task.as_broadcast)
    else
      WorkspaceBroadcaster.broadcast(@task.workspace_id, "update_backlog_task_tag", task: @task.as_broadcast)
    end
    render :show
  end

  def unassign
    @task = Task.find(params[:task_id])
    @tasks_tag = @task.tasks_tags.find_by!(tag_id: params[:id])

    @tasks_tag.destroy!
    @tag = Tag.find(params[:id])

    if @task.release_id.present?
      ReleaseBroadcaster.broadcast(@task.release_id, "update_task_tag", task: @task.as_broadcast)
    else
      WorkspaceBroadcaster.broadcast(@task.workspace_id, "update_backlog_task_tag", task: @task.as_broadcast)
    end

    render :show
  end

  private

  ALLOWED_PARAMS = [:name, :color, :workspace_id]

  def tag_params
    params.permit(ALLOWED_PARAMS)
  end
end
