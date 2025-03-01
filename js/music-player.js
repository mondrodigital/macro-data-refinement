// Create a self-executing function to avoid global scope pollution
(function() {
    // Function to create and add the slide-out music player
    function addSlideOutMusicPlayer() {
        console.log('Adding slide-out music player');
        
        // Remove any existing slide-out player
        const existingPlayer = document.querySelector('.slide-out-player');
        if (existingPlayer) {
            existingPlayer.remove();
        }
        
        // Create the slide-out player container
        const slideOutPlayer = document.createElement('div');
        slideOutPlayer.className = 'slide-out-player';
        
        // Set inline styles to ensure they take effect
        Object.assign(slideOutPlayer.style, {
            position: 'fixed',
            right: '-200px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '240px',
            backgroundColor: 'rgba(0, 24, 36, 0.9)',
            border: '2px solid #0ff',
            borderRadius: '10px 0 0 10px',
            boxShadow: '0 0 15px #0ff',
            transition: 'right 0.3s ease',
            zIndex: '9999',
            display: 'flex'
        });
        
        // Add hover effect
        slideOutPlayer.addEventListener('mouseenter', function() {
            this.style.right = '0';
        });
        
        slideOutPlayer.addEventListener('mouseleave', function() {
            this.style.right = '-200px';
        });
        
        // Create the tab
        const playerTab = document.createElement('div');
        playerTab.className = 'player-tab';
        Object.assign(playerTab.style, {
            width: '40px',
            backgroundColor: 'rgba(0, 24, 36, 0.9)',
            borderRight: '2px solid #0ff',
            borderRadius: '10px 0 0 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0ff',
            fontSize: '20px'
        });
        playerTab.innerHTML = '<i class="fas fa-music"></i>';
        
        // Create the content
        const playerContent = document.createElement('div');
        playerContent.className = 'player-content';
        Object.assign(playerContent.style, {
            padding: '15px',
            width: '200px'
        });
        
        // Add title
        const title = document.createElement('h3');
        title.textContent = 'Music to Refine To';
        Object.assign(title.style, {
            color: '#0ff',
            textShadow: '0 0 5px #0ff',
            fontSize: '16px',
            margin: '0 0 15px 0',
            textAlign: 'center'
        });
        
        // Add controls
        const controls = document.createElement('div');
        controls.className = 'player-controls';
        Object.assign(controls.style, {
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '15px'
        });
        
        // Play/Pause button
        const playPauseBtn = document.createElement('button');
        playPauseBtn.className = 'play-pause-btn';
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        Object.assign(playPauseBtn.style, {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
            border: '1px solid #0ff',
            color: '#0ff',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
        
        // Mute button
        const muteBtn = document.createElement('button');
        muteBtn.className = 'mute-btn';
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        Object.assign(muteBtn.style, {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
            border: '1px solid #0ff',
            color: '#0ff',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
        
        // Add volume container
        const volumeContainer = document.createElement('div');
        volumeContainer.className = 'volume-container';
        Object.assign(volumeContainer.style, {
            marginBottom: '15px'
        });
        
        // Volume slider
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.className = 'volume-slider';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.value = '100';
        Object.assign(volumeSlider.style, {
            width: '100%',
            height: '5px',
            background: 'rgba(0, 255, 255, 0.3)',
            borderRadius: '5px',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none'
        });
        
        // Source link
        const sourceLink = document.createElement('a');
        sourceLink.href = 'https://www.youtube.com/watch?v=JRnDYB28bL8';
        sourceLink.className = 'source-link';
        sourceLink.target = '_blank';
        sourceLink.textContent = 'Source: Apple TV';
        Object.assign(sourceLink.style, {
            color: '#0ff',
            fontSize: '12px',
            textDecoration: 'none',
            opacity: '0.8',
            display: 'block',
            textAlign: 'center'
        });
        
        // Assemble the player
        controls.appendChild(playPauseBtn);
        controls.appendChild(muteBtn);
        
        volumeContainer.appendChild(volumeSlider);
        
        playerContent.appendChild(title);
        playerContent.appendChild(controls);
        playerContent.appendChild(volumeContainer);
        playerContent.appendChild(sourceLink);
        
        slideOutPlayer.appendChild(playerTab);
        slideOutPlayer.appendChild(playerContent);
        
        document.body.appendChild(slideOutPlayer);
        
        // Set up audio functionality
        let audio = document.querySelector('audio');
        if (!audio) {
            audio = new Audio('/audio/music.mp3');
            audio.loop = true;
            document.body.appendChild(audio);
        }
        
        // Add event listeners for the player controls
        playPauseBtn.addEventListener('click', function() {
            if (audio.paused) {
                audio.play();
                this.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                audio.pause();
                this.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
        
        muteBtn.addEventListener('click', function() {
            audio.muted = !audio.muted;
            this.innerHTML = audio.muted ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
        });
        
        volumeSlider.addEventListener('input', function() {
            audio.volume = this.value / 100;
        });
        
        // Add Font Awesome if it's not already included
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
        
        console.log('Slide-out music player added');
    }
    
    // Add the player when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addSlideOutMusicPlayer, 500);
        });
    } else {
        // DOM is already loaded
        setTimeout(addSlideOutMusicPlayer, 500);
    }
    
    // Also add it when the window loads (as a backup)
    window.addEventListener('load', function() {
        setTimeout(addSlideOutMusicPlayer, 1000);
    });
    
    // Add a periodic check to ensure the player is added
    setInterval(function() {
        if (!document.querySelector('.slide-out-player')) {
            addSlideOutMusicPlayer();
        }
    }, 3000);

    // Expose the initialization function globally
    window.initMusicPlayer = addSlideOutMusicPlayer;
})(); 