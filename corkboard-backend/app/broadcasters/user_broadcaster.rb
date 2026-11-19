class UserBroadcaster < ApplicationBroadcaster
  def self.broadcast(user_id, type, actor_id: nil, **payload)
    publish("user_#{user_id}", type, payload, actor_id)
  end
end
