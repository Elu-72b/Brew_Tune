class Melody < ApplicationRecord
  validates :nickname, presence: true, length: { maximum: 50 }
  validates :bpm, presence: true, inclusion: { in: [60, 80, 100] }
  validates :notes, presence: true
  validate :notes_length

  private

  def notes_length
    errors.add(:notes, :too_long) if notes.length > 16
  end
end
