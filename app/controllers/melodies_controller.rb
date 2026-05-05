class MelodiesController < ApplicationController
  def index
    @theme_filter = params[:theme]
    @melodies = Melody.order(created_at: :desc)
    @melodies = @melodies.where(theme: @theme_filter) if @theme_filter.present?
    @themes = Melody.distinct.pluck(:theme).compact.reject(&:blank?).sort
  end

  def new
    @melody = Melody.new
    @themes = Melody.distinct.pluck(:theme).compact.reject(&:blank?).sort
  end

  def create
    notes = JSON.parse(params.dig(:melody, :notes_json) || "[]")
    @melody = Melody.new(
      nickname: params.dig(:melody, :nickname),
      bpm:      params.dig(:melody, :bpm).to_i,
      notes:    notes,
      theme:    params.dig(:melody, :theme).presence
    )
    if @melody.save
      redirect_to melodies_path
    else
      @themes = Melody.distinct.pluck(:theme).compact.reject(&:blank?).sort
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    Melody.find(params[:id]).destroy
    redirect_to melodies_path
  end
end
