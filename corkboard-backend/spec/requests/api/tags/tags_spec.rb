require 'rails_helper'

describe "Tags", type: :request do
  include_context 'task_seed'

  context 'authorization' do
    it "token" do
      check_authentication(:post, "/tags", { name: "", color: "", workspace_id: 1 })
      check_authentication(:post, "/tasks/1/tags/1/assign")
      check_authentication(:get, "/tags", { workspace_id: 1 })
      check_authentication(:put, "/tags/1", { name: "" })
      check_authentication(:delete, "/tags/1")
      check_authentication(:delete, "/tasks/1/tags/1/unassign")
    end

    it "permission" do
      [user2, superadmin].each do |user|
        check_permission(:post, "/tags", user, { name: "", color: "", workspace_id: user1_workspace.id })
        check_permission(:post, "/tasks/#{user1_workspace_task.id}/tags/#{user1_workspace_tag_bug.id}/assign", user)
        check_permission(:get, "/tags", user, { workspace_id: user1_workspace.id })
        check_permission(:put, "/tags/#{user1_workspace_tag_bug.id}", user, { name: "" })
        check_permission(:delete, "/tags/#{user1_workspace_tag_bug.id}", user)
        check_permission(:delete, "/tasks/#{user1_workspace_task.id}/tags/#{user1_workspace_tag_bug.id}/unassign", user)
      end
    end

    it "params" do
      expect(TagsController::ALLOWED_PARAMS.to_json).to match_json_snapshot("allowed_params")
    end
  end

  context "functionality" do
    it "create" do
      # user can create a tag in own workspace
      post "/tags", params: { name: "New tag", color: "#ffffff", workspace_id: user1_workspace.id }, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("created_user1_workspace_tag")

      # user can assign a tag to a task in own workspace
      post "/tasks/#{user1_workspace_task_two.id}/tags/#{user1_workspace_tag_bug.id}/assign", headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("assign_tag_to_user1_workspace_task_two")
    end

    it "fetch" do
      # user can fetch tags of own workspace
      get "/tags", params: { workspace_id: user1_workspace.id }, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("user1_workspace_tags")

      # user can fetch an empty list for a workspace without tags
      get "/tags", params: { workspace_id: second_user1_workspace.id }, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("second_user1_workspace_without_tags")

      # user can fetch workspace tags that are not yet assigned to the given task
      get "/tags", params: { workspace_id: user1_workspace.id, task_id: user1_workspace_task.id }, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("tags_without_user1_workspace_task_tags")
    end

    it "update" do
      # user can update a tag in own workspace
      put "/tags/#{user1_workspace_tag_bug.id}", params: load_request("update_user1_workspace_bug_tag"), headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("updated_user1_workspace_bug_tag")
    end

    it "delete" do
      # user can delete a tag from own workspace
      tag = Tag.create!(name: "Temp tag", color: "#ffffff", workspace_id: user1_workspace.id)
      delete "/tags/#{tag.id}", headers: auth_headers(user1)
      expect(Tag.where(workspace_id: user1_workspace.id).count).to eq(3)

      # user can unassign a tag from a task in own workspace
      delete "/tasks/#{user1_workspace_task.id}/tags/#{user1_workspace_tag_bug.id}/unassign", headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("unassign_bug_tag_user1_workspace_task")
    end
  end
end
