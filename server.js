require('module-alias/register');
const console = require('console');
const express = require('express');
const multer  = require('multer');
const fs = require('fs');
const path = require('path');
const { sendBigFile } = require('function/sendBigFile');

const app = express();
const PORT = process.env.PORT || 2050;

// storage: simpan ke folder downloads (buat jika belum ada)
const downloadsDir = path.join(process.cwd(), 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, downloadsDir),
  filename: (req, file, cb) => {
    // pertahankan originalname, sanitasi ringan
    const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
    const headerToken = req.headers['sb-webhook-token'];
    if (headerToken !== 'sbwhook-lwatbodiymchocuj2fdbt1qs') {
        return res.status(401).json({ status: 'unauthorized' });
    }

    // metadata dari Laravel
    const { name, mime, size, kind } = req.body;

    if (!req.file) {
        return res.status(400).json({ status: 'no_file' });
    }

    sendBigFile(req.file.path);

    return res.json({
        status: 'ok',
        saved: true,
        filename: req.file.filename,
        path: req.file.path,
        meta: { name, mime, size, kind }
    });
});

app.listen(PORT, () => {
  console.log(`Express listening on port ${PORT}`);
});
