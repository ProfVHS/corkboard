class Users::SessionsController < Devise::SessionsController
  respond_to :json
  skip_before_action :verify_signed_out_user, only: :destroy

  def create
    user = User.find_by(username: params[:user][:username])

    if user&.valid_password?(params[:user][:password])
      sign_in(user)
      token = request.env["warden-jwt_auth.token"]
      workspace_id = user.last_workspace_id

      if workspace_id.nil?
        workspace_id = Workspace.find_by(owner_id: user.id)&.id
      end

      render json: {
        message: "Logged in successfully",
        token: token,
        workspace_id: workspace_id,
        user: UserSerializer.new(user).serializable_hash[:data][:attributes]
      }, status: :ok
    else
      render json: { message: "Invalid username or password" }, status: :unauthorized
    end
  end

  def destroy
    sign_out(resource_name)
    render json: { message: "Logged out successfully" }, status: :ok
  end

  private

  def set_flash_message(*args)

  end

  def respond_with(resource, _opt = {})
    @token = request.env["warden-jwt_auth.token"]
    headers["Authorization"] = @token

    render json: {
      status: {
        message: "Logged in successfully",
        token: @token,
        user: UserSerializer.new(resource).serializable_hash[:data][:attributes]
      }
    }, status: :ok
  end
end