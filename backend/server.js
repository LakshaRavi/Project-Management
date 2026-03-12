require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const SavedRequest = require('./models/Request');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/api-vault')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Proxy route
app.post('/api/proxy', async (req, res) => {
  const { url, method, body } = req.body;
  try {
    const axiosConfig = {
      method,
      url,
    };
    if (body) {
      // Parse body if it's a JSON string, otherwise send as is
      try {
        axiosConfig.data = JSON.parse(body);
      } catch (e) {
        axiosConfig.data = body;
      }
    }
    const response = await axios(axiosConfig);
    res.json(response.data);
  } catch (error) {
    // Return gracefully
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// CRUD routes for saved requests
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await SavedRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching requests' });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const newRequest = new SavedRequest(req.body);
    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save request' });
  }
});

app.put('/api/requests/:id', async (req, res) => {
  try {
    const updatedRequest = await SavedRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  try {
    await SavedRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
