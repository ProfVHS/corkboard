# == Schema Information
#
# Table name: tasks
#
#  id           :uuid             not null, primary key
#  code_name    :string
#  code_number  :integer
#  due_date     :date
#  name         :string
#  position     :integer
#  priority     :string
#  start_date   :date
#  status       :string
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  release_id   :uuid
#  user_id      :uuid
#  workspace_id :uuid
#
# Indexes
#
#  index_tasks_on_release_id_and_status_and_position  (release_id,status,position)
#  index_tasks_on_workspace_id_and_code_name          (workspace_id,code_name) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (release_id => releases.id) ON DELETE => cascade
#  fk_rails_...  (user_id => users.id) ON DELETE => nullify
#  fk_rails_...  (workspace_id => workspaces.id) ON DELETE => cascade
#





class Task < ApplicationRecord
  belongs_to :release, optional: true
  belongs_to :workspace
  belongs_to :user, optional: true
  has_many :tasks_tags, dependent: :destroy
  has_many :tags, through: :tasks_tags
  has_one :document, dependent: :destroy

  validates :code_name, presence: true, uniqueness: { scope: :workspace_id }

  before_validation :generate_code_name, on: :create
  before_save :clear_release_id_for_backlog

  enum :status, {
    backlog: "backlog",
    adjustments: "adjustments",
    todo: "todo",
    in_progress: "in_progress",
    review_pending: "review_pending",
    testing: "testing",
    accepted: "accepted"
  }

  enum :priority, {
    medium: "medium",
    high: "high",
    urgent: "urgent",
  }

  acts_as_list scope: [:release_id, :status], column: :position, top_of_list: 0

  def clear_release_id_for_backlog
    # TODO: Add status_changed? when we are sure that the update is called only once
    if self.status == "backlog"
      self.release_id = nil
    end
  end

  def as_broadcast
    {
      id: id,
      name: name,
      code_name: code_name,
      status: status,
      priority: priority,
      position: position,
      start_date: start_date,
      due_date: due_date,
      release_id: release_id,
      workspace_id: workspace_id,
      tags: tag_ids,
      user: user && { id: user.id, username: user.username }
    }
  end

  def self.state_for(release_id)
    where(release_id: release_id).includes(:user, :tags).reorder(:position).map(&:as_broadcast)
  end

  def self.backlog_state_for(workspace_id)
    where(workspace_id: workspace_id, release_id: nil, status: "backlog")
      .includes(:user, :tags).reorder(:position).map(&:as_broadcast)
  end

  private

  def generate_code_name
    prefix = workspace.code_prefix
    last_number = workspace.tasks.maximum('code_number').to_i
    new_number = last_number + 1

    self.code_name = "#{prefix}-#{new_number.to_s.rjust(2, '0')}"
    self.code_number = new_number
  end
end
