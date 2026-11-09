releases = Release.where(workspace_id: @release.workspace_id).includes(:tasks).to_a

json.partial! "releases/release", release: @release, next_id: Release.next_release_id(releases)
