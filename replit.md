# Project Overview

A Node.js/Express API server that provides various utility API endpoints (Facebook tools, image processing, translation, SMS, lookup, etc.) and serves an HTML frontend.

## Architecture

- **Runtime**: Node.js 20
- **Framework**: Express
- **Entry point**: `index.js`
- **Port**: 5000 (0.0.0.0)

## Structure

- `index.js` — Main Express app, serves frontend HTML and static routes
- `api.js` — Auto-loader that reads `public/dsk/*.js` files and registers their routes
- `cliff/tik.html` — Frontend HTML page served at `/`
- `public/dsk/` — Individual API route modules (ddos, emojimix, fbshare, follow, gen, guard, imgur, lookup, message, pinterest, remini, removebg, sms, trans)

## API Modules

Each module in `public/dsk/` exports `name` (route path) and `index` (handler function). They are auto-loaded by `api.js` at startup.

## Dependencies

- express, axios, cheerio, qs, form-data, fs-extra, gradient-string, path
- @xaviabot/fb-downloader, betabotz-tools, scdl-core, request

## Workflow

- **Start application**: `node index.js` — webview on port 5000
