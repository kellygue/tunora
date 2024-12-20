/**
 * Initializes the event listeners for the controls (e.g., play/pause button).
 * This function is called when the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    initControlsListeners();  // Initialize the play/pause button listener
});

/**
 * Sets up the event listener for the play/pause button.
 * This toggles playback of the current track and updates the button's appearance.
 */
function initControlsListeners() {
    // Add a click event listener to the play/pause button
    playPauseButton.addEventListener('click', () => {
        // If no track is playing, exit early
        if (window.currentTrackPlaying === null) return;

        // SVG icons for play and pause states
        let playSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><polygon points="5,3 19,12 5,21" /></svg>`;
        let pauseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>`;

        // Toggle playback state based on whether the track is playing or paused
        if (window.currentTrackIsPlaying === true) {
            // Pause the audio and update the button icon and label
            window.audioElm.pause();
            playPauseButton.innerHTML = playSvg;  // Change to play icon
            playPauseButton.setAttribute('aria-label', 'Play');  // Update button accessibility label
            window.currentTrackIsPlaying = false;  // Track is no longer playing
        } else {
            // Play the audio and update the button icon and label
            window.audioElm.play();
            playPauseButton.innerHTML = pauseSvg;  // Change to pause icon
            playPauseButton.setAttribute('aria-label', 'Pause');  // Update button accessibility label
            window.currentTrackIsPlaying = true;  // Track is now playing
        }
    });
}
