# DeepSeek-Cloudflare Agent (Self-Hosted)

> A serverless, memory-enabled AI personal assistant powered by DeepSeek V3, running on Cloudflare Workers & R2.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Status](https://img.shields.io/badge/status-active-success.svg) ![Stack](https://img.shields.io/badge/tech-Cloudflare%20Workers%20%7C%20R2%20%7C%20DeepSeek-lightgrey)

## Overview
This project is a highly modified, security-hardened fork of Clawdbot, re-engineered to run **DeepSeek V3** as its cognitive engine. Unlike standard chatbots, this agent runs entirely on **Serverless Infrastructure** (Cloudflare Durable Objects), meaning it has 0% idle costs and scales infinitely.

It features **Persistent Long-Term Memory** via Cloudflare R2 (S3-compatible storage), allowing it to remember user details, preferences, and context across sessions.

## Key Features
- **DeepSeek V3 Integration:** Replaced default OpenAI drivers with DeepSeek's advanced reasoning model (64k context window).
- **Infinite Memory:** Uses **Cloudflare R2** to store JSON/Markdown logs of conversations. It doesn't "forget" when the server restarts.
- **Enterprise Security:** Custom "Allowlist" protocol. The bot ignores all Telegram messages unless the User ID matches the verified owner.
- **Zombie-Proof:** Dockerized deployment with self-healing start scripts (`v21-security-lockdown`).
- **Serverless:** Runs on Cloudflare Workers (0ms cold boot, global edge network).

## Tech Stack
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Compute** | Cloudflare Workers | Serverless execution environment |
| **State** | Durable Objects | Manages active chat sessions & "Brain" state |
| **Storage** | Cloudflare R2 | Long-term memory (S3 Protocol) |
| **Model** | DeepSeek V3 | LLM for reasoning and chat |
| **Interface** | Telegram Bot API | User interaction frontend |

## Installation & Setup

### Prerequisites
- Cloudflare Account (Workers & R2 enabled)
- Telegram Bot Token (@BotFather)
- DeepSeek API Key

### 1. Configuration
Clone the repo and configure your `wrangler.jsonc`:
```jsonc
"r2_buckets": [
  {
    "binding": "BUCKET",
    "bucket_name": "your-r2-bucket-name"
  }
]
```

### 2. Security Setup (The Allowlist)
This agent uses a strict allowlist to prevent unauthorized access.

1. **Find your Telegram ID:** Message the bot [@userinfobot](https://t.me/userinfobot) on Telegram. It will reply with your numeric ID (e.g., `123456789`).

2. **Add it to Cloudflare Secrets:**
```bash
npx wrangler secret put TELEGRAM_ALLOWED_USER
# Enter your ID when prompted
```

### 3. Deployment
npm run deploy

### 4. Configure `wrangler.jsonc`
The default configuration points to a bucket named `moltbot-data`. You must update this to match your own R2 bucket.

1. Open `wrangler.jsonc`.
2. Find the `r2_buckets` section.
3. Change `"bucket_name"` to the name of the bucket you created in Step 2.

```jsonc
"r2_buckets": [
    {
        "binding": "BUCKET",
        "bucket_name": "<YOUR_BUCKET_NAME>" // <-- Change this!
    }
]
```

## Memory Architecture
The bot uses a dual-layer memory system:
- **Short-Term**: Held in Durable Object RAM for instant context.
- **Long-Term**: Periodically flushes USER.md and conversation logs to the R2 Bucket.

## Credits
- **Core Agent:** [OpenClaw](https://github.com/openclaw) (formerly Clawdbot/Moltbot)
- **Serverless Infrastructure:** [Moltworker](https://github.com/cloudflare/moltworker) by Cloudflare
- **Modifications:** **Terry (@daboss88)** - DeepSeek migration, R2 persistence fix, Security hardening.