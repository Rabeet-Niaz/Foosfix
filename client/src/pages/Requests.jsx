import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";
import Icon from "../components/Icon.jsx";
import RequestCard from "../components/RequestCard.jsx";

const STATUS_FILTERS = [
  ["pending", "Pending"],
  ["done", "Done"],
  ["cant_fix", "Can't fix"],
];

export default function Requests() {
  const [status, setStatus] = useState(null); // one status at a time, or none
  const [lastMonth, setLastMonth] = useState(false);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs on first open and every time a filter changes
  useEffect(() => {
    let ignore = false; // drops an old answer if the filter changed again meanwhile
    setLoading(true);
    setError("");

    api
      .getRequests({ status, lastMonth, page: 1 })
      .then((data) => {
        if (ignore) return;
        setItems(data.items);
        setPage(1);
        setHasMore(data.hasMore);
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [status, lastMonth]);

  async function loadMore() {
    try {
      const data = await api.getRequests({ status, lastMonth, page: page + 1 });
      setItems((prev) => [...prev, ...data.items]);
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    }
  }

  function clearFilters() {
    setStatus(null);
    setLastMonth(false);
  }

  const filtersOn = status !== null || lastMonth;

  return (
    <main className="app">
      <header className="topbar">
        <Link className="back" to="/" aria-label="Back">
          <Icon name="back" />
        </Link>
        <h1 className="title">All requests</h1>
      </header>

      <div className="chips" role="group" aria-label="Filters">
        {STATUS_FILTERS.map(([value, label]) => (
          <button
            key={value}
            className={`chip ${status === value ? "active" : ""}`}
            aria-pressed={status === value}
            onClick={() => setStatus(status === value ? null : value)}
          >
            {label}
          </button>
        ))}
        <button
          className={`chip ${lastMonth ? "active" : ""}`}
          aria-pressed={lastMonth}
          onClick={() => setLastMonth(!lastMonth)}
        >
          Last month
        </button>
      </div>

      {error && <p className="hint error">{error}</p>}

      {loading ? (
        <p className="empty">Loading...</p>
      ) : items.length === 0 ? (
        <div className="empty">
          {filtersOn ? "No requests found" : "No requests yet"}
          {filtersOn && (
            <button className="link-btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <section className="list">
            {items.map((request) => (
              <RequestCard key={request._id} request={request} />
            ))}
          </section>
          {hasMore && (
            <button className="btn outline" onClick={loadMore}>
              Load more
            </button>
          )}
        </>
      )}
    </main>
  );
}