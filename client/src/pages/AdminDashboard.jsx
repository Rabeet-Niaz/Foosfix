import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api, auth } from "../api/api.js";
import { timeAgo } from "../utils/format.js";
import AdminRequestCard from "../components/AdminRequestCard.jsx";

const FILTERS = [
  ["pending", "Pending"],
  ["done", "Done"],
  ["cant_fix", "Can't fix"],
  ["archived", "Archived"],
];

// Keeps strangers out: no token means back to the login page
export default function AdminDashboard() {
  if (!auth.get()) return <Navigate to="/admin" replace />;
  return <Dashboard />;
}

function Dashboard() {
  const navigate = useNavigate();

  const [news, setNews] = useState("");
  const [postedAt, setPostedAt] = useState(null);
  const [posting, setPosting] = useState(false);

  const [counts, setCounts] = useState({ pending: 0, done: 0, cant_fix: 0 });
  const [filter, setFilter] = useState(null); // null = all, or a status, or "archived"
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [toast, setToast] = useState("");
  const timer = useRef();

  const archived = filter === "archived";
  const status = archived ? undefined : filter;

  function notify(message) {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 1800);
  }

  function logout() {
    auth.clear();
    navigate("/admin", { replace: true });
  }

  // An expired login (401) sends you back to the login page
  function handleError(err) {
    if (err.status === 401) logout();
    else notify(err.message);
  }

  function loadCounts() {
    api.adminGetCounts().then(setCounts).catch(handleError);
  }

  // On first open: current hot news and the counts
  useEffect(() => {
    api
      .getHotNews()
      .then((n) => {
        if (n) {
          setNews(n.text);
          setPostedAt(n.postedAt);
        }
      })
      .catch(() => {});
    loadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Every time the filter changes, load the first page again
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    api
      .adminGetRequests({ status, archived, page: 1 })
      .then((data) => {
        if (ignore) return;
        setItems(data.items);
        setPage(1);
        setHasMore(data.hasMore);
      })
      .catch((err) => {
        if (ignore) return;
        if (err.status === 401) logout();
        else setError(err.message);
      })
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function loadMore() {
    try {
      const data = await api.adminGetRequests({ status, archived, page: page + 1 });
      setItems((prev) => [...prev, ...data.items]);
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (err) {
      handleError(err);
    }
  }

  // A card changed: replace it, or drop it if it no longer belongs in this view
  function onUpdate(updated) {
    setItems((prev) =>
      updated.archived !== archived
        ? prev.filter((r) => r._id !== updated._id)
        : prev.map((r) => (r._id === updated._id ? updated : r))
    );
    loadCounts();
  }

  async function postNews() {
    const text = news.trim();
    if (!text) return;
    setPosting(true);
    try {
      const post = await api.adminPostNews(text);
      setPostedAt(post.postedAt);
      notify("Hot news updated");
    } catch (err) {
      handleError(err);
    } finally {
      setPosting(false);
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <span className="brand">Admin</span>
        <span className="spacer" />
        <button className="link-btn" onClick={logout}>
          Log out
        </button>
      </header>

      <section className="card editor">
        <h2>Hot news</h2>
        <textarea
          className="textarea"
          aria-label="Hot news text"
          maxLength={300}
          value={news}
          onChange={(e) => setNews(e.target.value)}
        />
        <span className="meta">
          {postedAt ? `Posted ${timeAgo(postedAt)}` : "Nothing posted yet"}
        </span>
        <button className="btn" onClick={postNews} disabled={posting || !news.trim()}>
          {posting ? "Posting..." : "Post update"}
        </button>
      </section>

      <section className="counts" aria-label="Totals">
        <div className="count">
          <b>{counts.pending}</b>
          <span>Pending</span>
        </div>
        <div className="count">
          <b>{counts.done}</b>
          <span>Done</span>
        </div>
        <div className="count">
          <b>{counts.cant_fix}</b>
          <span>Can't fix</span>
        </div>
      </section>

      <div className="chips" role="group" aria-label="Filters">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            className={`chip ${filter === value ? "active" : ""}`}
            aria-pressed={filter === value}
            onClick={() => setFilter(filter === value ? null : value)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="hint error">{error}</p>}

      {loading ? (
        <p className="empty">Loading...</p>
      ) : items.length === 0 ? (
        <p className="empty">{archived ? "No archived requests" : "No requests found"}</p>
      ) : (
        <>
          <section className="list">
            {items.map((request) => (
              <AdminRequestCard
                key={request._id}
                request={request}
                onUpdate={onUpdate}
                onNotify={notify}
                onError={handleError}
              />
            ))}
          </section>
          {hasMore && (
            <button className="btn outline" onClick={loadMore}>
              Load more
            </button>
          )}
        </>
      )}

      <div className={`toast ${toast ? "show" : ""}`} role="status">
        {toast}
      </div>
    </main>
  );
}