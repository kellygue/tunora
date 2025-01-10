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
        // let response = await fetch(`https://api.allorigins.win/raw?url=${this.$store.app.lastFMEndpoint}/method=track.search&track=Good+News&api_key=${this.$store.app.lastFMToken}&format=json`)

        /* Create a LastFM object */
        const lastfmInstance = new LastFM({
            apiKey    : 'ca76464bee2f0af2e0aba42d145fc997',
            apiSecret : '6be2fbcdb6bc4267a10c37d8287d7c3f',
        })

        /* Load some info. */
        lastfmInstance.track.getInfo({
            track: this.track.title || '',
            artist: this.track.artist || '',
            apiKey: 'ca76464bee2f0af2e0aba42d145fc997',
        },
        {
            success: function(_result){
                this.parent.coverChoices = []
                this.parent.coverChoices.push(_result.track.album.image[2]['#text'])
                this.parent.coverChoices.push(this.parent.defaultCover)
                this.parent.chosenCover = this.parent.coverChoices[0]
            },
            
            error: function(code, message){
                console.log(code, message)
            },

            parent: this
        })
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