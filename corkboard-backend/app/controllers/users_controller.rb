class UsersController < ApplicationController
  before_action :authenticate_user!
  authorize_resource

  def me
    @user = current_user
  end

  def index
    @users = User.where(role: "user").order(username: "asc")
  end

  def show
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id])

    if @user.update(user_params)
      render "users/me"
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    User.destroy(params[:id])
  end

  private

  def user_params
    params.require(:user).permit(:username, :password, :password_confirmation, :avatar)
  end
end
