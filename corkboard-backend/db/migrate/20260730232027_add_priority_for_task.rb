class AddPriorityForTask < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :priority, :string
  end
end
