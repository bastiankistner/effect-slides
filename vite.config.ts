import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-effect-types',
      configureServer(server) {
        // Serve Effect types from node_modules during dev
        server.middlewares.use('/effect-types', (req, res, next) => {
          const filePath = join(process.cwd(), 'node_modules/effect/dist/dts', req.url === '/' || req.url === '/index.d.ts' ? 'index.d.ts' : req.url.slice(1))
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/typescript')
            res.end(readFileSync(filePath, 'utf-8'))
          } else {
            next()
          }
        })
      },
      buildStart() {
        // Copy Effect types to public directory for production build
        const src = join(process.cwd(), 'node_modules/effect/dist/dts')
        const dest = join(process.cwd(), 'public/effect-types')
        if (existsSync(src)) {
          if (!existsSync(dest)) {
            mkdirSync(dest, { recursive: true })
          }
          // Copy index.d.ts and key module files
          const filesToCopy = ['index.d.ts', 'Effect.d.ts', 'Data.d.ts', 'Context.d.ts']
          filesToCopy.forEach(file => {
            try {
              const srcFile = join(src, file)
              if (existsSync(srcFile)) {
                copyFileSync(srcFile, join(dest, file))
              }
            } catch (e) {
              console.warn(`Could not copy ${file}:`, e)
            }
          })
        }
      }
    }
  ],
  optimizeDeps: {
    include: ['monaco-editor'],
  },
})

