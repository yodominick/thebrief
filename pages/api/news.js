// pages/api/news.js
// This serverless function proxies requests to Anthropic,
// keeping your API key secret on the server side.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set. Add it to your Vercel environment variables." });
  }

  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Missing topic" });
  }

  const SYSTEM_PROMPT = `You are a no-nonsense news aggregator. When given a topic, search the web for the 6 most recent and important news stories from the last 48 hours.

Write headlines that are COMPLETE sentences telling the FULL story — no clickbait, no "you won't believe", no cliffhangers. The headline alone should inform the reader of exactly what happened.

Bad headline: "Scientists make shocking discovery about climate"
Good headline: "Antarctic ice sheet melting 40% faster than 2010 projections, threatening 2m sea rise by 2100"

Bad headline: "Apple announces major product changes"
Good headline: "Apple discontinues iPhone SE line and raises base iPhone 16 price to $829"

Return ONLY a JSON array (no markdown, no backticks, no preamble):
[
  {
    "headline": "full informative headline that tells the complete story in one sentence",
    "source": "publication name",
    "time": "how long ago (e.g. '2h ago', 'Yesterday')",
    "url": "direct URL to the article if found, otherwise null",
    "sentiment": "neutral|positive|negative"
  }
]

Be ruthlessly factual. Numbers and specifics over vague language. Real URLs only — if unsure, set null.`;

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Find the 6 latest news stories about: ${topic}` }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return res.status(anthropicRes.status).json({ error: err });
    }

    const data = await anthropicRes.json();
    const textBlock = data.content?.find((b) => b.type === "text");
    if (!textBlock) throw new Error("No text response from Claude");

    const clean = textBlock.text.replace(/```json|```/g, "").trim();
    const articles = JSON.parse(clean);

    return res.status(200).json({ articles });
  } catch (err) {
    console.error("News API error:", err);
    return res.status(500).json({ error: "Failed to fetch news. Please try again." });
  }
}
