require "test_helper"

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
class UserTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
