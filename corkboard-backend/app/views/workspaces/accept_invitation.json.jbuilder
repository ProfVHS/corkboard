json.message "Accept invitation"
json.workspace do
  json.partial! "workspace", workspace: @workspace
end