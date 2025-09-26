# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

### 1. Prerequisites
- Vercel account (free tier available)
- Gemini API key
- Supabase account (optional, for full features)

### 2. One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/walmart-compass)

### 3. Environment Variables
Set these in your Vercel dashboard:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=models/gemma-3n-e4b-it

# Optional (for full features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Manual Deployment

### 1. Build the Application
```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Test the build locally
pnpm start
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Follow the prompts to configure
```

### 3. Configure Environment Variables
In your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required variables
4. Redeploy if needed

## Alternative Deployment Options

### Netlify
```bash
# Build the project
pnpm build

# Deploy to Netlify
npx netlify deploy --prod --dir=out
```

### Static Export
```bash
# Add to next.config.ts
output: 'export'

# Build and export
pnpm build

# Deploy the 'out' folder to any static host
```

### Docker Deployment
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Configuration

### Required Variables
- `GEMINI_API_KEY`: Your Google Gemini API key
- `GEMINI_MODEL`: Model to use (default: `models/gemma-3n-e4b-it`)

### Optional Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

### Getting API Keys

#### Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your environment variables

#### Supabase Setup (Optional)
1. Create account at [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the URL and anon key

## Post-Deployment Checklist

### 1. Test Core Functionality
- [ ] Homepage loads correctly
- [ ] Map displays properly
- [ ] Chat interface works
- [ ] Shopping list functions
- [ ] Mobile responsiveness

### 2. Test AI Features
- [ ] Chat responds to messages
- [ ] Items are recognized and added to list
- [ ] Route calculation works
- [ ] Error handling for API failures

### 3. Test Authentication (if Supabase configured)
- [ ] Google OAuth login works
- [ ] User profiles are created
- [ ] Preferences are saved
- [ ] Logout functions properly

### 4. Performance Check
- [ ] Page load times are acceptable
- [ ] Mobile performance is good
- [ ] PWA features work (install prompt)
- [ ] Offline functionality works

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

#### Environment Variables Not Working
- Check variable names match exactly
- Ensure no trailing spaces
- Redeploy after adding variables

#### API Errors
- Verify API keys are correct
- Check API quotas and limits
- Review error logs in Vercel dashboard

#### Mobile Issues
- Test on actual devices
- Check viewport meta tags
- Verify touch targets are large enough

### Performance Optimization

#### Bundle Size
- Use `pnpm build` to see bundle analysis
- Consider code splitting for large components
- Optimize images and assets

#### Loading Speed
- Enable Vercel's edge functions
- Use CDN for static assets
- Implement proper caching headers

## Monitoring & Maintenance

### Error Tracking
Consider adding:
- Sentry for error tracking
- Google Analytics for usage insights
- Vercel Analytics for performance monitoring

### Regular Updates
- Keep dependencies updated
- Monitor API usage and costs
- Review and update environment variables

### Backup Strategy
- Export Supabase data regularly
- Keep environment variables documented
- Maintain deployment configuration

## Security Considerations

### API Keys
- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate keys regularly

### CORS Configuration
- Configure allowed origins in API routes
- Use proper authentication for sensitive endpoints
- Implement rate limiting if needed

### Data Privacy
- Follow GDPR/privacy regulations
- Implement proper data retention policies
- Use secure authentication methods

---

**Ready to deploy?** 🚀

Your Walmart Wavefinder app is production-ready! Follow the steps above to get it live and start helping shoppers navigate stores more efficiently.
