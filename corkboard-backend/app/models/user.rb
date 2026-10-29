# == Schema Information
#
# Table name: users
#
#  id                     :uuid             not null, primary key
#  encrypted_password     :string           default(""), not null
#  jti                    :string           not null
#  remember_created_at    :datetime
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  role                   :string           default("user"), not null
#  username               :citext           not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  last_workspace_id      :uuid
#
# Indexes
#
#  index_users_on_jti                   (jti) UNIQUE
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#  index_users_on_username              (username) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (last_workspace_id => workspaces.id) ON DELETE => nullify
#
class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  validates :username,
            presence: true,
            uniqueness: { case_sensitive: false },
            format: {
              with: /\A[a-zA-Z0-9_-]+\z/,
              message: "cannot contain spaces"
            }
  validates :password, length: { minimum: 6 }, if: -> { password.present? }

  has_and_belongs_to_many :workspaces
  has_many :documents, foreign_key: :owner_id, dependent: :destroy
  has_many :owned_workspaces, class_name: "Workspace", foreign_key: :owner_id, inverse_of: :owner, dependent: :destroy
  has_one :user_preference, dependent: :destroy
  belongs_to :last_workspace, class_name: "Workspace", optional: true

  after_create :create_workspace
  after_create :create_preference

  def email_required?
    false
  end

  def email_changed?
    false
  end

  def email
    self.username
  end

  def superadmin?
    role == "superadmin"
  end

  private

  def create_workspace
    workspace = workspaces.create!(name: "#{username}'s Workspace", owner: self)
    update_column(:last_workspace_id, workspace.id) if workspace.persisted? && respond_to?(:last_workspace_id)
  end

  def create_preference
    UserPreference.find_or_create_by(user_id: id) do |pref|
      pref.task_display = "modal"
    end
  end
end
