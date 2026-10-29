require 'rails_helper'

describe "Releases", type: :request do
  include_context 'release_seed'

  context 'authorization' do
    it "token" do
      check_authentication(:post, "/releases", { name: "New Release", workspace_id: user1_workspace.id })
      check_authentication(:get, "/releases/#{user1_workspace_release.id}/board")
      check_authentication(:put, "/releases/#{user1_workspace_release.id}", load_request("update_user1_workspace_release"))
      check_authentication(:delete, "/releases/#{user1_workspace_release.id}")
    end

    it "permission" do
      [user2, superadmin].each do |user|
        check_permission(:post, "/releases", user, { name: "New Release", workspace_id: user1_workspace.id })
        check_permission(:get, "/releases/#{user1_workspace_release.id}/board", user)
        check_permission(:put, "/releases/#{user1_workspace_release.id}", user, load_request("update_user1_workspace_release"))
        check_permission(:delete, "/releases/#{user1_workspace_release.id}", user)
      end
    end

    it "params" do
      expect(ReleasesController::ALLOWED_PARAMS.to_json).to match_json_snapshot("allowed_params")
    end
  end

  context "functionality" do
    it "create" do
      # user can create release
      post "/releases", params: { name: "New Release", workspace_id: user1_workspace.id }, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("created_user1_workspace_release")
    end

    it "fetch" do
      Task.create!(name: "Task 1", workspace: user1_workspace, release: user1_workspace_release,
                   user: nil, position: 0, status: "backlog")
      Task.create!(name: "Task 2", workspace: user1_workspace, release: user1_workspace_release,
                   user: nil, position: 1, status: "todo")
      Task.create!(name: "Task 3", workspace: user1_workspace, release: user1_workspace_release,
                   user: nil, position: 2, status: "testing")

      # user can fetch release board
      get "/releases/#{user1_workspace_release.id}/board", headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("board_user1_workspace_release")
    end

    it "update" do
      # user can update release in workspace
      put "/releases/#{user1_workspace_release.id}", params: load_request("update_user1_workspace_release"), headers: auth_headers(user1)
      release = Release.where(id: user1_workspace_release.id).to_json
      expect(release).to match_json_snapshot("updated_user1_workspace_release")
    end

    it "delete" do
      # user can delete release from workspace
      delete "/releases/#{user1_workspace_release.id}", headers: auth_headers(user1)
      expect(Release.where(workspace_id: user1_workspace.id).count).to eq(1)
    end
  end
end
