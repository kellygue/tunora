// This file contains all the stores of the application and is responsible for managing the state of the application.
document.addEventListener('alpine:init', () => {
    // A store that contains miscelanous information about the application. for example is a request is loading or not, the current page, etc.
    Alpine.store('app', {
        isLoading: false,
        currentPage: 'home',
    })

    // A store that contains the endpoint of the API.
    Alpine.store('api', {
        base_endpoint: "https://tunora.fly.dev/player"
    })

    // Global store to contain information about the current track
    Alpine.store('currentTrack', {
        // Data properties
        id: null,
        url: null,
        title: null,
        artist: null,
        image: null,

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
            this.image = track.image

            window.dispatchEvent(new CustomEvent('trackDetailsLoaded', {
                ...track,
                url: this.url
            }))
        }
    })
    
    
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

    Alpine.store('tracks', {
        all: [],

        async init() {
            await this.getAllTracks()
        },

        async getAllTracks() {
            this.all = store.get('tracks') || []
        },

        async showTracks() {
            this.$store.app.isLoading = true

            let response = await fetch(`${this.$store.api.base_endpoint}/tracks`)
            let data = await response.json()

            this.tracks = data

            this.$store.app.isLoading = false
        }
    })
})
