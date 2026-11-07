export default function Skeleton({ className = '', style }) {
  return (
    <span
      className={`skeleton${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden="true"
    />
  );
}
