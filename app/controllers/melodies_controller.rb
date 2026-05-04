class MelodiesController < ApplicationController
  def index
    @melodies = Melody.order(created_at: :desc)
  end

  def new
    @melody = Melody.new
  end

  def create
    @melody = Melody.new(melody_params)
    if @melody.save
      redirect_to melodies_path
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def melody_params
    params.expect(melody: [:nickname, :bpm, notes: []])
  end
end
