export default function Layout({ title, subtitle, children }) {
  return (
    <main className="wrap">
      <header className="card brandHeaderWrap">
        <div className="brandRow" style={{ position: 'relative' }}>
          <img
            className="brandOverlayLogo"
            src="/assets/smooy-overlay.png"
            alt=""
            aria-hidden="true"
          />
          <div style={{ minWidth: 0 }}>
            <div className="title">{title}</div>
            <p className="subtitle">{subtitle}</p>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
