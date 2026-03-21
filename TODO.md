# Film Dashboard Fix - Approved Plan
Status: ✅ In Progress

## Breakdown Steps (Execute in Order)

### 1. Create Environment Files ✅
- `.env.local` with Supabase + ADMIN_SECRET
- `.env.local.example` (template)

### 2. Create Supabase SQL Schema
- `sql/setup.sql` - Run in Supabase SQL Editor

### 3. Fix Backend API Naming
- Edit `pages/api/[resource].js`: Rename `filmses` → `filmReleases`

### 4. Fix Dashboard Auth Header
- Edit `public/dashboard.html`: Add `x-admin-token` to apiRequest()

### 5. Migrate data.json
- Edit `data.json`: Rename `filmses` → `filmReleases`

### 6. Secure Supabase Client
- Edit `lib/supabase.js`: Use environment variables

### 7. Test Commands
```
npm run dev
# Test public site: http://localhost:3000
# Test dashboard: http://localhost:3000/dashboard.html (admin/password)
# Verify curl writes with token
```

### 8. Deploy Checklist
```
git add .
git commit -m "Fix dashboard: naming, auth, Supabase"
vercel --prod
```

**Next Step: Execute #1-2 (env + SQL)**

✅ COMPLETE - Film Dashboard Fully Fixed
