# Macro Data Refinement Simulator

A web application that simulates the macro data refinement work from the TV show "Severance". This application recreates the futuristic, neon blue interface seen in the show with slow, deliberate animations that mimic the show's aesthetic.

![Severance Macro Data Refinement](https://github.com/username/macrorefinement/raw/main/screenshots/preview.png)

## Demo

You can try the live demo here: [Macro Data Refinement Simulator](https://username.github.io/macrorefinement)

## Features

- **Branch Country Selection**: Choose your branch country from a grid of options
- **File Selection**: Select a file to refine from various options like PiGmy, Quirk, Enola, etc.
- **Number Grid**: Interact with a grid of random numbers that wiggle and move slightly
- **Hover Interaction**: On desktop, numbers enlarge when you hover over them with your mouse
- **Click and Drag**: Select numbers by clicking and dragging over them (desktop)
- **Touch Selection**: On mobile, tap numbers to select them
- **Animated Buckets**: Watch as buckets open to receive your selected numbers with fluid animations
- **Progress Tracking**: Watch as your refinement work increases the completion percentage
- **Visual Effects**: Enjoy the glowing, pulsing interface with slow, deliberate animations that mimic the show
- **Mobile Responsive**: Fully responsive design that works on desktop and mobile devices with touch support

## How to Use

### Desktop
1. **Select a Branch Country**: Click on one of the country options to begin
2. **Choose a File to Refine**: Select which file you want to work on
3. **Refine the Data**:
   - Hover over numbers to see them enlarge and glow
   - Click and hold while moving over numbers to select them (up to 9)
   - When 9 numbers are selected, a selection box will appear
   - Drag the entire selection to one of the buckets at the bottom
   - Watch as the bucket opens, receives the numbers, and closes
   - See the bucket's percentage increase and contribute to the overall completion

### Mobile
1. **Select a Branch Country**: Tap on one of the country options to begin
2. **Choose a File to Refine**: Tap which file you want to work on
3. **Refine the Data**:
   - Tap on numbers to select them (they will enlarge and glow)
   - Select exactly 9 numbers (a selection box will appear around them)
   - Drag the entire selection to one of the buckets at the bottom
   - Watch as the bucket opens, receives the numbers, and closes
   - See the bucket's percentage increase and contribute to the overall completion

## Running Locally

### Option 1: Open Directly in Browser
Simply open the `index.html` file in a modern web browser. No server or build process is required.

### Option 2: Use the Node.js Server
For a more authentic experience, you can use the included Node.js server:

1. Make sure you have Node.js installed on your system
2. Clone this repository: `git clone https://github.com/username/macrorefinement.git`
3. Navigate to the project directory: `cd macrorefinement`
4. Run the command: `node server.js`
5. Open your browser and navigate to `http://localhost:3000`

## Mobile Usage

The application is fully responsive and works on mobile devices:

- **Touch Support**: All interactions work with touch gestures
- **Drag and Drop**: Select numbers and drag them to buckets using touch
- **Responsive Layout**: The interface adapts to different screen sizes
- **Portrait and Landscape**: Works in both orientations

## Deployment

To deploy this project to GitHub Pages:

1. Fork this repository
2. Go to the repository settings
3. Navigate to the "Pages" section
4. Select the main branch as the source
5. Click "Save"
6. Your site will be published at `https://yourusername.github.io/macrorefinement`

## Technical Details

This application is built using:
- HTML5
- CSS3 (with animations, transitions, and glow effects)
- JavaScript (ES6+)
- Custom drag and drop implementation
- Touch events for mobile support
- Node.js (for the optional server)

## Inspiration

This project is inspired by the macro data refinement scenes from the Apple TV+ show "Severance", where employees perform mysterious data refinement tasks on retro-futuristic computer interfaces with slow, deliberate interactions. The wiggling numbers and hover-based interaction are directly based on the show's visual style.

## License

MIT License - feel free to use and modify for your own projects.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 