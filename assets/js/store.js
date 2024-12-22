/**
 * @file store.js
 * @description This file contains all the stores of the application and is responsible for managing the state of the application.
 */

/**
 * @typedef {Object} Track
 * @property {number|null} id - The unique identifier of the track.
 * @property {string|null} url - The URL of the track.
 * @property {string|null} title - The title of the track.
 * @property {string|null} artist - The artist of the track.
 * @property {array|null} genre - The artist of the track.
 * @property {string|null} cover - The image URL of the track.
 * @property {Date|null} urlLastUpdated - The last time the url has been updated.
 * @since 1.0.0
 */

/**
 * Store the name of all the stores in the application.
 * @type {Array<string>}
 * @constant
 * @default
 * @readonly
 * @since 1.0.0
 * @version 1.0.0
 * */
const storesList = ['app', 'backend', 'currentTrack', 'queue', 'tracks']

document.addEventListener('alpine:init', () => {
    // ------------------ app --------------------
    // A store that contains miscellaneous information about the application. for example is a request is loading or not, the current page, etc.
    Alpine.store('app', {
        isLoading: false,
        currentPage: 'home',
        discogsAccessToken: "YCdDUCsvhIlOSUaDsLKeHqsLYmnIPLuGNaxmsjoV",
        discogBaseEndpoint: "https://api.discogs.com/database",
        debugMode: false, // Set to false before deployment
        trackUrlExpiry: 2 * 60 * 60 * 1000, // Expire the URL after 2 hours
    })





    // ------------------ backend --------------------
    // A store that contains everything related to the backend
    Alpine.store('backend', {
        base_endpoint: "https://tunora.fly.dev/player"
    })





    // ------------------ currentTrack --------------------
    // Global store to contain information about the current track
    Alpine.store('currentTrack', {
        // Data properties
        id: null,
        url: null,
        title: null,
        artist: null,
        cover: null,

        // State properties
        isPlaying: false,
        isMuted: false,
        isLooping: false,

        // Use the id to get the track details from the track store
        async loadDetails(id, url) {
            if (!id || !url) {
                return
            }

            let track = Alpine.store('tracks').all.find(track => track.id === id)

            if (!track) {
                window.notyf.error('Track not found')
                return
            }

            this.id = id
            this.url = url
            this.title = track.title
            this.artist = track.artist
            this.cover = track.cover

            window.dispatchEvent(new CustomEvent('trackDetailsLoaded', {
                ...track,
                url: this.url
            }))
        },

        /**
         * Plays the current track if it is not already playing and a URL is available.
         */
        async play() {
            if (this.isPlaying === true || this.url === null) return
            this.isPlaying = true
        },

        /**
         * Pauses the current track if it is playing and a URL is available.
         */
        async pause() {
            if (this.isPlaying === false || this.url === null) return
            this.isPlaying = false
        },

        /**
         * Reset the current track
         */
        async reset() {
            await this.pause()
        }
    })




    
    // ------------------ queue --------------------
    // Create a new store named 'queue' with the following properties and methods
    Alpine.store('queue', {
        tracks: [],

        createQueue(tracks) {
            this.tracks = tracks
        },

        addToQueue(track, position) {
            if (position === -1) {
                this.tracks.push(track)
            } else {
                this.tracks.splice(position, 0, track)
            }
        },

        removeFromQueue(trackId) {
            this.tracks = this.tracks.filter(track => track.id !== trackId)
        }
    })




    // ------------------ tracks --------------------
    // Store to manage all tracks in the application
    Alpine.store('tracks', {
        all: [],

        async init() {
            await this.getAllTracks()
        },

        async getAllTracks() {
            this.all = store.get('tracks') || []
        },

        async addTrack(track) {
            this.all.push(track)
            store.set('tracks', this.all)
        },

        removeTrack(id) {
            // Filter out the track with the given id
            const _tracks = this.all.filter(track => track.id !== id);
            
            // Update the tracks array
            this.all = _tracks;
            
            // Persist the updated tracks array in the store (e.g., localStorage)
            store.set('tracks', _tracks);
        },        

        async updateTrack(track) {
            let index = this.all.findIndex(t => t.id === track.id)

            if (index === -1) {
                return "Error updating track"
            }

            if (track.url) {
                this.all[index].urlLastUpdated = Date.now()
            }

            this.all[index].title = track.title || this.all[index].title
            this.all[index].artist = track.artist || this.all[index].artist
            this.all[index].genre = track.genre || this.all[index].genre
            this.all[index].cover = track.cover || this.all[index].cover
            this.all[index].url = track.url || this.all[index].url

            store.set('tracks', this.all)

            return "Track updated successfully"
        }
    })
})
