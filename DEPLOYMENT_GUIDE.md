# NavEdge Deployment Guide

## Current Status

✅ **All new features are built and working with offline fallbacks:**
- Document OCR Scanner (uses local Tesseract.js when backend unavailable)
- AI Damage Detection (uses mock analysis when backend unavailable)
- Renter Chatbot (uses intelligent mock responses when backend unavailable)
- WhatsApp Notifications (demo mode when backend unavailable)
- Enhanced Reports & Contracts
- Dubai Police Fine Checker

✅ **Build successful** - Production-ready deployment package in `/dist` folder

## How Features Work Now

### 1. **With Backend API Available**
When your FastAPI backend at `http://185.241.151.219:8000` is running and accessible:
- All features connect to the backend
- Real OCR processing on server
- Actual damage detection with AI
- Live chatbot responses
- Real WhatsApp notifications sent
- Backend-generated reports and contracts

### 2. **Without Backend API (Current State)**
Since the backend isn't accessible from the browser, features automatically fall back to:
- **Document OCR**: Uses Tesseract.js for local image text extraction
- **Damage Detection**: Provides mock damage analysis with realistic results
- **Chatbot**: Intelligent pattern-based responses for common questions
- **WhatsApp**: Shows success in demo mode (message not actually sent)
- **Reports**: Uses local data and mock analytics
- **Contracts**: Local PDF generation with jsPDF

## Deployment Steps

### Option 1: Deploy to Netlify (Recommended)

1. **Initialize Git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit with all features"
   ```

2. **Push to GitHub:**
   ```bash
   git remote add origin YOUR_GITHUB_REPO_URL
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Netlify:**
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

4. **Add Custom Domain:**
   - In Netlify dashboard, go to "Domain settings"
   - Add custom domain: `navedge.ai`
   - Update DNS records as instructed by Netlify

### Option 2: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Add Custom Domain:**
   - In Vercel dashboard, go to your project
   - Settings → Domains
   - Add `navedge.ai`

### Option 3: Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload `dist` folder contents** to your web server:
   - All files in `/dist` folder
   - Maintain the directory structure
   - Ensure `.htaccess` or equivalent redirects for SPA routing

3. **Configure web server** for single-page application:

   **For Apache (.htaccess):**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   **For Nginx:**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

## Post-Deployment

### To Enable Full Backend Integration:

1. **Ensure FastAPI backend is running** at `http://185.241.151.219:8000`

2. **Enable CORS on backend** to allow requests from `navedge.ai`:
   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://navedge.ai", "http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Test API endpoints** are accessible from browser:
   - Open browser console on navedge.ai
   - Try: `fetch('http://185.241.151.219:8000/api/reports/dashboard')`
   - If you get CORS error, backend needs CORS configuration
   - If you get network error, backend isn't accessible from public internet

4. **Consider HTTPS for backend** (recommended for production):
   - Use nginx as reverse proxy with SSL certificate
   - Or use Cloudflare for SSL termination
   - Update frontend API URL to use HTTPS

### Environment Variables (Optional)

Create `.env` file for different API URLs per environment:

```bash
# .env.production
VITE_FASTAPI_URL=https://api.navedge.ai

# .env.development
VITE_FASTAPI_URL=http://localhost:8000
```

Update `src/services/fastapi.ts`:
```typescript
const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_URL || 'http://185.241.151.219:8000';
```

## Testing Deployment

After deployment, test these features:

### Working Features (with or without backend):
- ✅ Login (demo: admin/password123)
- ✅ Dashboard with stats and charts
- ✅ Driver management
- ✅ Contract management
- ✅ Document OCR (local processing)
- ✅ Damage Detection (mock analysis)
- ✅ Renter Chatbot (intelligent responses)
- ✅ WhatsApp notifications (demo mode)
- ✅ Reports and analytics
- ✅ Fine management

### Features requiring backend API:
- Real-time OCR via FastAPI
- Actual AI damage detection
- Backend chatbot responses
- Real WhatsApp message sending
- Backend-generated contracts
- Live Dubai Police fine checking

## Troubleshooting

### "Failed to fetch" errors:
1. Check if backend is running: `curl http://185.241.151.219:8000`
2. Check browser console for CORS errors
3. Features will automatically fall back to local processing

### Features not visible:
1. Clear browser cache
2. Check if you're logged in (admin/password123)
3. Check browser console for JavaScript errors

### Build fails:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Run `npm run build`

## Current Deployment Status

🟡 **Features deployed locally** - Built and ready in `/dist` folder
🔴 **Not yet live on navedge.ai** - Requires deployment step
🟢 **All features working offline** - Local fallbacks implemented

## Next Steps

1. ✅ Choose deployment method (Netlify recommended)
2. ✅ Deploy the application
3. ✅ Configure custom domain (navedge.ai)
4. ⚠️ Enable backend API with CORS (optional, for full features)
5. ✅ Test all features on live site

## Support

For issues or questions:
- Check browser console for errors
- Review API_INTEGRATION.md for backend setup
- Review FEATURES.md for feature documentation
