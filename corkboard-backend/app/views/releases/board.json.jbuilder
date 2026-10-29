grouped = @tasks.group_by(&:status)

json.columns do
  json.array!(Task.statuses.keys - ["backlog"]) do |status|
    json.id status

    json.tasks grouped.fetch(status, []) do |task|
      json.partial! "tasks/task", task: task

      json.user do
        task.user ? json.extract!(task.user, :id, :username) : json.nil!
      end
    end
  end
end
