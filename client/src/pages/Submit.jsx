import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { api } from "../api/api.js";
import Icon from "../components/Icon.jsx";

const ROLL = /^[A-Z]{4}\d{2}[A-Z]\d{3}$/; // like BITF25A001
const MAX_DESC = 500;
const MAX_PHOTOS = 3;

export default function Submit() {
  const [params] = useSearchParams();
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState(params.get("table") ?? ""); // QR code can preselect
  const [rollNo, setRollNo] = useState("");
  const [rollTouched, setRollTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]); // each: { file, preview }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState(null);

  useEffect(() => {
    api
      .getTables()
      .then(setTables)
      .catch(() => setError("Could not load the tables. Please refresh."));
  }, []);

  const rollBad = rollNo !== "" && !ROLL.test(rollNo);
  const showRollError = rollBad && (rollNo.length >= 10 || rollTouched);
  const canSubmit = tableId && description.trim() && !rollBad && !busy;

  async function addPhotos(e) {
    const picked = [...e.target.files];
    e.target.value = ""; // lets the same photo be picked again later
    const room = MAX_PHOTOS - photos.length;

    setBusy(true);
    setError("");
    try {
      // Shrink each photo to about 1 MB right here on the phone
      const compressed = await Promise.all(
        picked.slice(0, room).map((file) =>
          imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true })
        )
      );
      setPhotos((prev) => [
        ...prev,
        ...compressed.map((file) => ({ file, preview: URL.createObjectURL(file) })),
      ]);
    } catch {
      setError("Could not read that photo. Please try another one.");
    } finally {
      setBusy(false);
    }
  }

  function removePhoto(index) {
    URL.revokeObjectURL(photos[index].preview);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    const form = new FormData();
    form.append("tableId", tableId);
    form.append("description", description.trim());
    if (rollNo) form.append("rollNo", rollNo);
    photos.forEach((p) => form.append("photos", p.file, p.file.name));

    setBusy(true);
    setError("");
    try {
      const result = await api.submitRequest(form);
      setDoneId(result.requestId);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (doneId) {
    return (
      <main className="app">
        <section className="success">
          <div className="check">
            <Icon name="check" />
          </div>
          <h2>Request submitted</h2>
          <span className="id-pill">{doneId}</span>
          <p>Thanks for reporting. You can follow its status on the requests page.</p>
          <div className="stack">
            <Link className="btn" to="/requests">
              View all requests
            </Link>
            <a className="btn outline" href="/submit">
              Submit another
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <Link className="back" to="/" aria-label="Back">
          <Icon name="back" />
        </Link>
        <h1 className="title">Submit request</h1>
      </header>

      <form className="form" onSubmit={onSubmit} noValidate>
        <p className="intro">
          Check <Link to="/requests">View all requests</Link> first. Your issue may already be
          reported.
        </p>

        <div className="field">
          <label htmlFor="roll">
            Roll number <span className="opt">(optional)</span>
          </label>
          <input
            id="roll"
            className={`input ${showRollError ? "invalid" : ""}`}
            placeholder="BITF25A001"
            autoComplete="off"
            maxLength={10}
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value.toUpperCase().trim())}
            onBlur={() => setRollTouched(true)}
          />
          {showRollError ? (
            <span className="hint error">Format: BITF25A001</span>
          ) : (
            <span className="hint">Private. Only the admin can see it.</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="table">Table</label>
          <select
            id="table"
            className="select"
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
          >
            <option value="" disabled>
              Select a table
            </option>
            {tables.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="desc">Issue description</label>
          <textarea
            id="desc"
            className="textarea"
            placeholder="What is wrong with the table?"
            maxLength={MAX_DESC}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <span className="counter">
            {description.length}/{MAX_DESC}
          </span>
        </div>

        <div className="field">
          <label htmlFor="file">
            Photos <span className="opt">(optional, up to {MAX_PHOTOS})</span>
          </label>
          <div className="thumbs">
            {photos.map((p, i) => (
              <div className="thumb" key={p.preview}>
                <img src={p.preview} alt="Selected photo" />
                <button type="button" aria-label="Remove photo" onClick={() => removePhoto(i)}>
                  <Icon name="x" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="add" htmlFor="file" aria-label="Add photo">
                <Icon name="plus" />
              </label>
            )}
          </div>
          <input
            id="file"
            className="sr"
            type="file"
            accept="image/*"
            multiple
            onChange={addPhotos}
          />
          <div className="banner">
            <Icon name="eye" />
            PHOTOS ARE PUBLIC
          </div>
          <span className="hint">Photos are compressed to about 1 MB automatically.</span>
        </div>

        {error && <span className="hint error">{error}</span>}

        <button className="btn" type="submit" disabled={!canSubmit}>
          {busy ? "Please wait..." : "Submit request"}
        </button>
      </form>
    </main>
  );
}