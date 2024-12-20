import { getAllTracks } from "./storage.js"
import { resetPlayer } from "./playerControls.js"

/**
 * Initializes the application when the DOM content is fully loaded.
 * Sets global variables and prepares the application by fetching songs and initializing event listeners.
 */
document.addEventListener('DOMContentLoaded', async () => {
    /**
     * The base endpoint URL for the Tunora API.
     * @type {string}
     */
    window.tunoraEndpoint = "https://tunora.fly.dev/player";

    /**
     * The audio element responsible for playing tracks.
     * @type {HTMLAudioElement|null}
     */
    window.audioElm = document.querySelector('#audioElement');

    /**
     * The progress bar element that shows the current track progress.
     * @type {HTMLElement|null}
     */
    window.currentTrackProgress = document.querySelector('#currentTrackProgress');

    /**
     * The button element that toggles play and pause states.
     * @type {HTMLElement|null}
     */
    window.playPauseButton = document.querySelector('#playPauseButton');

    /**
     * A flag indicating whether the current track is playing.
     * @type {boolean}
     */
    window.currentTrackIsPlaying = false;

    /**
     * The ID of the currently playing track.
     * @type {string|null}
     */
    window.currentTrackId = null;

    /**
     * A flag indicating whether an API request is currently loading.
     * Used to prevent multiple overlapping requests.
     * @type {boolean}
     */
    window.requestIsLoading = false;

    /**
     * The duration of the currently playing track, in seconds.
     * @type {number}
     */
    window.currentTrackDuration = 0;

    /**
     * The data object representing the currently playing track.
     * @type {object|null}
     */
    window.currentTrackPlaying = null;

    /**
     * Initializing the notification library Notyf
     */
    window.notyf = new Notyf({
        ripple: false,
        position: {
            x: 'right',
            y: 'top'
        }
    })

    // Fetch all songs from the server and initialize event listeners.
    await showTracks().then(async () => await initListeners());
});


/**
 * Initializes all event listeners for the audio player and song buttons.
 */
async function initListeners() {
    /**
     * A list of all song button elements that allow the user to select a track.
     * @type {NodeListOf<Element>}
     */
    let songBtns = document.querySelectorAll('.songBtn');

    // Attach click event listeners to each song button to set the currently playing track.
    songBtns.forEach(songBtn => {
        /**
         * The ID of the song associated with the button.
         * @type {string}
         */
        let songId = songBtn.getAttribute('data-song');
        songBtn.addEventListener('click', () => set_current_playing_track(songId));
    });

    /**
     * Event listener for when the audio element is ready to play and metadata is available.
     */
    audioElm.addEventListener('canplaythrough', async () => {
        // Handle duration calculation differently for iPhones due to compatibility issues.
        if (navigator.userAgent.includes("iPhone")) {
            window.currentTrackDuration = parseFloat(window.audioElm.duration / 2).toFixed(2);
        } else {
            window.currentTrackDuration = parseFloat(window.audioElm.duration).toFixed(2);
        }

        // Update the maximum value of the progress bar to match the track duration.
        window.currentTrackProgress.max = window.currentTrackDuration;

        // Display the total track duration in a formatted time string.
        document.querySelector('#audioElmDuration').innerHTML = formatTime(window.currentTrackDuration);
    });

    /**
     * Event listener for updating the progress bar and current time display as the track plays.
     */
    audioElm.addEventListener('timeupdate', async () => {
        // Update the progress bar value and current time display.
        window.currentTrackProgress.value = parseFloat(window.audioElm.currentTime).toFixed(2);
        document.querySelector('#audioElmCurrentTime').innerHTML = formatTime(window.audioElm.currentTime);

        // If the track has finished playing, reset the player.
        if (window.audioElm.currentTime >= window.audioElm.duration) {
            await resetPlayer();
        }
    });

    /**
     * Event listener for the progress bar's input events to allow seeking within the track.
     * Uses the `sl-input` event to detect slider changes.
     */
    window.currentTrackProgress.addEventListener('sl-input', (e) => {
        // If the track is not playing, prevent seeking and reset progress.
        if (window.currentTrackIsPlaying === false) {
            window.currentTrackProgress.value = 0;
            return;
        }

        // Update the audio element's current time to match the slider's value.
        window.audioElm.currentTime = window.currentTrackProgress.value;
    });
}

// Display all the tracks
async function showTracks() {
    const songs = await getAllTracks()
    
    songs.forEach(song => {
        let elm = buildSongElm(song)
        document.querySelector('#tracksContainer').appendChild(elm)
    });
}


/**
 * Sets the current track to be played by fetching the track's URL and updating the audio element.
 * If the same track is clicked again, it resets the audio to the start.
 * @param {string} songId - The unique ID of the song to set as the current track.
 */
async function set_current_playing_track(songId) {
    // If the song clicked is already the current track, reset the playback to the beginning.
    if (songId === window.currentTrackId) {
        window.audioElm.currentTime = 0;  // Reset the audio to the start.
        return;  // Exit the function as no further action is needed.
    }

    // Reset the player before starting a new track.
    await resetPlayer();

    // Indicate that a request is in progress (to prevent multiple simultaneous requests).
    window.requestIsLoading = true;

    // Fetch the song URL from the server using the songId.
    fetch(`${tunoraEndpoint}/play/${songId}`)
        .then(response => response.text())  // Parse the response as plain text (song URL).
        .then(data => {
            // Set the song URL to be played.
            window.currentTrackPlaying = data;
            window.audioElm.src = window.currentTrackPlaying;  // Update the audio source.

            // Update the current track ID.
            window.currentTrackId = songId;

            // Reset the loading flag as the track has been successfully fetched and played.
            window.requestIsLoading = false;
            
            // Trigger the play/pause button to start playback.
            window.playPauseButton.click();
        })
        .catch(error => {
            // Handle any errors that occur during the fetch request.
            console.error('Error fetching the track:', error);

            // Reset the loading flag in case of an error.
            window.requestIsLoading = false;
        });
}


/**
 * Formats a given time in seconds into a string format of "mm:ss".
 * @param {number} seconds - The time in seconds to be formatted.
 * @returns {string} - The formatted time as "mm:ss".
 */
function formatTime(seconds) {
    // Calculate the number of minutes
    const minutes = Math.floor(seconds / 60);

    // Calculate the remaining seconds
    const remainingSeconds = Math.floor(seconds % 60);

    // Return the formatted string in "mm:ss" format, padding seconds if necessary
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Builds a song element (button) to display song details and a play icon.
 * @param {Object} song - The song object containing song details.
 * @param {string} song.id - The unique ID of the song.
 * @param {string} song.title - The title of the song.
 * @param {string} song.artist - The artist of the song.
 * @returns {HTMLButtonElement} - The button element representing the song.
 */
function buildSongElm(song) {
    // Create the button that will represent the song
    const button = document.createElement('button');
    button.className = 'songBtn flex items-center w-full border-b p-4';
    button.setAttribute('data-song', song.id);  // Set the song ID as a data attribute

    // Create a container for the song details
    const songDetailsDiv = document.createElement('div');
    songDetailsDiv.className = 'flex flex-col gap-y-1 justify-start items-start';

    // Create and append the song title
    const songTitleSpan = document.createElement('span');
    songTitleSpan.textContent = song.title;

    // Create and append the artist name
    const artistSmall = document.createElement('small');
    artistSmall.textContent = song.artist;

    // Append title and artist to the details container
    songDetailsDiv.appendChild(songTitleSpan);
    songDetailsDiv.appendChild(artistSmall);

    // Create a container for the play icon
    const playIconDiv = document.createElement('div');
    playIconDiv.className = 'ml-auto';

    // Create the play icon element
    const playIcon = document.createElement('sl-icon');
    playIcon.setAttribute('name', 'play-fill');  // Set the play icon
    playIcon.className = 'text-xl';  // Set the icon size

    // Append the play icon to the icon container
    playIconDiv.appendChild(playIcon);

    // Append the song details and play icon container to the button
    button.appendChild(songDetailsDiv);
    button.appendChild(playIconDiv);

    // Return the completed button element
    return button;
}
