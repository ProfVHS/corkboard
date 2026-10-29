json.array! @tasks do |task|
  json.partial! "tasks/task", task: task

  json.user do
    task.user ? json.extract!(task.user, :id, :username) : json.nil!
  end
end
