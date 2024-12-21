/**
 * Retrieves all tracks from local storage.
 * 
 * This function fetches the list of tracks stored in localStorage under the 'tracks' key.
 * If no tracks are found, it returns an empty array.
 * 
 * @async
 * @function getAllTracks
 * @returns {Promise<Array>} A promise that resolves to an array of tracks.
 */
export async function getAllTracks() {
    // Retrieve and return the list of tracks from storage, or an empty array if none exist
    const tracks = store.get('tracks') || []
    await createQueue(tracks)
    return tracks
}





/**
 * Saves a single track to the local storage after validating input.
 * 
 * This function retrieves the track data (title, artist, ID) from the form inputs,
 * validates the input data, checks if the track already exists in the storage, 
 * and then saves the new track if valid.
 * 
 * @async
 * @function saveTrack
 * @returns {Promise<void>} Resolves when the track is saved and the form is reset.
 */
export async function saveTrack() {
    // Retrieve input values for title, artist, and id
    let title = document.querySelector('#newSongTitle').value,
        artist = document.querySelector('#newSongArtist').value,
        id = document.querySelector('#newSongId').value,
        
        // Create a new track object
        newTrack = {
            id: id,
            title: title,
            artist: artist,
        },
        
        // Retrieve stored tracks, or initialize an empty array if not present
        tracks = store.get('tracks') || []

    // Validate input data to ensure valid length for title, artist, and id
    if (title.length <= 2 || artist.length <= 2 || id.length <= 2) {
        notyf.error('Invalid data')
        return
    }

    // Check if the track already exists in storage
    const trackExists = tracks.some(_track => _track.id === newTrack.id)

    if (trackExists) {
        notyf.error('This track already exists')
        return
    }

    // Add the new track to the tracks array
    tracks.push(newTrack)
    
    // Store the updated tracks array
    store.set('tracks', tracks)

    // Reset the track form
    await resetTrackForm()

    notyf.success("Track added successfully")
}




/**
 * Creates a queue object with the given tracks and stores it.
 *
 * @async
 * @function createQueue
 * @param {Array} tracks - An array of track objects to be added to the queue.
 * @returns {Promise<void>} - A promise that resolves when the queue is created and stored.
 */
async function createQueue(tracks) {
    let queue = {
        id: 'queue',
        tracks: [...tracks]
    }

    store.set('queue', queue)
}





/**
 * Adds a track to the queue at the specified position.
 *
 * @async
 * @function addToQueue
 * @param {Object} track - The track object to be added to the queue.
 * @param {number} position - The position in the queue where the track should be added.
 * @returns {Promise<void>} - A promise that resolves when the track has been added to the queue.
 */
async function addToQueue(track, position) {
    let queue = store.get('queue')

    if (position === -1) {
        queue.tracks.push(track)
    } else {
        queue.tracks.splice(position, 0, track)
    }

    store.set('queue', queue)
}




/**
 * Removes a track from the queue based on the provided track ID.
 *
 * @async
 * @function removeFromQueue
 * @param {string} trackId - The ID of the track to be removed from the queue.
 * @returns {Promise<void>} - A promise that resolves when the track has been removed from the queue.
 */
async function removeFromQueue(trackId) {
    let queue = store.get('queue')

    queue.tracks = queue.tracks.filter(track => track.id !== trackId)

    store.set('queue', queue)
}





async function resetTrackForm() {
    document.querySelector('#newSongTitle').value = ""
    document.querySelector('#newSongArtist').value = ""
    document.querySelector('#newSongId').value = ""
}