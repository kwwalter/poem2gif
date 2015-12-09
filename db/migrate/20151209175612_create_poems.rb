class CreatePoems < ActiveRecord::Migration
  def change
    create_table :poems do |t|
      t.string :title, null: false
      t.string :author, null: false
      t.text :poem, array: true, null: false, default: []

      t.timestamps null: false
    end
  end
end
