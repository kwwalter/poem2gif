class AddPoem < ActiveRecord::Migration
  def change
    add_column :poems, :poemContent, :string, null: false
  end
end
