
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
    return store.get('tracks') || []
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
        alert('Invalid data')
        return
    }

    // Check if the track already exists in storage
    const trackExists = tracks.some(_track => _track.id === newTrack.id)

    if (trackExists) {
        alert('This track already exists')
        return
    }

    // Add the new track to the tracks array
    tracks.push(newTrack)
    
    // Store the updated tracks array
    store.set('tracks', tracks)

    // Reset the track form
    await resetTrackForm()
}


async function resetTrackForm() {
    document.querySelector('#newSongTitle').value = ""
    document.querySelector('#newSongArtist').value = ""
    document.querySelector('#newSongId').value = ""
}