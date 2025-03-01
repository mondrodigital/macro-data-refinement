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
        completionScreenShown: false,
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

        // Bucket drop zones - add click event to place numbers in buckets
        elements.bucketDropZones.forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
            
            // Add click event to place numbers in buckets
            zone.addEventListener('click', () => {
                if (state.selectedNumbers.length > 0) {
                    const bucketId = zone.id.split('-')[1];
                    animateNumbersToBucket(state.selectedNumbers, bucketId);
                }
            });
            
            // Add touch events for mobile
            zone.addEventListener('touchmove', (e) => {
                e.preventDefault(); // Prevent scrolling when over drop zones
                handleTouchMove(e, zone);
            }, { passive: false });
            
            zone.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (state.selectedNumbers.length > 0) {
                    const bucketId = zone.id.split('-')[1];
                    animateNumbersToBucket(state.selectedNumbers, bucketId);
                }
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
        } else {
            // Mobile-specific touch events for drag selection
            document.addEventListener('touchstart', handleDocumentTouchStart);
            document.addEventListener('touchmove', handleDocumentTouchMove);
            document.addEventListener('touchend', handleDocumentTouchEnd);
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
        // Adjust grid size for mobile
        const rows = state.isMobile ? 8 : 10;
        const cols = state.isMobile ? (window.innerWidth < 480 ? 8 : 10) : 14;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                createNumberCell(i, j);
            }
        }

        // Clear selected numbers
        state.selectedNumbers = [];
    }
    
    // Function to create a single number cell
    function createNumberCell(row, col) {
        const number = Math.floor(Math.random() * 10);
        const cell = document.createElement('div');
        cell.className = 'number-cell';
        cell.textContent = number;
        cell.dataset.row = row;
        cell.dataset.col = col;
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
        return cell;
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
        // For mobile, allow more selections for better usability
        const maxSelections = state.isMobile ? 12 : 9;
        
        // If already have max selections and this one isn't selected, don't allow more
        if (state.selectedNumbers.length >= maxSelections && !cell.classList.contains('selected')) {
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
        
        // Check if we have enough selections to show keyboard hint
        updateSelectionGroup();
    }

    function updateSelectionGroup() {
        // Check if we have enough numbers selected
        const requiredSelections = state.isMobile ? 12 : 9;
        if (state.selectedNumbers.length === requiredSelections) {
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

        // Process if we have any numbers selected
        if (state.selectedNumbers.length > 0) {
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
    
    // Mobile touch event handlers
    function handleDocumentTouchStart(e) {
        if (state.currentScreen !== 'grid-screen') return;
        
        state.touchIdentifier = e.changedTouches[0].identifier;
        state.mouseDown = true; // Use the same flag for touch and mouse
    }
    
    function handleDocumentTouchMove(e) {
        // Prevent default to avoid scrolling issues
        if (state.currentScreen === 'grid-screen') {
            e.preventDefault();
            
            // Find the touch with the stored identifier
            let touch = null;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === state.touchIdentifier) {
                    touch = e.changedTouches[i];
                    break;
                }
            }
            
            if (touch && state.mouseDown) {
                // Check if touch is over a number cell
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element && element.classList.contains('number-cell')) {
                    // If we're dragging over a cell, select it
                    if (!element.classList.contains('selected')) {
                        handleNumberSelection(element);
                    }
                }
                
                // Check if touch is over a bucket
                elements.bucketDropZones.forEach(zone => {
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
                });
            }
        }
    }
    
    function handleDocumentTouchEnd(e) {
        if (state.currentScreen !== 'grid-screen') return;
        
        // Find the touch with the stored identifier
        let touch = null;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === state.touchIdentifier) {
                touch = e.changedTouches[i];
                break;
            }
        }
        
        if (touch) {
            // Check if touch ended over a bucket
            elements.bucketDropZones.forEach(zone => {
                zone.classList.remove('highlight');
                
                const rect = zone.getBoundingClientRect();
                if (
                    touch.clientX >= rect.left && 
                    touch.clientX <= rect.right && 
                    touch.clientY >= rect.top && 
                    touch.clientY <= rect.bottom
                ) {
                    if (state.selectedNumbers.length > 0) {
                        const bucketId = zone.id.split('-')[1];
                        animateNumbersToBucket(state.selectedNumbers, bucketId);
                    }
                }
            });
        }
        
        state.mouseDown = false;
        state.touchIdentifier = null;
    }
    
    function animateNumbersToBucket(numbers, bucketId) {
        // Get the bucket element
        const bucketElement = document.getElementById(`bucket-${bucketId}`);
        if (!bucketElement) return;
        
        // Create a copy of the numbers array to avoid modifying the original during animation
        const numbersCopy = [...numbers];
        
        // Get positions for animation
        const bucketRect = bucketElement.getBoundingClientRect();
        const bucketCenterX = bucketRect.left + bucketRect.width / 2;
        const bucketCenterY = bucketRect.top + bucketRect.height / 2;
        
        // Highlight the bucket briefly
        bucketElement.classList.add('highlight');
        setTimeout(() => {
            bucketElement.classList.remove('highlight');
        }, 300);
        
        // Track how many animations have completed
        let completedAnimations = 0;
        
        // Animate each number to fall off the page
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
            
            // Make the original number invisible
            num.element.style.opacity = '0';
            
            // Animate it falling off the page
            setTimeout(() => {
                animatedNumber.style.transition = 'all 0.5s ease-in-out';
                animatedNumber.style.top = `${window.innerHeight + 100}px`; // Fall below the screen
                animatedNumber.style.opacity = '0';
                
                // Remove the animated number after animation
                setTimeout(() => {
                    animatedNumber.remove();
                    completedAnimations++;
                    
                    // If this is the last number, process the drop
                    if (completedAnimations === numbersCopy.length) {
                        processDrop(bucketId);
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
        
        // MODIFIED: Make each bin completion increase the progress bar by 20% (takes 5 submissions to reach 100%)
        state.totalProgress += 20;
        
        // Ensure total progress doesn't exceed 100%
        if (state.totalProgress > 100) {
            state.totalProgress = 100;
        }
        
        // Add completion screen trigger when progress reaches 100%
        if (state.totalProgress >= 100) {
            // Show completion screen after a short delay
            setTimeout(() => {
                showSeveranceCompletion();
            }, 1500);
        }
        
        // Mark that we've shown the keyboard hint
        state.hasShownKeyboardHint = true;
        
        // Hide the keyboard shortcut hint
        hideKeyboardShortcutHint();
        
        // Replace the empty cells with new numbers
        state.selectedNumbers.forEach(num => {
            // Find the cell position
            const row = parseInt(num.row);
            const col = parseInt(num.col);
            
            // Remove the old cell from the DOM if it still exists
            if (num.element && num.element.parentNode) {
                num.element.parentNode.removeChild(num.element);
            }
            
            // Create a new cell at the same position
            const newCell = createNumberCell(row, col);
            
            // Add a fade-in effect
            newCell.style.opacity = '0';
            setTimeout(() => {
                newCell.style.opacity = '1';
            }, 100);
        });
        
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
        
        // Update total progress bar fill
        const totalProgressFill = document.getElementById('total-progress-fill');
        if (totalProgressFill) {
            totalProgressFill.style.width = `${state.totalProgress}%`;
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
        
        // Different hint text for mobile vs desktop
        if (state.isMobile) {
            hint.innerHTML = 'Tap on a <span>bucket</span> to send numbers';
        } else {
            hint.innerHTML = 'Press keys <span>1-5</span> to send to corresponding bucket';
        }
        
        // Add to the grid screen
        const gridScreen = document.getElementById('grid-screen');
        if (gridScreen) {
            gridScreen.appendChild(hint);
            
            // Position the hint better on mobile
            if (state.isMobile) {
                // Position it above the buckets
                const bucketsElement = document.querySelector('.buckets');
                if (bucketsElement) {
                    const bucketsRect = bucketsElement.getBoundingClientRect();
                    const gridRect = gridScreen.getBoundingClientRect();
                    const topPosition = bucketsRect.top - gridRect.top - 60;
                    hint.style.bottom = 'auto';
                    hint.style.top = `${topPosition}px`;
                }
            }
            
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
        
        // Create a floating music button for mobile
        if (state.isMobile) {
            const floatingMusicBtn = document.createElement('button');
            floatingMusicBtn.className = 'floating-music-btn';
            floatingMusicBtn.innerHTML = '<i class="fas fa-music"></i>';
            document.body.appendChild(floatingMusicBtn);
            
            // Initially hide the slide-out player on mobile
            slideOutPlayer.classList.add('hidden');
            
            // Toggle slide-out player visibility when floating button is clicked
            floatingMusicBtn.addEventListener('click', toggleMusicPlayer);
            floatingMusicBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                toggleMusicPlayer();
            }, { passive: false });
            
            // Function to toggle music player visibility
            function toggleMusicPlayer() {
                slideOutPlayer.classList.toggle('hidden');
                floatingMusicBtn.classList.toggle('active');
                
                // Add animation class
                slideOutPlayer.classList.add('animate');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    slideOutPlayer.classList.remove('animate');
                }, 500);
            }
        }
        
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
                transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
            }
            
            .slide-out-player.hidden {
                transform: translateX(110%);
                opacity: 0;
            }
            
            .slide-out-player.animate {
                animation: slideInPlayer 0.5s ease-in-out;
            }
            
            @keyframes slideInPlayer {
                0% {
                    transform: translateX(110%);
                    opacity: 0;
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .floating-music-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background-color: rgba(0, 24, 36, 0.7);
                border: 2px solid #00c3ff;
                color: #00c3ff;
                font-size: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
                cursor: pointer;
                box-shadow: 0 0 10px #00c3ff;
                transition: all 0.3s ease;
                -webkit-tap-highlight-color: transparent;
            }
            
            .floating-music-btn:active,
            .floating-music-btn.active {
                background-color: rgba(0, 195, 255, 0.3);
                transform: scale(0.95);
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
                -webkit-tap-highlight-color: rgba(0, 195, 255, 0.3);
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
                    bottom: 90px;
                    top: auto;
                    right: 20px;
                    transform: none;
                    width: 220px;
                }
                
                .slide-out-player.hidden {
                    transform: translateY(110%);
                }
                
                @keyframes slideInPlayer {
                    0% {
                        transform: translateY(110%);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                .player-controls button {
                    width: 48px;
                    height: 48px;
                    font-size: 18px;
                }
                
                .slide-out-player h3 {
                    font-size: 16px;
                    margin-bottom: 10px;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        // Set up audio functionality with better mobile support
        let audio;
        
        // Try to get existing audio element or create a new one
        audio = document.querySelector('audio');
        if (!audio) {
            audio = new Audio();
            audio.id = 'background-music';
            audio.loop = true;
            audio.preload = 'auto';
            
            // Add the audio element to the DOM (needed for iOS)
            document.body.appendChild(audio);
            
            // Set the source after appending to DOM
            audio.src = 'audio/music.mp3';
        }
        
        // Add event listeners for the player controls with both click and touch events
        const playPauseBtn = slideOutPlayer.querySelector('.play-pause-btn');
        
        // Function to handle play/pause
        const togglePlayPause = function(e) {
            // Prevent default behavior for touch events
            if (e) e.preventDefault();
            
            // iOS requires user interaction to play audio
            try {
                if (audio.paused) {
                    // Create a promise to play the audio
                    const playPromise = audio.play();
                    
                    // Handle the promise to catch any errors
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            // Playback started successfully
                            this.innerHTML = '<i class="fas fa-pause"></i>';
                            console.log('Audio playback started');
                        }).catch(error => {
                            // Auto-play was prevented
                            console.error('Audio playback failed:', error);
                            // Show a message to the user
                            const message = document.createElement('div');
                            message.className = 'audio-message';
                            message.textContent = 'Tap again to play music';
                            message.style.position = 'absolute';
                            message.style.bottom = '-20px';
                            message.style.left = '0';
                            message.style.width = '100%';
                            message.style.textAlign = 'center';
                            message.style.color = '#00c3ff';
                            message.style.fontSize = '12px';
                            this.parentNode.appendChild(message);
                            
                            // Remove the message after 3 seconds
                            setTimeout(() => {
                                if (message.parentNode) {
                                    message.parentNode.removeChild(message);
                                }
                            }, 3000);
                        });
                    }
                } else {
                    audio.pause();
                    this.innerHTML = '<i class="fas fa-play"></i>';
                }
            } catch (e) {
                console.error('Error toggling audio:', e);
            }
        };
        
        // Add both click and touch events
        playPauseBtn.addEventListener('click', togglePlayPause);
        playPauseBtn.addEventListener('touchstart', togglePlayPause, { passive: false });
        
        // Function to handle mute/unmute
        const muteBtn = slideOutPlayer.querySelector('.mute-btn');
        
        const toggleMute = function(e) {
            // Prevent default behavior for touch events
            if (e) e.preventDefault();
            
            try {
                audio.muted = !audio.muted;
                this.innerHTML = audio.muted ? 
                    '<i class="fas fa-volume-mute"></i>' : 
                    '<i class="fas fa-volume-up"></i>';
            } catch (e) {
                console.error('Error toggling mute:', e);
            }
        };
        
        // Add both click and touch events
        muteBtn.addEventListener('click', toggleMute);
        muteBtn.addEventListener('touchstart', toggleMute, { passive: false });
        
        // Add Font Awesome if it's not already included
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
        
        // Update progress bar (simplified for mobile)
        const progressFill = slideOutPlayer.querySelector('.progress-fill');
        const currentTimeDisplay = slideOutPlayer.querySelector('.current-time');
        const durationDisplay = slideOutPlayer.querySelector('.duration');
        
        // Update progress bar every second
        const updateProgressInterval = setInterval(() => {
            if (!audio.paused) {
                const progress = (audio.currentTime / audio.duration) * 100 || 0;
                progressFill.style.width = `${progress}%`;
                
                // Format time displays
                currentTimeDisplay.textContent = formatTime(audio.currentTime);
                durationDisplay.textContent = formatTime(audio.duration);
            }
        }, 1000);
        
        // Format time function (converts seconds to MM:SS format)
        function formatTime(seconds) {
            if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
            
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        }
        
        // Set initial volume
        audio.volume = 0.7;
        
        // Handle audio loading events
        audio.addEventListener('loadedmetadata', () => {
            durationDisplay.textContent = formatTime(audio.duration);
        });
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            clearInterval(updateProgressInterval);
            audio.pause();
        });
        
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

    // Add the showSeveranceCompletion function
    function showSeveranceCompletion() {
        // Check if completion screen is already shown to prevent duplicates
        if (state.completionScreenShown) {
            console.log('Completion screen already shown, preventing duplicate');
            return;
        }
        
        // Set flag to indicate completion screen is now shown
        state.completionScreenShown = true;
        
        // Create the completion overlay
        const overlay = document.createElement('div');
        overlay.className = 'severance-completion-overlay';
        
        // Add ceiling lights to match the image
        const ceilingLights = document.createElement('div');
        ceilingLights.className = 'ceiling-lights';
        
        // Create light panels
        for (let i = 0; i < 16; i++) {
            const lightPanel = document.createElement('div');
            lightPanel.className = 'light-panel';
            ceilingLights.appendChild(lightPanel);
        }
        
        overlay.appendChild(ceilingLights);
        
        // Create the content container
        const container = document.createElement('div');
        container.className = 'severance-completion-container';
        
        // Add Lumon-style content
        container.innerHTML = `
            <div class="completion-header">
                <div class="lumon-logo">
                    <div class="logo-inner"></div>
                </div>
                <h1>REFINEMENT COMPLETE</h1>
            </div>
            <div class="completion-message">
                <p>Congratulations, <span class="employee-name">${state.userName}</span>.</p>
                <p>Your work in Macrodata Refinement has been exemplary.</p>
                <p>The Board is pleased with your performance.</p>
                <p class="quote">"The data has been refined to 100% completion."</p>
                <div class="waffle-party-notice">
                    <h2>YOU ARE ELIGIBLE FOR A WAFFLE PARTY</h2>
                    <p>Please proceed to the break room to receive your reward.</p>
                    <div class="dancing-waffle">
                        <div class="waffle"></div>
                    </div>
                </div>
            </div>
            <div class="completion-actions">
                <button class="severance-btn" id="restart-btn">Begin New File</button>
                <button class="severance-btn" id="elevator-btn">Return to Outie</button>
            </div>
        `;
        
        // Add to the overlay and then to the body
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Add CSS for the completion screen
        const style = document.createElement('style');
        style.textContent = `
            .severance-completion-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 1s ease-in-out;
                overflow: hidden;
            }
            
            /* Add ceiling lights to match the image */
            .severance-completion-overlay:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 120px;
                background: #000;
                z-index: -1;
            }
            
            /* Ceiling light panels */
            .ceiling-lights {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 120px;
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                grid-template-rows: repeat(2, 1fr);
                gap: 10px;
                padding: 10px;
            }
            
            .light-panel {
                background-color: #333;
                border-radius: 4px;
                transition: background-color 0.5s ease;
            }
            
            .light-panel.blue { background-color: rgba(0, 123, 255, 0.8); box-shadow: 0 0 15px rgba(0, 123, 255, 0.8); }
            .light-panel.pink { background-color: rgba(255, 105, 180, 0.8); box-shadow: 0 0 15px rgba(255, 105, 180, 0.8); }
            .light-panel.orange { background-color: rgba(255, 165, 0, 0.8); box-shadow: 0 0 15px rgba(255, 165, 0, 0.8); }
            .light-panel.yellow { background-color: rgba(255, 255, 0, 0.8); box-shadow: 0 0 15px rgba(255, 255, 0, 0.8); }
            .light-panel.white { background-color: rgba(255, 255, 255, 0.8); box-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
            
            .severance-completion-container {
                width: 90%;
                max-width: 600px;
                background-color: #001824;
                border: 3px solid #00c3ff;
                box-shadow: 0 0 30px #00c3ff;
                padding: 30px;
                color: #00c3ff;
                text-align: center;
                position: relative;
                animation: scaleIn 0.5s ease-out 0.5s both;
            }
            
            .completion-header {
                margin-bottom: 30px;
                position: relative;
            }
            
            .lumon-logo {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background-color: transparent;
                margin: 0 auto 20px;
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                background-image: url('../screenshots/lumen.png');
                background-size: contain;
                background-position: center;
                background-repeat: no-repeat;
            }
            
            .logo-inner {
                display: none; /* Hide the CSS-based logo since we're using the image */
            }
            
            .completion-header h1 {
                font-family: 'Courier New', monospace;
                font-size: 28px;
                letter-spacing: 2px;
                margin: 0;
                text-shadow: 0 0 10px #00c3ff;
            }
            
            .completion-message {
                margin-bottom: 30px;
                font-size: 18px;
                line-height: 1.6;
            }
            
            .employee-name {
                font-weight: bold;
                color: #fff;
                text-shadow: 0 0 5px #00c3ff;
            }
            
            .quote {
                font-style: italic;
                margin: 20px 0;
                padding: 10px;
                border-left: 3px solid #00c3ff;
                text-align: left;
            }
            
            .waffle-party-notice {
                margin: 30px 0;
                padding: 15px;
                border: 1px dashed #00c3ff;
                background-color: rgba(0, 195, 255, 0.1);
                animation: pulse 2s infinite alternate;
            }
            
            .waffle-party-notice h2 {
                color: #fff;
                margin: 0 0 10px 0;
                font-size: 20px;
                letter-spacing: 1px;
            }
            
            .completion-actions {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 30px;
            }
            
            .severance-btn {
                background-color: rgba(0, 195, 255, 0.2);
                border: 2px solid #00c3ff;
                color: #00c3ff;
                padding: 12px 24px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Courier New', monospace;
            }
            
            .severance-btn:hover {
                background-color: rgba(0, 195, 255, 0.4);
                box-shadow: 0 0 15px #00c3ff;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 5px #00c3ff inset; }
                100% { box-shadow: 0 0 15px #00c3ff inset; }
            }
            
            /* Dancing waffle styles */
            .dancing-waffle {
                width: 100px;
                height: 100px;
                margin: 20px auto 10px;
                position: relative;
                animation: waffle-dance 3s infinite ease-in-out;
            }
            
            .waffle {
                width: 100%;
                height: 100%;
                background-image: url('../screenshots/waffle.png');
                background-size: contain;
                background-position: center;
                background-repeat: no-repeat;
                position: relative;
                transform-style: preserve-3d;
            }
            
            .waffle:before, .waffle:after {
                display: none;
            }
            
            @keyframes waffle-dance {
                0% { transform: rotate(-10deg); }
                50% { transform: rotate(10deg); }
                100% { transform: rotate(-10deg); }
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
                .severance-completion-container {
                    padding: 20px;
                }
                
                .completion-header h1 {
                    font-size: 22px;
                }
                
                .completion-message {
                    font-size: 16px;
                }
                
                .waffle-party-notice h2 {
                    font-size: 18px;
                }
                
                .completion-actions {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .severance-btn {
                    width: 100%;
                }
                
                .dancing-waffle {
                    width: 80px;
                    height: 80px;
                    margin: 15px auto 5px;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        // Add event listeners for the buttons
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                // Stop the congratulatory sound if it's playing
                if (window.currentCompletionSound && !window.currentCompletionSound.paused) {
                    window.currentCompletionSound.pause();
                    window.currentCompletionSound.currentTime = 0;
                }
                
                // Reset the game state
                state.totalProgress = 0;
                for (let i = 1; i <= 5; i++) {
                    state.buckets[i].progress = 0;
                    state.buckets[i].numbers = [];
                }
                
                // Reset the completion screen flag
                state.completionScreenShown = false;
                
                // Remove the completion screen
                document.body.removeChild(overlay);
                
                // Navigate back to file selection
                navigateToScreen('file-screen');
                
                // Update UI
                updateUI();
                
                // Play select sound
                playSelectSound();
            });
        }
        
        const elevatorBtn = document.getElementById('elevator-btn');
        if (elevatorBtn) {
            elevatorBtn.addEventListener('click', () => {
                // Stop the congratulatory sound if it's playing
                if (window.currentCompletionSound && !window.currentCompletionSound.paused) {
                    window.currentCompletionSound.pause();
                    window.currentCompletionSound.currentTime = 0;
                }
                
                // Create elevator transition effect
                const elevator = document.createElement('div');
                elevator.className = 'elevator-transition';
                document.body.appendChild(elevator);
                
                // Add elevator transition styles
                const elevatorStyle = document.createElement('style');
                elevatorStyle.textContent = `
                    .elevator-transition {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 0;
                        background-color: #000;
                        z-index: 10001;
                        transition: height 3s ease-in-out;
                    }
                    
                    .elevator-transition.active {
                        height: 100%;
                    }
                    
                    .elevator-message {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        color: #00c3ff;
                        font-size: 24px;
                        opacity: 0;
                        transition: opacity 1s ease-in-out;
                        text-align: center;
                        width: 80%;
                    }
                    
                    .elevator-logo {
                        width: 100px;
                        height: 100px;
                        margin-bottom: 20px;
                        filter: brightness(0) invert(1) sepia(100%) saturate(10000%) hue-rotate(170deg);
                    }
                    
                    .elevator-message.visible {
                        opacity: 1;
                    }
                `;
                document.head.appendChild(elevatorStyle);
                
                // Animate the elevator closing
                setTimeout(() => {
                    elevator.classList.add('active');
                    
                    // Add the elevator message
                    const message = document.createElement('div');
                    message.className = 'elevator-message';
                    message.innerHTML = `
                        <img src="screenshots/lumen.png" alt="Lumon Logo" class="elevator-logo">
                        <p>You are now leaving Lumon Industries.<br>Your outie will wake up momentarily.</p>
                    `;
                    elevator.appendChild(message);
                    
                    // Show the message
                    setTimeout(() => {
                        message.classList.add('visible');
                        
                        // After a delay, redirect to the start screen
                        setTimeout(() => {
                            // Reset the game state
                            state.totalProgress = 0;
                            for (let i = 1; i <= 5; i++) {
                                state.buckets[i].progress = 0;
                                state.buckets[i].numbers = [];
                            }
                            
                            // Reset the completion screen flag
                            state.completionScreenShown = false;
                            
                            // Navigate to the branch screen
                            navigateToScreen('branch-screen');
                            
                            // Remove the completion and elevator overlays
                            document.body.removeChild(overlay);
                            document.body.removeChild(elevator);
                            
                            // Update UI
                            updateUI();
                        }, 4000);
                    }, 1500);
                }, 100);
                
                // Play select sound
                playSelectSound();
            });
        }
        
        // Find and pause the background music player if it's playing
        const pauseBackgroundMusic = () => {
            console.log('Attempting to forcefully pause background music...');
            
            // Try multiple ways to find the audio element
            const backgroundAudio = document.querySelector('audio#background-music') || 
                                   document.querySelector('audio') ||
                                   document.getElementById('background-music');
            
            console.log('Found audio element:', backgroundAudio);
            
            // First approach: Try to pause any audio elements on the page
            const allAudioElements = document.querySelectorAll('audio');
            let pausedAny = false;
            
            allAudioElements.forEach(audio => {
                try {
                    if (!audio.paused) {
                        console.log('Pausing audio element:', audio);
                        audio.pause();
                        audio.currentTime = audio.currentTime;
                        pausedAny = true;
                    }
                } catch (e) {
                    console.error('Error pausing audio element:', e);
                }
            });
            
            // Second approach: Try to find and click the play/pause button
            const playPauseBtn = document.querySelector('.play-pause-btn');
            if (playPauseBtn) {
                try {
                    console.log('Found play/pause button, updating UI');
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    
                    // If the button shows a pause icon, click it to pause
                    if (playPauseBtn.querySelector('.fa-pause')) {
                        console.log('Clicking play/pause button to pause');
                        playPauseBtn.click();
                    }
                } catch (e) {
                    console.error('Error updating play button:', e);
                }
            }
            
            // Third approach: Try to use the specific background audio element
            if (backgroundAudio) {
                try {
                    console.log('Directly pausing background audio');
                    backgroundAudio.pause();
                    backgroundAudio.muted = true; // Also mute it just to be sure
                    
                    // Store the current state to potentially resume later
                    const wasPlaying = !backgroundAudio.paused;
                    return wasPlaying;
                } catch (e) {
                    console.error('Error directly pausing background audio:', e);
                }
            }
            
            // Fourth approach: Try to find the slide-out player and manipulate it
            const slideOutPlayer = document.querySelector('.slide-out-player');
            if (slideOutPlayer) {
                try {
                    console.log('Manipulating slide-out player');
                    // Hide the player as a last resort
                    slideOutPlayer.classList.add('hidden');
                } catch (e) {
                    console.error('Error manipulating slide-out player:', e);
                }
            }
            
            return pausedAny;
        };
        
        // Pause any currently playing background music
        console.log('Attempting to pause background music before showing completion screen...');
        const backgroundMusicWasPlaying = pauseBackgroundMusic();
        console.log('Background music was playing:', backgroundMusicWasPlaying);
        
        // Start the ceiling light animation
        animateCeilingLights();
        
        // Create and play the congratulatory sound
        const completionSound = new Audio();
        completionSound.volume = 0.5;
        completionSound.src = 'audio/congrats.mp3'; // Make sure this file exists in your audio folder
        
        // Store the audio element in a global variable to ensure we can access it later
        window.currentCompletionSound = completionSound;
        
        // Stop any previously playing completion sounds
        if (window.previousCompletionSound && !window.previousCompletionSound.paused) {
            console.log('Stopping previously playing completion sound');
            window.previousCompletionSound.pause();
            window.previousCompletionSound.currentTime = 0;
        }
        
        // Store this as the previous sound for next time
        window.previousCompletionSound = completionSound;
        
        // Sync waffle dance with audio beat
        const syncWaffleDance = () => {
            const waffle = document.querySelector('.dancing-waffle');
            if (waffle && completionSound && !completionSound.paused) {
                // Keep a consistent animation speed
                waffle.style.animationDuration = '3s';
                
                // Remove the scaling effect that was making it jerky
                waffle.style.transform = '';
            }
        };
        
        // Update waffle dance animation periodically
        const waffleDanceInterval = setInterval(syncWaffleDance, 300);
        
        // Set up a timer to stop the sound after 2 minutes (120 seconds)
        const soundTimeout = setTimeout(() => {
            if (completionSound && !completionSound.paused) {
                completionSound.pause();
                completionSound.currentTime = 0;
                console.log('Congratulatory sound stopped after 2 minutes');
            }
        }, 120000); // 2 minutes in milliseconds
        
        // Add event listener for when the sound ends naturally
        completionSound.addEventListener('ended', () => {
            clearTimeout(soundTimeout); // Clear the timeout since it ended naturally
            console.log('Congratulatory sound ended naturally');
        });
        
        // Try to play the sound (may fail on mobile without user interaction)
        try {
            const playPromise = completionSound.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Congratulatory sound started playing');
                }).catch(err => {
                    console.log('Could not play congratulatory sound automatically:', err);
                    
                    // If we couldn't play the sound, add a button to play it
                    const soundButton = document.createElement('button');
                    soundButton.className = 'severance-btn sound-btn';
                    soundButton.innerHTML = '<i class="fas fa-volume-up"></i> Play Celebration';
                    soundButton.style.marginTop = '15px';
                    
                    // Add the button to the container
                    const actionsDiv = container.querySelector('.completion-actions');
                    if (actionsDiv) {
                        actionsDiv.appendChild(soundButton);
                        
                        // Add event listener to play sound when clicked
                        soundButton.addEventListener('click', () => {
                            completionSound.play().catch(e => console.error('Still could not play sound:', e));
                            soundButton.disabled = true;
                            soundButton.innerHTML = '<i class="fas fa-volume-up"></i> Playing...';
                        });
                    }
                });
            }
        } catch (e) {
            console.log('Error playing congratulatory sound:', e);
        }
        
        // Clean up when the overlay is removed
        const cleanupFunction = () => {
            // Stop the sound if it's still playing
            if (window.currentCompletionSound && !window.currentCompletionSound.paused) {
                window.currentCompletionSound.pause();
                window.currentCompletionSound.currentTime = 0;
            }
            
            // Clear the timeout and intervals
            clearTimeout(soundTimeout);
            clearInterval(waffleDanceInterval);
            
            // Remove the event listener
            overlay.removeEventListener('remove', cleanupFunction);
        };
        
        // Add event listener for when the overlay is removed
        overlay.addEventListener('remove', cleanupFunction);
    }
    
    // Function to animate ceiling lights
    function animateCeilingLights() {
        const lightPanels = document.querySelectorAll('.light-panel');
        if (!lightPanels.length) return;
        
        const colors = ['blue', 'pink', 'orange', 'yellow', 'white'];
        
        // Initial random colors
        lightPanels.forEach(panel => {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            panel.classList.add(randomColor);
        });
        
        // Animate lights with different patterns
        setInterval(() => {
            // Random pattern selection
            const pattern = Math.floor(Math.random() * 4);
            
            switch(pattern) {
                case 0: // All panels change randomly
                    lightPanels.forEach(panel => {
                        // Remove all color classes
                        colors.forEach(color => panel.classList.remove(color));
                        
                        // Add a random color
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        panel.classList.add(randomColor);
                    });
                    break;
                    
                case 1: // Alternating rows
                    lightPanels.forEach((panel, index) => {
                        // Remove all color classes
                        colors.forEach(color => panel.classList.remove(color));
                        
                        // Add color based on row
                        const row = Math.floor(index / 8);
                        const colorIndex = (row + Math.floor(Date.now() / 500)) % colors.length;
                        panel.classList.add(colors[colorIndex]);
                    });
                    break;
                    
                case 2: // Alternating columns
                    lightPanels.forEach((panel, index) => {
                        // Remove all color classes
                        colors.forEach(color => panel.classList.remove(color));
                        
                        // Add color based on column
                        const col = index % 8;
                        const colorIndex = (col + Math.floor(Date.now() / 500)) % colors.length;
                        panel.classList.add(colors[colorIndex]);
                    });
                    break;
                    
                case 3: // Checkerboard pattern
                    lightPanels.forEach((panel, index) => {
                        // Remove all color classes
                        colors.forEach(color => panel.classList.remove(color));
                        
                        // Create checkerboard pattern
                        const row = Math.floor(index / 8);
                        const col = index % 8;
                        const isEven = (row + col) % 2 === 0;
                        const timeOffset = Math.floor(Date.now() / 800) % 2;
                        const colorIndex = ((isEven ? 0 : 1) + timeOffset) % colors.length;
                        
                        panel.classList.add(colors[colorIndex]);
                    });
                    break;
            }
        }, 800);
    }
}); 