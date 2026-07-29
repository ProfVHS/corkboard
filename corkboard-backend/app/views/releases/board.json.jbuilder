json.tasks do
  @tasks.each do |task|
    json.set! task.id do
      json.extract! task, :id, :name, :status

      json.user do
        if task.user
          json.extract! task.user, :id, :username
          json.avatar_url task.user.avatar_url
        else
          json.nil!
        end
      end
    end
  end
end

json.columns do
  json.array!(Task.statuses.keys.select{|key| key != Task.statuses[:backlog]}) do |status|
    json.id status
    json.taskIds @tasks.order("tasks.order ASC").select { |task| task.status == status }.map { |task| task.id }
  end
end