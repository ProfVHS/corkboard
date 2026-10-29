require 'rails_helper'

RSpec.describe "Workspaces", type: :request do
  include_context 'release_seed'

  context "authorization" do
    it "token" do
      check_authentication(:post, "/workspaces", load_request("create_user1_workspace"))
      check_authentication(:post, "/workspaces/#{user1_workspace.id}/complete_release")
      check_authentication(:post, "/workspaces/#{user1_workspace.id}/invite_user")
      check_authentication(:post, "/workspaces/#{user1_workspace.id}/accept_invitation")
      check_authentication(:get, "/workspaces")
      check_authentication(:get, "/workspaces/#{user1_workspace.id}")
      check_authentication(:get, "/workspaces/#{user1_workspace.id}/collaborators")
      check_authentication(:get, "/workspaces/#{user1_workspace.id}/current_release")
      check_authentication(:put, "/workspaces/#{user1_workspace.id}", load_request("update_user1_workspace"))
      check_authentication(:delete, "/workspaces/#{user1_workspace.id}")
      check_authentication(:delete, "/workspaces/#{user1_workspace.id}/decline_invitation", { name: second_user2_workspace.name })
      check_authentication(:delete, "/workspaces/#{user1_workspace.id}/cancel_invitation")
      check_authentication(:delete, "/workspaces/#{user1_workspace.id}/delete_user", { user_id: user5.id, username: user5.username })
    end

    it "permission" do
      [user2, superadmin].each do |user|
        if user == superadmin
          check_permission(:post, "/workspaces", user, load_request("create_user1_workspace"))
          check_permission(:get, "/workspaces", user)
        end

        check_permission(:post, "/workspaces/#{user1_workspace.id}/complete_release", user)
        check_permission(:post, "/workspaces/#{user1_workspace.id}/invite_user", user)
        check_permission(:post, "/workspaces/#{user1_workspace.id}/accept_invitation", user)
        check_permission(:get, "/workspaces/#{user1_workspace.id}", user)
        check_permission(:get, "/workspaces/#{user1_workspace.id}/collaborators", user)
        check_permission(:get, "/workspaces/#{user1_workspace.id}/current_release", user)
        check_permission(:put, "/workspaces/#{user1_workspace.id}", user, load_request("update_user1_workspace"))
        check_permission(:delete, "/workspaces/#{user1_workspace.id}", user)
        check_permission(:delete, "/workspaces/#{user1_workspace.id}/decline_invitation", user, { name: second_user2_workspace.name })
        check_permission(:delete, "/workspaces/#{user1_workspace.id}/cancel_invitation", user)
        check_permission(:delete, "/workspaces/#{user1_workspace.id}/delete_user", user, { user_id: user5.id, username: user5.username })
      end
   end

    it "params" do
      expect(UsersController::ALLOWED_PARAMS.to_json).to match_json_snapshot("allowed_params")
    end
  end

  context "functionality" do
    it "create" do
      # user can create new workspace
      post "/workspaces", params: load_request("create_user1_workspace"), headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("created_user1_workspace")

      # user can complete release in workspace and move tasks to accepted
      post "/workspaces/#{user1_workspace.id}/complete_release", params: { tasks_action: "accepted" }, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("completed_release_user1_workspace")

      # user can invite other user to workspace
      post "/workspaces/#{user2_workspace.id}/invite_user", params: { id: user2_workspace.id, username: user3.username }, headers: auth_headers(user2)
      expect(response.body).to match_json_snapshot("invited_user_user2_workspace")

      # user can accept invitation to workspace
      WorkspaceInvitation.create!(invited_by_user_id: user2.id, invited_user_id: user5.id, workspace_id: user2_workspace.id, status: "PENDING")
      post "/workspaces/#{user2_workspace.id}/accept_invitation", headers: auth_headers(user5)
      expect(response.body).to match_json_snapshot("accepted_invitation_user2_workspace")
    end

    it "fetch" do
      # user can fetch workspaces
      get "/workspaces", headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("user1_workspaces")

      # user can fetch workspace
      get "/workspaces/#{user1_workspace.id}", headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("user1_workspace")

      # user can fetch current release
      get "/workspaces/#{user1_workspace.id}/current_release", headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("user1_workspace_current_release")
    end

    it "update" do
      # user can update workspace
      put "/workspaces/#{user1_workspace.id}", params: load_request("update_user1_workspace"), headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("updated_user1_workspace")
    end

    it "delete" do
      # user can delete workspace when he is owner
      delete "/workspaces/#{second_user1_workspace.id}", headers: auth_headers(user1)
      get "/workspaces", headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("deleted_user1_workspace")

      # user can't delete his last workspace
      delete "/workspaces/#{user1_workspace.id}", headers: auth_headers(user1)
      expect(response).to have_http_status(:forbidden)

      # user can decline invitation to workspace
      delete "/workspaces/#{user2_workspace.id}/decline_invitation", params: { name: second_user2_workspace.name }, headers: auth_headers(user2)
      expect(response.body).to match_json_snapshot("declined_invitation_user2_workspace")
      expect(WorkspaceInvitation.where(workspace_id: user2_workspace.id, invited_user_id: user5.id).count).to eq(0)

      # user can cancel user invitation to workspace
      delete "/workspaces/#{user2_workspace.id}/cancel_invitation", headers: auth_headers(user2)
      expect(response.body).to match_json_snapshot("canceled_invitation_user2_workspace")
      expect(WorkspaceInvitation.where(workspace_id: user2_workspace.id, invited_user_id: user5.id).count).to eq(0)

      # owner can delete user from workspace
      delete "/workspaces/#{user1_workspace.id}/delete_user", params: { user_id: user5.id, username: user5.username }, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("deleted_user_user1_workspace")
    end
  end
end
