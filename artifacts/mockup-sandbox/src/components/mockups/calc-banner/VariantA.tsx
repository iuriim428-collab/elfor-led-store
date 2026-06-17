export function VariantA() {
  return (
    <div style={{ background: "#F4F1EA", minHeight: "100vh", display: "flex", alignItems: "center", padding: "40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", width: "100%" }}>

        {/* Full-width dark banner */}
        <div style={{
          background: "#2B2D2B",
          borderLeft: "4px solid #E8500B",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 48,
          padding: "40px 56px",
          flexWrap: "wrap",
        }}>
          {/* Left: text */}
          <div style={{ flex: "1 1 340px" }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.15em", color: "#E8500B", textTransform: "uppercase", marginBottom: 12 }}>
              Бесплатная услуга
            </div>
            <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 34, color: "#fff", textTransform: "uppercase", lineHeight: 1.1, margin: "0 0 12px" }}>
              Сделаем бесплатный<br />расчёт освещения
            </h2>
            <p style={{ fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: 0, maxWidth: 420 }}>
              Подберём светильники под ваш объект, рассчитаем количество и мощность. Результат — за 1 рабочий день.
            </p>
          </div>

          {/* Right: form */}
          <div style={{ display: "flex", gap: 12, flex: "0 0 auto", alignItems: "stretch", flexWrap: "wrap" }}>
            <input
              placeholder="+7 (___) ___-__-__"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontFamily: "monospace",
                fontSize: 14,
                padding: "14px 20px",
                outline: "none",
                width: 220,
              }}
            />
            <button style={{
              background: "#E8500B",
              border: "none",
              color: "#fff",
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "14px 28px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}>
              Получить расчёт →
            </button>
          </div>
        </div>

        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#999", marginTop: 12, paddingLeft: 4 }}>
          Расположение: между «Популярные модели» и «Новости» на главной странице
        </div>
      </div>
    </div>
  );
}
