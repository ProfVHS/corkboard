json.extract! @user, :id, :username
json.avatar_url @user.avatar_url
json.preferences do
  json.task_display @user.user_preference&.task_display
end