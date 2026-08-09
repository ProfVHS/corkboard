class PopulateColorsForUsers < ActiveRecord::Migration[8.1]
  def change
    User.where(color: nil).each do |user|
      user.color = user.username_to_color
      user.save!
    end

    change_column_null :users, :color, false
  end
end
