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
      @token = request.env['warden-jwt_auth.token']
      headers['Authorization'] = @token

      render json: {
        status: { code: 200, message: 'Signed up successfully.',
                  token: @token,
                  data: UserSerializer.new(resource).serializable_hash[:data][:attributes] }
      }
    else
      render json: {
        status: { message: "User couldn't be created successfully. #{resource.errors.full_messages.to_sentence}" }
      }, status: :unprocessable_entity
    end
  end
end