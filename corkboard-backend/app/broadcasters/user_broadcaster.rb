class UserBroadcaster < ApplicationBroadcaster
  def self.send_workspace_invite(user_id, invitation, type, actor_id)
    workspace_name = Workspace.find(invitation.workspace_id).name
    user_name = User.find(invitation.invited_by_user_id).username

    broadcast(user_id, {
      type: type,
      actor_id: actor_id,
      invitation: {
        invited_by: user_name,
        workspace: {
          id: invitation.workspace_id,
          name: workspace_name
        }
      }
    })
  end

  def self.broadcast(user_id, type, actor_id: nil, **payload)
    publish("user_#{user_id}", type, payload, actor_id)
  end
end
