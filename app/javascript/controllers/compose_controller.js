import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["cell", "bpmButton", "bpmInput", "notesContainer"]

  connect() {
    this.notes = []
    this.bpm = 80
  }

  addNote(event) {
    event.stopPropagation()
    if (this.notes.length >= 16) return

    const note = event.currentTarget.dataset.note
    this.notes.push({ pitch: note, time: this.notes.length })
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
    this.notes = []
    this.updateGrid()
    this.updateHiddenFields()
  }

  updateGrid() {
    this.cellTargets.forEach((cell, i) => {
      const note = this.notes[i]
      if (note) {
        cell.textContent = note.pitch
        cell.className = cell.className
          .replace("border-dashed border-gray-300 text-gray-400", "")
          .trim()
          + " bg-indigo-100 border-indigo-400 text-indigo-700 font-medium"
      } else {
        cell.textContent = ""
        cell.className = "h-10 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400"
      }
    })
  }

  updateHiddenFields() {
    this.notesContainerTarget.innerHTML = ""
    this.notes.forEach((note, i) => {
      ["pitch", "time"].forEach(key => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = `melody[notes][${i}][${key}]`
        input.value = note[key]
        this.notesContainerTarget.appendChild(input)
      })
    })
  }
}
