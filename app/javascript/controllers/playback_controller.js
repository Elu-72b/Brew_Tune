import { Controller } from "@hotwired/stimulus"
import * as Tone from "tone"

const SAMPLER_URLS = {
  C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
  A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3",
  "F#5": "Fs5.mp3", A5: "A5.mp3", C6: "C6.mp3"
}
const SAMPLER_BASE = "https://tonejs.github.io/audio/salamander/"

export default class extends Controller {
  static targets = ["playButton", "soundTypeButton"]
  static values = { notes: Array, bpm: Number }

  connect() {
    this.synth = null
    this.playTimer = null
    this.soundType = 'synth'
  }

  disconnect() {
    this.stop()
  }

  selectSoundType(event) {
    this.soundType = event.currentTarget.dataset.soundType
    this.soundTypeButtonTargets.forEach(btn => {
      const active = btn.dataset.soundType === this.soundType
      btn.style.background = active ? '#e0e7ff' : 'white'
      btn.style.color = active ? '#4338ca' : '#6b7280'
      btn.style.borderColor = active ? '#a5b4fc' : '#d1d5db'
    })
  }

  async toggle() {
    if (this.synth) {
      this.stop()
    } else {
      await this.play()
    }
  }

  async createInstrument() {
    if (this.soundType === 'piano') {
      return new Promise((resolve) => {
        const sampler = new Tone.Sampler({
          urls: SAMPLER_URLS,
          baseUrl: SAMPLER_BASE,
          onload: () => resolve(sampler)
        }).toDestination()
      })
    } else {
      return new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
      }).toDestination()
    }
  }

  async play() {
    if (this.notesValue.length === 0) return

    await Tone.start()
    this.synth = await this.createInstrument()

    const secPerBeat = 60 / this.bpmValue
    const now = Tone.now()
    const duration = this.soundType === 'piano' ? "4n" : "8n"

    this.notesValue.forEach((note, i) => {
      if (note.pitch !== "R") {
        this.synth.triggerAttackRelease(note.pitch, duration, now + i * secPerBeat)
      }
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
