import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";
import { timeAgo } from "../utils/format.js";
import Icon from "../components/Icon.jsx";

export default function Home() {
  // undefined = still loading, null = no news posted yet
  const [news, setNews] = useState(undefined);

  useEffect(() => {
    api.getHotNews().then(setNews).catch(() => setNews(null));
  }, []);

  return (
    <main className="app">
      <header className="topbar">
        <span className="brand">FoosFix</span>
      </header>

      <section className="hotnews" aria-label="Hot news">
        <span className="label">Hot news</span>
        {news ? (
          <>
            <span className="time">Posted {timeAgo(news.postedAt)}</span>
            <p>{news.text}</p>
          </>
        ) : (
          <p style={{ marginTop: 14 }}>
            {news === undefined ? "Loading..." : "No news right now."}
          </p>
        )}
      </section>

      <nav className="grid" aria-label="Main">
        <Link className="tile" to="/requests">
          <Icon name="list" />
          <span className="name">View all requests</span>
        </Link>

        <Link className="tile" to="/submit">
          <Icon name="circle-plus" />
          <span className="name">Submit request</span>
        </Link>

        <div className="tile soon" aria-disabled="true">
          <Icon name="megaphone" />
          <div>
            <span className="name">Announcements</span>
            <span className="pill">Coming soon</span>
          </div>
        </div>

        <div className="tile soon" aria-disabled="true">
          <Icon name="wallet" />
          <div>
            <span className="name">Fund</span>
            <span className="pill">Coming soon</span>
          </div>
        </div>
      </nav>

      <footer className="credit">
        Created by <a
          href="https://www.linkedin.com/in/rabeet-niaz-8b659039a/"
          target="_blank"
          rel="noreferrer"
        >
          Rabeet Niaz
        </a>
      </footer>
    </main>
  );
}