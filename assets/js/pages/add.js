import { saveTrack } from '../storage.js'

await initAddListeners()

async function initAddListeners() {
    document.querySelector('#saveTrackBtn').addEventListener('click', saveTrack)
}