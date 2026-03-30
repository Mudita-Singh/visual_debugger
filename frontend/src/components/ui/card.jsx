export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-gray-700 bg-gray-800 shadow-md ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
