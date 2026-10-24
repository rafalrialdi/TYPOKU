import './components.css';

export default function InputForm({ inputText, setInputText, onSubmit, isLoading, buttonText = "Proses Teks" }) {
  return (
    <form onSubmit={onSubmit} className="input-form">
      <textarea 
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Ketik atau tempel teks Anda di sini..." 
        rows="8"
        className="input-textarea"
        required
      />
      <div className="input-action">
        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-submit"
        >
          {isLoading ? 'Memproses...' : buttonText}
        </button>
      </div>
    </form>
  );
}