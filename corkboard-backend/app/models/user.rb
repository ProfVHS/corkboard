# == Schema Information
#
# Table name: users
#
#  id                     :bigint           not null, primary key
#  encrypted_password     :string           default(""), not null
#  jti                    :string           not null
#  remember_created_at    :datetime
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  role                   :string           default("user"), not null
#  username               :citext
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  last_workspace_id      :bigint
#
# Indexes
#
#  index_users_on_jti                   (jti) UNIQUE
#  index_users_on_last_workspace_id     (last_workspace_id)
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#  index_users_on_username              (username) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (last_workspace_id => workspaces.id)
#
class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  include Rails.application.routes.url_helpers

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
  validates :password, length: { minimum: 6 }, if: -> { new_record? || password.present? }
  has_and_belongs_to_many :workspaces
  has_many :documents, foreign_key: :owner_id
  has_one :user_preference, dependent: :destroy
  belongs_to :last_workspace, class_name: "Workspace", optional: true

  has_one_attached :avatar

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

  def avatar_url
    if self.avatar.attached?
      "#{Rails.application.config.action_controller.default_url_options[:host]}#{Rails.application.routes.url_helpers.rails_blob_path(self.avatar, only_path: true)}"
    else
      nil
    end
  end

  private

  def create_workspace
    workspaces.create!(name: "#{username}'s Workspace", owner: self)
  end

  def create_preference
    create_user_preference!(task_display: "modal")
  end
end
