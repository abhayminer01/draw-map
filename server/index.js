require('dotenv').config();
const express = require('express');
const cors = require('cors');
const knexConfig = require('./knexfile');
const environment = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexConfig[environment]);
const auth = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors({
  origin: [
    'https://drawmap.qodux.in', 
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Auth Routes
app.use('/api/auth', authRoutes);

// Get all maps for authenticated user
app.get('/api/maps', auth, async (req, res) => {
  try {
    const maps = await knex('maps')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');
    res.json(maps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch maps' });
  }
});

// Create a new map for authenticated user
app.post('/api/maps', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const [id] = await knex('maps').insert({ name, user_id: req.user.id });
    const newMap = await knex('maps').where({ id }).first();
    res.status(201).json(newMap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create map' });
  }
});

// Get a specific map
app.get('/api/maps/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const map = await knex('maps').where({ id, user_id: req.user.id }).first();
    if (!map) {
      return res.status(404).json({ error: 'Map not found' });
    }
    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch map' });
  }
});

// Update map canvas data
app.put('/api/maps/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { canvas_data } = req.body;
  
  try {
    const map = await knex('maps').where({ id, user_id: req.user.id }).first();
    if (!map) {
      return res.status(404).json({ error: 'Map not found' });
    }
    await knex('maps').where({ id }).update({ canvas_data });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update map' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
