# == Schema Information
#
# Table name: users_workspaces
#
#  user_id      :bigint           not null
#  workspace_id :bigint           not null
#
# Indexes
#
#  index_users_workspaces_on_user_id_and_workspace_id  (user_id,workspace_id)
#  index_users_workspaces_on_workspace_id_and_user_id  (workspace_id,user_id)
#



class UsersWorkspaces < ApplicationRecord
  belongs_to :user
  belongs_to :workspace

  validates :user_id, uniqueness: { scope: :workspace_id }
end
