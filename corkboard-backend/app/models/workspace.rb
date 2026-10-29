# == Schema Information
#
# Table name: workspaces
#
#  id                  :uuid             not null, primary key
#  auto_assign         :boolean          default(FALSE)
#  code_prefix         :string(3)        not null
#  code_prefix_enabled :boolean          default(FALSE), not null
#  current             :boolean          default(FALSE), not null
#  name                :string           not null
#  slug                :string
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  owner_id            :uuid             not null
#
# Indexes
#
#  index_workspaces_on_slug  (slug) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (owner_id => users.id) ON DELETE => nullify
#





class Workspace < ApplicationRecord
  has_many :releases, dependent: :destroy
  has_many :tasks, dependent: :destroy
  has_many :documents, dependent: :destroy
  has_many :tags, dependent: :destroy

  has_and_belongs_to_many :users
  belongs_to :owner, class_name: "User", foreign_key: :owner_id

  validates :code_prefix, presence: true, length: { minimum: 1, maximum: 3 },
            format: { with: /\A[A-Z]+\z/, message: "only upper letters" }
  before_validation :generate_code_prefix

  def queued_releases
    releases.where(status: Release::QUEUED).reorder(:position)
  end

  def current_release
    queued_releases.first
  end

  def next_release
    queued_releases.offset(1).first
  end

  def generate_code_prefix
    return if code_prefix.present?

    words = name.to_s.split
    prefix = words.filter_map { |w| w[/[A-Za-z]/] }.join.upcase

    if prefix.blank? || prefix.length > 3
      letters_only = name.to_s.gsub(/[^A-Za-z]/, "")
      prefix = letters_only[0, 3].upcase
    end

    self.code_prefix = prefix.presence || "TSK"
  end

  def generate_code_prefix!
    generate_code_prefix
    save!
  end

  def rebuild_task_codes!
    tasks.order(:created_at).each_with_index do |task, index|
      number = index + 1
      task.update_columns(
        code_name: "#{code_prefix}-#{number.to_s.rjust(2, '0')}",
        code_number: number
      )
    end
  end
end
