# Google AdSense Setup Guide

## How to Add Google Ads to Your Study Companion App

### Step 1: Sign Up for Google AdSense
1. Go to [Google AdSense](https://www.google.com/adsense)
2. Sign in with your Google account
3. Complete the application process (usually takes 1-2 days for approval)

### Step 2: Get Your Publisher ID
Once approved:
1. Log into your AdSense account
2. Navigate to **Account** → **Settings**
3. Find your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### Step 3: Update Your App
1. Open `index.html`
2. Find this line:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
```
3. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual Publisher ID

### Step 4: Add Ad Units
To display ads on your pages, add ad units in your components:

```tsx
// Example: Add to your component
useEffect(() => {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    console.error('AdSense error:', e);
  }
}, []);

return (
  <ins className="adsbygoogle"
    style={{ display: 'block' }}
    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
    data-ad-slot="YYYYYYYYYY"
    data-ad-format="auto"
    data-full-width-responsive="true">
  </ins>
);
```

### Best Practices for Study App Ads
1. **Strategic Placement**:
   - Between study sessions (non-intrusive)
   - In the room list sidebar
   - After completing a Pomodoro session

2. **User Experience First**:
   - Don't interrupt active study sessions
   - Place ads in natural break points
   - Use responsive ad units

3. **Ad Types to Consider**:
   - Display ads (banners)
   - Native ads (blend with content)
   - Multiplex ads (for room listings)

### Revenue Optimization Tips
- Wait until you have significant traffic (100+ daily users)
- Experiment with ad placement
- Monitor performance in AdSense dashboard
- Keep ads relevant to education/productivity niche

### Important Notes
⚠️ **AdSense Policies**:
- Don't click your own ads
- Don't encourage users to click ads
- Ensure content is original and valuable
- Follow AdSense program policies

### Alternative Monetization Options
If AdSense doesn't work for you:
1. **Premium Features**: Add subscription for advanced features
2. **Affiliate Links**: Partner with study resources
3. **Donations**: Add support/tip functionality
4. **Sponsored Content**: Partner with educational brands
