export default () => ({
	screens: ['mainScreen', 'addTrackScreen'],
	currentScreen: null,

	init() {
		this.initScreens()
		this.initLinkHandlers()
		this.currentScreen = 'mainScreen'
	},

	initScreens() {
		
	},

	initLinkHandlers() {
		let links = document.querySelectorAll('[link]')

		links.forEach(link => {
			link.addEventListener('click', (event) => {
				const targetScreen = event.target.getAttribute('to') || 'mainScreen'
				this.handleNavigation(targetScreen)
			})
		})
	},

	handleNavigation(targetScreen) {
		this.currentScreen = targetScreen
	}

})