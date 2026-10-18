import { formatDateTime } from "../utils/format.js";

const STATUS = {
  pending: { label: "Pending", cls: "pending" },
  done: { label: "Done", cls: "done" },
  cant_fix: { label: "Can't fix", cls: "cant" },
};

export default function RequestCard({ request, showRoll = false, children }) {
  const status = STATUS[request.status];

  return (
    <article className="card">
      <div className="card-head">
        <span className="rid">{request.requestId}</span>
        <span className={`badge ${status.cls}`}>{status.label}</span>
      </div>

      <div className="meta">
        {formatDateTime(request.createdAt)} &middot; {request.table?.name}
        {showRoll && <> &middot; {request.rollNo || "No roll number"}</>}
      </div>

      <p className="desc">{request.description}</p>

      {request.photos.length > 0 && (
        <div className="photos">
          {request.photos.map((photo) => (
            <div className="photo" key={photo.url}>
              <a href={photo.url} target="_blank" rel="noreferrer">
                <img src={photo.url} alt="Photo attached to this request" loading="lazy" />
              </a>
            </div>
          ))}
        </div>
      )}

      {request.comments.map((comment) => (
        <div className="ac" key={comment._id}>
          <b>Admin</b>
          <p>{comment.text}</p>
          <small>{formatDateTime(comment.createdAt)}</small>
        </div>
      ))}

      {children}
    </article>
  );
}