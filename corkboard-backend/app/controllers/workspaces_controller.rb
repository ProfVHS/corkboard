class WorkspacesController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource :workspace, except: :accept_invitation

  def index
    @workspaces = current_user.workspaces
  end

  def create
    @workspace = current_user.workspaces.create!(workspace_params.merge(owner_id: current_user.id))
    render "workspaces/show"
  end

  def update
    @workspace = current_user.workspaces.find(params[:id])
    code_prefix_changed = @workspace.code_prefix != params[:code_prefix]
    @workspace&.update!(workspace_params)
    @workspace.rebuild_task_codes! if code_prefix_changed
    render "workspaces/show"
  end

  def show
    @workspace = Workspace.find(params[:id])
  end

  def destroy
    @workspace.destroy
  end

  def collaborators
    @workspace = Workspace.find(params[:id])
    @users = @workspace.users
    invited_user_ids = WorkspaceInvitation.where(workspace_id: params[:id]).pluck(:invited_user_id)
    @invited_users = User.where(id: invited_user_ids)
  end

  def invite_user
    username = params[:username]
    @user = User.find_by(username: username)
    return render json: { message: "User #{username} not found!" } if @user.nil?

    already_in_workspace = UsersWorkspaces.find_by(workspace_id: params[:id], user_id: @user&.id)
    return render json: { message: "User #{username} is already in workspace!" } if already_in_workspace

    already_invited = WorkspaceInvitation.find_by(invited_user_id: @user&.id, workspace_id: params[:id])
    return render json: { message: "User #{username} is already invited!" } if already_invited

    WorkspaceInvitation.create!(invited_user_id: @user&.id, workspace_id: params[:id], invited_by_user_id: current_user.id, status: "PENDING")
  end

  def invitation
    @invitation = WorkspaceInvitation.where(invited_user_id: current_user.id)
  end

  def backlog
    @tasks = Task.where(workspace_id: @workspace.id, status: Task.statuses[:backlog], release_id: nil)
  end

  def accept_invitation
    invitation = WorkspaceInvitation.find_by(invited_user_id: current_user.id, workspace_id: params[:id])
    authorize! :accept, invitation

    invitation.destroy! if invitation
    UsersWorkspaces.create!(workspace_id: params[:id], user_id: current_user.id)
    @workspace = invitation&.workspace
  end

  def decline_invitation
    WorkspaceInvitation.where(invited_user_id: current_user.id, workspace_id: params[:id]).delete_all
    render json: { message: "Decline invitation to #{params[:name]}" }, status: :ok
  end

  def cancel_invitation
    WorkspaceInvitation.where(invited_user_id: params[:invited_user_id], workspace_id: params[:id]).delete_all
    render json: { message: "Successfully cancel invitation" }, status: :ok
  end

  def delete_user
    UsersWorkspaces.where(workspace_id: params[:id], user_id: params[:user_id]).delete_all
    render json: { message: "User #{params[:username]} was removed from the workspace" }, status: :ok
  end

  def leave_workspace
    UsersWorkspaces.where(workspace_id: params[:id], user_id: current_user.id).delete_all
    @workspace = current_user.workspaces.first
  end

  def current_release
    workspace = Workspace.find(params[:id])
    @current_release = workspace.releases.find_by(current: true)

    # We use update_column here because ActiveRecord triggers full model validations
    current_user.update_column(:last_workspace_id, workspace.id)

    render json: nil if @current_release.nil?
  end

  def complete_release
    workspace = Workspace.find(params[:id])
    tasks_action = params[:tasks_action]
    current_release = workspace.current_release
    @next_release = workspace.next_release

    if current_release
      tasks = Task.where(release_id: current_release.id).where.not(status: "accepted")

      case tasks_action
      when "accepted"
        tasks.update_all(status: "accepted")
      when "next_release"
        tasks.update_all(release_id: @next_release.id)
      when "backlog"
        tasks.update_all(release_id: nil, status: "backlog")
      end

      current_release.update!(completed: true, current: false, status: "COMPLETED")
    end

    @next_release.update!(current: true) if @next_release

    WorkspaceBroadcaster.releases_changed(workspace.id, type: "release_created", actor_id: current_user.id)
  end

  private

  ALLOWED_PARAMS = [:name, :code_prefix, :code_prefix_enabled, :auto_assign]

  def workspace_params
    params.permit(ALLOWED_PARAMS)
  end
end
