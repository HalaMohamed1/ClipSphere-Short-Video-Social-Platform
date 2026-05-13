# SSL/TLS Certificates

⚠️ **IMPORTANT**: Do NOT commit private keys to version control!

## Development: Self-Signed Certificate

Generate a self-signed certificate for local development:

```bash
cd nginx/ssl
openssl req -x509 -newkey rsa:2048 -keyout nginx.key -out nginx.crt -days 365 -nodes
```

When prompted:
- **Common Name (CN)**: `localhost` (or your dev domain)
- **Country, State, City**: Any values (ignored for self-signed)

**Browser Warning**: Browsers will show "certificate not trusted" warning for self-signed certs. This is expected in development.

## Production: CA-Signed Certificate

For production deployment:

1. **Option A - Let's Encrypt (Recommended)**
   ```bash
   # Using Certbot
   certbot certonly --standalone -d yourdomain.com
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/nginx.crt
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/nginx.key
   sudo chmod 644 nginx/ssl/nginx.*
   ```

2. **Option B - Commercial CA**
   - Obtain certificate from provider (Comodo, DigiCert, etc.)
   - Place `certificate.crt` → `nginx/ssl/nginx.crt`
   - Place `private_key.key` → `nginx/ssl/nginx.key`
   - Place intermediate chain (if provided) → update nginx.conf

## File Permissions

```bash
# Nginx must read the key file
chmod 644 nginx/ssl/nginx.key
chmod 644 nginx/ssl/nginx.crt
```

## Docker Volumes

The `docker-compose.yml` mounts SSL certificates as read-only:

```yaml
volumes:
  - ./nginx/ssl:/etc/nginx/ssl:ro
```

Nginx inside the container reads from `/etc/nginx/ssl/nginx.{crt,key}`.

## Verify Certificate

```bash
# Check certificate details
openssl x509 -in nginx/ssl/nginx.crt -text -noout

# Check expiration date
openssl x509 -in nginx/ssl/nginx.crt -noout -dates
```

## Renewal

For Let's Encrypt certificates:
```bash
certbot renew
# Copy renewed certificates to nginx/ssl/
```

Set up cron job for automatic renewal (handled by certbot on Linux/macOS).
