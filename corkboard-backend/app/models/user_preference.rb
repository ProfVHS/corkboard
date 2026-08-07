# == Schema Information
#
# Table name: user_preferences
#
#  id           :bigint           not null, primary key
#  task_display :string           default(NULL), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  user_id      :bigint           not null
#
# Indexes
#
#  index_user_preferences_on_user_id  (user_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class UserPreference < ApplicationRecord
  belongs_to :user

  enum :task_display, { modal: "modal", sidebar: "sidebar" }

  validates :task_display, presence: true
end
