# == Schema Information
#
# Table name: tasks
#
#  id           :bigint           not null, primary key
#  name         :string
#  order        :integer
#  priority     :string
#  status       :string
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  release_id   :integer
#  user_id      :bigint
#  workspace_id :string
#
# Indexes
#
#  index_tasks_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#


require "test_helper"

class TaskTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
