# == Schema Information
#
# Table name: documents
#
#  id           :uuid             not null, primary key
#  content      :jsonb
#  name         :string           not null
#  yjs_state    :binary
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  owner_id     :uuid             not null
#  task_id      :uuid
#  workspace_id :uuid             not null
#
# Foreign Keys
#
#  fk_rails_...  (owner_id => users.id) ON DELETE => cascade
#  fk_rails_...  (task_id => tasks.id) ON DELETE => nullify
#  fk_rails_...  (workspace_id => workspaces.id) ON DELETE => cascade
#


class Document < ApplicationRecord
  belongs_to :owner, class_name: "User"
  belongs_to :task, optional: true

  scope :not_task_documents, -> { where(task_id: nil) }

  def as_broadcast
    {
      id: id,
      name: name,
      owner: {
        id: owner_id,
        username: User.find(owner_id).username
      },
      updated_at: updated_at,
    }
  end
end
