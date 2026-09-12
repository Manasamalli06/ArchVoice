require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'ArchVoice Backend API',
    demoMode: !process.env.GEMINI_API_KEY,
    timestamp: new Date()
  });
});

// API Routes
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 ArchVoice Server running on http://localhost:${PORT}`);
  console.log(`📡 AI Mode: ${process.env.GEMINI_API_KEY ? 'Gemini 2.5 Flash' : 'Demo Fallback Engine'}`);
});
