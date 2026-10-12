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

  def broadcast(type, current_user)
    ActionCable.server.broadcast "documents_#{self.workspace_id}", {
      type: type,
      document: {
        id: self.id,
        name: self.name,
        updated_at: self.updated_at,
        owner: {
          id: self.owner.id,
          username: self.owner.username
        },
        actor_id: current_user&.id
      }
    }
  end
end
