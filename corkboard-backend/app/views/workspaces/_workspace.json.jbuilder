json.extract! workspace, :id, :name, :owner_id
json.logo_url workspace.logo_url
json.owner do
  json.extract! workspace.owner, :id, :username
end
json.number_of_members workspace.users.count
