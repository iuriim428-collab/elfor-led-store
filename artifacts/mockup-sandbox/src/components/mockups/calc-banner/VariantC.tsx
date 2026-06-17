export function VariantC() {
  return (
    <div style={{ background: "#F4F1EA", minHeight: "100vh", display: "flex", alignItems: "center", padding: "40px 0" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 32px", width: "100%" }}>

        {/* Product detail page context */}
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#999", marginBottom: 20 }}>
          ↑ Кнопка «В корзину» и цена выше
        </div>

        {/* The calc block */}
        <div style={{
          background: "#2B2D2B",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 0,
          border: "1px solid #3a3c3a",
        }}>
          {/* Left panel */}
          <div style={{ padding: "32px 40px", borderRight: "1px solid #3a3c3a" }}>
            <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.15em", color: "#E8500B", textTransform: "uppercase", marginBottom: 10 }}>
              Услуга бесплатно
            </div>
            <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 900, fontSize: 22, color: "#fff", textTransform: "uppercase", lineHeight: 1.15, margin: "0 0 14px" }}>
              Сделаем расчёт<br />освещения для<br />вашего объекта
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Количество светильников", "Схема расстановки", "Итоговая мощность"].map((item) => (
                <li key={item} style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.55)", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: "#E8500B" }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right panel: form */}
          <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>
              Оставьте контакт — перезвоним
            </div>
            <input
              placeholder="Ваше имя"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                fontFamily: "monospace",
                fontSize: 13,
                padding: "12px 16px",
                outline: "none",
              }}
            />
            <input
              placeholder="+7 (___) ___-__-__"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                fontFamily: "monospace",
                fontSize: 13,
                padding: "12px 16px",
                outline: "none",
              }}
            />
            <button style={{
              background: "#E8500B",
              border: "none",
              color: "#fff",
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "14px 20px",
              cursor: "pointer",
              marginTop: 4,
            }}>
              Получить расчёт →
            </button>
          </div>
        </div>

        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#999", marginTop: 12, paddingLeft: 4 }}>
          Расположение: на странице каждого товара, под кнопкой «В корзину»
        </div>
      </div>
    </div>
  );
}
