class MelodiesController < ApplicationController
  def index
    @theme_filter = params[:theme]
    @melodies = Melody.order(created_at: :desc)
    if @theme_filter.present?
      escaped = @theme_filter.gsub('%', '\%').gsub('_', '\_')
      @melodies = @melodies.where(
        "(' / ' || theme || ' / ') LIKE ?", "% / #{escaped} / %"
      )
    end
    @themes = Melody.pluck(:theme).compact.reject(&:blank?)
      .flat_map { |t| t.split(/\s*\/\s*/) }.map(&:strip)
      .reject(&:blank?).uniq.sort
  end

  def new
    @melody = Melody.new
    @themes = Melody.pluck(:theme).compact.reject(&:blank?)
      .flat_map { |t| t.split(/\s*\/\s*/) }.map(&:strip)
      .reject(&:blank?).uniq.sort
  end

  def create
    notes = JSON.parse(params.dig(:melody, :notes_json) || "[]")
    @melody = Melody.new(
      nickname: params.dig(:melody, :nickname),
      bpm:      params.dig(:melody, :bpm).to_i,
      notes:    notes,
      theme:    params.dig(:melody, :theme).presence,
      title:    params.dig(:melody, :title).presence
    )
    if @melody.save
      redirect_to melodies_path
    else
      @themes = Melody.pluck(:theme).compact.reject(&:blank?)
        .flat_map { |t| t.split(/\s*\/\s*/) }.map(&:strip)
        .reject(&:blank?).uniq.sort
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    Melody.find(params[:id]).destroy
    redirect_to melodies_path
  end
end
