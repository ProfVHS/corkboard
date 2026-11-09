# == Schema Information
#
# Table name: releases
#
#  id           :uuid             not null, primary key
#  completed    :boolean          not null
#  current      :boolean          not null
#  name         :string           not null
#  position     :integer          not null
#  status       :string           default("NOT_QUEUED"), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  workspace_id :uuid             not null
#
# Indexes
#
#  index_releases_on_workspace_id_and_status_and_position  (workspace_id,status,position)
#
# Foreign Keys
#
#  fk_rails_...  (workspace_id => workspaces.id) ON DELETE => cascade
#


class Release < ApplicationRecord
  belongs_to :workspace
  has_many :tasks, dependent: :destroy

  before_save :defaults
  before_save :set_current

  after_destroy :promote_next_current, if: :current

  default_scope { where(completed: false) }
  acts_as_list scope: [:workspace_id, :status], top_of_list: 0

  NOT_QUEUED = "NOT_QUEUED"
  QUEUED = "QUEUED"

  def self.next_release_id(releases)
    list = releases.sort_by(&:position)
    current = list.find(&:current)
    return nil unless current

    list.find { |r| r.position > current.position && r.status == "QUEUED" }&.id
  end

  def as_broadcast(next_id: nil)
    {
      id: id,
      name: name,
      status: status,
      position: position,
      current: current,
      progress: progress,
      next: next_id.present? && id == next_id
    }
  end

  def next_release
    return unless status == QUEUED

    workspace.releases
             .where(status: QUEUED)
             .where("releases.position > ?", position)
             .order(:position)
             .first
  end

  def set_current
    if !self.current && self.status_changed? && self.status === Release::QUEUED
      current_release = Release.where(workspace_id: self.workspace_id, current: true).first

      self.current = true if current_release.nil?
    end
  end

  def progress
    if tasks.loaded?
      { tasks: tasks.size, accepted_tasks: tasks.count { |t| t.status == "accepted" } }
    else
      { tasks: tasks.count, accepted_tasks: tasks.where(status: "accepted").count }
    end
  end

  def promote_next_current
    return if Release.exists?(workspace_id: workspace_id, current: true)

    Release.where(workspace_id: workspace_id, status: QUEUED)
           .where.not(id: id)
           .order(:position)
           .first
      &.update_columns(current: true)
  end

  def defaults
    self.completed ||= false
    self.current ||= false
    self.status ||= NOT_QUEUED
  end
end
