json.adjustments do
  json.array! @tasks.where(status: "adjustments").order(:position) do |task|
    json.extract! task, :id, :name, :status, :order
  end
end

json.todo do
  json.array! @tasks.where(status: "todo").order(:position)  do |task|
    json.extract! task, :id, :name, :status
  end
end

json.in_progress do
  json.array! @tasks.where(status: "in_progress").order(:position)  do |task|
    json.extract! task, :id, :name, :status
  end
end

json.review_pending do
  json.array! @tasks.where(status: "review_pending").order(:position)  do |task|
    json.extract! task, :id, :name, :status
  end
end

json.testing do
  json.array! @tasks.where(status: "testing").order(:position)  do |task|
    json.extract! task, :id, :name, :status
  end
end

json.accepted do
  json.array! @tasks.where(status: "accepted").order(:position)  do |task|
    json.extract! task, :id, :name, :status
  end
end