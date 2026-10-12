class AddMissingNotNull < ActiveRecord::Migration[8.1]
  def up
    execute <<~SQL
      UPDATE documents d
      SET name = COALESCE(NULLIF(t.code_name, ''), t.name)
      FROM tasks t
      WHERE d.task_id = t.id
        AND d.name IS NULL
    SQL

    change_column_null :documents, :name, false
    change_column_null :releases, :completed, false
    change_column_null :releases, :current, false
    change_column_null :releases, :status, false
    change_column_null :user_preferences, :show_board_tags, false
    change_column_null :user_preferences, :spellcheck, false
    change_column_null :workspaces, :code_prefix_enabled, false
    change_column_null :workspaces, :code_prefix, false
    change_column_null :workspace_invitations, :status, false
    change_column_null :workspaces, :owner_id, false
    change_column_null :workspace_invitations, :invited_user_id, false
    change_column_null :workspace_invitations, :invited_by_user_id, false
  end

  def down
    change_column_null :documents, :name, true
    change_column_null :releases, :completed, true
    change_column_null :releases, :current, true
    change_column_null :releases, :status, true
    change_column_null :user_preferences, :show_board_tags, true
    change_column_null :user_preferences, :spellcheck, true
    change_column_null :workspaces, :code_prefix_enabled, true
    change_column_null :workspaces, :code_prefix, true
    change_column_null :workspace_invitations, :status, true
    change_column_null :workspaces, :owner_id, true
    change_column_null :workspace_invitations, :invited_user_id, true
    change_column_null :workspace_invitations, :invited_by_user_id, true
  end
end