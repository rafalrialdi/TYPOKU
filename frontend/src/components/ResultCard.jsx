import './components.css';

export default function ResultCard({ title = "Hasil Pemeriksaan", resultText }) {
  if (!resultText) return null;

  return (
    <div className="result-card">
      <div className="result-header">
        <h3 className="result-title">{title}</h3>
        <span className="result-badge">Selesai</span>
      </div>
      <div className="result-body">
        {resultText}
      </div>
      <div className="result-footer">
        <button className="btn-copy">Salin Teks</button>
      </div>
    </div>
  );
}import './components.css';

export default function ResultCard({ title = "Hasil Pemeriksaan", resultText }) {
  if (!resultText) return null;

  return (
    <div className="result-card">
      <div className="result-header">
        <h3 className="result-title">{title}</h3>
        <span className="result-badge">Selesai</span>
      </div>
      <div className="result-body">
        {resultText}
      </div>
      <div className="result-footer">
        <button className="btn-copy">Salin Teks</button>
      </div>
    </div>
  );
}