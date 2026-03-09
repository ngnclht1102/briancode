#!/bin/bash
# Setup script: connects to Android proxy and generates brian-code config
# Usage: ./setup.sh 192.168.1.2:52524

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <android-ip:port>"
  echo "Example: $0 192.168.1.2:52524"
  exit 1
fi

ANDROID_ADDR="$1"
ANDROID_IP="${ANDROID_ADDR%%:*}"
ANDROID_PORT="${ANDROID_ADDR##*:}"
LOCAL_PORT="${2:-3100}"

echo "Android proxy: ${ANDROID_IP}:${ANDROID_PORT}"
echo "Local port:    ${LOCAL_PORT}"

# ADB port forward: MacBook:LOCAL_PORT → Android:ANDROID_PORT
echo ""
echo "Setting up adb port forward..."
adb forward tcp:${LOCAL_PORT} tcp:${ANDROID_PORT}
echo "adb forward tcp:${LOCAL_PORT} tcp:${ANDROID_PORT} — done"

# Generate config
CONFIG_DIR="$HOME/.brian-code"
CONFIG_FILE="${CONFIG_DIR}/config.json"
PROXY_BASE="http://127.0.0.1:${LOCAL_PORT}"

mkdir -p "${CONFIG_DIR}"

# Read existing config or start fresh
if [ -f "${CONFIG_FILE}" ]; then
  echo ""
  echo "Existing config found, merging baseUrl into providers..."
  # Use node to merge baseUrl into existing config
  node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('${CONFIG_FILE}', 'utf-8'));
    if (!config.providers) config.providers = {};
    const providers = ['anthropic', 'deepseek', 'openai', 'kimi', 'qwen', 'groq'];
    for (const p of providers) {
      if (!config.providers[p]) config.providers[p] = {};
      config.providers[p].baseUrl = '${PROXY_BASE}/' + p;
    }
    fs.writeFileSync('${CONFIG_FILE}', JSON.stringify(config, null, 2));
  "
else
  echo ""
  echo "Creating new config..."
  cat > "${CONFIG_FILE}" << EOF
{
  "defaultProvider": "deepseek",
  "providers": {
    "deepseek": {
      "model": "deepseek-chat",
      "baseUrl": "${PROXY_BASE}/deepseek"
    },
    "anthropic": {
      "model": "claude-sonnet-4-20250514",
      "baseUrl": "${PROXY_BASE}/anthropic"
    },
    "openai": {
      "baseUrl": "${PROXY_BASE}/openai"
    },
    "kimi": {
      "model": "moonshot-v1-8k",
      "baseUrl": "${PROXY_BASE}/kimi"
    },
    "qwen": {
      "model": "qwen-turbo",
      "baseUrl": "${PROXY_BASE}/qwen"
    },
    "groq": {
      "baseUrl": "${PROXY_BASE}/groq"
    }
  }
}
EOF
fi

echo ""
echo "Config written to ${CONFIG_FILE}"
echo ""
echo "All providers now route through proxy:"
echo "  anthropic → ${PROXY_BASE}/anthropic"
echo "  deepseek  → ${PROXY_BASE}/deepseek"
echo "  openai    → ${PROXY_BASE}/openai"
echo "  kimi      → ${PROXY_BASE}/kimi"
echo "  qwen      → ${PROXY_BASE}/qwen"
echo "  groq      → ${PROXY_BASE}/groq"
echo ""
echo "Done! Make sure the proxy is running on your Android device."
