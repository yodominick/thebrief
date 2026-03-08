import { useState } from "react";
import Head from "next/head";

const TOPICS = ["Technology", "Science", "World", "Business", "Health", "Climate"];

const sentimentColor = (s) =>
  ({ positive: "#16a34a", negative: "#dc2626", neutral: "#94a3b8" })[s] || "#94a3b8";

export default function Home() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({});

  const fetchNews = async (topic, force = false) => {
    if (!force && cache[topic]) {
      setArticles(cache[topic]);
      setActiveTopic(topic);
      return;
    }

    setLoading(true);
    setError(null);
    setActiveTopic(topic);
    setArticles([]);

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setCache((prev) => ({ ...prev, [topic]: data.articles }));
      setArticles(data.articles);
    } catch (err) {
      setError(err.message || "Couldn't load news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = () => {
    if (!activeTopic) return;
    setCache((prev) => { const n = { ...prev }; delete n[activeTopic]; return n; });
    fetchNews(activeTopic, true);
  };

  return (
    <>
      <Head>
        <title>The Brief — AI News Digest</title>
        <meta name="description" content="No-clickbait AI-powered news headlines" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight: "100vh" }}>
        {/* Header */}
        <header style={{
          borderBottom: "2px solid #111",
          padding: "28px 48px 18px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.15em",
              color: "#aaa",
              marginBottom: "4px",
              textTransform: "uppercase",
            }}>
              AI News Digest
            </div>
            <h1 style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}>
              The <em>Brief</em>
            </h1>
          </div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            color: "#bbb",
            letterSpacing: "0.05em",
          }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", month: "long", day: "numeric", year: "numeric",
            })}
          </div>
        </header>

        {/* Topic Nav */}
        <nav style={{
          padding: "14px 48px",
          borderBottom: "1px solid #e5e5e1",
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            color: "#ccc",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginRight: "6px",
          }}>
            Topics
          </span>
          {TOPICS.map((t) => (
            <button
              key={t}
              className={`topic-btn ${activeTopic === t ? "active" : ""}`}
              onClick={() => fetchNews(t)}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* Main */}
        <main style={{ padding: "0 48px 80px", maxWidth: "900px" }}>

          {/* Empty state */}
          {!activeTopic && !loading && (
            <div style={{ paddingTop: "64px" }}>
              <p style={{
                fontSize: "clamp(20px, 2.5vw, 30px)",
                fontWeight: 300,
                color: "#bbb",
                lineHeight: 1.5,
                fontStyle: "italic",
                maxWidth: "420px",
              }}>
                Select a topic to read<br />what actually happened.
              </p>
              <div style={{
                marginTop: "32px",
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px",
                color: "#ccc",
                letterSpacing: "0.08em",
              }}>
                No clickbait · No summaries · Just the facts
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ paddingTop: "4px" }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  padding: "18px 0",
                  borderBottom: "1px solid #e5e5e1",
                  display: "flex",
                  gap: "0",
                  animation: `fadeIn 0.3s ease ${i * 0.06}s forwards`,
                  opacity: 0,
                }}>
                  <div style={{ width: "32px", flexShrink: 0 }}>
                    <div className="skeleton" style={{ height: "10px", width: "20px", marginTop: "4px" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: "18px", width: `${65 + (i * 7) % 25}%`, marginBottom: "8px" }} />
                    <div className="skeleton" style={{ height: "10px", width: "120px" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginTop: "40px",
              padding: "16px 20px",
              border: "1px solid #fcd5d5",
              background: "#fff8f8",
              borderRadius: "2px",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              color: "#c44",
              letterSpacing: "0.04em",
            }}>
              {error}
            </div>
          )}

          {/* Articles */}
          {!loading && articles.length > 0 && (
            <div>
              <div style={{
                padding: "16px 0 4px",
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px",
                color: "#bbb",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span>{articles.length} stories — {activeTopic}</span>
                <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={forceRefresh}>
                  Refresh
                </span>
              </div>

              {articles.map((a, i) => {
                const inner = (
                  <>
                    <span className="headline-text">{a.headline}</span>
                    <div className="meta">
                      <span className="dot" style={{ background: sentimentColor(a.sentiment) }} />
                      <span>{a.source}</span>
                      <span>·</span>
                      <span>{a.time}</span>
                    </div>
                  </>
                );

                return (
                  <div key={i} className="article-row" style={{ animationDelay: `${i * 0.07}s` }}>
                    <span className="row-num">{String(i + 1).padStart(2, "0")}</span>
                    {a.url
                      ? <a className="article-link" href={a.url} target="_blank" rel="noopener noreferrer">{inner}</a>
                      : <div className="no-link">{inner}</div>
                    }
                    {a.url && <span className="arrow">↗</span>}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
