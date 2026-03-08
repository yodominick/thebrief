# The Brief — AI News Aggregator

A minimal, no-clickbait news aggregator powered by Claude AI with live web search.
Headlines tell the full story. Click to open the source article.

---

## Deploy to Vercel (free, ~5 minutes)

### Step 1 — Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / log in
3. Navigate to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`) — you won't see it again

---

### Step 2 — Put the code on GitHub

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Click **New repository** → name it `the-brief` → **Create repository**
3. Upload all the files from this folder to the repo
   - Easiest: drag and drop the files in the GitHub web UI
   - Or use Git on the command line:
     ```bash
     cd the-brief
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/YOUR_USERNAME/the-brief.git
     git push -u origin main
     ```

---

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New → Project**
3. Select your `the-brief` repository → click **Import**
4. Before deploying, click **Environment Variables** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from Step 1
5. Click **Deploy**

Vercel will build and deploy your app. In ~60 seconds you'll get a live URL like:
`https://the-brief-yourname.vercel.app`

---

## Run locally

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local
# Then edit .env.local and paste your API key

# 3. Start the dev server
npm run dev

# 4. Open http://localhost:3000
```

---

## How it works

```
Browser → /api/news (Vercel serverless) → Anthropic API (with web search) → JSON articles → UI
```

- The API key lives only on the server — never exposed to the browser
- Each topic fetch uses Claude with live web search to find real, recent stories
- Results are cached in memory per session to avoid redundant API calls

---

## Project structure

```
the-brief/
├── pages/
│   ├── api/
│   │   └── news.js       ← Serverless proxy (keeps API key secret)
│   ├── _app.js
│   └── index.js          ← Main UI
├── styles/
│   └── globals.css
├── .env.example           ← Copy to .env.local
├── .gitignore             ← Prevents secrets from being committed
├── next.config.js
└── package.json
```
