const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Handle contact form submission (simulated)
app.use(express.json());
app.post('/contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  // In a real app, you'd send email or save to database
  res.json({ success: true, message: 'Thank you! We\'ll be in touch within 24 hours.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Cotesa Tours website running at http://localhost:${PORT}`);
});