class AddUniqueIndexToUsersUsername < ActiveRecord::Migration[8.1]
  def up
    enable_extension "citext" unless extension_enabled?("citext")
    change_column :users, :username, :citext
    add_index :users, :username, unique: true
  end

  def down
    remove_index :users, :username
    change_column :users, :username, :string
  end
end
