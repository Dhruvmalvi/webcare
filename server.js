require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Load initial data into memory
let memoryData = { messages: [], projects: [], views: 1204 };
try {
    const fileData = fs.readFileSync(DATA_FILE, 'utf8');
    const parsedData = JSON.parse(fileData);
    memoryData = { ...memoryData, ...parsedData };
    if (typeof memoryData.views !== 'number') memoryData.views = 1204;
} catch (err) {
    console.error('Failed to load initial data.json', err);
}

// Helper function to read data
const readData = () => {
    return memoryData;
};

// Helper function to write data
const writeData = (data) => {
    memoryData = data;
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        // Ignored on Vercel due to read-only file system
    }
};

// --- Views API Endpoints ---
app.get('/api/views', (req, res) => {
    const data = readData();
    res.json({ views: data.views || 0 });
});

app.post('/api/views/increment', (req, res) => {
    const data = readData();
    data.views = (data.views || 0) + 1;
    writeData(data);
    res.json({ views: data.views });
});

// --- Projects API Endpoints ---

// Get all projects
app.get('/api/projects', (req, res) => {
    const data = readData();
    res.json(data.projects || []);
});

// Add a new project
app.post('/api/projects', (req, res) => {
    const data = readData();
    const newProject = req.body;
    
    // Add simple ID and append
    newProject.id = Date.now().toString();
    data.projects.push(newProject);
    
    writeData(data);
    res.status(201).json(newProject);
});

// Delete a project
app.delete('/api/projects/:id', (req, res) => {
    const data = readData();
    const projectId = req.params.id;
    
    data.projects = data.projects.filter(p => p.id !== projectId);
    
    writeData(data);
    res.status(204).send();
});


// --- Messages API Endpoints ---

// Get all messages
app.get('/api/messages', (req, res) => {
    const data = readData();
    res.json(data.messages || []);
});

// Add a new message
app.post('/api/messages', async (req, res) => {
    const data = readData();
    const newMessage = req.body;
    
    // Add date and simple ID
    newMessage.id = Date.now().toString();
    newMessage.date = new Date().toISOString();
    
    data.messages.push(newMessage);
    
    writeData(data);

    // Send email notification
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `New Portfolio Inquiry from ${newMessage.name}`,
        text: `You have received a new message from your portfolio contact form.\n\nName: ${newMessage.name}\nEmail: ${newMessage.email}\nMessage:\n${newMessage.message}`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }

    res.status(201).json(newMessage);
});

// Delete a message
app.delete('/api/messages/:id', (req, res) => {
    const data = readData();
    const messageId = req.params.id;
    
    data.messages = data.messages.filter(m => m.id !== messageId);
    
    writeData(data);
    res.status(204).send();
});

// Clear all messages
app.delete('/api/messages', (req, res) => {
    const data = readData();
    data.messages = [];
    writeData(data);
    res.status(204).send();
});


// --- Auth API Endpoints ---

// Admin Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        // Return a simple success token
        res.json({ success: true, token: 'admin_auth_token_123' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});


// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
