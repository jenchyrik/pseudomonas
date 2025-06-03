import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    const url = req.originalUrl

    try {
      // Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      )

      // Apply Vite HTML transforms
      template = await vite.transformIndexHtml(url, template)

      // Load server entry
      const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')

      // Render app HTML
      const { html: appHtml } = await render(url)

      // Inject app HTML into template
      const html = template.replace(`<div id="root"></div>`, `<div id="root">${appHtml}</div>`)

      // Send rendered HTML
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      // If an error is caught, let Vite fix the stack trace
      vite.ssrFixStacktrace(e)
      console.error(e.stack)
      res.status(500).end(e.message)
    }
  })

  const port = process.env.PORT || 5000
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

createServer() 