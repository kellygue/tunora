import page from "//unpkg.com/page/page.mjs";

page('/', async () => {
    await preNavigate(true)
})

page('/pages/add', async () => {
    await preNavigate()
    // Getting the content of the page
    const content = await fetch('/pages/add.html').then(response => response.text())
    document.querySelector('#pageContainer').innerHTML = content
    // Loading the necessary scripts for the page
    loadScript('/assets/js/pages/add.js')
})

page({ hashbang: true })
page()

async function preNavigate(isHome = false) {
    if (isHome) {
        document.querySelector('#mainScreen').style.display = 'block'
        document.querySelector('#pageContainer').style.display = 'none'
        return
    }

    document.querySelector('#mainScreen').style.display = 'none'
    document.querySelector('#pageContainer').style.display = 'block'
}

function loadScript(src, callback, errorCallback) {
    // Check if the script is already added to the DOM
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      console.log(`Script already loaded: ${src}`);
      if (callback) callback();  // Call callback immediately if script is already loaded
      return;
    }
  
    // Create the script tag
    const script = document.createElement('script');
    script.src = src;
    script.async = true; // Load the script asynchronously
    script.type = "module"
    script.onload = function() {
      console.log(`Script loaded successfully: ${src}`);
      if (callback) callback();
    };
    
    script.onerror = function(error) {
      console.error(`Failed to load script: ${src}`, error);
      if (errorCallback) errorCallback(error);
    };
  
    // Append the script to the body
    document.body.appendChild(script);
}