document.addEventListener('DOMContentLoaded', () => {
    initControlsListeners()
})

function initControlsListeners() {
    playPauseButton.addEventListener('click', () => {
        if(window.currentTrackPlaying === null) return

        let playSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><polygon points="5,3 19,12 5,21" /></svg>`,
            pauseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>`

        if (window.currentTrackIsPlaying === true) {
            window.audioElm.pause()
            playPauseButton.innerHTML = playSvg
            playPauseButton.setAttribute('aria-label', 'Play')
            window.currentTrackIsPlaying = false
        } else {
            window.audioElm.play()
            playPauseButton.innerHTML = pauseSvg
            playPauseButton.setAttribute('aria-label', 'Pause')
            window.currentTrackIsPlaying = true
        }
    })
}