export function VariantB() {
  return (
    <div style={{ background: "#F4F1EA", minHeight: "100vh", display: "flex", alignItems: "center", padding: "40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", width: "100%" }}>

        {/* Compact top-of-catalog strip */}
        <div style={{
          background: "#fff",
          border: "1px solid #e0ddd6",
          borderTop: "3px solid #E8500B",
          display: "flex",
          alignItems: "center",
          gap: 32,
          padding: "20px 32px",
          flexWrap: "wrap",
        }}>
          {/* Icon */}
          <div style={{
            width: 44, height: 44, background: "#E8500B",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3M13 3h8m0 0v8m0-8L11 13"/>
            </svg>
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <span style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 15, textTransform: "uppercase", color: "#2B2D2B" }}>
              Бесплатный расчёт освещения
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#777", marginLeft: 12 }}>
              — подберём модели под ваш объект за 1 рабочий день
            </span>
          </div>

          {/* CTA */}
          <button style={{
            background: "transparent",
            border: "2px solid #2B2D2B",
            color: "#2B2D2B",
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "10px 24px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}>
            Запросить расчёт
          </button>
        </div>

        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#999", marginTop: 12, paddingLeft: 4 }}>
          Расположение: над сеткой товаров в каталоге и страницах категорий
        </div>
      </div>
    </div>
  );
}
