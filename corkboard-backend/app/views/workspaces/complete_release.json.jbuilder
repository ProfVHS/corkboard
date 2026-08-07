if @next_release
  json.extract! @next_release, :id, :name
else
  json.null!
end
