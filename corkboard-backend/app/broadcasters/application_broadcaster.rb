class ApplicationBroadcaster
  def self.publish(channel, type, payload, actor_id)
    ActionCable.server.broadcast(channel, { type: type, actor_id: actor_id, **payload })
  end

  private_class_method :publish
end
