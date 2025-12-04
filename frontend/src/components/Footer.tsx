export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Built with 💚 • All Premium Features Free Forever
        </p>
      </div>
    </footer>
  );
}
