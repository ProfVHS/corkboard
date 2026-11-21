class WorkspaceBroadcaster < ApplicationBroadcaster
  def self.broadcast(workspace_id, type, actor_id: nil, **payload)
    publish("workspace_#{workspace_id}", type, payload, actor_id)
  end
end
