#!/bin/bash
# VERSION CHECK: v21-security-lockdown
echo ">>> STARTING SCRIPT v21 (Security Lockdown) <<<"

mkdir -p /root/.clawdbot
CONFIG_FILE="/root/.clawdbot/clawdbot.json"
if [ ! -f "$CONFIG_FILE" ]; then echo "{}" > "$CONFIG_FILE"; fi

node -e '
const fs = require("fs");
const configFile = "/root/.clawdbot/clawdbot.json";
let config = {};
try { config = JSON.parse(fs.readFileSync(configFile)); } catch (e) {}

config.models = config.models || {};
config.models.providers = config.models.providers || {};
config.agents = config.agents || {};

// --- KEY CLEANER ---
let rawKey = process.env.OPENAI_API_KEY || "";
let cleanKey = rawKey.replace(/["'\'']/g, "").trim();

// --- SECURITY LOGIC ---
// 1. Get the VIP ID from Cloudflare
let vipUser = process.env.TELEGRAM_ALLOWED_USER || ""; 
// 2. Determine Policy: If we have a VIP, use strict allowlist. Otherwise, allow everyone (pairing).
let policy = vipUser ? "allowlist" : "pairing";
let allowList = vipUser ? [vipUser] : ["*"];

console.log("DEBUG: Security Policy:", policy);
console.log("DEBUG: Allowed Users:", allowList);

// --- DEEPSEEK CONFIG ---
config.models.providers.deepseek = {
    api: "openai-completions",
    baseUrl: "https://api.deepseek.com/v1",
    apiKey: cleanKey,
    models: [{ id: "deepseek-chat", name: "DeepSeek Chat", contextWindow: 64000 }]
};
config.agents.defaults = { model: { primary: "deepseek/deepseek-chat" } };

// --- GATEWAY ---
config.gateway = {
    port: 18789,
    auth: { token: process.env.CLAWDBOT_GATEWAY_TOKEN || "admin" }
};
if (config.gateway.token) { delete config.gateway.token; }
if (config.gateway.bind) { delete config.gateway.bind; }

// --- TELEGRAM ---
config.channels = config.channels || {};
if (process.env.TELEGRAM_BOT_TOKEN) {
    config.channels.telegram = {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        dmPolicy: policy,        // Uses "allowlist" if ID is present
        allowFrom: allowList,    // Only allows YOU
        enabled: true
    };
}
fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
'

echo "Config patched. Starting Gateway..."

exec clawdbot gateway \
  --port 18789 \
  --bind "lan" \
  --token "${CLAWDBOT_GATEWAY_TOKEN:-admin}" \
  --allow-unconfigured