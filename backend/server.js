import express from 'express'
import multer from 'multer'
import cors from 'cors'
import { exec } from 'child_process'
import { writeFile, readFile, unlink } from 'fs/promises'
import { randomUUID } from 'crypto'
import { join } from 'path'
import { tmpdir } from 'os'

const app = express()
const PORT = process.env.PORT || 8080
const MAX_SIZE_BYTES = 30 * 1024 * 1024 // 30 MB

// Allow requests from GitHub Pages origin
app.use(cors({
  origin: ['https://getinside-ops.github.io', 'http://localhost:5173'],
  methods: ['POST'],
}))

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype === 'application/pdf')
  },
})

app.get('/health', (_req, res) => res.json({ ok: true }))

app.post('/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file provided or file type invalid' })
  }

  const id = randomUUID()
  const inputPath  = join(tmpdir(), `${id}-input.pdf`)
  const outputPath = join(tmpdir(), `${id}-output.pdf`)

  try {
    await writeFile(inputPath, req.file.buffer)

    await new Promise((resolve, reject) => {
      const cmd = [
        'gs',
        '-dBATCH', '-dNOPAUSE', '-dNOSAFER',
        '-sDEVICE=pdfwrite',
        '-dPDFX=true',
        '-dPDFSETTINGS=/prepress',
        '-sColorConversionStrategy=CMYK',
        '-dProcessColorModel=/DeviceCMYK',
        `-sOutputFile="${outputPath}"`,
        `"${inputPath}"`,
      ].join(' ')
      exec(cmd, (err) => err ? reject(err) : resolve(null))
    })

    const output = await readFile(outputPath)
    const safeBaseName = req.file.originalname
      .replace(/\.pdf$/i, '')
      .replace(/[^a-zA-Z0-9_\-. ]/g, '_') || 'converted'

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${safeBaseName}-pdfx.pdf"`)
    res.send(output)
  } catch (err) {
    console.error('Ghostscript error:', err)
    res.status(500).json({ error: 'Conversion failed' })
  } finally {
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})
  }
})

app.listen(PORT, () => console.log(`PDF/X backend listening on :${PORT}`))
