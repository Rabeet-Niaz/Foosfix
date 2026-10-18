import { useState } from "react";
import { api } from "../api/api.js";
import Icon from "./Icon.jsx";
import RequestCard from "./RequestCard.jsx";

const STATUSES = [
  ["pending", "Pending"],
  ["done", "Done"],
  ["cant_fix", "Can't fix"],
];

export default function AdminRequestCard({ request, onUpdate, onNotify, onError }) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  // Runs one admin action, then reports the result to the dashboard
  async function run(action, message) {
    setBusy(true);
    try {
      const updated = await action();
      onUpdate(updated);
      onNotify(message);
      return true;
    } catch (err) {
      onError(err);
      return false;
    } finally {
      setBusy(false);
    }
  }

  function setStatus(status) {
    if (status === request.status) return;
    run(() => api.adminSetStatus(request._id, status), "Status saved");
  }

  async function sendComment(e) {
    e.preventDefault();
    const text = comment.trim();
    if (!text) return;
    const ok = await run(() => api.adminAddComment(request._id, text), "Comment added");
    if (ok) setComment("");
  }

  function toggleArchive() {
    if (
      !request.archived &&
      !window.confirm("Archive this request? It will be hidden from the public.")
    ) {
      return;
    }
    run(
      () => api.adminArchive(request._id, !request.archived),
      request.archived ? "Request restored" : "Request archived"
    );
  }

  return (
    <RequestCard request={request} showRoll>
      <div className="seg" role="group" aria-label="Status">
        {STATUSES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={request.status === value ? "on" : ""}
            disabled={busy}
            onClick={() => setStatus(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="say" onSubmit={sendComment}>
        <input
          className="input"
          placeholder="Add a comment"
          aria-label="Comment"
          maxLength={500}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button className="send" aria-label="Send comment" disabled={busy || !comment.trim()}>
          <Icon name="send" />
        </button>
      </form>

      <div className="row-actions">
        <button
          type="button"
          className={`link-btn ${request.archived ? "" : "danger"}`}
          disabled={busy}
          onClick={toggleArchive}
        >
          {request.archived ? "Restore" : "Archive"}
        </button>
      </div>
    </RequestCard>
  );
}