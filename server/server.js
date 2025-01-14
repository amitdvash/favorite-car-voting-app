const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const http = require('http'); // Required for Socket.IO
const { Server } = require('socket.io'); // Import Socket.IO
const cors = require('cors');

const app = express();
const PORT = 3000;

// Create an HTTP server (needed for Socket.IO to work with Express)
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:4200', // Allow requests from Angular frontend
      methods: ['GET', 'POST'],
    },
  });

// Enable CORS middleware for Express
app.use(cors());  

app.use(express.static('public'));

// Sample route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Favorite Car Backend!');
});


/**
 * Endpoint to fetch the list of cars.
 * Reads the `cars.csv` file and returns the car data as JSON.
 */
app.get('/api/cars', (req, res) => {
    const cars = [];
    fs.createReadStream('public/data/cars.csv')
        .pipe(csv({
            mapHeaders: ({ header }) => header.trim().replace(/^﻿/, '') // Remove BOM from headers, because of the csv
        }))
        .on('data', (row) => {
            cars.push(row);
        })
        .on('end', () => {
            console.log(cars); // Log the cars array after reading the CSV
            res.json(cars);
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
            res.status(500).send('Error reading car data');
        });
});


/**
 * Endpoint to update votes for a car.
 * Increments the vote count for a specific car in the `cars.csv` file
 * and broadcasts the updated car data to all connected clients via Socket.IO.
 */
app.post('/api/cars/:id/vote', (req, res) => {
    const carId = req.params.id;
    const filePath = path.join(__dirname, 'public', 'data', 'cars.csv');
    const cars = [];

    // Read the CSV file
    fs.createReadStream(filePath)
        .pipe(csv({
            mapHeaders: ({ header }) => header.trim().replace(/^﻿/, '') // Remove BOM from headers
        }))
        .on('data', (row) => {
            if (row.id === carId) {
                row.votes = (parseInt(row.votes, 10) + 1).toString(); // Increment votes
            }
            cars.push(row);
        })
        .on('end', () => {
            // Write the updated data back to the CSV
            const csvData = ['id,votes,image_path']
                .concat(cars.map((car) => `${car.id},${car.votes},${car.image_path}`))
                .join('\n');
            fs.writeFile(filePath, csvData, (err) => {
                if (err) {
                    console.error('Error writing CSV file:', err);
                    res.status(500).send('Error updating car data');
                } else {
                    // Notify all connected clients about the update
                    console.log('CSV updated successfully. Emitting updated cars...');
                    io.emit('updateCars', cars); // שליחת עדכון לכל הקליינטים
                    console.log('Updated cars emitted via Socket.IO');
                    res.json({ message: 'Vote updated successfully', cars });
                }
            });
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
            res.status(500).send('Error reading car data');
        });
});

/**
 * Socket.IO connection handling.
 * Logs when a user connects or disconnects.
 */
io.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
  

// Serve static files from the "public/images" folder
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
