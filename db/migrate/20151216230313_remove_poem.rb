class RemovePoem < ActiveRecord::Migration
  def change
    remove_column :poems, :poem
  end
end
