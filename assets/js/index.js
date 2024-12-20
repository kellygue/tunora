document.addEventListener('DOMContentLoaded', async () => {
    window.tunoraEndpoint = "https://tunora.fly.dev/player"
    window.audioElm = document.querySelector('#audioElement')
    window.currentTrackProgress = document.querySelector('#currentTrackProgress')
    window.playPauseButton = document.querySelector('#playPauseButton')
    window.currentTrackIsPlaying = false
    window.currentTrackId = null
    window.requestIsLoading = false
    window.currentTrackDuration = 0
    window.currentTrackPlaying = null
    
    
    await getAllSongs().then(async () => await initListeners())
})

// Initialize all the event listeners
async function initListeners() {
    let songBtns = document.querySelectorAll('.songBtn')
    // Listen to all clicks on song buttons
    songBtns.forEach(songBtn => {
        let songId = songBtn.getAttribute('data-song')
        songBtn.addEventListener('click', () => set_current_playing_track(songId))
    });

    // Listen to when the player is ready and retrive metadata
    audioElm.addEventListener('loadedmetadata', () => {
        window.currentTrackDuration = parseFloat(window.audioElm.duration).toFixed(2)
        window.currentTrackProgress.max = parseFloat(window.audioElm.duration).toFixed(2)
        document.querySelector('#audioElmDuration').innerHTML = formatTime(window.audioElm.duration)
    })
    audioElm.addEventListener('timeupdate', async () => {
        window.currentTrackProgress.value = parseFloat(window.audioElm.currentTime).toFixed(2)
        document.querySelector('#audioElmCurrentTime').innerHTML = formatTime(window.audioElm.currentTime)

        if (window.audioElm.currentTime >= window.audioElm.duration) {
            await resetPlayer()
        }
    })
    window.currentTrackProgress.addEventListener('sl-input', (e) => {
        if (window.currentTrackIsPlaying === false) {
            window.currentTrackProgress.value = 0
            return
        }

        window.audioElm.currentTime = window.currentTrackProgress.value
    })
}

async function getAllSongs() {
    const songs = await fetch('assets/songs.json').then(response => response.json())
    
    songs.forEach(song => {
        let elm = buildSongElm(song)
        document.querySelector('#tracksContainer').appendChild(elm)
    });

}

// Play a song
async function play(songId) {
    window.audioElm.src = currentTrackPlaying
    window.audioElm.load()
    window.playPauseButton.click()
    window.currentTrackIsPlaying = true
}

// Getting the stream url
async function set_current_playing_track(songId) {
    if (songId === window.currentTrackId) {
        window.audioElm.currentTime = 0
        return
    }

    await resetPlayer()
    
    window.requestIsLoading = true

    fetch(`${tunoraEndpoint}/play/${songId}`)
    .then(response => response.text())  // Parse response as text
    .then(data => {
        window.currentTrackPlaying = data
        window.audioElm.src = window.currentTrackPlaying
        window.currentTrackId = songId
        window.playPauseButton.click()
        window.requestIsLoading = false
    })
    .catch(error => {
        console.error('Error fetching the track:', error)
        window.requestIsLoading = false
    });
}

// Resetting the player
async function resetPlayer() {
    window.currentTrackId = null
    window.currentTrackIsPlaying = false
    window.currentTrackPlaying = null
    window.currentTrackProgress.value = 0
    window.playPauseButton.click()
    window.audioElm.load()
}

// Format seconds into the following format: 00:00
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60); // Get the number of minutes
    const remainingSeconds = Math.floor(seconds % 60); // Get the remaining seconds
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`; // Format as mm:ss
}

// Building the song element
function buildSongElm(song) {
    // Create the button
    const button = document.createElement('button');
    button.className = 'songBtn flex items-center w-full border-b p-4';
    button.setAttribute('data-song', song.id);

    // Create the flex container for song details
    const songDetailsDiv = document.createElement('div');
    songDetailsDiv.className = 'flex flex-col gap-y-1 justify-start items-start';

    // Create the song title span
    const songTitleSpan = document.createElement('span');
    songTitleSpan.textContent = song.title;

    // Create the artist small tag
    const artistSmall = document.createElement('small');
    artistSmall.textContent = song.artist;

    // Append title and artist to the details div
    songDetailsDiv.appendChild(songTitleSpan);
    songDetailsDiv.appendChild(artistSmall);

    // Create the play icon container
    const playIconDiv = document.createElement('div');
    playIconDiv.className = 'ml-auto';

    // Create the play icon
    const playIcon = document.createElement('sl-icon');
    playIcon.setAttribute('name', 'play-fill');
    playIcon.className = 'text-xl';

    // Append the play icon to its container
    playIconDiv.appendChild(playIcon);

    // Append details and play icon to the button
    button.appendChild(songDetailsDiv);
    button.appendChild(playIconDiv);

    return button
}