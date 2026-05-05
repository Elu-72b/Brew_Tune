class AddThemeToMelodies < ActiveRecord::Migration[8.1]
  def change
    add_column :melodies, :theme, :string
  end
end
