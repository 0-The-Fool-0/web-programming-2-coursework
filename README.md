# Web Programming 2 Coursework

A structured archive of Web Programming 2 laboratory assignments. The original lab folders and differing versions are preserved rather than merged into a single application.

## What's included

- **HTML/CSS foundations:** page layouts, tables, responsive markup, and static assets.
- **JavaScript exercises:** DOM interaction, forms, recipe interfaces, and object-oriented variants.
- **Client/server labs:** small Express applications serving static files and JSON.
- **REST and CRUD examples:** individual labs include route handlers, storage modules, and package manifests.
- **Webpack/RxJS exercise:** Lab 10 includes its own `package.json`, lockfile, client assets, Express server, and REST routes.

The collection is organized into `root collection/` and `repos collection/`. Lab 9 is intentionally omitted here because it has its own existing repository: `0-The-Fool-0/Web-prog-coure-2`. Web Programming 3 is a different course and is not part of this repository.

## Run a Node-based lab

There is no root-level Node package or single command for the full collection. For a lab that contains both `package.json` and `package-lock.json`, enter that lab's directory and install its dependencies there.

For example, Lab 10 can be started with:

```bash
cd "repos collection/Лаб 10"
npm ci
npm start
```

The source defines the start script as `node server.js`; this command was not executed during the review. Static HTML labs can be opened individually in a browser.

## Scope and limitations

This is an academic collection, not one production application. Review the README and manifest inside each lab for lab-specific details. Different variants are retained intentionally. No app builds or tests have been run as part of this documentation update. Confirm course requirements and inspect sample data before making the repository public.