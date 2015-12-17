# json.extract! @poem, :id, :title, :author, :poem, :created_at, :updated_at

json.poemObj do
  json.id @poem.id
  json.title @poem.title
  json.author @poem.author

  json.poemContent @poem.poem

  # json.array! @poem.poem do |line|
  #   json.array! line do |wordData|
  #     json.linkToGIF wordData.linkToGIF
  #     json.word wordData.word
  #   end
  # end

  json.created_at @poem.created_at
  json.updated_at @poem.updated_at
end
