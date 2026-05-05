import { Controller } from "@hotwired/stimulus"
import * as Tone from "tone"

export default class extends Controller {
  static targets = ["playButton"]
  static values = { notes: Array, bpm: Number }

  connect() {
    this.synth = null
    this.playTimer = null
  }

  disconnect() {
    this.stop()
  }

  async toggle() {
    if (this.synth) {
      this.stop()
    } else {
      await this.play()
    }
  }

  async play() {
    if (this.notesValue.length === 0) return

    await Tone.start()

    this.synth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
    }).toDestination()

    const secPerBeat = 60 / this.bpmValue
    const now = Tone.now()

    this.notesValue.forEach((note, i) => {
      this.synth.triggerAttackRelease(note.pitch, "8n", now + i * secPerBeat)
    })

    this.setPlaying(true)

    const totalMs = this.notesValue.length * secPerBeat * 1000
    this.playTimer = setTimeout(() => this.stop(), totalMs)
  }

  stop() {
    if (this.playTimer) {
      clearTimeout(this.playTimer)
      this.playTimer = null
    }
    if (this.synth) {
      this.synth.dispose()
      this.synth = null
    }
    this.setPlaying(false)
  }

  setPlaying(playing) {
    if (!this.hasPlayButtonTarget) return
    const btn = this.playButtonTarget
    if (playing) {
      btn.textContent = "■ 停止"
      btn.classList.replace("bg-indigo-600", "bg-red-500")
      btn.classList.replace("hover:bg-indigo-700", "hover:bg-red-600")
    } else {
      btn.textContent = "▶ 再生"
      btn.classList.replace("bg-red-500", "bg-indigo-600")
      btn.classList.replace("hover:bg-red-600", "hover:bg-indigo-700")
    }
  }
}
