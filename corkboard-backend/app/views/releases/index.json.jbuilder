releases = @releases.to_a
next_id = Release.next_release_id(releases)

json.array! releases do |release|
  json.partial! "releases/release", release: release, next_id: next_id
end
