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
      get "all_tasks"
    end
  end

  resources :backlog

  resources :tasks do
    member do
      put :move_to_next_release
    end
  end

  resources :workspaces do
    member do
      get :collaborators
      get :current_release
      get :releases
      post :invite_user
      post :accept_invitation
      delete :decline_invitation
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
