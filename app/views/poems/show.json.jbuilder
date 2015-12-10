# json.extract! @poem, :id, :title, :author, :poem, :created_at, :updated_at

json.poemObj do
  json.id @poem.id
  json.title @poem.title
  json.author @poem.author
  # json.poem @poem.poem.to_json
  json.poem @poem.poem
  json.created_at @poem.created_at
  json.updated_at @poem.updated_at
end
