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
        selectionGroupActive: false
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
        // Add event listeners
        addEventListeners();
        
        // Update UI based on initial state
        updateUI();
        
        // Start hex code animation
        startHexCodeAnimation();
    }

    function addEventListeners() {
        // Country selection
        elements.countryButtons.forEach(button => {
            button.addEventListener('click', () => {
                state.selectedCountry = button.dataset.country;
                navigateToScreen('file-screen');
                playSelectSound();
            });
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
        });

        // Bucket drop zones
        elements.bucketDropZones.forEach(zone => {
            zone.addEventListener('dragover', handleDragOver);
            zone.addEventListener('dragleave', handleDragLeave);
            zone.addEventListener('drop', handleDrop);
        });
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
        const cols = 18;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const number = Math.floor(Math.random() * 10);
                const cell = document.createElement('div');
                cell.className = 'number-cell';
                cell.textContent = number;
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.dataset.value = number;

                // Add click event to select numbers
                cell.addEventListener('click', () => {
                    handleNumberSelection(cell);
                });

                // Add hover sound effect
                cell.addEventListener('mouseenter', () => {
                    playHoverSound();
                });

                elements.numberGrid.appendChild(cell);
            }
        }

        // Create selection group element
        createSelectionGroup();
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

        elements.numberGrid.appendChild(selectionGroup);
    }

    function handleNumberSelection(cell) {
        // If already have 9 selections and this one isn't selected, don't allow more
        if (state.selectedNumbers.length >= 9 && !cell.classList.contains('selected')) {
            return;
        }

        // Toggle selection
        cell.classList.toggle('selected');

        // Play selection sound
        playSelectSound();

        // Add or remove from selected numbers
        if (cell.classList.contains('selected')) {
            const numberData = {
                value: cell.dataset.value,
                row: cell.dataset.row,
                col: cell.dataset.col,
                element: cell
            };
            state.selectedNumbers.push(numberData);
        } else {
            // Remove from selected numbers
            const index = state.selectedNumbers.findIndex(n => 
                n.row === cell.dataset.row && n.col === cell.dataset.col
            );
            
            if (index !== -1) {
                state.selectedNumbers.splice(index, 1);
            }
        }

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
            
            // Activate the selection group
            selectionGroup.classList.add('active');
            state.selectionGroupActive = true;
        } else {
            // Deactivate the selection group
            selectionGroup.classList.remove('active');
            state.selectionGroupActive = false;
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
            // Add numbers to the bucket
            state.buckets[bucketId].numbers = state.buckets[bucketId].numbers.concat(state.selectedNumbers);
            
            // Update bucket progress (random increase between 1-5%)
            const progressIncrease = Math.floor(Math.random() * 5) + 1;
            state.buckets[bucketId].progress += progressIncrease;
            
            // Update total progress
            state.totalProgress += Math.floor(progressIncrease / 5);
            
            // Clear selected numbers
            state.selectedNumbers.forEach(num => {
                num.element.classList.remove('selected');
            });
            state.selectedNumbers = [];
            
            // Update UI
            updateUI();
            
            // Play success sound
            playSuccessSound();
            
            // Flash the screen briefly
            flashScreen();
            
            // Update selection group
            updateSelectionGroup();
        }
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