import { Controller } from "@hotwired/stimulus"
import * as Tone from "tone"

export default class extends Controller {
  static targets = ["cell", "bpmButton", "bpmInput", "notesContainer", "playButton"]

  connect() {
    this.notes = []
    this.bpm = 80
    this.synth = null
  }

  disconnect() {
    this.stopPlayback()
  }

  addNote(event) {
    event.stopPropagation()
    if (this.notes.length >= 16) return

    const note = event.currentTarget.dataset.note
    this.notes.push({ pitch: note, time: this.notes.length })
    this.updateGrid()
    this.updateHiddenFields()
  }

  addRest() {
    if (this.notes.length >= 16) return

    this.notes.push({ pitch: "R", time: this.notes.length })
    this.updateGrid()
    this.updateHiddenFields()
  }

  selectBpm(event) {
    this.bpm = parseInt(event.currentTarget.dataset.bpm)
    this.bpmInputTarget.value = this.bpm

    this.bpmButtonTargets.forEach(btn => {
      const active = parseInt(btn.dataset.bpm) === this.bpm
      btn.className = btn.className
        .replace(/bg-indigo-600 text-white border-indigo-600|border-gray-400 text-gray-700 hover:border-indigo-400/, "")
        .trim()
      btn.className += active
        ? " bg-indigo-600 text-white border-indigo-600"
        : " border-gray-400 text-gray-700 hover:border-indigo-400"
    })
  }

  clear() {
    this.stopPlayback()
    this.notes = []
    this.updateGrid()
    this.updateHiddenFields()
  }

  async play() {
    if (this.notes.length === 0) return

    this.stopPlayback()
    await Tone.start()

    this.synth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
    }).toDestination()

    const secPerBeat = 60 / this.bpm
    const now = Tone.now()

    this.notes.forEach((note, i) => {
      if (note.pitch !== "R") {
        this.synth.triggerAttackRelease(note.pitch, "8n", now + i * secPerBeat)
      }
    })

    this.setPlayingState(true)

    const totalDuration = (this.notes.length) * secPerBeat * 1000
    this.playTimer = setTimeout(() => this.setPlayingState(false), totalDuration)
  }

  stopPlayback() {
    if (this.playTimer) {
      clearTimeout(this.playTimer)
      this.playTimer = null
    }
    if (this.synth) {
      this.synth.dispose()
      this.synth = null
    }
    this.setPlayingState(false)
  }

  setPlayingState(playing) {
    if (!this.hasPlayButtonTarget) return
    const btn = this.playButtonTarget
    if (playing) {
      btn.textContent = "■ 停止"
      btn.dataset.action = "click->compose#stopPlayback"
      btn.classList.replace("bg-indigo-600", "bg-red-500")
      btn.classList.replace("hover:bg-indigo-700", "hover:bg-red-600")
    } else {
      btn.textContent = "▶ 再生"
      btn.dataset.action = "click->compose#play"
      btn.classList.replace("bg-red-500", "bg-indigo-600")
      btn.classList.replace("hover:bg-red-600", "hover:bg-indigo-700")
    }
  }

  updateGrid() {
    this.cellTargets.forEach((cell, i) => {
      const note = this.notes[i]
      if (!note) {
        cell.style.cssText = "height:2.5rem;min-width:0;overflow:hidden;border-radius:0.25rem;border:2px dashed #d1d5db;display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:#9ca3af;"
        cell.textContent = ""
      } else if (note.pitch === "R") {
        cell.style.cssText = "height:2.5rem;min-width:0;overflow:hidden;border-radius:0.25rem;border:2px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:1rem;color:#6b7280;background:#f9fafb;"
        cell.textContent = "𝄽"
      } else {
        cell.style.cssText = "height:2.5rem;min-width:0;overflow:hidden;border-radius:0.25rem;border:2px solid #818cf8;display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:#4338ca;background:#e0e7ff;font-weight:500;"
        cell.textContent = note.pitch
      }
    })
  }

  updateHiddenFields() {
    this.notesContainerTarget.innerHTML = ""
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "melody[notes_json]"
    input.value = JSON.stringify(this.notes)
    this.notesContainerTarget.appendChild(input)
  }
}
