document.addEventListener('DOMContentLoaded', () => {
    // Application state
    const state = {
        currentScreen: 'branch-screen',
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
        hoverCells: []
    };

    // DOM Elements
    const screens = {
        branch: document.getElementById('branch-screen'),
        file: document.getElementById('file-screen'),
        grid: document.getElementById('grid-screen')
    };

    const elements = {
        countryButtons: document.querySelectorAll('[data-country]'),
        fileButtons: document.querySelectorAll('[data-file]'),
        numberGrid: document.getElementById('number-grid'),
        selectedNumbersContainer: document.getElementById('selected-numbers'),
        currentFile: document.getElementById('current-file'),
        totalProgress: document.getElementById('total-progress'),
        bucketDropZones: document.querySelectorAll('.bucket-drop-zone'),
        bucketProgress: document.querySelectorAll('[id^="bucket-"][id$="-progress"]'),
        hexCode1: document.getElementById('hex-code-1'),
        hexCode2: document.getElementById('hex-code-2')
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
        // Country selection
        elements.countryButtons.forEach(button => {
            button.addEventListener('click', () => {
                state.selectedCountry = button.dataset.country;
                navigateToScreen('file-screen');
                playSelectSound();
            });
            
            // Add touch event for mobile
            button.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent double-firing with click
                state.selectedCountry = button.dataset.country;
                navigateToScreen('file-screen');
                playSelectSound();
            }, { passive: false });
        });

        // File selection
        elements.fileButtons.forEach(button => {
            button.addEventListener('click', () => {
                state.selectedFile = button.dataset.file;
                elements.currentFile.textContent = state.selectedFile;
                navigateToScreen('grid-screen');
                generateNumberGrid();
                playSelectSound();
            });
            
            // Add touch event for mobile
            button.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent double-firing with click
                state.selectedFile = button.dataset.file;
                elements.currentFile.textContent = state.selectedFile;
                navigateToScreen('grid-screen');
                generateNumberGrid();
                playSelectSound();
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
                    // Desktop: Use hover and drag to select
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

        // Create selection group element
        createSelectionGroup();
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

    function createSelectionGroup() {
        // Remove any existing selection group
        const existingGroup = document.querySelector('.selection-group');
        if (existingGroup) {
            existingGroup.remove();
        }

        // Create new selection group
        const selectionGroup = document.createElement('div');
        selectionGroup.className = 'selection-group';
        selectionGroup.id = 'selection-group';
        selectionGroup.draggable = true;

        // Add drag events
        selectionGroup.addEventListener('dragstart', handleSelectionGroupDragStart);
        selectionGroup.addEventListener('dragend', handleSelectionGroupDragEnd);
        
        // Add touch events for mobile
        selectionGroup.addEventListener('touchstart', handleSelectionGroupTouchStart, { passive: false });

        elements.numberGrid.appendChild(selectionGroup);
    }
    
    // Desktop mouse event handlers
    function handleDocumentMouseDown(e) {
        if (state.currentScreen !== 'grid-screen') return;
        
        state.mouseDown = true;
        
        // If we have hovered cells, select them
        state.hoverCells.forEach(cell => {
            if (!cell.classList.contains('selected')) {
                handleNumberSelection(cell);
            }
        });
    }
    
    function handleDocumentMouseUp(e) {
        if (state.currentScreen !== 'grid-screen') return;
        
        state.mouseDown = false;
        
        // Clear hover cells that aren't selected
        state.hoverCells.forEach(cell => {
            if (!cell.classList.contains('selected')) {
                handleNumberUnhover(cell);
            }
        });
        
        state.hoverCells = [];
        
        // If we have 9 selected and we're dragging, check if we're over a bucket
        if (state.selectedNumbers.length === 9 && state.isDragging) {
            const dropZone = checkDropZones(e.clientX, e.clientY);
            if (dropZone) {
                const bucketId = dropZone.id.split('-')[1];
                animateNumbersToBucket(state.selectedNumbers, bucketId);
            } else {
                // Reset position if not dropped on a valid zone
                const selectionGroup = document.getElementById('selection-group');
                if (selectionGroup) {
                    resetSelectionGroupPosition(selectionGroup);
                }
            }
            
            state.isDragging = false;
        }
    }
    
    function handleDocumentMouseMove(e) {
        if (state.currentScreen !== 'grid-screen' || !state.mouseDown) return;
        
        // If we have 9 selected, start dragging
        if (state.selectedNumbers.length === 9) {
            if (!state.isDragging) {
                state.isDragging = true;
                const selectionGroup = document.getElementById('selection-group');
                if (selectionGroup) {
                    selectionGroup.classList.add('dragging');
                    
                    // Calculate drag offset
                    const rect = selectionGroup.getBoundingClientRect();
                    state.dragOffsetX = e.clientX - rect.left;
                    state.dragOffsetY = e.clientY - rect.top;
                    
                    playDragSound();
                }
            }
            
            // Move the selection group
            const selectionGroup = document.getElementById('selection-group');
            if (selectionGroup && selectionGroup.classList.contains('dragging')) {
                const gridRect = elements.numberGrid.getBoundingClientRect();
                
                selectionGroup.style.left = `${e.clientX - gridRect.left - state.dragOffsetX}px`;
                selectionGroup.style.top = `${e.clientY - gridRect.top - state.dragOffsetY}px`;
                
                // Check if over a drop zone
                checkDropZones(e.clientX, e.clientY);
            }
        }
    }
    
    function handleNumberHover(cell) {
        // If already have 9 selections and this one isn't selected, don't allow more
        if (state.selectedNumbers.length >= 9 && !cell.classList.contains('selected')) {
            return;
        }
        
        // Add hover effect
        cell.classList.add('hover-effect');
        
        // Add to hover cells array if not already there
        if (!state.hoverCells.includes(cell)) {
            state.hoverCells.push(cell);
        }
        
        // If mouse is down, select the cell
        if (state.mouseDown && !cell.classList.contains('selected')) {
            handleNumberSelection(cell);
        }
    }
    
    function handleNumberUnhover(cell) {
        // Remove hover effect if not selected
        if (!cell.classList.contains('selected')) {
            cell.classList.remove('hover-effect');
            
            // Remove from hover cells array
            const index = state.hoverCells.indexOf(cell);
            if (index !== -1) {
                state.hoverCells.splice(index, 1);
            }
        }
    }

    function handleNumberSelection(cell) {
        // If already have 9 selections and this one isn't selected, don't allow more
        if (state.selectedNumbers.length >= 9 && !cell.classList.contains('selected')) {
            return;
        }

        // Toggle selection
        if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            cell.classList.remove('hover-effect');
            
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
        
        // Check if we have 9 selections to activate the selection group
        updateSelectionGroup();
    }

    function updateSelectionGroup() {
        const selectionGroup = document.getElementById('selection-group');
        
        if (state.selectedNumbers.length === 9) {
            // Calculate the bounding box of all selected numbers
            const positions = state.selectedNumbers.map(num => {
                const rect = num.element.getBoundingClientRect();
                const gridRect = elements.numberGrid.getBoundingClientRect();
                return {
                    left: rect.left - gridRect.left,
                    top: rect.top - gridRect.top,
                    right: rect.right - gridRect.left,
                    bottom: rect.bottom - gridRect.top
                };
            });
            
            const minLeft = Math.min(...positions.map(p => p.left));
            const minTop = Math.min(...positions.map(p => p.top));
            const maxRight = Math.max(...positions.map(p => p.right));
            const maxBottom = Math.max(...positions.map(p => p.bottom));
            
            // Position and size the selection group
            selectionGroup.style.left = `${minLeft - 10}px`;
            selectionGroup.style.top = `${minTop - 10}px`;
            selectionGroup.style.width = `${maxRight - minLeft + 20}px`;
            selectionGroup.style.height = `${maxBottom - minTop + 20}px`;
            
            // Store original position for touch dragging
            selectionGroup.dataset.originalLeft = selectionGroup.style.left;
            selectionGroup.dataset.originalTop = selectionGroup.style.top;
            
            // Activate the selection group
            selectionGroup.classList.add('active');
            state.selectionGroupActive = true;
        } else {
            // Deactivate the selection group
            selectionGroup.classList.remove('active');
            selectionGroup.classList.remove('dragging');
            state.selectionGroupActive = false;
            state.isDragging = false;
        }
    }

    // Drag and Drop Handlers for Selection Group
    function handleSelectionGroupDragStart(e) {
        if (state.selectedNumbers.length !== 9) return;
        
        e.dataTransfer.setData('text/plain', 'selection-group');
        e.target.classList.add('dragging');
        playDragSound();
    }

    function handleSelectionGroupDragEnd(e) {
        e.target.classList.remove('dragging');
    }
    
    // Touch event handlers for mobile
    function handleSelectionGroupTouchStart(e) {
        if (state.selectedNumbers.length !== 9 || !e.target.classList.contains('active')) return;
        
        e.preventDefault(); // Prevent default touch behavior
        
        state.isDragging = true;
        state.touchIdentifier = e.changedTouches[0].identifier;
        
        const touch = e.changedTouches[0];
        const rect = e.target.getBoundingClientRect();
        
        // Calculate the offset of the touch point from the top-left corner of the element
        state.dragOffsetX = touch.clientX - rect.left;
        state.dragOffsetY = touch.clientY - rect.top;
        
        e.target.classList.add('dragging');
        playDragSound();
    }
    
    function handleDocumentTouchMove(e) {
        if (!state.isDragging) return;
        
        // Find the touch that started the drag
        let touch = null;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === state.touchIdentifier) {
                touch = e.changedTouches[i];
                break;
            }
        }
        
        if (!touch) return;
        
        // Prevent default only when we're actually dragging
        e.preventDefault();
        
        const selectionGroup = document.getElementById('selection-group');
        if (!selectionGroup || !selectionGroup.classList.contains('dragging')) return;
        
        const gridRect = elements.numberGrid.getBoundingClientRect();
        
        // Update position based on touch movement
        selectionGroup.style.left = `${touch.clientX - gridRect.left - state.dragOffsetX}px`;
        selectionGroup.style.top = `${touch.clientY - gridRect.top - state.dragOffsetY}px`;
        
        // Check if over a drop zone
        checkDropZones(touch.clientX, touch.clientY);
    }
    
    function handleDocumentTouchEnd(e) {
        if (!state.isDragging) return;
        
        // Find the touch that started the drag
        let touch = null;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === state.touchIdentifier) {
                touch = e.changedTouches[i];
                break;
            }
        }
        
        if (!touch) return;
        
        const selectionGroup = document.getElementById('selection-group');
        if (!selectionGroup) return;
        
        selectionGroup.classList.remove('dragging');
        
        // Check if dropped on a drop zone
        const dropZone = checkDropZones(touch.clientX, touch.clientY);
        if (dropZone) {
            const bucketId = dropZone.id.split('-')[1];
            animateNumbersToBucket(state.selectedNumbers, bucketId);
        } else {
            // Reset position if not dropped on a valid zone
            resetSelectionGroupPosition(selectionGroup);
        }
        
        // Reset drag state
        state.isDragging = false;
        state.touchIdentifier = null;
    }
    
    function handleTouchMove(e, zone) {
        if (!state.isDragging) return;
        
        // Find the touch that started the drag
        let touch = null;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === state.touchIdentifier) {
                touch = e.changedTouches[i];
                break;
            }
        }
        
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
    
    function resetSelectionGroupPosition(selectionGroup) {
        // Reset to original position
        if (selectionGroup.dataset.originalLeft && selectionGroup.dataset.originalTop) {
            selectionGroup.style.left = selectionGroup.dataset.originalLeft;
            selectionGroup.style.top = selectionGroup.dataset.originalTop;
        }
    }
    
    function checkDropZones(x, y) {
        let activeDropZone = null;
        
        // Remove highlight from all drop zones
        elements.bucketDropZones.forEach(zone => {
            zone.classList.remove('highlight');
            
            // Check if coordinates are over this drop zone
            const rect = zone.getBoundingClientRect();
            if (
                x >= rect.left && 
                x <= rect.right && 
                y >= rect.top && 
                y <= rect.bottom
            ) {
                zone.classList.add('highlight');
                activeDropZone = zone;
            }
        });
        
        return activeDropZone;
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

        // Only process if we have 9 numbers selected and the selection group is being dragged
        if (state.selectedNumbers.length === 9 && data === 'selection-group') {
            animateNumbersToBucket(state.selectedNumbers, bucketId);
        }
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
        
        // Hide the selection group during animation
        const selectionGroup = document.getElementById('selection-group');
        if (selectionGroup) {
            selectionGroup.style.opacity = '0';
        }
        
        // Animate each number to the bucket
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
        
        // Clear selected numbers
        state.selectedNumbers = [];
        
        // Update UI
        updateUI();
        
        // Play success sound
        playSuccessSound();
        
        // Flash the screen briefly
        flashScreen();
        
        // Update selection group
        updateSelectionGroup();
        
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
        elements.totalProgress.textContent = `${state.totalProgress}% Complete`;
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
}); 