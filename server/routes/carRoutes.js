const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const lockfile = require('proper-lockfile');

/**
 * Endpoint to fetch the list of cars.
 * Reads the `cars.csv` file and returns the car data as JSON.
 */
router.get('/', async (req, res) => {
    const filePath = path.join(process.cwd(), 'public', 'data', 'cars.csv');
    const cars = [];

    try {
        console.log('Attempting to acquire lock for reading cars data...');
        const release = await lockfile.lock(filePath, { 
            retries: 5,
            retryWait: 100
        });

        try {
            await new Promise((resolve, reject) => { // Object of an async action that will end in the future
                fs.createReadStream(filePath)
                    .pipe(csv({
                        mapHeaders: ({ header }) => header.trim().replace(/^﻿/, '')
                    }))
                    .on('data', (row) => {
                        cars.push(row);
                    })
                    .on('end', () => {
                        console.log(`Successfully read ${cars.length} cars from CSV`);
                        resolve();
                    })
                    .on('error', (err) => {
                        console.error('Error while reading CSV:', err);
                        reject(err);
                    });
            });

            await release();
            console.log('Lock released after reading cars data');
            res.json(cars);

        } catch (error) {
            console.error('Error during file read operation:', {
                error: error.message,
                stack: error.stack
            });
            await release();
            throw error;
        }

    } catch (error) {
        if (error.code === 'ELOCKED') {
            console.error('Failed to acquire lock for reading - file is busy:', {
                error: error.message,
                retries: 5,
                waitTime: '100ms'
            });
            res.status(503).json({
                error: 'Server is busy, please try again',
                details: 'Too many concurrent requests'
            });
        } else {
            console.error('Unexpected error while reading cars data:', {
                error: error.message,
                stack: error.stack
            });
            res.status(500).json({
                error: 'Internal server error',
                details: 'Failed to read car data'
            });
        }
    }
});

/**
 * Endpoint to update votes for a car.
 * Increments the vote count for a specific car in the `cars.csv` file
 * and broadcasts the updated car data to all connected clients via Socket.IO.
 */
router.post('/:id/vote', async (req, res) => {
    const carId = req.params.id;
    const filePath = path.join(process.cwd(), 'public', 'data', 'cars.csv');
    const io = req.app.get('io');
    const cars = [];
    
    try {
        console.log(`Attempting to acquire lock for voting on car ${carId}...`);
        const release = await lockfile.lock(filePath, { 
            retries: 5,
            retryWait: 100
        });
        
        try {
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv({
                        mapHeaders: ({ header }) => header.trim().replace(/^﻿/, '')
                    }))
                    .on('data', (row) => {
                        if (row.id === carId) {
                            console.log(`Updating votes for car ${carId} from ${row.votes} to ${parseInt(row.votes, 10) + 1}`);
                            row.votes = (parseInt(row.votes, 10) + 1).toString();
                        }
                        cars.push(row);
                    })
                    .on('end', resolve)
                    .on('error', (err) => {
                        console.error('Error while reading CSV for vote update:', err);
                        reject(err);
                    });
            });

            const csvData = ['id,votes,image_path']
                .concat(cars.map((car) => `${car.id},${car.votes},${car.image_path}`))
                .join('\n');

            await fs.promises.writeFile(filePath, csvData);
            console.log(`Successfully updated votes for car ${carId}`);
            
            await release();
            console.log('Lock released after vote update');
            
            io.emit('updateCars', cars);
            console.log('Updated car data broadcast to all clients');
            
            res.json({ 
                message: 'Vote updated successfully', 
                cars 
            });
            
        } catch (error) {
            console.error('Error during vote update operation:', {
                error: error.message,
                stack: error.stack,
                carId: carId
            });
            await release();
            throw error;
        }
        
    } catch (error) {
        if (error.code === 'ELOCKED') {
            console.error('Failed to acquire lock for voting - file is busy:', {
                error: error.message,
                carId: carId,
                retries: 5,
                waitTime: '100ms'
            });
            res.status(503).json({
                error: 'Server is busy, please try again',
                details: 'Too many concurrent requests'
            });
        } else {
            console.error('Unexpected error while updating vote:', {
                error: error.message,
                stack: error.stack,
                carId: carId
            });
            res.status(500).json({
                error: 'Internal server error',
                details: 'Failed to update vote'
            });
        }
    }
});

module.exports = router;