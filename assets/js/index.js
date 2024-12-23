import addPage from './pages/add.js'
import router from './router.js'

document.addEventListener('alpine:init', () => {
    
    Alpine.data('indexPage', () => ({
        // Store shortcuts
        elmStore: null,
        currentTrackStore: null,
        trackStore: null,
        appStore: null,

        // State
        bigPlayerOpen: false,

        /**
         * Initializes the application by setting up the Notyf library and event listeners.
         * This method is called when the page is loaded.
         * @returns {Promise<void>} - A promise that resolves when the initialization is complete.
         * 
         **/
        async init() {
            // Setting shorcuts for the stores
            this.currentTrackStore = this.$store.currentTrack
            this.trackStore = this.$store.tracks
            this.appStore = this.$store.app

            // Setting the most common elements
            this.elmStore = {
                audio: this.$refs.audioElm,
                playButton: this.$refs.playButton,
                pauseButton: this.$refs.pauseButton,
                nextButton: this.$refs.nextButton,
                previousButton: this.$refs.previousButton,
                seekBar: this.$refs.seekBar,
                volumeBar: this.$refs.volumeBar,
                currentTime: this.$refs.audioElmCurrentTime,
                duration: this.$refs.audioElmDuration,
                trackTitle: this.$refs.trackTitle,
                trackArtist: this.$refs.trackArtist,
                trackImage: this.$refs.trackImage,
            }

            // Initialize the Notyf notification library with custom settings
            window.notyf = new Notyf({
                ripple: false,
                position: {
                    x: 'right',
                    y: 'top'
                }
            })

            await this.initListeners()

            
            
        },

        /**
         * Initializes event listeners
         */
        async initListeners() {
            // No listeners for now
        },


        /**
         * Prepares a track to play by fetching its URL and resetting playback if the same track is clicked.
         * 
         * @async
         * @param {string} songId - The ID of the song to be played.
         * @returns {Promise<void>} - A promise that resolves when the track is prepared.
         * @throws {Error} - Throws an error if there is an issue fetching the track.
         */
        async prepareTrackToPlay(songId, shouldResumeIfSame = false, triggeredFromTheQueue = false) {

            // Reset playback if the same track is clicked
            if (songId === this.currentTrackStore.id) {

                if (shouldResumeIfSame && !this.$store.currentTrack.isPlaying) {
                    this.$store.currentTrack.play()
                    return
                }

                this.$dispatch('restart-current-track')
                return
            }

            // Set loading state to true
            this.appStore.isLoading = true

            // Fetch the track URL from the backend
            try {

                // Ensure that track.urlLastUpdated is a valid number (milliseconds since epoch).
                if (this.trackStore.all.length > 0) {

                    const _track = this.trackStore.all.find(track => track.id === songId)

                    if (_track && _track.url && _track.urlLastUpdated) {
                        
                        const trackExpiryTime = Date.now() - this.$store.app.trackUrlExpiry
                        // Check if the track URL has not expired
                        if (_track.urlLastUpdated > trackExpiryTime) {

                            // Dispatch the event with the track URL
                            this.$dispatch('track-returned', {
                                id: songId,
                                url: _track.url,
                                triggeredFromTheQueue: triggeredFromTheQueue
                            });

                            // Set the loading state to false
                            this.appStore.isLoading = false;

                            // Log the track info for debugging
                            return
                        }
                    }
                }
                
                const response = await fetch(`${this.$store.backend.base_endpoint}/play/${songId}`)
                const data = await response.text()

                if (data === 'invalid') {

                    this.$dispatch('track-invalid', {
                        id: songId
                    })

                    throw new Error("Track ID is invalid")
                }

                this.$dispatch('track-returned', {
                    id: songId,
                    url: data
                })

            } catch (error) {
                
                notyf.error('Error fetching the track. Track ID might be corrupted.')

                // Log the error to the console if debug mode is enabled
                if (this.appStore.debugMode) {
                    console.error('[Error] fetching the track:', error)
                }

            } finally {
                // Set loading state to false
                this.appStore.isLoading = false;
            }
        },

        /**
         * Formats a given time in seconds into a string format of "mm:ss".
         * @param {number} seconds - The time in seconds to be formatted.
         * @returns {string} - The formatted time as "mm:ss".
         */
        formatTime(seconds) {
            // Calculate the number of minutes
            const minutes = Math.floor(seconds / 60);

            // Calculate the remaining seconds
            const remainingSeconds = Math.floor(seconds % 60);

            // Return the formatted string in "mm:ss" format, padding seconds if necessary
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        },
    }))

    // Initialize the router component
    Alpine.data('router', router)

    // Initialize components for other pages
    Alpine.data('addPage', addPage)
})
