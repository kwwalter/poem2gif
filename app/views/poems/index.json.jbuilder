# json.array!(@poems) do |poem|
#   json.extract! poem, :id, :title, :author, :poem
#   # Not sure what this is from..
#   # json.url poem_url(poem, format: :json)
# end

json.poems(@poems) do |poem|
  json.id poem.id
  json.title poem.title
  json.author poem.author
  json.poemContent poem.poemContent
  json.created_at time_ago_in_words(poem.created_at) + " ago"
end
