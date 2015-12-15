class ChangeColumnInPoem < ActiveRecord::Migration
  def change
    change_column :poems, :poem, :text, array: true, default: [], null: false
  end
end
