class WorkspaceBroadcaster < ApplicationBroadcaster
  def self.releases_changed(workspace_id, type:, actor_id:)
    releases = Release.where(workspace_id: workspace_id)
                      .includes(:tasks)
                      .reorder(:position)
                      .to_a

    next_id      = Release.next_release_id(releases)
    current      = releases.find(&:current)
    next_release = releases.find { |r| r.id == next_id }

    broadcast(workspace_id, {
      type: type,
      actor_id: actor_id,
      releases: releases.map { |r| r.as_broadcast(next_id: next_id) },
      current_release: current&.as_broadcast(next_id: next_id),
      next_release: next_release&.as_broadcast(next_id: next_id)
    })
  end

  def self.broadcast(workspace_id, type, actor_id: nil, **payload)
    publish("workspace_#{workspace_id}", type, payload, actor_id)
  end
end
