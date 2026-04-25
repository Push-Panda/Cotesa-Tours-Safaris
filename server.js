const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const historyFilePath = path.join(__dirname, 'booking-history.json');

app.use(express.json());
app.use(express.static(path.join(__dirname), { maxAge: '1d' }));

function readHistoryFile() {
  try {
    if (!fs.existsSync(historyFilePath)) {
      fs.writeFileSync(historyFilePath, JSON.stringify([]), 'utf8');
    }
    const content = fs.readFileSync(historyFilePath, 'utf8');
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error('Error reading booking history file:', error);
    return [];
  }
}

function writeHistoryFile(entries) {
  try {
    fs.writeFileSync(historyFilePath, JSON.stringify(entries, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing booking history file:', error);
  }
}

app.get('/history', (req, res) => {
  res.json({ success: true, entries: readHistoryFile() });
});

app.post('/history', (req, res) => {
  const entry = req.body || {};
  const entries = readHistoryFile();
  entry.timestamp = new Date().toISOString();
  entries.push(entry);
  writeHistoryFile(entries.slice(-50));
  res.json({ success: true, entry });
});

// Handle contact form submission (simulated)
app.post('/contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  // In a real app, you'd send email or save to database
  res.json({ success: true, message: 'Thank you! We\'ll be in touch within 24 hours.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Cotesa Tours website running at http://localhost:${PORT}`);
});