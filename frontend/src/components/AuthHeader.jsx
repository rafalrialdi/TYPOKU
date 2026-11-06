export default function AuthHeader({ title, subtitle, titleId }) {
  return (
    <header className="auth-header">
      <div className="auth-badge" aria-hidden="true">
        <span>T</span>
      </div>
      <h1 className="auth-title" id={titleId}>{title}</h1>
      {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
    </header>
  );
}
