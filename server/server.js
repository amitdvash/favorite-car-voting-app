const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const carRoutes = require('./routes/carRoutes');

const app = express();
const PORT = 3000;

// Create an HTTP server (needed for Socket.IO to work with Express)
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:4200',
      methods: ['GET', 'POST'],
    },
});

// Set io instance on app for use in routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Favorite Car Backend!');
});

// Use car routes
app.use('/api/cars', carRoutes);

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});