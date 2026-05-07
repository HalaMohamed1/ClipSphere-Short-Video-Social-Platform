#!/usr/bin/env bash
# Forward Stripe webhooks to the local ClipSphere API (run from project root).
# Copy the "whsec_..." signing secret from this command's output into STRIPE_WEBHOOK_SECRET in .env
set -euo pipefail
exec stripe listen --forward-to localhost:5050/api/v1/webhooks/stripe
