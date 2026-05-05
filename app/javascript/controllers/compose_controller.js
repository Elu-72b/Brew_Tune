import { Controller } from "@hotwired/stimulus"
import * as Tone from "tone"

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const PITCH_TO_SEMITONE = Object.fromEntries(NOTE_NAMES.map((n, i) => [n, i]))

const CHORD_TYPES = {
  '0,4,7':     'maj',
  '0,3,7':     'm',
  '0,3,6':     'dim',
  '0,4,8':     'aug',
  '0,2,7':     'sus2',
  '0,5,7':     'sus4',
  '0,4,7,10':  '7',
  '0,4,7,11':  'maj7',
  '0,3,7,10':  'm7',
  '0,3,6,10':  'm7b5',
}

const SAMPLER_URLS = {
  C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
  A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3",
  "F#5": "Fs5.mp3", A5: "A5.mp3", C6: "C6.mp3"
}
const SAMPLER_BASE = "https://tonejs.github.io/audio/salamander/"

function detectChord(notes) {
  const pitchClasses = [...new Set(
    notes
      .filter(n => n.pitch !== 'R')
      .map(n => n.pitch.replace(/\d+$/, ''))
  )]
  if (pitchClasses.length < 2) return null

  const semitones = pitchClasses
    .map(p => PITCH_TO_SEMITONE[p])
    .filter(s => s !== undefined)

  for (const root of semitones) {
    const intervals = [...new Set(semitones.map(s => (s - root + 12) % 12))].sort((a, b) => a - b)
    const key = intervals.join(',')
    if (CHORD_TYPES[key]) {
      return NOTE_NAMES[root] + CHORD_TYPES[key]
    }
  }

  if (pitchClasses.length === 2) {
    const diff = ((PITCH_TO_SEMITONE[pitchClasses[1]] - PITCH_TO_SEMITONE[pitchClasses[0]]) + 12) % 12
    const INTERVALS = { 1:'短2度', 2:'長2度', 3:'短3度', 4:'長3度', 5:'完全4度', 6:'増4度', 7:'完全5度', 8:'短6度', 9:'長6度', 10:'短7度', 11:'長7度' }
    return INTERVALS[diff] ? `${pitchClasses[0]} - ${pitchClasses[1]}（${INTERVALS[diff]}）` : null
  }

  return pitchClasses.join(' / ')
}

export default class extends Controller {
  static targets = ["cell", "bpmButton", "bpmInput", "notesContainer", "playButton", "noteCount", "themeInput", "chordDisplay", "soundTypeButton"]

  connect() {
    this.notes = []
    this.bpm = 120
    this.soundType = 'synth'
    this.synth = null
  }

  disconnect() {
    this.stopPlayback()
  }

  selectTheme(event) {
    this.themeInputTarget.value = event.currentTarget.dataset.theme
  }

  selectSoundType(event) {
    this.soundType = event.currentTarget.dataset.soundType
    this.soundTypeButtonTargets.forEach(btn => {
      const active = btn.dataset.soundType === this.soundType
      btn.className = btn.className
        .replace(/bg-indigo-600 text-white border-indigo-600|border-gray-400 text-gray-700 hover:border-indigo-400/, "")
        .trim()
      btn.className += active
        ? " bg-indigo-600 text-white border-indigo-600"
        : " border-gray-400 text-gray-700 hover:border-indigo-400"
    })
  }

  addNote(event) {
    event.stopPropagation()
    if (this.notes.length >= 32) return

    const note = event.currentTarget.dataset.note
    this.notes.push({ pitch: note, time: this.notes.length })
    this.updateGrid()
    this.updateHiddenFields()
  }

  addRest() {
    if (this.notes.length >= 32) return

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
    if (this.notes.length === 0) return

    this.stopPlayback()
    await Tone.start()

    this.synth = await this.createInstrument()

    const secPerBeat = 60 / this.bpm
    const now = Tone.now()
    const duration = this.soundType === 'piano' ? "4n" : "8n"

    this.notes.forEach((note, i) => {
      if (note.pitch !== "R") {
        this.synth.triggerAttackRelease(note.pitch, duration, now + i * secPerBeat)
      }
    })

    this.setPlayingState(true)

    const totalDuration = this.notes.length * secPerBeat * 1000
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
        cell.style.cssText = "height:2rem;min-width:0;border-radius:3px;border:1px dashed #d1d5db;background:#f9fafb;"
        cell.textContent = ""
      } else if (note.pitch === "R") {
        cell.style.cssText = "height:2rem;min-width:0;border-radius:3px;border:1px solid #d1d5db;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:#6b7280;"
        cell.textContent = "𝄽"
      } else {
        cell.style.cssText = "height:2rem;min-width:0;border-radius:3px;border:1px solid #818cf8;background:#c7d2fe;"
        cell.textContent = ""
      }
    })

    if (this.hasNoteCountTarget) {
      this.noteCountTarget.textContent = this.notes.length
    }

    if (this.hasChordDisplayTarget) {
      const chord = detectChord(this.notes)
      this.chordDisplayTarget.textContent = chord ? `🎵 ${chord}` : ""
    }
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
