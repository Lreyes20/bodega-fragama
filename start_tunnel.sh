#!/bin/bash
./cloudflared tunnel --url http://localhost:8080 > tunnel.log 2>&1 &
TUNNEL_PID=$!
echo $TUNNEL_PID > tunnel.pid
echo "Tunnel started with PID $TUNNEL_PID. Waiting for public URL..."

for i in {1..20}; do
  URL=$(grep -o 'https://[-a-zA-Z0-9@:%._\+~#=]*.trycloudflare.com' tunnel.log | head -n 1)
  if [ ! -z "$URL" ]; then
    echo "PUBLIC_URL=$URL"
    break
  fi
  sleep 1
done
