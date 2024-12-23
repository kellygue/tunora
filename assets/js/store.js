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
        debugMode: true, // Set to false before deployment
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

            window.dispatchEvent(new CustomEvent('track-details-loaded', {
                detail: {
                    ...track,
                    url: this.url
                }
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
        unshuflledTracks: [],
        currentTrackIndex: 0,
        shouldRepeat: false,
        isShuffled: false,
        canPlayNext: true,
        canPlayPrevious: false,
        isVisible: false,
        draggedTrack: {
            id: undefined,
            index: undefined,
            cover: undefined,
            title: undefined,
            artist: undefined
        },
        floatingStyle: { top: 0, left: 0 },

        init() {
        },

        createQueue() {
            // If the queue is already created, skip
            if (this.tracks.length > 0) {
                Alpine.store('currentTrack').reset()
                Alpine.store('currentTrack').play()
                return
            }

            let _allTracks = Alpine.store('tracks').all,
                currentTrackId = Alpine.store('currentTrack').id,
                _currentTrackIndex = _allTracks.findIndex(track => track.id == currentTrackId),
                currentTrack = undefined

            if (_currentTrackIndex < 0) {
                if (Alpine.store('app').debugMode) {
                    console.warn("Unable to create queue. Current track index is not in the tracks array")
                }
                return
            }

            currentTrack = _allTracks[_currentTrackIndex]

            let _beforeCurrentTrack = _allTracks.slice(0, _currentTrackIndex),
                _afterCurrentTrack = _allTracks.slice(_currentTrackIndex + 1)

            this.tracks = [currentTrack, ..._afterCurrentTrack, ..._beforeCurrentTrack]
            this.unshuflledTracks = [currentTrack, ..._afterCurrentTrack, ..._beforeCurrentTrack]

            // Start the queue if it created
            Alpine.store('currentTrack').play()
        },

        addToQueue(track, position) {
            if (position === -1) {
                this.tracks.push(track)
            } else {
                this.tracks.splice(position, 0, track)
            }
        },

        playNext() {

            if (this.currentTrackIndex === (this.tracks.length - 1)) {

                if (!this.shouldRepeat) {
                    return
                }

                this.currentTrackIndex = -1
            }

            let nextTrackIndex = this.currentTrackIndex + 1,
            nextTrack = this.tracks[nextTrackIndex]

            window.dispatchEvent(new CustomEvent('queue-track-triggered', {
                detail: {
                    id: nextTrack.id,
                    url: nextTrack.url
                }
            }))

            this.currentTrackIndex = nextTrackIndex

            if (this.currentTrackIndex === this.tracks.length - 1 && !this.shouldRepeat) {
                this.canPlayNext = false
            } else {
                this.canPlayNext = true
            }
        },

        playPrevious() {
            
            if (this.currentTrackIndex === 0) {

                if (!this.shouldRepeat) {
                    return
                }

                this.currentTrackIndex = this.tracks.length
            }

            let nextTrackIndex = this.currentTrackIndex - 1,
            nextTrack = this.tracks[nextTrackIndex]

            window.dispatchEvent(new CustomEvent('queue-track-triggered', {
                detail: {
                    id: nextTrack.id,
                    url: nextTrack.url
                }
            }))

            this.currentTrackIndex = nextTrackIndex

            if (this.currentTrackIndex === 0 && !this.shouldRepeat) {
                this.canPlayPrevious = false
            } else {
                this.canPlayPrevious = true
            }
        },

        playTrack(trackId) {
            this.currentTrackIndex = this.tracks.findIndex(track => track.id === trackId)
            window.dispatchEvent(new CustomEvent('queue-track-triggered', {
                detail: {
                    id: trackId
                }
            }))
        },

        removeFromQueue(trackId, index) {
            if (this.currentTrackIndex === index) {
                return
            }

            this.tracks = [...this.tracks.filter((track, _index) => _index !== index)]
        },

        shuffleQueue() {

            if (this.isShuffled === true) {
                let currentTrack = this.tracks.find((track, index) => index === this.currentTrackIndex) 
                this.tracks = [...this.unshuflledTracks]
                this.currentTrackIndex = this.tracks.findIndex(track => track.id === currentTrack.id)
                this.isShuffled = false
                return
            }

            let currentTrack = this.tracks.find((track, index) => index === this.currentTrackIndex)           
            this.tracks.sort(() => Math.random() - 0.5)
            let filtered_tracks = this.tracks.filter(track => track.id !== currentTrack.id)
            this.tracks = [currentTrack, ...filtered_tracks]
            this.currentTrackIndex = 0

            this.isShuffled = true
        },

        dragStart(trackId, index, isTouchEvent = null) {
            console.log('--', index)
            if (isTouchEvent !== null) {
                isTouchEvent.preventDefault()
                this.updateFloatingStyle(isTouchEvent.touches[0]);
            }

            let _track = this.tracks.find(t => t.id == trackId)
            this.draggedTrack = {
                ..._track,
                index: index
            }
        },

        dropTrack(event, targetId, targetIndex, isTouchEnd = false) {
            event.preventDefault()

            if (targetIndex === this.draggedTrack.index) return

            let movedTrack = this.tracks[this.draggedTrack.index]

            this.tracks.splice(this.draggedTrack.index, 1)
            this.tracks.splice(targetIndex, 0, movedTrack)

            if (this.currentTrackIndex === this.draggedTrack.index) {
                this.currentTrackIndex = this.tracks.findIndex(track => track.id === this.draggedTrack.id)
            }

            if (this.currentTrackIndex === targetIndex) {
                this.currentTrackIndex = this.tracks.findIndex(track => track.id === targetId)
            }

            this.draggedTrack = {
                id: undefined,
                index: undefined,
                cover: undefined,
                title: undefined,
                artist: undefined
            }
        },

        touchMove(event) {
            this.updateFloatingStyle(event.touches[0])
        },

        touchEnd(event, trackId) {
            const touchY = event.changedTouches[0].clientY; // Get touch position
            const droppedIndex = this.getMobileDropIndex(touchY);

            if (droppedIndex !== -1) {
                let _targetTrack = this.tracks.find((t, i) => i === droppedIndex)
                this.dropTrack(event, _targetTrack.id, droppedIndex, true)
            }

            this.draggedTrack = {
                id: undefined,
                index: undefined,
                cover: undefined,
                title: undefined,
                artist: undefined
            }
        },

        getMobileDropIndex(touchY) {
            const listItems = document.querySelectorAll('.queue-track-item')
        
            for (let i = 0; i < listItems.length; i++) {
              const rect = listItems[i].getBoundingClientRect();
        
              // Check if the touch Y position is within the current element's bounds
              if (touchY >= rect.top && touchY <= rect.bottom) {
                return i;
              }
            }
        
            return -1; // Return -1 if no valid index is found
        },

        updateFloatingStyle(touch) {
            this.floatingStyle.top = touch.clientY;
            this.floatingStyle.left = touch.clientX;
        },
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
