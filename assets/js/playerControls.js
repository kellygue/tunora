document.addEventListener('alpine:init', () => {

    Alpine.data('player', () => ({
        elmStore: null,

        async init() {

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

            await this.initListeners()
            await this.initWatchers()
        },

        async initWatchers() {
            // Set up a watcher for the isPlaying property.
            // This watcher will play or pause the audio element based on the value of isPlaying.
            this.$watch('$store.currentTrack.isPlaying', (value) => {
            if (value) {
                this.$refs.audioElm.play();
            } else {
                this.$refs.audioElm.pause();
            }
            })
        },

        async initListeners() {
            /**
             * Event listener for when the audio element is ready to play and metadata is available.
             */
            this.elmStore.audio.addEventListener('canplaythrough', async () => {
                let duration = 0
                // Handle duration calculation differently for iPhones due to compatibility issues.
                if (navigator.userAgent.includes("iPhone")) {
                    duration = parseFloat(this.elmStore.audio.duration / 2).toFixed(2)
                } else {
                    duration = parseFloat(this.elmStore.audio.duration).toFixed(2)
                }

                // Set the max value of the seek bar to the duration of the track.
                this.elmStore.seekBar.max = duration

                // Set the volume bar value to the current volume.
                this.elmStore.volumeBar.value = this.elmStore.audio.volume * 100

                // Update the duration display.
                this.elmStore.duration.textContent = this.formatTime(duration)
            })

            /**
             * Event listener for updating the progress bar and current time display as the track plays.
             */
            this.elmStore.audio.addEventListener('timeupdate', async () => {
                // Update the seek bar value to match the current time.
                this.elmStore.seekBar.value = parseFloat(this.elmStore.audio.currentTime).toFixed(2)

                // Update the current time display.
                this.elmStore.currentTime.textContent = this.formatTime(this.elmStore.audio.currentTime)

                // If the track has finished playing, reset the player.
                if (parseFloat(this.elmStore.seekBar.value) >= parseFloat(this.elmStore.seekBar.max)) {
                    
                    if (this.$store.currentTrack.isLooping) {
                        this.$dispatch('restart-current-track')
                        return
                    }

                    await this.$store.queue.playNext()
                }
            })

            /**
             * Event listener for the progress bar's input events to allow seeking within the track.
             * Uses the `sl-input` event to detect slider changes.
             */
            this.elmStore.seekBar.addEventListener('sl-input', (e) => {
                // If the track is not playing, prevent seeking and reset progress.
                if (this.currentTrackStore.url === null) {
                    this.elmStore.seekBar.value = 0
                    return
                }

                // Update the current time of the track to match the seek bar value.
                this.elmStore.audio.currentTime = this.elmStore.seekBar.value
            })

            /**
             * Event listener for the volume bar's input events to allow adjusting the volume.
             * Uses the `sl-change` event to detect slider changes.
             */
            this.elmStore.volumeBar.addEventListener('sl-input', () => {
                // Update the volume of the track to match the volume bar value.
                this.elmStore.audio.volume = parseFloat(this.elmStore.volumeBar.value / 100).toFixed(2)
            })

            /**
             * Event listener for the custom event dispatched when the streaming url of a track has been returned form the API.
             */
            window.addEventListener('track-returned', (e) => {
                this.$store.currentTrack.loadDetails(e.detail.id, e.detail.url, e.detail.triggeredFromTheQueue)
            })

            window.addEventListener('restart-current-track', (e) => {
                this.$store.currentTrack.pause()
                this.elmStore.audio.currentTime = 0
                this.$store.currentTrack.play()
            })
        },
        
        /**
         * Toggle loop mode on the audio player.
         */
        async toggleLoop() {
            if (this.$store.queue.shouldRepeat == false) {
                this.$store.queue.shouldRepeat = true
            } else {
                if (this.$store.currentTrack.isLooping == false) {
                    this.$store.currentTrack.isLooping = true
                    document.querySelector('#trackLoopButton').setAttribute('name', 'repeat-1')
                } else {
                    this.$store.currentTrack.isLooping = false
                    this.$store.queue.shouldRepeat = false
                    document.querySelector('#trackLoopButton').setAttribute('name', 'repeat')
                }
            }
        },

        // Shuffle the queue of tracks.
        async shuffleQueue() {
            this.$store.queue.shuffleQueue()
        },

        // Show the queue of tracks.
        async showQueue() {
            this.$store.queue.isVisible = !this.$store.queue.isVisible
        },

        async resetPlayer() {
            this.$store.currentTrack.reset()
        },
    }))
})