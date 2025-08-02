const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

function adminOnly(req, res, next) { next(); }

// Migrate DB
router.post('/migrate', adminOnly, (req, res) => {
  exec('npx prisma migrate deploy', (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr });
    res.json({ message: 'Migration complete', output: stdout });
  });
});

// Seed DB
router.post('/seed', adminOnly, (req, res) => {
  exec('npx prisma db seed', (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr });
    res.json({ message: 'Seed complete', output: stdout });
  });
});

// Backup DB (simple file copy for SQLite)
router.post('/backup', adminOnly, (req, res) => {
  exec('cp ./prisma/dev.db ./prisma/dev.db.bak', (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr });
    res.json({ message: 'Backup complete' });
  });
});

// Restore DB (simple file copy for SQLite)
router.post('/restore', adminOnly, (req, res) => {
  exec('cp ./prisma/dev.db.bak ./prisma/dev.db', (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr });
    res.json({ message: 'Restore complete' });
  });
});

module.exports = router; 