class Melody < ApplicationRecord
  validates :nickname, presence: true, length: { maximum: 50 }
  validates :bpm, presence: true, inclusion: { in: [ 100, 120, 150, 180, 240, 300, 360 ] }
  validates :notes, presence: true
  validates :theme, length: { maximum: 100 }, allow_blank: true
  validates :title, length: { maximum: 50 }, allow_blank: true
  validate :notes_length

  private

  def notes_length
    return unless notes.is_a?(Array)
    errors.add(:notes, :too_long) if notes.length > 32
  end
end
