import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'

function resolveSafe(spec: string): string {
  if (!spec || typeof spec !== 'string') {
    throw new TypeError(`resolveSafe: expected a non-empty string spec, got ${String(spec)}`)
  }

  try {
    const meta: any = (typeof import !== 'undefined' && typeof (import.meta) !== 'undefined') ? import.meta : undefined
    if (meta && meta.url) {
      const candidate = fileURLToPath(new URL(spec, meta.url))
      if (candidate && typeof candidate === 'string') {
        if (!path.isAbsolute(candidate)) {
          return path.resolve(process.cwd(), candidate)
        }
        return candidate
      }
    }
  } catch (e) {
    // fallback
  }

  const fallback = path.resolve(process.cwd(), spec)
  if (!fallback || typeof fallback !== 'string') {
    throw new Error(`resolveSafe: could not resolve path spec="${spec}"`)
  }
  return fallback
}

const srcDir = resolveSafe('./src')
const projectRoot = resolveSafe('.')

export default defineConfig(({ mode }) => {
  const isCi = process.env.CI === 'true' || process.env.CI === '1'

  const config: UserConfig = {
    root: projectRoot,
    resolve: {
      alias: [
        { find: /^@\//, replacement: srcDir + '/' },
        { find: '@', replacement: srcDir },
      ],
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production' ? 'inline' : false,
    },
    server: {
      watch: {
        usePolling: isCi,
      },
    },
    optimizeDeps: {},
  }

  const aliases = config.resolve?.alias ?? []
  for (const a of aliases) {
    const replacement = (a as any).replacement
    if (typeof replacement !== 'string' || replacement.length === 0) {
      throw new TypeError(`vite.config: alias replacement must be a non-empty string, got ${String(replacement)}`)
    }
  }

  return config
})
        
