class ReleaseBroadcaster < ApplicationBroadcaster
  def self.broadcast(release_id, type, actor_id: nil, **payload)
    publish("release_#{release_id}", type, payload, actor_id)
  end
end
