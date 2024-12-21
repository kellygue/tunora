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

            // Display all the tracks and initialize event listeners once tracks are shown
            await this.showTracks()
            .then(async () => {
                await this.initListeners()
            })
        },

        /**
         * Initializes all event listeners for the audio player and song buttons.
         */
        async initListeners() {
            // A list of all song button elements that allow the user to select a track.
            let songBtns = document.querySelectorAll('.songBtn');

            // Attach click event listeners to each song button to set the currently playing track.
            songBtns.forEach(songBtn => {

                // The ID of the song associated with the button.
                let songId = songBtn.getAttribute('data-song');

                songBtn.addEventListener('click', () => this.set_current_playing_track(songId))

            });
        },

        // Display all the tracks
        async showTracks() {
            const tracks = this.trackStore.all
            
            tracks.forEach(track => {
                let elm = this.buildSongElm(track)
                document.querySelector('#tracksContainer').appendChild(elm)
            });
        },


        /**
         * Sets the current track to be played by fetching the track's URL and updating the audio element.
         * If the same track is clicked again, it resets the audio to the start.
         * @param {string} songId - The unique ID of the song to set as the current track.
         */
        async set_current_playing_track(songId) {
            // If the song clicked is already the current track, reset the playback to the beginning.
            if (songId === this.currentTrackStore.id) {
                this.elmStore.audio.currentTime = 0;  // Reset the audio to the start.
                return;  // Exit the function as no further action is needed.
            }

            // Indicate that a request is in progress (to prevent multiple simultaneous requests).
            this.appStore.isLoading = true

            // Fetch the song URL from the server using the songId.
            fetch(`${this.$store.api.base_endpoint}/play/${songId}`)
                .then(response => response.text())  // Parse the response as plain text (song URL).
                .then(data => {
                    // Dispatch an event to indicate that the track is ready to be played.
                    this.$dispatch('trackUrlReturned', {
                        id: songId,
                        url: data
                    })
                })
                .catch(error => {
                    // Handle any errors that occur during the fetch request.
                    console.error('Error fetching the track:', error);
                })
                .finally(() => {
                    // Indicate that the request is complete (whether successful or not).
                    this.appStore.isLoading = false;
                });
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

        /**
         * Builds a song element (button) to display song details and a play icon.
         * @param {Object} song - The song object containing song details.
         * @param {string} song.id - The unique ID of the song.
         * @param {string} song.title - The title of the song.
         * @param {string} song.artist - The artist of the song.
         * @returns {HTMLButtonElement} - The button element representing the song.
         */
        buildSongElm(song) {
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
    }))
})
