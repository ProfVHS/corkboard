class ReleasesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_release, only: [:board]
  load_and_authorize_resource

  def index
    workspace = Workspace.find(params[:workspace_id])
    @releases = workspace.releases&.order("releases.position ASC") || []
    @current_release = @releases.find_by(current: true)
  end

  def create
    workspace = Workspace.find(params[:workspace_id])
    @release = Release.create!(release_params)

    if @release.status == "QUEUED" || @release.current
      WorkspaceBroadcaster.broadcast(workspace.id, "create_current_release", releases: Release.state_for(workspace.id))
    else
      WorkspaceBroadcaster.broadcast(workspace.id, "create_release", release: @release.as_broadcast)
    end

    render :show
  end

  def update
    @release.update!(release_params)
    WorkspaceBroadcaster.broadcast(@release.workspace_id, "update_release", release: @release.as_broadcast)
    render :show
  end

  def destroy
    workspace_id = @release.workspace_id
    @release.destroy!
    WorkspaceBroadcaster.broadcast(workspace_id, "delete_release", releases: Release.state_for(workspace_id))
  end

  def board
    @tasks = @release.tasks.includes(:user, :tags).order(:position)
  end

  def move
    workspace = Workspace.find(release_params[:workspace_id])
    release = workspace.releases.find(params[:id])
    new_status = release_params[:status]
    position = release_params[:position].to_i

    workspace.with_lock do
      release.reload
      release.update!(status: new_status) if release.status != new_status
      release.insert_at(position)
    end

    @releases = workspace.releases.includes(:tasks).reorder(:position)
    WorkspaceBroadcaster.broadcast(workspace.id, "move_release", releases: Release.state_for(workspace.id))
    render :index
  end

  private

  ALLOWED_PARAMS = [:name, :workspace_id, :status, :position]

  def release_params
    params.permit(ALLOWED_PARAMS)
  end

  def set_release
    @release = Release.joins(:workspace).where(workspace_id: current_user.workspaces.map{|w| w.id}).find_by(id: params[:id])
  end
end
