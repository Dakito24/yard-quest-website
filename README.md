# Yard Quest Website

Simple landing page and deep link handler for the Yard Quest mobile app.

## Overview

This website serves three main purposes:

1. **Landing Page**: Showcases the Yard Quest app with download links
2. **Deep Linking**: Handles iOS Universal Links and Android App Links to open sales in the app
3. **Fallback**: Provides app download options when the app is not installed

## Project Structure

```
yard-quest-website/
├── .well-known/
│   ├── apple-app-site-association    # iOS Universal Links configuration
│   └── assetlinks.json                # Android App Links configuration
├── public/
│   ├── index.html                     # Main landing page
│   └── sale.html                      # Sale detail page (deep link handler)
├── server.js                          # Express server
├── package.json                       # Dependencies
├── Dockerfile                         # Docker configuration
├── .dockerignore                      # Docker ignore rules
└── README.md                          # This file
```

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (for containerized deployment)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The website will be available at `http://localhost:3000`

### 3. Test Deep Link Files

Verify the deep link configuration files are accessible:

```bash
# iOS Universal Links
curl http://localhost:3000/.well-known/apple-app-site-association

# Android App Links
curl http://localhost:3000/.well-known/assetlinks.json
```

Both should return JSON with `Content-Type: application/json` header.

## Docker Deployment

### Build the Docker Image

```bash
docker build -t yard-quest-website .
```

### Run the Container

```bash
docker run -d -p 3000:3000 --name yard-quest-web yard-quest-website
```

### Run with Custom Port

```bash
docker run -d -p 8080:3000 --name yard-quest-web yard-quest-website
```

### Stop the Container

```bash
docker stop yard-quest-web
docker rm yard-quest-web
```

### View Logs

```bash
docker logs yard-quest-web
```

## Production Deployment

### Important Requirements

When deploying to production at `yard-quest.com`:

1. **HTTPS Required**: Both deep link files MUST be served over HTTPS
2. **No Redirects**: The `.well-known` files must not redirect
3. **Correct Content-Type**: Must return `Content-Type: application/json`
4. **Public Access**: Files must be publicly accessible without authentication
5. **Domain Verification**: Ensure DNS points to your server

### Deployment Steps

1. **Build and push Docker image** (if using container registry):
   ```bash
   docker build -t your-registry/yard-quest-website:latest .
   docker push your-registry/yard-quest-website:latest
   ```

2. **Deploy to your server**:
   ```bash
   # Pull and run the container
   docker pull your-registry/yard-quest-website:latest
   docker run -d -p 3000:3000 --name yard-quest-web \
     --restart unless-stopped \
     your-registry/yard-quest-website:latest
   ```

3. **Configure reverse proxy** (nginx example):
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yard-quest.com www.yard-quest.com;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Verify deep link files are accessible**:
   ```bash
   # Check iOS Universal Links
   curl -I https://www.yard-quest.com/.well-known/apple-app-site-association

   # Check Android App Links
   curl -I https://www.yard-quest.com/.well-known/assetlinks.json
   ```

5. **Validate with platform tools**:
   - **iOS**: [Apple App Search Validation Tool](https://search.developer.apple.com/appsearch-validation-tool/)
   - **Android**: [Google Digital Asset Links Tool](https://developers.google.com/digital-asset-links/tools/generator)

## Deep Link Configuration

### iOS Universal Links

File: `.well-known/apple-app-site-association`

- **App ID**: `4QLN2V7LPA.com.dakito.yardquest`
- **Paths**: `/sale/*`

### Android App Links

File: `.well-known/assetlinks.json`

- **Package**: `com.dakito.yardquest`
- **SHA256 Fingerprint** (Debug): `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`

**Important**: Before deploying to production, add your production keystore SHA256 fingerprint to `assetlinks.json`.

Get production fingerprint:
```bash
keytool -list -v -keystore path/to/upload-keystore.jks -alias upload
```

Or from Google Play Console: Setup → App Signing → SHA-256 certificate fingerprint

## Routes

- `/` - Landing page
- `/sale/:id` - Sale detail page (deep link handler)
- `/.well-known/apple-app-site-association` - iOS Universal Links
- `/.well-known/assetlinks.json` - Android App Links

## How Deep Linking Works

1. User clicks a shared link: `https://www.yard-quest.com/sale/123`
2. **If app is installed**:
   - iOS/Android opens the link in the Yard Quest app
   - App navigates directly to the sale detail screen
3. **If app is not installed**:
   - Link opens in browser
   - `sale.html` is displayed
   - After 3 seconds, shows app download options
   - User can download the app from App Store or Google Play

## Testing Deep Links

### iOS Testing

1. Build the app with Universal Links configured
2. Install on a physical device (simulator support is limited)
3. Send yourself a test link via Messages or Mail
4. Tap the link - app should open directly to the sale

### Android Testing

1. Build the app with App Links configured
2. Install on a device or emulator
3. Test with ADB:
   ```bash
   adb shell am start -W -a android.intent.action.VIEW \
     -d "https://www.yard-quest.com/sale/123" \
     com.dakito.yardquest
   ```
4. Verify domain verification:
   ```bash
   adb shell pm get-app-links com.dakito.yardquest
   ```

## Environment Variables

- `PORT` - Server port (default: 3000)

## Troubleshooting

### Deep links not working

1. **Verify HTTPS**: Deep links only work over HTTPS in production
2. **Check Content-Type**: Ensure JSON files return correct Content-Type header
3. **No redirects**: Verify `.well-known` files don't redirect
4. **Rebuild app**: App caches deep link config on install
5. **Delete and reinstall**: iOS caches Universal Links config

### Files not accessible

1. **Check file permissions**: Ensure files are readable
2. **Verify path**: Files must be at `/.well-known/` (note the leading slash)
3. **Test with curl**: Use `curl -I` to check headers

### Docker issues

1. **Port conflicts**: Ensure port 3000 is not in use
2. **Container logs**: Check `docker logs yard-quest-web`
3. **Restart container**: `docker restart yard-quest-web`

## Security Notes

- Deep link files must be publicly accessible (no authentication)
- HTTPS is required for production deep linking
- Keep SSL certificates up to date
- Regularly verify deep link files are accessible

## Support

For issues or questions about the mobile app integration, refer to the main app documentation.

## License

MIT
