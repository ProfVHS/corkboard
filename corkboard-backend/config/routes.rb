Rails.application.routes.draw do
  mount ActionCable.server => "/cable"

  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users, path: "", path_names: {
    sign_in: "login",
    sign_out: "logout",
    registration: "signup"
  },
             controllers: {
               sessions: "users/sessions",
               registrations: "users/registrations"
             },
             defaults: { format: :json }

  resources :users do
    collection do
      get :me
    end
  end

  put "user_preferences", to: "user_preferences#update"

  resources :releases do
    member do
      get "board"
      put "move"
    end
  end

  resources :tasks do
    member do
      put :move_to_next_release
      put :move
    end
    resources :tags, only: [] do
      member do
        post :assign
        delete :unassign
      end
    end
  end

  resources :tags

  resources :workspaces do
    member do
      get :backlog, controller: "tasks", action: :backlog
      get :collaborators
      get :current_release
      post :invite_user
      post :accept_invitation
      delete :decline_invitation
      delete :cancel_invitation
      delete :delete_user
      delete :leave_workspace
      post :complete_release
    end

    collection do
      get :invitation
    end

    post :switch, on: :collection
  end

  resources :tasks do
    resource :document, only: [:show]
  end

  resources :documents do
    collection do
      post :authorize
    end
    member do
      get :ydoc
      put :ydoc, action: :update_ydoc
    end
  end

  post "/auth/verify_token", to: "auth#verify_token"
end
