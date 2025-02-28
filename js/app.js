document.addEventListener('DOMContentLoaded', () => {
    // Application state
    const state = {
        currentScreen: 'branch-screen',
        userName: 'Refinement Worker',
        selectedCountry: null,
        selectedFile: null,
        selectedNumbers: [],
        buckets: {
            1: { progress: 1, numbers: [] },
            2: { progress: 5, numbers: [] },
            3: { progress: 0, numbers: [] },
            4: { progress: 0, numbers: [] },
            5: { progress: 3, numbers: [] }
        },
        totalProgress: 3,
        hexCodes: {
            current1: 'x00000',
            current2: 'x00006'
        },
        selectionGroupActive: false,
        isDragging: false,
        touchIdentifier: null,
        dragOffsetX: 0,
        dragOffsetY: 0,
        isMobile: false,
        mouseDown: false,
        hoverCells: [],
        hasShownKeyboardHint: false,
        audioPlayer: {
            isPlaying: false,
            isMuted: false,
            volume: 70,
            youtubePlayer: null,
            youtubeReady: false,
            youtubeVideoId: 'JRnDYB28bL8', // Severance theme YouTube video ID
            updateInterval: null
        }
    };

    // DOM Elements
    const screens = {
        name: document.getElementById('name-screen'),
        branch: document.getElementById('branch-screen'),
        file: document.getElementById('file-screen'),
        grid: document.getElementById('grid-screen')
    };

    const elements = {
        nameInput: document.getElementById('user-name-input'),
        nameSubmit: document.getElementById('submit-name-btn'),
        userNameDisplay: document.getElementById('display-user-name'),
        countryButtons: document.querySelectorAll('[data-country]'),
        fileButtons: document.querySelectorAll('[data-file]'),
        numberGrid: document.getElementById('number-grid'),
        selectedNumbersContainer: document.getElementById('selected-numbers'),
        currentFile: document.getElementById('current-file'),
        totalProgress: document.getElementById('total-progress'),
        bucketDropZones: document.querySelectorAll('.bucket-drop-zone'),
        bucketProgress: document.querySelectorAll('[id^="bucket-"][id$="-progress"]'),
        hexCode1: document.getElementById('hex-code-1'),
        hexCode2: document.getElementById('hex-code-2'),
        // Music player elements
        audioElement: document.getElementById('audio-player'),
        playPauseBtn: document.getElementById('play-pause-btn'),
        playIcon: document.querySelector('.play-icon'),
        pauseIcon: document.querySelector('.pause-icon'),
        progressBar: document.querySelector('.progress-bar'),
        progressFill: document.getElementById('progress-fill'),
        currentTimeDisplay: document.getElementById('current-time'),
        durationDisplay: document.getElementById('duration'),
        muteBtn: document.getElementById('mute-btn'),
        volumeSlider: document.getElementById('volume-slider'),
        youtubeContainer: document.getElementById('youtube-player-container')
    };

    // Initialize the application
    initApp();

    function initApp() {
        // Detect if mobile
        detectMobile();
        
        // Add event listeners
        addEventListeners();
        
        // Update UI based on initial state
        updateUI();
        
        // Start hex code animation
        startHexCodeAnimation();
        
        // Ensure viewport meta tag is set for mobile
        ensureViewportMeta();
        
        // Initialize hasShownKeyboardHint flag
        state.hasShownKeyboardHint = false;
        
        // Set default username in display
        elements.userNameDisplay.textContent = state.userName;
        
        // Debug log
        console.log('App initialized');
        console.log('File buttons found:', elements.fileButtons.length);
        
        // Initialize music player
        initMusicPlayer();
        
        // Show the active screen
        showScreen(state.currentScreen);
    }
    
    function detectMobile() {
        state.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        document.body.classList.toggle('mobile-device', state.isMobile);
    }
    
    function ensureViewportMeta() {
        // Add viewport meta tag for mobile if not present
        if (!document.querySelector('meta[name="viewport"]')) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(meta);
        }
    }

    function addEventListeners() {
        // Name submission - keeping this code but it won't be used
        if (elements.nameSubmit) {
            elements.nameSubmit.addEventListener('click', () => {
                handleNameSubmit();
            });
            
            // Allow pressing Enter to submit name
            if (elements.nameInput) {
                elements.nameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        handleNameSubmit();
                    }
                });
            }
        }

        // Country selection
        elements.countryButtons.forEach(button => {
            button.addEventListener('click', () => {
                state.selectedCountry = button.dataset.country;
                navigateToScreen('file-screen');
                playSelectSound();
                console.log('Country selected:', state.selectedCountry);
            });
            
            // Add touch event for mobile
            button.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent double-firing with click
                state.selectedCountry = button.dataset.country;
                navigateToScreen('file-screen');
                playSelectSound();
                console.log('Country selected (touch):', state.selectedCountry);
            }, { passive: false });
        });

        // File selection
        console.log('Setting up file button listeners');
        elements.fileButtons.forEach((button, index) => {
            console.log(`Setting up listener for file button ${index}:`, button.dataset.file);
            
            button.addEventListener('click', () => {
                handleFileSelection(button);
            });
            
            // Add touch event for mobile
            button.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent double-firing with click
                handleFileSelection(button);
            }, { passive: false });
        });

        // Bucket drop zones
        elements.bucketDropZones.forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
            
            // Add touch events for mobile
            zone.addEventListener('touchmove', (e) => {
                e.preventDefault(); // Prevent scrolling when over drop zones
                handleTouchMove(e, zone);
            }, { passive: false });
        });
        
        // Add document-level touch event listeners for dragging
        document.addEventListener('touchmove', handleDocumentTouchMove, { passive: false });
        document.addEventListener('touchend', handleDocumentTouchEnd);
        document.addEventListener('touchcancel', handleDocumentTouchEnd);
        
        // Add mouse events for desktop
        if (!state.isMobile) {
            document.addEventListener('mousedown', handleDocumentMouseDown);
            document.addEventListener('mouseup', handleDocumentMouseUp);
            document.addEventListener('mousemove', handleDocumentMouseMove);
            
            // Add mousemove event to the number grid for the magnifying glass effect
            elements.numberGrid.addEventListener('mousemove', handleNumberGridMouseMove);
            elements.numberGrid.addEventListener('mouseleave', handleNumberGridMouseLeave);
        }
        
        // Add keyboard event listener for number keys to select buckets
        document.addEventListener('keydown', handleKeyDown);
    }

    function handleNameSubmit() {
        const nameInput = elements.nameInput.value.trim();
        if (nameInput) {
            state.userName = nameInput;
            elements.userNameDisplay.textContent = state.userName;
            navigateToScreen('branch-screen');
            playSelectSound();
        } else {
            // Shake the input field to indicate error
            elements.nameInput.classList.add('shake');
            setTimeout(() => {
                elements.nameInput.classList.remove('shake');
            }, 500);
        }
    }

    function navigateToScreen(screenId) {
        // Hide all screens
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // Show the target screen
        document.getElementById(screenId).classList.add('active');
        state.currentScreen = screenId;
    }

    function generateNumberGrid() {
        // Clear existing grid
        elements.numberGrid.innerHTML = '';

        // Generate random numbers for the grid
        const rows = 10;
        const cols = 14;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const number = Math.floor(Math.random() * 10);
                const cell = document.createElement('div');
                cell.className = 'number-cell';
                cell.textContent = number;
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.dataset.value = number;
                
                // Add random wiggle animation properties
                setWiggleProperties(cell);

                if (state.isMobile) {
                    // Mobile: Use click/touch to select
                    cell.addEventListener('click', () => {
                        handleNumberSelection(cell);
                    });
                    
                    cell.addEventListener('touchstart', (e) => {
                        if (state.currentScreen === 'grid-screen') {
                            e.preventDefault();
                        }
                        handleNumberSelection(cell);
                    }, { passive: false });
                } else {
                    // Desktop: Use click to select and hover for magnifying effect
                    cell.addEventListener('click', () => {
                        handleNumberSelection(cell);
                    });
                    
                    // Add hover effect for magnifying glass
                    cell.addEventListener('mouseenter', () => {
                        handleNumberHover(cell);
                        playHoverSound();
                    });
                    
                    cell.addEventListener('mouseleave', () => {
                        if (!state.mouseDown) {
                            handleNumberUnhover(cell);
                        }
                    });
                }

                elements.numberGrid.appendChild(cell);
            }
        }

        // Clear selected numbers
        state.selectedNumbers = [];
    }
    
    function setWiggleProperties(cell) {
        // Randomly decide if this cell should wiggle (70% chance)
        if (Math.random() < 0.7) {
            // Set random wiggle properties
            const wiggleAmount = Math.random() * 3 + 1; // 1-4px
            const wiggleSpeed = Math.random() * 6 + 4; // 4-10s
            const wiggleDelay = Math.random() * 2; // 0-2s
            
            cell.style.setProperty('--wiggle-duration', `${wiggleSpeed}s`);
            cell.style.setProperty('--wiggle-delay', `${wiggleDelay}s`);
            cell.style.setProperty('--wiggle-x', `${wiggleAmount}px`);
            cell.style.setProperty('--wiggle-y', `${-wiggleAmount}px`);
            cell.style.setProperty('--wiggle-x2', `${-wiggleAmount}px`);
            cell.style.setProperty('--wiggle-y2', `${wiggleAmount}px`);
            cell.style.setProperty('--wiggle-x3', `${wiggleAmount/2}px`);
            cell.style.setProperty('--wiggle-y3', `${-wiggleAmount/2}px`);
            cell.style.setProperty('--wiggle-x4', `${-wiggleAmount/2}px`);
            cell.style.setProperty('--wiggle-y4', `${wiggleAmount/2}px`);
        }
    }
    
    // Desktop mouse event handlers
    function handleDocumentMouseDown(e) {
        if (state.currentScreen !== 'grid-screen') return;
        
        state.mouseDown = true;
    }
    
    function handleDocumentMouseUp(e) {
        if (state.currentScreen !== 'grid-screen') return;
        
        state.mouseDown = false;
    }
    
    function handleDocumentMouseMove(e) {
        if (state.currentScreen !== 'grid-screen' || !state.mouseDown) return;
        
        // Check if mouse is over a number cell
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element && element.classList.contains('number-cell')) {
            // If we're dragging over a cell, select it
            if (!element.classList.contains('selected')) {
                handleNumberSelection(element);
            }
        }
    }
    
    // Function to handle mouse movement over the number grid
    function handleNumberGridMouseMove(e) {
        if (state.currentScreen !== 'grid-screen') return;
        
        // Get mouse position relative to the grid
        const gridRect = elements.numberGrid.getBoundingClientRect();
        const mouseX = e.clientX - gridRect.left;
        const mouseY = e.clientY - gridRect.top;
        
        // Get all cells in the grid
        const allCells = elements.numberGrid.querySelectorAll('.number-cell');
        
        // Loop through all cells to apply magnifying effect based on distance to mouse
        allCells.forEach(cell => {
            if (cell.classList.contains('selected')) return;
            
            // Get cell position
            const cellRect = cell.getBoundingClientRect();
            const cellCenterX = cellRect.left + cellRect.width / 2 - gridRect.left;
            const cellCenterY = cellRect.top + cellRect.height / 2 - gridRect.top;
            
            // Calculate distance from mouse to cell center
            const distance = Math.sqrt(
                Math.pow(mouseX - cellCenterX, 2) + 
                Math.pow(mouseY - cellCenterY, 2)
            );
            
            // Convert distance to grid cell units (approximate)
            const cellSize = (cellRect.width + cellRect.height) / 2;
            const distanceInCells = distance / cellSize;
            
            // Apply scale based on distance
            if (distanceInCells < 0.5) {
                // Main hover effect for the closest cell
                cell.classList.add('hover-effect');
                cell.classList.remove('ripple-effect-1');
                cell.classList.remove('ripple-effect-2');
            } else if (distanceInCells < 1.5) {
                // First ripple effect for cells within 1.5 cell distance
                cell.classList.remove('hover-effect');
                cell.classList.add('ripple-effect-1');
                cell.classList.remove('ripple-effect-2');
                
                // Calculate scale based on distance - closer cells get larger scale
                const scale = 1.8 - ((distanceInCells - 0.5) / 1.0 * 0.6);
                cell.style.setProperty('--dynamic-scale', `${scale.toFixed(2)}`);
            } else if (distanceInCells < 2.0) {
                // Second ripple effect for cells within 2.0 cell distance
                cell.classList.remove('hover-effect');
                cell.classList.remove('ripple-effect-1');
                cell.classList.add('ripple-effect-2');
                
                // Calculate scale based on distance - further cells get smaller scale
                const scale = 1.3 - ((distanceInCells - 1.5) / 0.5 * 0.2);
                cell.style.setProperty('--dynamic-scale', `${scale.toFixed(2)}`);
            } else {
                // Remove all effects for cells beyond the threshold
                cell.classList.remove('hover-effect');
                cell.classList.remove('ripple-effect-1');
                cell.classList.remove('ripple-effect-2');
                cell.style.removeProperty('--dynamic-scale');
            }
        });
    }
    
    // Function to handle mouse leaving the number grid
    function handleNumberGridMouseLeave() {
        if (state.currentScreen !== 'grid-screen') return;
        
        // Remove all hover effects when mouse leaves the grid
        const allCells = elements.numberGrid.querySelectorAll('.number-cell');
        allCells.forEach(cell => {
            if (!cell.classList.contains('selected')) {
                cell.classList.remove('hover-effect');
                cell.classList.remove('ripple-effect-1');
                cell.classList.remove('ripple-effect-2');
                cell.style.removeProperty('--dynamic-scale');
            }
        });
    }
    
    function handleNumberHover(cell) {
        // If already selected, don't apply hover effect
        if (cell.classList.contains('selected')) return;
        
        // Apply hover effect
        cell.classList.add('hover-effect');
    }
    
    function handleNumberUnhover(cell) {
        // Remove hover effect
        cell.classList.remove('hover-effect');
    }

    function handleNumberSelection(cell) {
        // If already have 9 selections and this one isn't selected, don't allow more
        if (state.selectedNumbers.length >= 9 && !cell.classList.contains('selected')) {
            return;
        }

        // Toggle selection
        if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            
            // Remove from selected numbers
            const index = state.selectedNumbers.findIndex(n => 
                n.row === cell.dataset.row && n.col === cell.dataset.col
            );
            
            if (index !== -1) {
                state.selectedNumbers.splice(index, 1);
            }
        } else {
            cell.classList.add('selected');
            
            // Add to selected numbers
            const numberData = {
                value: cell.dataset.value,
                row: cell.dataset.row,
                col: cell.dataset.col,
                element: cell
            };
            state.selectedNumbers.push(numberData);
        }

        // Play selection sound
        playSelectSound();

        // Update hex codes when selection changes
        updateHexCodes();
        
        // Check if we have 9 selections to show keyboard hint
        updateSelectionGroup();
    }

    function updateSelectionGroup() {
        // Check if we have 9 numbers selected
        if (state.selectedNumbers.length === 9) {
            // Show keyboard shortcut hint if this is the first time
            if (!state.hasShownKeyboardHint) {
                showKeyboardShortcutHint();
            }
        } else {
            // Hide keyboard shortcut hint
            hideKeyboardShortcutHint();
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.target.classList.add('highlight');
    }

    function handleDragLeave(e) {
        e.target.classList.remove('highlight');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('highlight');

        const data = e.dataTransfer.getData('text/plain');
        const bucketId = e.target.id.split('-')[1];

        // Only process if we have 9 numbers selected
        if (state.selectedNumbers.length === 9) {
            animateNumbersToBucket(state.selectedNumbers, bucketId);
        }
    }
    
    function handleTouchMove(e, zone) {
        // Simple touch move handler for bucket zones
        const touch = e.touches[0];
        if (!touch) return;
        
        const rect = zone.getBoundingClientRect();
        if (
            touch.clientX >= rect.left && 
            touch.clientX <= rect.right && 
            touch.clientY >= rect.top && 
            touch.clientY <= rect.bottom
        ) {
            zone.classList.add('highlight');
        } else {
            zone.classList.remove('highlight');
        }
    }
    
    function handleDocumentTouchMove(e) {
        // Prevent default to avoid scrolling issues
        if (state.currentScreen === 'grid-screen') {
            e.preventDefault();
        }

    }
    
    function handleDocumentTouchEnd(e) {
        // Touch end handler
    }
    
    function animateNumbersToBucket(numbers, bucketId) {
        // Get the bucket element
        const bucketElement = document.getElementById(`bucket-${bucketId}`);
        if (!bucketElement) return;
        
        // Animate the bucket opening
        bucketElement.classList.add('opening');
        
        // Create a copy of the numbers array to avoid modifying the original during animation
        const numbersCopy = [...numbers];
        
        // Get positions for animation
        const bucketRect = bucketElement.getBoundingClientRect();
        const gridRect = elements.numberGrid.getBoundingClientRect();
        const bucketCenterX = bucketRect.left + bucketRect.width / 2;
        const bucketCenterY = bucketRect.top + bucketRect.height / 2;
        
        // Animate each number to the bucket with a delay based on index
        numbersCopy.forEach((num, index) => {
            // Create an animated number element
            const animatedNumber = document.createElement('div');
            animatedNumber.className = 'number-animation';
            animatedNumber.textContent = num.value;
            
            // Position it at the original number's position
            const rect = num.element.getBoundingClientRect();
            animatedNumber.style.left = `${rect.left}px`;
            animatedNumber.style.top = `${rect.top}px`;
            
            // Add it to the body
            document.body.appendChild(animatedNumber);
            
            // Animate it to the bucket with a delay based on index
            setTimeout(() => {
                animatedNumber.style.transition = 'all 0.5s ease-in-out';
                animatedNumber.style.left = `${bucketCenterX}px`;
                animatedNumber.style.top = `${bucketCenterY}px`;
                animatedNumber.style.opacity = '0';
                animatedNumber.style.transform = 'scale(0.5)';
                
                // Remove the animated number after animation
                setTimeout(() => {
                    animatedNumber.remove();
                    
                    // If this is the last number, close the bucket and process the drop
                    if (index === numbersCopy.length - 1) {
                        setTimeout(() => {
                            bucketElement.classList.remove('opening');
                            bucketElement.classList.add('closing');
                            
                            // Process the drop after the bucket closes
                            setTimeout(() => {
                                bucketElement.classList.remove('closing');
                                processDrop(bucketId);
                            }, 800);
                        }, 200);
                    }
                }, 500);
            }, index * 100);
            
            // Remove the selection from the original number
            num.element.classList.remove('selected');
            num.element.classList.remove('hover-effect');
        });
    }
    
    function processDrop(bucketId) {
        // Add numbers to the bucket
        state.buckets[bucketId].numbers = state.buckets[bucketId].numbers.concat(state.selectedNumbers);
        
        // Update bucket progress (random increase between 1-5%)
        const progressIncrease = Math.floor(Math.random() * 5) + 1;
        state.buckets[bucketId].progress += progressIncrease;
        
        // Update total progress
        state.totalProgress += Math.floor(progressIncrease / 5);
        
        // Mark that we've shown the keyboard hint
        state.hasShownKeyboardHint = true;
        
        // Hide the keyboard shortcut hint
        hideKeyboardShortcutHint();
        
        // Clear selected numbers
        state.selectedNumbers = [];
        
        // Reset drag state to prevent auto-dragging bug
        state.isDragging = false;
        state.mouseDown = false;
        
        // Update UI
        updateUI();
        
        // Play success sound
        playSuccessSound();
        
        // Flash the screen briefly
        flashScreen();
        
        // Generate new numbers
        generateNumberGrid();
    }

    function updateUI() {
        // Update bucket progress displays
        for (let i = 1; i <= 5; i++) {
            const progressElement = document.getElementById(`bucket-${i}-progress`);
            if (progressElement) {
                progressElement.textContent = `${state.buckets[i].progress}%`;
            }
        }

        // Update total progress
        if (elements.totalProgress) {
            elements.totalProgress.textContent = `${state.totalProgress}% Complete`;
        }
        
        // Update current file display
        if (elements.currentFile && state.selectedFile) {
            elements.currentFile.textContent = state.selectedFile;
        }
    }

    // Hex code animation
    function startHexCodeAnimation() {
        setInterval(() => {
            updateHexCodes();
        }, 8000); // Slower update interval
    }

    function updateHexCodes() {
        // Generate random hex codes
        const randomHex1 = 'x' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        const randomHex2 = 'x' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        
        state.hexCodes.current1 = randomHex1;
        state.hexCodes.current2 = randomHex2;
        
        elements.hexCode1.textContent = state.hexCodes.current1;
        elements.hexCode2.textContent = state.hexCodes.current2;
    }

    // Sound effects (simulated)
    function playSelectSound() {
        // In a real implementation, you would play an actual sound here
        console.log('Select sound played');
    }

    function playHoverSound() {
        // In a real implementation, you would play an actual sound here
        console.log('Hover sound played');
    }

    function playDragSound() {
        // In a real implementation, you would play an actual sound here
        console.log('Drag sound played');
    }

    function playSuccessSound() {
        // In a real implementation, you would play an actual sound here
        console.log('Success sound played');
    }

    // Visual effects
    function flashScreen() {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(0, 195, 255, 0.2)';
        flash.style.zIndex = '9999';
        flash.style.pointerEvents = 'none';
        flash.style.transition = 'opacity 1s ease'; // Slower flash transition
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(flash);
            }, 1000);
        }, 500);
    }

    // These functions are no longer needed as we're handling hover effects differently
    function applySurroundingRippleEffect(cell) {
        // No longer used
    }
    
    function removeSurroundingRippleEffect(cell) {
        // No longer used
    }

    // New function to handle keyboard events
    function handleKeyDown(e) {
        // Only process if we're on the grid screen and have 9 numbers selected
        if (state.currentScreen !== 'grid-screen' || state.selectedNumbers.length !== 9) return;
        
        // Check if the key pressed is a number between 1 and 5
        const key = e.key;
        if (/^[1-5]$/.test(key)) {
            const bucketId = key;
            
            // Highlight the bucket briefly to provide visual feedback
            const bucketElement = document.getElementById(`bucket-${bucketId}`);
            if (bucketElement) {
                bucketElement.classList.add('highlight');
                setTimeout(() => {
                    bucketElement.classList.remove('highlight');
                }, 300);
            }
            
            // Animate numbers to the selected bucket
            animateNumbersToBucket(state.selectedNumbers, bucketId);
            
            // Play selection sound
            playSelectSound();
        }
    }

    // New function to show keyboard shortcut hint
    function showKeyboardShortcutHint() {
        // Remove any existing hint
        hideKeyboardShortcutHint();
        
        // Create hint element
        const hint = document.createElement('div');
        hint.id = 'keyboard-hint';
        hint.className = 'keyboard-shortcut-hint';
        hint.innerHTML = 'Press keys <span>1-5</span> to send to corresponding bucket';
        
        // Add to the grid screen
        const gridScreen = document.getElementById('grid-screen');
        if (gridScreen) {
            gridScreen.appendChild(hint);
            
            // Animate in
            setTimeout(() => {
                hint.classList.add('visible');
            }, 100);
        }
    }
    
    // New function to hide keyboard shortcut hint
    function hideKeyboardShortcutHint() {
        const existingHint = document.getElementById('keyboard-hint');
        if (existingHint) {
            existingHint.classList.remove('visible');
            setTimeout(() => {
                if (existingHint.parentNode) {
                    existingHint.parentNode.removeChild(existingHint);
                }
            }, 300);
        }
    }

    // Add this function to create a slide-out music player
    function createSlideOutMusicPlayer() {
        // First, hide the original music player if it exists
        const originalPlayer = document.querySelector('.music-player');
        if (originalPlayer) {
            originalPlayer.style.display = 'none';
        }
        
        // Create the slide-out player container
        const slideOutPlayer = document.createElement('div');
        slideOutPlayer.className = 'slide-out-player';
        slideOutPlayer.innerHTML = `
            <div class="player-content">
                <h3>Music to Refine To</h3>
                <div class="player-controls">
                    <button class="play-pause-btn"><i class="fas fa-play"></i></button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <div class="time-display">
                            <span class="current-time">0:00</span> / <span class="duration">0:00</span>
                        </div>
                    </div>
                    <button class="mute-btn"><i class="fas fa-volume-up"></i></button>
                </div>
            </div>
        `;
        
        document.body.appendChild(slideOutPlayer);
        
        // Add styles for the slide-out player
        const style = document.createElement('style');
        style.textContent = `
            .slide-out-player {
                position: fixed;
                right: 20px;
                top: 100px;
                width: 280px;
                background-color: rgba(0, 24, 36, 0.3);
                border: 2px solid #00c3ff;
                border-radius: 10px;
                box-shadow: 0 0 15px #00c3ff;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                backdrop-filter: blur(5px);
                animation: pulse 8s infinite alternate;
            }
            
            @keyframes pulse {
                0% {
                    box-shadow: 0 0 15px #00c3ff;
                }
                100% {
                    box-shadow: 0 0 25px #00c3ff;
                }
            }
            
            /* Calculate position based on app container width */
            @media (min-width: 1100px) {
                .slide-out-player {
                    right: calc(50% - 500px);
                }
            }
            
            .player-content {
                padding: 15px;
                width: 100%;
            }
            
            .slide-out-player h3 {
                color: #00c3ff;
                text-shadow: 0 0 5px #00c3ff;
                font-size: 18px;
                margin: 0 0 15px 0;
                text-align: center;
                font-family: 'Courier New', monospace;
            }
            
            .player-controls {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 5px;
            }
            
            .player-controls button {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: rgba(0, 195, 255, 0.1);
                border: 1px solid #00c3ff;
                color: #00c3ff;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .player-controls button:hover {
                background-color: rgba(0, 195, 255, 0.3);
                box-shadow: 0 0 10px #00c3ff;
            }
            
            .progress-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .progress-bar {
                width: 100%;
                height: 5px;
                background: rgba(0, 195, 255, 0.2);
                border-radius: 5px;
                position: relative;
                overflow: hidden;
            }
            
            .progress-fill {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                background: #00c3ff;
                width: 30%;
                border-radius: 5px;
                box-shadow: 0 0 5px #00c3ff;
            }
            
            .time-display {
                color: #00c3ff;
                font-size: 12px;
                text-align: center;
                font-family: 'Courier New', monospace;
            }
            
            /* Responsive adjustments */
            @media (max-width: 1100px) {
                .slide-out-player {
                    right: 20px;
                }
            }
            
            @media (max-width: 900px) {
                .slide-out-player {
                    width: 240px;
                }
            }
            
            @media (max-width: 768px) {
                .slide-out-player {
                    bottom: 20px;
                    top: auto;
                    right: 20px;
                    transform: none;
                    width: 220px;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        // Set up audio functionality
        let audio = document.querySelector('audio');
        if (!audio) {
            audio = new Audio('audio/music.mp3');
            audio.loop = true;
        }
        
        // Add event listeners for the player controls
        const playPauseBtn = slideOutPlayer.querySelector('.play-pause-btn');
        playPauseBtn.addEventListener('click', function() {
            if (audio.paused) {
                audio.play();
                this.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                audio.pause();
                this.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
        
        const muteBtn = slideOutPlayer.querySelector('.mute-btn');
        muteBtn.addEventListener('click', function() {
            audio.muted = !audio.muted;
            this.innerHTML = audio.muted ? 
                '<i class="fas fa-volume-mute"></i>' : 
                '<i class="fas fa-volume-up"></i>';
        });
        
        // Add Font Awesome if it's not already included
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
        
        return slideOutPlayer;
    }

    // Add this to the existing document ready function or create a new one
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, adding slide-out player');
        setTimeout(createSlideOutMusicPlayer, 1000);
    });

    // Also add it to the showGridScreen function if it exists
    if (typeof window.showGridScreen === 'function') {
        const originalShowGridScreen = window.showGridScreen;
        window.showGridScreen = function() {
            originalShowGridScreen.apply(this, arguments);
            setTimeout(function() {
                if (!document.querySelector('.slide-out-player')) {
                    createSlideOutMusicPlayer();
                }
            }, 1000);
        };
    }

    function handleFileSelection(button) {
        console.log('File button clicked:', button.dataset.file);
        state.selectedFile = button.dataset.file;
        
        // Update the project name display
        if (elements.currentFile) {
            elements.currentFile.textContent = state.selectedFile;
        } else {
            console.error('Current file element not found');
        }
        
        navigateToScreen('grid-screen');
        generateNumberGrid();
        playSelectSound();
    }
}); 