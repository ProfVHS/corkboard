class UsersController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  def me
    @user = current_user
    @workspace = @user.last_workspace
    @release = @workspace.current_release
    @next_release = @workspace.next_release
  end

  def index
    @users = User.where(role: "user").order(username: "asc")
  end

  def show
  end

  def update
    if @user.update(user_params)
      render "users/show"
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @user.destroy!
  end

  private

  ALLOWED_PARAMS = [:username, :password, :password_confirmation]

  def user_params
    params.permit(ALLOWED_PARAMS)
  end
end
