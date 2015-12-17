class ChangePoemToString < ActiveRecord::Migration
  def change
    change_column :poems, :poem, :string, null: false
  end
end
