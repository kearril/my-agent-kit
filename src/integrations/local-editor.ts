import type { AstroIntegration } from 'astro';
import type { IncomingMessage, ServerResponse } from 'node:http';
import * as path from 'node:path';
import { createEntryStore } from '../dev/server/entry-store';
import {
  createEditorApi,
  isLoopbackAddress,
  DEFAULT_MAX_BODY_SIZE_BYTES,
} from '../dev/server/editor-api';
export interface LocalEditorOptions {
  entriesRoot?: string;
  today?: () => Date;
}

export function localEditor(options?: LocalEditorOptions): AstroIntegration {
  return {
    name: 'local-editor',
    hooks: {
      'astro:server:setup': async ({ server, refreshContent }) => {
        const entriesRoot =
          options?.entriesRoot ??
          path.resolve(process.cwd(), 'src/content/entries');
        const store = createEntryStore({
          entriesRoot,
          today: options?.today,
        });

        const api = createEditorApi({
          store,
          refreshContent: async () => {
            if (refreshContent) {
              await refreshContent();
            }
          },
        });

        server.middlewares.use(
          async (
            req: IncomingMessage,
            res: ServerResponse,
            next: (err?: unknown) => void,
          ) => {
            if (!req.url) {
              return next();
            }

            const parsedUrl = new URL(req.url, 'http://localhost');
            const pathname = parsedUrl.pathname;
            const isEditorRoute =
              pathname === '/__garden-editor' ||
              pathname === '/__garden-editor/' ||
              pathname === '/__garden-editor/api' ||
              pathname.startsWith('/__garden-editor/api/');

            // 1. Pass through all non-editor routes
            if (!isEditorRoute) {
              return next();
            }

            // 2. Enforce loopback check for all editor routes (shell and API)
            const remoteAddress =
              req.socket?.remoteAddress ??
              (req as { connection?: { remoteAddress?: string } })
                .connection?.remoteAddress;

            if (!isLoopbackAddress(remoteAddress)) {
              res.statusCode = 403;
              res.setHeader(
                'Content-Type',
                'application/json; charset=utf-8',
              );
              res.end(
                JSON.stringify({ error: 'Forbidden: loopback access only' }),
              );
              return;
            }

            // 3. API routes: /__garden-editor/api/*
            if (
              pathname === '/__garden-editor/api' ||
              pathname.startsWith('/__garden-editor/api/')
            ) {
              let body: string | undefined = undefined;
              if (
                req.method === 'POST' ||
                req.method === 'PUT' ||
                req.method === 'PATCH'
              ) {
                try {
                  const chunks: Buffer[] = [];
                  let totalBytes = 0;
                  for await (const chunk of req) {
                    const buf =
                      typeof chunk === 'string'
                        ? Buffer.from(chunk, 'utf8')
                        : chunk;
                    totalBytes += buf.length;
                    if (totalBytes > DEFAULT_MAX_BODY_SIZE_BYTES) {
                      res.statusCode = 413;
                      res.setHeader(
                        'Content-Type',
                        'application/json; charset=utf-8',
                      );
                      res.end(
                        JSON.stringify({ error: 'Payload too large' }),
                      );
                      return;
                    }
                    chunks.push(buf);
                  }
                  body = Buffer.concat(chunks).toString('utf8');
                } catch {
                  res.statusCode = 400;
                  res.setHeader(
                    'Content-Type',
                    'application/json; charset=utf-8',
                  );
                  res.end(
                    JSON.stringify({ error: 'Failed to read request body' }),
                  );
                  return;
                }
              }

              const headers: Record<string, string | string[] | undefined> =
                {};
              for (const [k, v] of Object.entries(req.headers)) {
                headers[k] = v;
              }

              try {
                const apiRes = await api({
                  method: req.method ?? 'GET',
                  pathname,
                  remoteAddress,
                  body,
                  headers,
                });

                res.statusCode = apiRes.status;
                for (const [
                  headerKey,
                  headerVal,
                ] of Object.entries(apiRes.headers)) {
                  res.setHeader(headerKey, headerVal);
                }
                const responseData =
                  typeof apiRes.body === 'string'
                    ? apiRes.body
                    : JSON.stringify(apiRes.body);
                res.end(responseData);
              } catch {
                res.statusCode = 500;
                res.setHeader(
                  'Content-Type',
                  'application/json; charset=utf-8',
                );
                res.end(JSON.stringify({ error: 'Internal server error' }));
              }
              return;
            }

            // 4. Editor UI shell: /__garden-editor or /__garden-editor/
            if (
              pathname === '/__garden-editor' ||
              pathname === '/__garden-editor/'
            ) {
              const rawHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Local Entry Editor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/dev/editor.tsx"></script>
  </body>
</html>`;

              try {
                const html = await server.transformIndexHtml(
                  req.url,
                  rawHtml,
                );
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(html);
              } catch {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(rawHtml);
              }
              return;
            }
            return next();
          },
        );
      },
    },
  };
}
