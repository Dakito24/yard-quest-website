# How to Redeploy Yard Quest Website

## Quick Deploy (Rebuild Docker Container)

### Option 1: Using Docker Compose

```bash
# Stop the current container
docker-compose down

# Rebuild the image (force no cache)
docker-compose build --no-cache

# Start the new container
docker-compose up -d

# Verify it's running
docker-compose ps
docker-compose logs -f web
```

### Option 2: Using Docker Directly

```bash
# Stop and remove old container
docker stop yard-quest-website
docker rm yard-quest-website

# Remove old image to force rebuild
docker rmi yard-quest-website-web

# Rebuild
docker build --no-cache -t yard-quest-website-web .

# Run new container
docker run -d --name yard-quest-website -p 3000:3000 --restart unless-stopped yard-quest-website-web

# Check logs
docker logs -f yard-quest-website
```

## Verify Logo is Loaded

After deploying, check that the logo file exists in the container:

```bash
# Check if logo exists in running container
docker exec yard-quest-website ls -lh /app/public/logo.png

# Should show: -rw-r--r-- 1 root root 143K ... /app/public/logo.png
```

## Test Locally Before Deploy

```bash
# Build and test locally first
docker-compose up --build

# In another terminal, test the logo endpoint
curl -I http://localhost:3000/logo.png

# Should return: HTTP/1.1 200 OK
# Content-Type: image/png
```

## If Deploying to Cloud Server (SSH)

```bash
# SSH into your server
ssh your-server

# Pull latest code
cd /path/to/yard-quest-website
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify
curl -I https://yard-quest.com/logo.png
```

## Common Issues

### Issue: Logo still not showing
- **Cause**: Browser cache
- **Fix**: Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Issue: Docker build using cache
- **Cause**: Docker cached old layers
- **Fix**: Use `--no-cache` flag when building

### Issue: "Image not found" but container is running
- **Cause**: File not copied to container
- **Fix**: Check .dockerignore doesn't exclude PNG files (it doesn't)
