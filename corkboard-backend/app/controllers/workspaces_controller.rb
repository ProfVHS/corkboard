class WorkspacesController < ApplicationController
  def index
    @workspaces = current_user.workspaces
  end

  def show
    @workspace = Workspace.find(params[:id])
  end

  def destroy
    workspace = Workspace.find(params[:id])

    unless workspace.owner_id == current_user.id
      return render json: { error: "Not authorized" }, status: :forbidden
    end

    workspace.destroy
  end

  def create
    @workspace = current_user.workspaces.create(name: params[:name], owner_id: current_user.id)
  end

  def update
    @workspace = current_user.workspaces.find(params[:id])
    @workspace&.update!(workspace_params)
  end

  def collaborators
    @users = Workspace.find(params[:id]).users
    invited_user_ids = WorkspaceInvitation.where(workspace_id: params[:id]).pluck(:invited_user_id)
    @invited_users = User.where(id: invited_user_ids)
  end

  def invite_user
    @user = User.find_by(username: params[:username])
    return render json: { message: "Username not found!" } if @user.nil?

    already_in_workspace = UsersWorkspaces.find_by(workspace_id: params[:id], user_id: @user&.id)
    return render json: { message: "Username already in workspace!" } if already_in_workspace

    already_invited = WorkspaceInvitation.find_by(invited_user_id: @user&.id, workspace_id: params[:id])
    return render json: { message: "Username already invited!" } if already_invited

    WorkspaceInvitation.create!(invited_user_id: @user&.id, workspace_id: params[:id], invited_by_user_id: current_user.id)
    render json: { message: "Username successfully invited!", status: "success" }
  end

  def invitation
    @invitation = WorkspaceInvitation.where(invited_user_id: current_user.id)
  end

  def accept_invitation
    invitation = WorkspaceInvitation.find_by(invited_user_id: current_user.id, workspace_id: params[:id])
    invitation.destroy! if invitation
    UsersWorkspaces.create!(workspace_id: params[:id], user_id: current_user.id)
  end

  def decline_invitation
    WorkspaceInvitation.where(invited_user_id: current_user.id, workspace_id: params[:id]).delete_all
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
    current_release = workspace.current_release
    @next_release = workspace.next_release

    current_release&.update!(completed: true, current: false)
    @next_release.update!(current: true) if @next_release
  end

  def releases
    workspace = Workspace.find(params[:id])
    @releases = workspace.releases&.order("releases.order ASC") || []
    @current_release = @releases.find_by(current: true)
  end

  private

  def workspace_params
    params.require(:workspace).permit(:name)
  end
end
