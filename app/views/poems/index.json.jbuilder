json.array!(@poems) do |poem|
  json.extract! poem, :id, :title, :author, :poem
  # Not sure what this is from..
  # json.url poem_url(poem, format: :json)
end
