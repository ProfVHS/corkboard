require 'rails_helper'

describe "Tasks", type: :request do
  include_context 'task_seed'

  context 'authorization' do
    it "token" do
      check_authentication(:post, "/tasks", { name: "New Task", release_id: user1_workspace_release.id, workspace_id: user1_workspace.id } )
      check_authentication(:get, "/tasks")
      check_authentication(:put, "/tasks/#{user1_workspace_task.id}", { name: "Update Name", status: "in_progress", priority: "high", order: 2, user_id: user2.id })
      check_authentication(:put, "/tasks/#{user1_workspace_task.id}/move_to_next_release")
      check_authentication(:delete, "/tasks/#{user1_workspace_task.id}")
    end

    it "permission" do
      [user5, superadmin].each do |user|
        check_permission(:post, "/tasks", user, { name: "New Task", release_id: user2_workspace_release.id, workspace_id: user2_workspace.id })
        check_permission(:get, "/tasks", user, { release_id: user2_workspace_release.id })
        check_permission(:put, "/tasks/#{user2_workspace_task.id}", user, { name: "Update Name", status: "in_progress", priority: "high", order: 2, user_id: user2.id })
        check_permission(:put, "/tasks/#{user2_workspace_task.id}/move_to_next_release", user)
        check_permission(:delete, "/tasks/#{user2_workspace_task.id}", user)
      end
    end

    it "params" do
      expect(TasksController::ALLOWED_PARAMS.to_json).to match_json_snapshot("allowed_params")
    end
  end

  context "functionality" do
    it "create" do
      # user can create task
      post "/tasks", params: { name: "New Task", release_id: user1_workspace_release.id, workspace_id: user1_workspace.id }, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("created_task_user1_workspace_release")
    end

    it "fetch" do
      # user can fetch task
      get "/tasks", params: { release_id: user1_workspace_release.id }, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("tasks_user1_workspace_release")
    end

    it "update" do
      # user can update task
      put "/tasks/#{user1_workspace_task.id}", params: { name: "Update Name", status: "in_progress", priority: "high", order: 2, user_id: user2.id }, headers: auth_headers(user1)
      expect(response.body).to match_json_snapshot("updated_task_user1_workspace_release")

      # user can move task to next release
      put "/tasks/#{user1_workspace_task.id}/move_to_next_release", headers: auth_headers(user1)
      expect(Task.where(release_id: user1_workspace_release.id).count).to eq(1)
      expect(Task.where(release_id: user1_workspace_release_two.id).count).to eq(2)
    end

    it "delete" do
      # user can delete task
      delete "/tasks/#{user1_workspace_task.id}", headers: auth_headers(user1)
      expect(Task.where(release_id: user1_workspace_release.id).count).to eq(1)
    end
  end
end
