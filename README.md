# SkyStation Sports

Static Phase 1 PWA for NFL, MLB, and NHL. It needs a local web server (not `file://`) because it uses ES modules and a service worker.

From PowerShell:

```powershell
node dev-server.js
```

Then open `http://localhost:5500`. The server uses only built-in Node modules, sends correct MIME types for ES modules and the manifest, and disables HTTP caching for quick local iteration. `dev-pwa.js` unregisters the service worker on localhost so an installed-PWA cache cannot mask source changes during development.

For deployment, publish the contents of this folder to GitHub Pages. No keys, build step, or server-side secrets are included.

See [DATA-SOURCES.md](DATA-SOURCES.md) for the source audit and limitations.
