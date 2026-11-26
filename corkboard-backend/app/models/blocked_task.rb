# == Schema Information
#
# Table name: blocked_tasks
#
#  id                 :uuid             not null, primary key
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  blocked_by_task_id :uuid             not null
#  task_id            :uuid             not null
#
# Indexes
#
#  index_blocked_tasks_on_blocked_by_task_id              (blocked_by_task_id)
#  index_blocked_tasks_on_task_id                         (task_id)
#  index_blocked_tasks_on_task_id_and_blocked_by_task_id  (task_id,blocked_by_task_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (blocked_by_task_id => tasks.id)
#  fk_rails_...  (task_id => tasks.id)
#
class BlockedTask < ApplicationRecord
  belongs_to :task
  belongs_to :blocked_by_task, class_name: "Task"

  validates :blocked_by_task_id, uniqueness: { scope: :task_id }
  validate :cannot_block_itself

  private

  def cannot_block_itself
    errors.add(:blocked_by_task_id, "cannot block itself") if task_id == blocked_by_task_id
  end
end
