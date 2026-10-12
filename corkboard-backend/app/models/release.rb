# == Schema Information
#
# Table name: releases
#
#  id           :uuid             not null, primary key
#  completed    :boolean          not null
#  current      :boolean          not null
#  name         :string           not null
#  order        :integer          not null
#  status       :string           default("NOT_QUEUED"), not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  workspace_id :uuid             not null
#
# Foreign Keys
#
#  fk_rails_...  (workspace_id => workspaces.id) ON DELETE => cascade
#


class Release < ApplicationRecord
  belongs_to :workspace
  has_many :tasks

  before_save :defaults
  before_save :set_current

  default_scope { where(completed: false) }

  NOT_QUEUED = "NOT_QUEUED"
  QUEUED = "QUEUED"

  def next_release
    Release.find_by(workspace_id: self.workspace_id, order: self.order + 1)
  end

  def set_current
    if !self.current && self.status_changed? && self.status === Release::QUEUED
      current_release = Release.where(workspace_id: self.workspace_id, current: true).first

      self.current = true if current_release.nil?
    end
  end

  def progress
    tasks = self.tasks.size
    accepted_tasks = self.tasks.where(status: Task.statuses[:accepted]).size

    if tasks.size.positive?
      { tasks:, accepted_tasks: }
    else
      nil
    end
  end

  def defaults
    self.completed ||= false
    self.current ||= false
    self.status ||= NOT_QUEUED
  end
end
