# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_06_185759) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "documents", force: :cascade do |t|
    t.jsonb "content"
    t.datetime "created_at", null: false
    t.string "name"
    t.bigint "owner_id", null: false
    t.bigint "task_id"
    t.datetime "updated_at", null: false
    t.bigint "workspace_id", null: false
    t.binary "yjs_state"
    t.index ["owner_id"], name: "index_documents_on_owner_id"
    t.index ["task_id"], name: "index_documents_on_task_id"
    t.index ["workspace_id"], name: "index_documents_on_workspace_id"
  end

  create_table "releases", force: :cascade do |t|
    t.boolean "completed"
    t.datetime "created_at", null: false
    t.boolean "current"
    t.string "name", null: false
    t.integer "order", null: false
    t.string "status"
    t.datetime "updated_at", null: false
    t.integer "workspace_id", null: false
  end

  create_table "tasks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "order"
    t.string "priority"
    t.integer "release_id"
    t.string "status"
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.string "workspace_id"
    t.index ["user_id"], name: "index_tasks_on_user_id"
  end

  create_table "user_preferences", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "task_display", default: "MODAL", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_user_preferences_on_user_id", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "jti", null: false
    t.bigint "last_workspace_id"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "role", default: "user", null: false
    t.datetime "updated_at", null: false
    t.citext "username"
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["last_workspace_id"], name: "index_users_on_last_workspace_id"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  create_table "users_workspaces", id: false, force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "workspace_id", null: false
    t.index ["user_id", "workspace_id"], name: "index_users_workspaces_on_user_id_and_workspace_id"
    t.index ["workspace_id", "user_id"], name: "index_users_workspaces_on_workspace_id_and_user_id"
  end

  create_table "workspace_invitations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "invited_by_user_id"
    t.integer "invited_user_id"
    t.string "status"
    t.datetime "updated_at", null: false
    t.integer "workspace_id"
  end

  create_table "workspaces", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.integer "owner_id"
    t.datetime "updated_at", null: false
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "documents", "tasks"
  add_foreign_key "documents", "users", column: "owner_id"
  add_foreign_key "documents", "workspaces"
  add_foreign_key "releases", "workspaces"
  add_foreign_key "tasks", "users"
  add_foreign_key "user_preferences", "users"
  add_foreign_key "users", "workspaces", column: "last_workspace_id"
  add_foreign_key "workspaces", "users", column: "owner_id", on_delete: :nullify
end
