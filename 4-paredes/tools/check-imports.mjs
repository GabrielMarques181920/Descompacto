/* ============================================================
   Verificador estático de imports/exports + imports não usados.
   Não executa o código do jogo (os módulos tocam em `window`).
   Rodar: npm run check
   ============================================================ */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const rel = (p) => p.replace(root + '/', '')

const files = []
;(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) {
      if (entry !== 'node_modules') walk(p)
    } else if (entry.endsWith('.js')) files.push(p)
  }
})(join(root, 'js'))

const IMPORT_RE = /import\s+([^'"]+?)\s+from\s+['"](\.[^'"]+)['"]/g
const EXPORT_FN_RE = /export\s+(?:async\s+)?function\s*\*?\s*([A-Za-z0-9_$]+)/g
const EXPORT_VAR_RE = /export\s+(?:const|let|var|class)\s+([A-Za-z0-9_$]+)/g
const EXPORT_BRACE_RE = /export\s*\{([^}]+)\}/g

function exportsOf(file) {
  const src = readFileSync(file, 'utf8')
  const names = new Set()
  for (const re of [EXPORT_FN_RE, EXPORT_VAR_RE, EXPORT_BRACE_RE]) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(src))) {
      if (re === EXPORT_BRACE_RE) {
        for (const part of m[1].split(',')) {
          const name = part.trim().split(/\s+as\s+/).pop()?.trim()
          if (name) names.add(name)
        }
      } else names.add(m[1])
    }
  }
  if (/export\s+default/.test(src)) names.add('default')
  return names
}

let errors = 0
let warnings = 0

for (const file of files) {
  const src = readFileSync(file, 'utf8')

  // 1) coleta os imports (sem mutar a regex durante o uso)
  IMPORT_RE.lastIndex = 0
  const imports = []
  let m
  while ((m = IMPORT_RE.exec(src))) imports.push({ clause: m[1].trim(), spec: m[2] })

  // 2) corpo do arquivo sem as linhas de import (para checar uso)
  const body = src.replace(IMPORT_RE, '')

  for (const { clause, spec } of imports) {
    const target = resolve(dirname(file), spec)
    let available
    try {
      available = exportsOf(target)
    } catch {
      console.log(`❌ ${rel(file)}: módulo não encontrado → ${spec}`)
      errors++
      continue
    }
    const braceMatch = clause.match(/\{([^}]*)\}/)
    if (!braceMatch) continue
    for (const part of braceMatch[1].split(',')) {
      const raw = part.trim()
      if (!raw) continue
      const remote = raw.split(/\s+as\s+/)[0].trim()
      const local = (raw.split(/\s+as\s+/)[1] || remote).trim()
      if (!available.has(remote)) {
        console.log(`❌ ${rel(file)}: importa "${remote}" de ${spec}, que não exporta esse nome`)
        errors++
        continue
      }
      const used = new RegExp(`\\b${local.replaceAll('$', '\\$')}\\b`).test(body)
      if (!used) {
        console.log(`⚠️  ${rel(file)}: importa "${local}" de ${spec} mas nunca usa`)
        warnings++
      }
    }
  }
}

console.log(`\n${files.length} módulos analisados`)
console.log(errors || warnings ? `❌ ${errors} erro(s) · ⚠️ ${warnings} aviso(s)` : '✅ imports limpos')
process.exit(errors ? 1 : 0)
