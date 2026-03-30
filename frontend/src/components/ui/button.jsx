export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
