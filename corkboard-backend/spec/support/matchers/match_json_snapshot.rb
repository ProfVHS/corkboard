RSpec::Matchers.define :match_json_snapshot do |snapshot_name|
  def uuid_regex
    /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i
  end

  def timestamp_regex
    /\A\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?\z/
  end

  def any_key?(key)
    k = key.to_s
    k == "id" || k.end_with?("_id")
  end

  match do |actual|
    actual = JSON.parse(actual) if actual.is_a?(String)

    spec_file = RSpec.current_example.metadata[:file_path]
    spec_dir = File.dirname(spec_file)
    path = Rails.root.join(spec_dir, "snapshots", "#{snapshot_name}.json")
    @snapshot_name = snapshot_name
    @snapshot_path = path

    if ENV["UPDATE_SNAPSHOTS"] == "true" || !File.exist?(path)
      existed = File.exist?(path)
      FileUtils.mkdir_p(File.dirname(path))
      File.write(path, JSON.pretty_generate(auto_any(actual)))
      warn "Snapshot #{existed ? 'updated' : 'created'}: #{path}"
      next true
    end

    expected = JSON.parse(File.read(path))
    @diff_expected = expected
    @diff_actual = actual
    json_match?(expected, actual)
  end

  def auto_any(value, key = nil)
    return "ANY" if any_key?(key) && !value.is_a?(Hash) && !value.is_a?(Array)

    case value
    when Hash
      value.to_h { |k, v| [k, auto_any(v, k)] }
    when Array
      value.map { |v| auto_any(v, key) }
    when String
      (value.match?(uuid_regex) || value.match?(timestamp_regex)) ? "ANY" : value
    else
      value
    end
  end

  def json_match?(expected, actual)
    return true if expected == "ANY"

    if expected.is_a?(Hash) && actual.is_a?(Hash)
      return false unless expected.keys.sort == actual.keys.sort
      expected.all? { |k, v| json_match?(v, actual[k]) }
    elsif expected.is_a?(Array) && actual.is_a?(Array)
      expected.size == actual.size &&
        expected.zip(actual).all? { |e, a| json_match?(e, a) }
    else
      expected == actual
    end
  end

  def mask_any(expected, actual)
    return "ANY" if expected == "ANY"

    if expected.is_a?(Hash) && actual.is_a?(Hash)
      actual.to_h { |k, v| [k, expected.key?(k) ? mask_any(expected[k], v) : v] }
    elsif expected.is_a?(Array) && actual.is_a?(Array)
      actual.each_with_index.map { |a, i| i < expected.size ? mask_any(expected[i], a) : a }
    else
      actual
    end
  end

  failure_message do
    expected_str = JSON.pretty_generate(@diff_expected)
    got_str      = JSON.pretty_generate(mask_any(@diff_expected, @diff_actual))

    diff = RSpec::Support::Differ.new(color: RSpec::Matchers.configuration.color?)
                                 .diff(got_str, expected_str)

    <<~MSG
      snapshot: #{@snapshot_name}
      file: #{@snapshot_path}

      expected:
      #{expected_str}

      got:
      #{got_str}

      diff (- expected, + got):
      #{diff}

      To accept the new output: UPDATE_SNAPSHOTS=true bundle exec rspec #{RSpec.current_example.metadata[:location]}
    MSG
  end
end
