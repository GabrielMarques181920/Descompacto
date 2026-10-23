#!/usr/bin/env node
/**
 * 4 Paredes — servidor estático minimalista (zero dependências).
 * Sobe a pasta do jogo em 0.0.0.0 para funcionar no preview do navegador.
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)))
const port = Number(process.env.PORT ?? 4321)
const host = process.env.HOST ?? '0.0.0.0'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    let pathname = decodeURIComponent(url.pathname)
    if (pathname === '/') pathname = '/index.html'

    const target = normalize(join(root, pathname))
    if (!target.startsWith(root + sep) && target !== root) {
      res.writeHead(403).end('forbidden')
      return
    }

    let file = target
    const info = await stat(file).catch(() => null)
    if (!info || info.isDirectory()) file = join(target, 'index.html')

    const body = await readFile(file).catch(() => null)
    if (body === null) {
      // SPA fallback
      const index = await readFile(join(root, 'index.html'))
      res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' })
      res.end(index)
      return
    }

    const ext = extname(file).toLowerCase()
    const cacheable = ext === '.png' || ext === '.jpg' || ext === '.woff2' || ext === '.svg'
    res.writeHead(200, {
      'content-type': MIME[ext] ?? 'application/octet-stream',
      'cache-control': cacheable ? 'public, max-age=3600' : 'no-store',
    })
    res.end(body)
  } catch (err) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end(`erro: ${err?.message ?? err}`)
  }
})

server.listen(port, host, () => {
  console.log(`🔥 4 Paredes rodando em http://${host}:${port}`)
})
