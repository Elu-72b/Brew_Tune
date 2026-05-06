class MelodiesController < ApplicationController
  before_action :set_melody, only: [:show, :edit, :update, :destroy]

  def index
    @theme_filter = params[:theme]
    @melodies = Melody.order(created_at: :desc)
    if @theme_filter.present?
      escaped = @theme_filter.gsub('%', '\%').gsub('_', '\_')
      @melodies = @melodies.where(
        "(' / ' || theme || ' / ') LIKE ?", "% / #{escaped} / %"
      )
    end
    @themes = all_tags
  end

  def new
    @melody = Melody.new
    @themes = all_tags
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
      redirect_to melody_path(@melody)
    else
      @themes = all_tags
      render :new, status: :unprocessable_entity
    end
  end

  def show
  end

  def edit
    @themes = all_tags
  end

  def update
    if @melody.update(
      nickname: params.dig(:melody, :nickname),
      bpm:      params.dig(:melody, :bpm).to_i,
      theme:    params.dig(:melody, :theme).presence,
      title:    params.dig(:melody, :title).presence
    )
      redirect_to melody_path(@melody)
    else
      @themes = all_tags
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @melody.destroy
    redirect_to melodies_path
  end

  private

  def set_melody
    @melody = Melody.find(params[:id])
  end

  def all_tags
    Melody.pluck(:theme).compact.reject(&:blank?)
      .flat_map { |t| t.split(/\s*\/\s*/) }.map(&:strip)
      .reject(&:blank?).uniq.sort
  end
end
