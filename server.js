const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve .well-known files with correct Content-Type
app.use('/.well-known', express.static(path.join(__dirname, '.well-known'), {
    setHeaders: (res, filePath) => {
        // Set Content-Type to application/json for both deep link files
        res.setHeader('Content-Type', 'application/json');
        // Allow CORS for deep link verification
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for sale detail pages - serves sale.html for any /sale/{id}
app.get('/sale/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sale.html'));
});

// Catch all route - serves index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Yard Quest website running on http://localhost:${PORT}`);
    console.log(`\nDeep link files available at:`);
    console.log(`- http://localhost:${PORT}/.well-known/apple-app-site-association`);
    console.log(`- http://localhost:${PORT}/.well-known/assetlinks.json`);
});
