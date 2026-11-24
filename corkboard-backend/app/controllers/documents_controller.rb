class DocumentsController < ApplicationController
  before_action :authenticate_user!, except: [:ydoc, :update_ydoc]
  load_and_authorize_resource only: [:update, :destroy]

  def index
    authorize! :index, Document.new(workspace_id: params[:workspace_id])
    @documents = Document.not_task_documents.where(workspace_id: params[:workspace_id]).order(:created_at)
  end

  def show
    @document = Document.find_by!(task_id: params[:task_id])
    authorize! :read, @document
  end

  def create
    workspace_id = params[:workspace_id]
    authorize! :create, Document.new(workspace_id: workspace_id)

    @document = Document.create!(name: "Untilted", owner_id: current_user.id, workspace_id: workspace_id)

    WorkspaceBroadcaster.broadcast(workspace_id, "create_document", document: @document.as_broadcast)
    render :show
  end

  def update
    @document.update!(document_params)

    WorkspaceBroadcaster.broadcast(@document.workspace_id, "update_document", document: @document.as_broadcast)

    render :show
  end

  def destroy
    WorkspaceBroadcaster.broadcast(@document.workspace_id, "delete_document", document: @document.as_broadcast)
    @document.destroy!
    render json: { message: "Successfully deleted!" }
  end

  def ydoc
    verify_internal_token!
    return if performed?

    document = Document.find(params[:id])

    if document.yjs_state.present?
      send_data document.yjs_state, type: "application/octet-stream"
    else
      head :no_content
    end
  end

  def update_ydoc
    verify_internal_token!
    return if performed?

    request.body.rewind
    body = request.body.read&.force_encoding("BINARY")

    document = Document.find(params[:id])
    document.update!(yjs_state: body)
    head :ok
  end

  private

  ALLOWED_PARAMS = [:name, content: {}]

  def document_params
    params.permit(ALLOWED_PARAMS)
  end

  def verify_internal_token!
    unless request.headers['X-Internal-Token'] == Rails.configuration.hocuspocus_secret
      head :unauthorized
    end
  end
end
