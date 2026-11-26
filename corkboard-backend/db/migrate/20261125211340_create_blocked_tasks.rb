class CreateBlockedTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :blocked_tasks, id: :uuid do |t|
      t.references :task, type: :uuid, null: false, foreign_key: true
      t.references :blocked_by_task, type: :uuid, null: false, foreign_key: { to_table: :tasks }

      t.timestamps
    end

    add_index :blocked_tasks, [:task_id, :blocked_by_task_id], unique: true
    add_check_constraint :blocked_tasks, "task_id <> blocked_by_task_id", name: "check_task_not_blocking_itself"
  end
end
