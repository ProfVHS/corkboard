require_relative "boot"
require "rails/all"
require "action_cable/engine"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module CorkboardBackend
  class Application < Rails::Application
    config.load_defaults 8.1
    config.autoload_lib(ignore: %w[assets tasks])

    config.autoload_paths << Rails.root.join("app/services")
    config.eager_load_paths << Rails.root.join("app/services")

    config.api_only = false
    config.session_store :cookie_store, key: '_corkboard-session'
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use config.session_store, config.session_options

    config.action_controller.default_url_options = { host: ENV.fetch('APP_HOST', 'http://localhost:3000'), protocol: 'https' }
  end
end
