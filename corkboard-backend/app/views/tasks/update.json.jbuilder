json.task do
  json.partial! @task, partial: 'tasks/task', as: :task
end

if @task.user
  json.user do
    json.partial! 'users/user', user: @task.user
  end
end