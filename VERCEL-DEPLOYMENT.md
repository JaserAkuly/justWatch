# 🚀 Vercel Deployment Guide

## Quick Deploy Steps

### 1. Import Repository to Vercel
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import from GitHub: `JaserAkuly/justWatch`

### 2. Configure Environment Variables
In the Vercel dashboard, add these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://lvvgmnthgvpqtoydwvvp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dmdtbnRoZ3ZwcXRveWR3dnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjE0MjksImV4cCI6MjA3ODI5NzQyOX0.PWN8c2Q4hgEE6IRonJJKvPzY2P6Jop4z6CR5PJ_Oe9E
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

### 3. Deploy
- Click "Deploy"
- Vercel will automatically build and deploy your app

### 4. Test the Demo
Once deployed, visit these URLs:
- **Homepage**: `https://your-project.vercel.app`
- **Demo**: `https://your-project.vercel.app/demo`
- **Login**: `https://your-project.vercel.app/login`

### Demo Credentials
- **Email**: `demo@television.app`
- **Password**: `demo123`

## Post-Deployment

### Update App URL
After deployment, update the `NEXT_PUBLIC_APP_URL` environment variable with your actual Vercel URL.

### Set up Supabase (Optional)
For full functionality, run the SQL from `supabase/schema.sql` and `supabase/seed.sql` in your Supabase project.

## 🎯 Ready to Share!
Your Television MVP is now live and ready to demo to your peer!