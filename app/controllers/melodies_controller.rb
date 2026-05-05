class MelodiesController < ApplicationController
  def index
    @melodies = Melody.order(created_at: :desc)
  end

  def new
    @melody = Melody.new
  end

  def create
    notes = JSON.parse(params.dig(:melody, :notes_json) || "[]")
    @melody = Melody.new(
      nickname: params.dig(:melody, :nickname),
      bpm: params.dig(:melody, :bpm).to_i,
      notes: notes
    )
    if @melody.save
      redirect_to melodies_path
    else
      render :new, status: :unprocessable_entity
    end
  end
end
