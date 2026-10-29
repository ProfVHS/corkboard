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
    workspace = Workspace.find_by(id: params[:workspace_id])
    if workspace
      releases_count = workspace.releases.where(completed: false).count

      @release = Release.create!(
        release_params.merge(position: releases_count, workspace_id: workspace.id)
      )
    end

    WorkspaceBroadcaster.release_changed(@release, type: "release_created", actor_id: current_user.id)
    render :show
  end

  def update
    @release.update!(release_params)
    WorkspaceBroadcaster.release_changed(@release, type: "release_updated", actor_id: current_user.id)
    render :show
  end

  def destroy
    WorkspaceBroadcaster.release_changed(@release, type: "release_deleted", actor_id: current_user.id)
    @release&.destroy!
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

    WorkspaceBroadcaster.releases_moved(workspace, actor_id: current_user.id)
    @releases = workspace.releases.includes(:tasks).reorder(:position)
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
