json.array! @invitation do |invitation|
  json.id invitation.id
  json.invited_by invitation.user.username
  json.workspace do
    workspace = invitation.workspace
    json.extract! workspace, :id, :name
  end
end