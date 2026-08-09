json.message "Username successfully invited"
json.status "success"
json.user do
  json.extract! @user, :id, :username, :role
end