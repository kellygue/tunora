// SVG icons for play and pause states
const playSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><polygon points="5,3 19,12 5,21"/></svg>`
let pauseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>`

/**
 * Initializes the event listeners for the controls (e.g., play/pause button).
 * This function is called when the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', async () => {
    await initControlsListeners();  // Initialize the play/pause button listener
});

/**
 * Sets up the event listener for the play/pause button.
 * This toggles playback of the current track and updates the button's appearance.
 */
async function initControlsListeners() {
    // Add a click event listener to the play/pause button
    playPauseButton.addEventListener('click', async () => {
        // If no track is playing, exit early
        if (window.currentTrackPlaying === null) return;

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

        // Update the playing indicator in the track list
        await showIndicator()
    });


    // Activate or deactivate track loop
    document.querySelector('#trackLoopBtn').addEventListener('sl-change', () => {
        window.audioElm.loop = document.querySelector('#trackLoopBtn').checked
    })
}


/**
 * Updates the play/pause indicator for the currently playing track.
 * - Changes the icon of the previously playing track (if any) to 'play-fill'.
 * - Updates the icon of the newly playing track to 'pause-fill'.
 * 
 * @async
 */
async function showIndicator() {
    // Get the current playing track icon, or set it to null if it doesn't exist
    const currentPlayingTrackIcon = document.querySelector("#currentPlayingTrackIcon") || null;
    
    // If an icon for the currently playing track exists, set its icon to 'play-fill'
    if (currentPlayingTrackIcon !== null) {
        currentPlayingTrackIcon.id = ""
        currentPlayingTrackIcon.setAttribute('name', 'play-fill')
    }

    // Locate the element corresponding to the new current track using the global `currentTrackId`
    const currentTrackElement = document.querySelector(`[data-song=${window.currentTrackId}]`) || null
    if (currentTrackElement === null) return

    // Find the first <sl-icon> element within the current track element
    const icon = currentTrackElement.getElementsByTagName('sl-icon')[0]
    
    // Update the icon to indicate it is the currently playing track
    icon.id = "currentPlayingTrackIcon";

    if (currentTrackIsPlaying === false) {
        icon.setAttribute('name', 'play-fill')
        return
    }

    icon.setAttribute('name', 'pause-fill');
}

/**
 * Resets the audio player to its initial state.
 * Stops the current track, clears the progress, and prepares the player for the next track.
 */
export async function resetPlayer() {
    playPauseButton.innerHTML = playSvg;  // Change to play icon
    playPauseButton.setAttribute('aria-label', 'Play');  // Update button accessibility label

    // Reset the global variables related to the current track.
    window.currentTrackId = null;  // Clear the current track ID.
    window.currentTrackIsPlaying = false;  // Indicate that no track is currently playing.
    window.currentTrackPlaying = null;  // Clear the URL of the currently playing track.

    // Reset the track progress bar to 0.
    window.currentTrackProgress.value = 0;

    // Reload the audio element to prepare it for a new track.
    window.audioElm.load();
}