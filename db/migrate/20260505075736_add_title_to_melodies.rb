class AddTitleToMelodies < ActiveRecord::Migration[8.1]
  def change
    add_column :melodies, :title, :string
  end
end
