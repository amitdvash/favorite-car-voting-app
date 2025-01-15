const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

/**
 * Endpoint to fetch the list of cars.
 * Reads the `cars.csv` file and returns the car data as JSON.
 */
router.get('/', (req, res) => {
    const cars = [];
    fs.createReadStream('public/data/cars.csv')
        .pipe(csv({
            mapHeaders: ({ header }) => header.trim().replace(/^﻿/, '')
        }))
        .on('data', (row) => {
            cars.push(row);
        })
        .on('end', () => {
            console.log(cars);
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
router.post('/:id/vote', (req, res) => {
    const carId = req.params.id;
    const filePath = path.join(process.cwd(), 'public', 'data', 'cars.csv');
    const cars = [];
    
    const io = req.app.get('io'); // Get Socket.IO instance from Express app

    fs.createReadStream(filePath)
        .pipe(csv({
            mapHeaders: ({ header }) => header.trim().replace(/^﻿/, '')
        }))
        .on('data', (row) => {
            if (row.id === carId) {
                row.votes = (parseInt(row.votes, 10) + 1).toString();
            }
            cars.push(row);
        })
        .on('end', () => {
            const csvData = ['id,votes,image_path']
                .concat(cars.map((car) => `${car.id},${car.votes},${car.image_path}`))
                .join('\n');
            fs.writeFile(filePath, csvData, (err) => {
                if (err) {
                    console.error('Error writing CSV file:', err);
                    res.status(500).send('Error updating car data');
                } else {
                    console.log('CSV updated successfully. Emitting updated cars...');
                    io.emit('updateCars', cars);
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

module.exports = router;