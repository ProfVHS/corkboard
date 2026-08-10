class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  protected

  def update_resource(resource, params)
    resource.update_without_password(params)
  end

  private

  def respond_with(resource, _opts = {})
    Rails.logger.debug params.inspect
    if resource.persisted?
      @token = request.env["warden-jwt_auth.token"]
      headers["Authorization"] = @token

      render json: {
        message: "Signed up successfully",
        token: @token,
        user: UserSerializer.new(resource).serializable_hash[:data][:attributes]
      }, status: :ok
    else
      render json: { message: "#{resource.errors.full_messages.to_sentence}" }, status: :unprocessable_entity
    end
  end
end