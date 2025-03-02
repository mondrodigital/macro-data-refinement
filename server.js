const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const WebSocket = require('ws');
const chokidar = require('chokidar');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
};

// Add livereload script to HTML content
function injectLiveReloadScript(content) {
    const livereloadScript = `
    <script>
        // Live reload WebSocket connection
        (function() {
            const socket = new WebSocket('ws://localhost:${PORT + 1}');
            socket.onmessage = function(msg) {
                if (msg.data === 'reload') {
                    console.log('Changes detected, reloading...');
                    window.location.reload();
                }
            };
            socket.onclose = function() {
                console.log('Live reload connection closed. Reconnecting in 1s...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            };
        })();
    </script>
    `;
    
    // Insert before closing body tag
    return content.toString().replace('</body>', `${livereloadScript}</body>`);
}

const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
    // Parse the URL to remove query parameters
    const parsedUrl = url.parse(req.url);
    
    // Special handling for service worker - return 404 to unregister it
    if (parsedUrl.pathname === '/service-worker.js') {
        console.log('Service worker request detected - returning 404 to unregister');
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Service worker not found - this helps unregister it');
        return;
    }
    
    // Handle root path
    let filePath = parsedUrl.pathname === '/' 
        ? path.join(__dirname, 'index.html')
        : path.join(__dirname, parsedUrl.pathname);
    
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Page not found
                fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store'
            });
            
            // Inject live reload script for HTML files
            if (contentType === 'text/html') {
                content = injectLiveReloadScript(content);
            }
            
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Press Ctrl+C to stop the server`);
});

// Set up live reload WebSocket server
const wss = new WebSocket.Server({ port: PORT + 1 });
console.log(`Live reload WebSocket server running at ws://localhost:${PORT + 1}`);

// Set up file watcher
const watcher = chokidar.watch([
    './css/**/*.css',
    './js/**/*.js',
    './*.html'
], {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
});

// Broadcast reload message to all clients
function notifyClients() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('reload');
        }
    });
}

// Watch for file changes
let debounceTimer;
watcher
    .on('change', path => {
        console.log(`File changed: ${path}`);
        // Debounce the reload to prevent multiple rapid reloads
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            notifyClients();
        }, 100);
    });

console.log('Watching for file changes...'); 