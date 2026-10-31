class AddDatesToTask < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :start_date, :date
    add_column :tasks, :due_date, :date
  end
end
