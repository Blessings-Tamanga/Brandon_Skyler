# Next.js Portfolio Professionalization & Fix Plan

## Status: [IN PROGRESS]

### 1. Create TODO.md [✅ DONE]

### 2. Fix Supabase Config (Security + Env) [✅ DONE]\n- Create .env.local with SUPABASE_URL, SUPABASE_ANON_KEY\n- Update lib/supabase.js to use process.env\n- Update pages/_document.js to use NEXT_PUBLIC_ env

### 3. Performance: ISR for publicContent API [✅ DONE]\n- Convert to App Router GET() + revalidate: 300

### 4. Reduce JS Polling + Add Skeletons
- Edit public/js/app.js → disable polling if realtime, longer cache TTL
- Edit public/index.html → add CSS skeletons to grids

### 5. Image Optimization
- Add next.config.js with image domains
- Update renders to use loading='lazy' + sizes

### 6. Test Run
- `npm run dev`
- Check console/network, Lighthouse perf >90

### 7. Pro Tools
- Add ESLint/Prettier/TS configs
- Clean test files

### 8. Deploy Ready [npm run build & vercel]

Next Step: 6. Test `npx next dev -p 3000` + open localhost:3000 to verify faster load

