/**
 * VPS Master Pro — Express Server
 * Untuk Pterodactyl Panel (Node.js egg)
 * Port dibaca dari env P_SERVER_PORT atau PORT
 */
const express = require('express')
const path    = require('path')
const fs      = require('fs')

const app  = express()
const PORT = process.env.P_SERVER_PORT || process.env.PORT || 3000
const DIST = path.join(__dirname, 'dist')

if (!fs.existsSync(DIST)) {
  console.error('❌  Folder dist/ tidak ditemukan!')
  console.error('   Jalankan dulu: npm run build')
  process.exit(1)
}

// Serve static files
app.use(express.static(DIST, { maxAge: '1d', etag: true }))

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log('╔════════════════════════════════════════╗')
  console.log('║       VPS Master Pro  ⚡ Running       ║')
  console.log('╠════════════════════════════════════════╣')
  console.log(`║  PORT  : ${String(PORT).padEnd(30)}║`)
  console.log(`║  URL   : http://0.0.0.0:${String(PORT).padEnd(14)}║`)
  console.log('╚════════════════════════════════════════╝')
})

process.on('SIGTERM', () => { process.exit(0) })
process.on('SIGINT',  () => { process.exit(0) })
