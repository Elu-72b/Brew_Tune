class CreateMelodies < ActiveRecord::Migration[8.1]
  def change
    create_table :melodies do |t|
      t.string  :nickname, null: false
      t.integer :bpm,      null: false, default: 80
      t.jsonb   :notes,    null: false, default: []

      t.timestamps
    end
  end
end
