class TasksController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource except: [ :index, :create, :update, :backlog ]

  def index
    return head :bad_request unless params[:release_id]

    release = Release.find(params[:release_id])
    authorize! :index, Task.new(workspace_id: release.workspace_id)

    render json: Task.state_for(release.id)
  end

  def backlog
    authorize! :index, Task.new(workspace_id: params[:id])
    render json: Task.backlog_state_for(params[:id])
  end

  def create
    release_id = tasks_params[:release_id].presence
    @task = Task.new(
      name: tasks_params[:name],
      release_id: release_id,
      status: release_id ? tasks_params[:status] : "backlog",
      workspace_id: tasks_params[:workspace_id]
    )
    authorize! :create, @task

    @task.save!
    Document.create!(task: @task, name: @task.code_name, owner: current_user, workspace_id: @task.workspace_id)

    if @task.release_id && @task.status != "backlog"
      ReleaseBroadcaster.broadcast(@task.release_id, "create_task", task: @task.as_broadcast)
    else
      WorkspaceBroadcaster.broadcast(@task.workspace_id, "create_backlog_task", task: @task.as_broadcast)
    end

    render "show"
  end

  def update
    @task = Task.includes(:user, :tags).find(params[:id])
    authorize! :update, @task
    workspace_id = @task.workspace_id
    release_id = @task.release_id

    attrs = params.permit(UPDATE_PARAMS).to_h
    attrs[:user_id] = nil if attrs[:user_id].present? && attrs[:user_id].to_s == @task.user_id.to_s

    @task.update!(attrs) if attrs.present?

    if release_id.present?
      ReleaseBroadcaster.broadcast(release_id, "update_task", task: @task.as_broadcast)
    else
      WorkspaceBroadcaster.broadcast(workspace_id, "update_backlog_task", task: @task.as_broadcast)
    end

    render json: { task: @task, user: @task.user }, status: :ok
  end

  def move
    @task = Task.includes(:user, :tags).find(params[:id])
    authorize! :update, @task

    move = params.permit(MOVE_PARAMS)

    old_release_id = @task.release_id
    old_status     = @task.status
    new_status     = move[:status].presence || old_status
    new_release_id = move.key?(:release_id) ? move[:release_id].presence : old_release_id

    scope_changes = {}
    scope_changes[:status]     = new_status     if new_status != old_status
    scope_changes[:release_id] = new_release_id if new_release_id != old_release_id

    if new_status == "in_progress" && old_status == "todo" && @task.user_id.nil? && @task.workspace.auto_assign
      scope_changes[:user] = current_user
    end

    ActiveRecord::Base.transaction do
      @task.update!(scope_changes) if scope_changes.any?
      @task.insert_at(move[:position].to_i) if move[:position].present?
    end

    release_id = new_release_id || old_release_id

    if old_release_id != new_release_id
      ReleaseBroadcaster.broadcast(
        release_id,
        "move_between_task",
        board_tasks:   Task.state_for(release_id),
        backlog_tasks: Task.backlog_state_for(@task.workspace_id)
      )
    elsif release_id
      ReleaseBroadcaster.broadcast(
        release_id,
        "move_board_task",
        tasks: Task.state_for(release_id)
      )
    else
      WorkspaceBroadcaster.broadcast(
        @task.workspace_id,
        "move_backlog_task",
        tasks: Task.backlog_state_for(@task.workspace_id)
      )
    end

    render json: { task: @task.as_broadcast }, status: :ok
  end

  def block
    ids = Array(update_params[:blocked_by_ids]).map(&:to_s).uniq - [@task.id.to_s]
    blockers = Task.where(workspace_id: @task.workspace_id, id: ids)
    raise ActiveRecord::RecordNotFound if blockers.size != ids.size

    existing = @task.blocked_tasks.pluck(:blocked_by_task_id).map(&:to_s)

    (blockers.map { |t| t.id.to_s } - existing).each do |id|
      @task.blocked_tasks.create!(blocked_by_task_id: id)
    end

    if @task.release_id.present?
      ReleaseBroadcaster.broadcast(@task.release_id, "update_task", task: @task.as_broadcast)
    else
      WorkspaceBroadcaster.broadcast(@task.workspace_id, "update_backlog_task", task: @task.as_broadcast)
    end
  end

  def unblock
    ids = Array(update_params[:blocked_by_ids]).map(&:to_s).uniq - [@task.id.to_s]

    @task.blocked_tasks.where(blocked_by_task_id: ids).destroy_all

    if @task.release_id.present?
      ReleaseBroadcaster.broadcast(@task.release_id, "update_task", task: @task.as_broadcast)
    else
      WorkspaceBroadcaster.broadcast(@task.workspace_id, "update_backlog_task", task: @task.as_broadcast)
    end
  end

  def destroy
    release_id, workspace_id = @task.release_id, @task.workspace_id
    @task.destroy!

    if release_id
      ReleaseBroadcaster.broadcast(release_id, "delete_task", tasks: Task.state_for(release_id))
    else
      WorkspaceBroadcaster.broadcast(workspace_id, "delete_backlog_task", tasks: Task.backlog_state_for(workspace_id))
    end

    head :no_content
  end

  def move_to_next_release
    old_release_id = @task.release_id
    next_release = @task.release&.next_release
    return head :unprocessable_entity unless next_release

    @task.update!(release_id: next_release.id)

    ReleaseBroadcaster.broadcast(old_release_id, "move_to_next_task", tasks: Task.state_for(old_release_id))

    head :no_content
  end

  private

  UPDATE_PARAMS = [:name, :priority, :start_date, :due_date, :user_id, blocked_by_ids: []]
  MOVE_PARAMS   = [:status, :position, :release_id]
  ALLOWED_PARAMS = UPDATE_PARAMS + MOVE_PARAMS + [:release_id, :workspace_id]

  def update_params
    params.permit(*UPDATE_PARAMS)
  end

  def tasks_params
    params.permit(ALLOWED_PARAMS)
  end
end
