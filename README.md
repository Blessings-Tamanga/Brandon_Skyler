# Brandon Skyler Portfolio (Vercel Backend)

This repository contains the static front-end for Brandon's portfolio along with a simple Node/Next.js backend designed to run on Vercel serverless functions. The dashboard is served as a static HTML file and communicates with the API routes under `/api`.

## Structure

- `public/` – contains static assets including `dashboard.html` and any images/CSS.
- `pages/api/[resource].js` – dynamic API route handling CRUD for all collections.
- `lib/db.js` – helper that reads/writes a `data.json` file in the project root. For production you should replace this with a real database or Vercel KV.
- `data.json` – simple JSON file that holds all records. **Note:** Vercel's filesystem is ephemeral; data will reset on each deploy. Use a managed database for persistence.
- `package.json` – Next.js project configuration and scripts.
- `index.html` – (optional) landing page for the site.

## Available API resources

| Resource path        | Description                     |
|----------------------|---------------------------------|
| `/api/musicReleases` | music release objects           |
| `/api/actingProjects`| acting project objects          |
| `/api/galleryItems`  | gallery image metadata          |
| `/api/teamMembers`   | team member profiles            |
| `/api/contactMessages` | contact messages            |

Supported HTTP methods: `GET`, `POST`, `PUT`, `DELETE`. Example:

```bash
curl -X POST https://yourdomain.vercel.app/api/musicReleases -d '{"id":123, "title":"New"}' -H "Content-Type:application/json"
```

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html) to access the admin dashboard.

## Deploying to Vercel

1. Commit your code to a GitHub (or GitLab/Bitbucket) repository.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Build settings are automatic for Next.js; simply deploy.
4. When deployed, static assets like `dashboard.html` are available at `/dashboard.html`, and API routes at `/api/*`.

> **Persistence warning:** the example backend uses a local JSON file which is fine for prototype/demo, but Vercel serverless functions have a read-only filesystem in production. Switch to a proper database (MongoDB Atlas, Firebase, Supabase, Vercel KV, etc.) before storing real data.

## Front‑end changes

The admin dashboard (`public/dashboard.html`) now uses `fetch` to hit our API routes rather than `localStorage`. Those changes are already applied.

## Next Steps

1. Configure an external database and update `lib/db.js` accordingly.
2. Add authentication/authorization to protect the API routes.
3. Convert the static HTML to React/Next.js pages for better maintainability.

---

This setup gives you a minimal backend that runs on Vercel and is ready for further expansion. Feel free to adapt it to your requirements.