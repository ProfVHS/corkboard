json.extract! release, :id, :name, :current, :position, :status
json.progress release.progress
json.set! :next, local_assigns[:next_id].present? && release.id == local_assigns[:next_id]
