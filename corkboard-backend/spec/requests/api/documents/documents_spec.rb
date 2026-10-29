require 'rails_helper'

describe "Documents", type: :request do
  include_context 'document_seed'

  context 'authorization' do
    it "token" do
      check_authentication(:post, "/documents", { workspace_id: user1_workspace.id })
      check_authentication(:get, "/documents", { workspace_id: user1_workspace.id })
      check_authentication(:get, "/documents/#{user1_workspace_task.id}")
      check_authentication(:put, "/documents/#{user1_workspace_document.id}")
      check_authentication(:delete, "/documents/#{user1_workspace_document.id}")
    end

    it "permission" do
      [user2, superadmin].each do |user|
        check_permission(:post, "/documents", user, { workspace_id: user1_workspace.id })
        check_permission(:get, "/documents", user, { workspace_id: user1_workspace.id })
        check_permission(:get, "/documents/#{user1_workspace_task.id}", user)
        check_permission(:put, "/documents/#{user1_workspace_document.id}", user)
        check_permission(:delete, "/documents/#{user1_workspace_document.id}", user)
      end
    end

    it "params" do
      expect(DocumentsController::ALLOWED_PARAMS.to_json).to match_json_snapshot("allowed_params")
    end
  end

  context "functionality" do
    it "create" do
      # user can create document
      post "/documents", params: { workspace_id: user1_workspace.id}, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("created_user1_workspace_document")
    end

    it "fetch" do
      # user can fetch workspace documents
      get "/documents", params: { workspace_id: user1_workspace.id }, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("user1_workspace_documents")

      # user can fetch task document
      get "/documents/#{user1_workspace_task.id}", headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("user1_workspace_task_document")
    end

    it "update" do
      # user can update document
      put "/documents/#{user1_workspace_document.id}", params: load_request("update_user1_workspace_document"), headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("updated_user1_workspace_document")
    end

    it "delete" do
      # user can delete document
      delete "/documents/#{user1_workspace_document.id}", headers: auth_headers(user1)
      expect(Document.where(workspace_id: user1_workspace_document.id, task_id: nil).count).to eq(0)
    end
  end
end
