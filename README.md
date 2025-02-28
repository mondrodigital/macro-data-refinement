# Macro Data Refinement Simulator

A web application that simulates the macro data refinement work from the TV show "Severance". This application recreates the futuristic, neon blue interface seen in the show with slow, deliberate animations that mimic the show's aesthetic.

## Features

- **Branch Country Selection**: Choose your branch country from a grid of options
- **File Selection**: Select a file to refine from various options like PiGmy, Quirk, Enola, etc.
- **Number Grid**: Interact with a grid of random numbers
- **Number Selection**: Click on numbers to select them (up to 9 in a 3x3 grid)
- **Group Selection**: When 9 numbers are selected, they can be dragged as a group
- **Progress Tracking**: Watch as your refinement work increases the completion percentage
- **Visual Effects**: Enjoy the glowing, pulsing interface with slow, deliberate animations that mimic the show

## How to Use

1. **Select a Branch Country**: Click on one of the country options to begin
2. **Choose a File to Refine**: Select which file you want to work on
3. **Refine the Data**:
   - Click on numbers in the grid to select them (they will enlarge and glow)
   - Select exactly 9 numbers (a selection box will appear around them)
   - Drag the entire selection to one of the buckets at the bottom
   - Watch as the bucket's percentage increases and contributes to the overall completion

## Running the Application

### Option 1: Open Directly in Browser
Simply open the `index.html` file in a modern web browser. No server or build process is required.

### Option 2: Use the Node.js Server
For a more authentic experience, you can use the included Node.js server:

1. Make sure you have Node.js installed on your system
2. Open a terminal in the project directory
3. Run the command: `node server.js`
4. Open your browser and navigate to `http://localhost:3000`

## Technical Details

This application is built using:
- HTML5
- CSS3 (with slow animations and glow effects)
- JavaScript (ES6+)
- Drag and Drop API
- Node.js (for the optional server)

## Inspiration

This project is inspired by the macro data refinement scenes from the Apple TV+ show "Severance", where employees perform mysterious data refinement tasks on retro-futuristic computer interfaces with slow, deliberate interactions. 