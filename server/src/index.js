require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// CORS: allow all origins in dev, restrict to same-origin in prod (served as static)
app.use(cors({
  origin: isProduction ? false : '*',
  credentials: true
}));
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

// Serve React frontend in production
if (isProduction) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  // SPA fallback — all non-API routes serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 ArchVoice Server running on http://localhost:${PORT}`);
  console.log(`📡 AI Mode: ${process.env.GEMINI_API_KEY ? 'Gemini 2.5 Flash' : 'Demo Fallback Engine'}`);
  console.log(`🌍 Environment: ${isProduction ? 'Production' : 'Development'}`);
});
