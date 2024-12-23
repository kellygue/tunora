export default () => ({
    track: {
        id: '',
        title: '',
        artist: '',
        image: '',
        url: '',
    },

    defaultCover: 'assets/img/default-cover.png',

    chosenCover: null,
    coverChoices: [],
    maxCoverChoices: 10,

    init() {

        // Listen for 'sl-slide-change' event
        window.addEventListener('sl-slide-change', (event) => this.setChosenCover(event.detail.index))

        // Always add the default cover to the coverChoices array
        this.coverChoices.push(this.defaultCover)
    },

    setChosenCover(index) {
        this.chosenCover = this.coverChoices[index] || this.defaultCover
    },

    async search() {
        let response = await fetch(`${this.$store.app.discogBaseEndpoint}/search?release_title=${encodeURI(this.track.title)}&artist=${encodeURI(this.track.artist)}&token=${this.$store.app.discogsAccessToken}`)
        let data = await response.json()

        console.log(this.coverChoices[0])

        this.coverChoices = []

        if (data.results.length > 0) {
            // Loop through the first 5 results and add them to the coverChoices array
            for (let i = 0; i < (data.results.length - 1); i++) {
                if (this.coverChoices.length >= this.maxCoverChoices) {
                    break
                }

                // Handle cover images
                if (data.results[i] && data.results[i].cover_image && (data.results[i].cover_image.includes('.jpeg') || data.results[i].cover_image.includes('.jpg') || data.results[i].cover_image.includes('.png'))) {
                    this.coverChoices.push(data.results[i].cover_image)
                }
            }
        }

        this.coverChoices.push(this.defaultCover)
        this.chosenCover = this.coverChoices[0]
    },

    async addTrack() {
        let track = {
            title: this.track.title,
            artist: this.track.artist,
            cover: this.chosenCover || this.defaultCover,
            url: this.track.url,
            genre: undefined,
            urlLastUpdated: 0, // timestamps
            id: this.track.id
        }

        this.$store.tracks.addTrack(track).then(() => {
            this.resetState()

            notyf.success(`${track.title} has been added successfully`)
        })

    },

    resetState() {
        this.track = {
            id: '',
            title: '',
            artist: '',
            image: '',
            url: '',
        },

        this.chosenCover = null
        this.coverChoices = [this.defaultCover]
    }
})