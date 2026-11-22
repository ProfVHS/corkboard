json.user do
  json.partial! "users/user", user: @user
end
if @workspace.present?
  json.workspace do
    json.partial! "workspaces/workspace", workspace: @workspace
  end
end
if @release.present?
  json.release do
    json.partial! "releases/release", release: @release
  end
end
if @next_release.present?
  json.next_release do
    json.partial! "releases/release", release: @next_release
  end
end
