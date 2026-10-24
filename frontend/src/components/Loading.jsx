import './components.css';

export default function Loading({ message = "AI sedang menganalisis teks Anda..." }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
}