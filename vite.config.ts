import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-effect-types',
      configureServer(server) {
        // Serve list of all Effect type files
        server.middlewares.use('/effect-types-list', (req, res) => {
          try {
            const dtsDir = join(process.cwd(), 'node_modules/effect/dist/dts');
            if (existsSync(dtsDir)) {
              const files = readdirSync(dtsDir)
                .filter((f) => f.endsWith('.d.ts') && !f.endsWith('.map'))
                .map((f) => f.replace('.d.ts', ''));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(files));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Effect types not found' }));
            }
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e) }));
          }
        });

        // Serve list of all @effect/platform type files
        server.middlewares.use('/platform-types-list', (req, res) => {
          try {
            const dtsDir = join(process.cwd(), 'node_modules/@effect/platform/dist/dts');
            if (existsSync(dtsDir)) {
              const files = readdirSync(dtsDir)
                .filter((f) => f.endsWith('.d.ts') && !f.endsWith('.map'))
                .map((f) => f.replace('.d.ts', ''));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(files));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Platform types not found' }));
            }
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e) }));
          }
        });

        // Serve list of all @effect/ai type files
        server.middlewares.use('/ai-types-list', (req, res) => {
          try {
            const dtsDir = join(process.cwd(), 'node_modules/@effect/ai/dist/dts');
            if (existsSync(dtsDir)) {
              const files = readdirSync(dtsDir)
                .filter((f) => f.endsWith('.d.ts') && !f.endsWith('.map'))
                .map((f) => f.replace('.d.ts', ''));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(files));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'AI types not found' }));
            }
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e) }));
          }
        });

        // Serve individual Effect type files
        server.middlewares.use('/effect-types', (req, res, next) => {
          const fileName = req.url?.slice(1) || 'index.d.ts';
          const filePath = join(process.cwd(), 'node_modules/effect/dist/dts', fileName);
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'application/typescript');
            res.end(readFileSync(filePath, 'utf-8'));
          } else {
            next();
          }
        });

        // Serve individual @effect/platform type files
        server.middlewares.use('/platform-types', (req, res, next) => {
          const fileName = req.url?.slice(1) || 'index.d.ts';
          const filePath = join(process.cwd(), 'node_modules/@effect/platform/dist/dts', fileName);
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'application/typescript');
            res.end(readFileSync(filePath, 'utf-8'));
          } else {
            next();
          }
        });

        // Serve individual @effect/ai type files
        server.middlewares.use('/ai-types', (req, res, next) => {
          const fileName = req.url?.slice(1) || 'index.d.ts';
          const filePath = join(process.cwd(), 'node_modules/@effect/ai/dist/dts', fileName);
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'application/typescript');
            res.end(readFileSync(filePath, 'utf-8'));
          } else {
            next();
          }
        });

        // Serve @effect/ai-openai type files
        server.middlewares.use('/node_modules/@effect/ai-openai', (req, res, next) => {
          const fileName = req.url?.replace('/node_modules/@effect/ai-openai/', '') || 'index.d.ts';
          const filePath = req.url?.includes('/dist/')
            ? join(process.cwd(), 'node_modules/@effect/ai-openai', fileName)
            : join(process.cwd(), 'node_modules/@effect/ai-openai/dist/dts', fileName);
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'application/typescript');
            res.end(readFileSync(filePath, 'utf-8'));
          } else {
            next();
          }
        });

        // Serve @effect/ai-anthropic type files
        server.middlewares.use('/node_modules/@effect/ai-anthropic', (req, res, next) => {
          const fileName = req.url?.replace('/node_modules/@effect/ai-anthropic/', '') || 'index.d.ts';
          const filePath = req.url?.includes('/dist/')
            ? join(process.cwd(), 'node_modules/@effect/ai-anthropic', fileName)
            : join(process.cwd(), 'node_modules/@effect/ai-anthropic/dist/dts', fileName);
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'application/typescript');
            res.end(readFileSync(filePath, 'utf-8'));
          } else {
            next();
          }
        });

        // Serve neverthrow types
        server.middlewares.use('/node_modules/neverthrow', (req, res, next) => {
          const filePath = req.url?.includes('/dist/')
            ? join(process.cwd(), 'node_modules/neverthrow', req.url)
            : join(process.cwd(), 'node_modules/neverthrow/dist/index.d.ts');
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'application/typescript');
            res.end(readFileSync(filePath, 'utf-8'));
          } else {
            next();
          }
        });

        // Serve ts-results types
        server.middlewares.use('/node_modules/ts-results', (req, res, next) => {
          const fileName = req.url?.replace('/node_modules/ts-results/', '') || 'index.d.ts';
          const filePath = join(process.cwd(), 'node_modules/ts-results', fileName);
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'application/typescript');
            res.end(readFileSync(filePath, 'utf-8'));
          } else {
            next();
          }
        });
      },
    },
  ],
  optimizeDeps: {
    include: ['monaco-editor'],
  },
});
