const express = require('express');

const app = express();

app.use(express.json());
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.options('*', (_req, res) => res.sendStatus(200));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ── Future routes go here ────────────────────────────────────────────────────

app.listen(3000, '127.0.0.1');
