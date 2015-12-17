json.poemObj do
  json.id @poem.id
  json.title @poem.title
  json.author @poem.author
  json.poemContent @poem.poemContent
  json.created_at @poem.created_at
  json.updated_at @poem.updated_at
end
