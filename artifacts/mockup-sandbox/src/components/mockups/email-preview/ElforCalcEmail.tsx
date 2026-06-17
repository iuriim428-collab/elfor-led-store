export function ElforCalcEmail() {
  const requestId = 42;
  const name = "Александр";
  const phone = "+7 (903) 123-45-67";
  const productName = "L4AE34 — Встраиваемый светильник 36 Вт";
  const now = "17.06.2026, 14:30";

  return (
    <div className="min-h-screen bg-[#E8E5DE] flex items-start justify-center py-10 px-4">
      {/* Email client chrome */}
      <div className="w-full max-w-[620px]">
        {/* Fake subject bar */}
        <div className="bg-white border border-[#D5D0C5] border-b-0 px-5 py-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#999] uppercase tracking-wider w-16 shrink-0">Кому:</span>
            <span className="text-[13px] text-[#2B2D2B]">aleksandr@company.ru</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#999] uppercase tracking-wider w-16 shrink-0">Тема:</span>
            <span className="text-[13px] font-semibold text-[#2B2D2B]">Расчёт освещения №{requestId} — ЭЛФОР</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#999] uppercase tracking-wider w-16 shrink-0">Дата:</span>
            <span className="text-[13px] text-[#888]">{now} МСК</span>
          </div>
        </div>

        {/* Email body */}
        <div className="bg-white border border-[#D5D0C5]">
          {/* Header */}
          <div className="bg-[#2B2D2B] px-7 py-5 flex items-center justify-between">
            <span className="text-[#E8500B] text-[22px] font-black tracking-[3px] uppercase">ЭЛФОР</span>
            <span className="text-[#888] text-[11px] tracking-wider uppercase">Расчёт освещения</span>
          </div>

          {/* Body */}
          <div className="px-7 py-7">
            <h2 className="text-[#2B2D2B] text-[17px] font-bold uppercase tracking-wide mb-4">
              Ваш расчёт готов
            </h2>
            <p className="text-[#555] text-[14px] mb-2">
              Здравствуйте, <strong>{name}</strong>!
            </p>
            <p className="text-[#555] text-[14px] mb-6">
              Мы подготовили расчёт освещения для вашего объекта. Файл расчёта прикреплён к этому письму.
            </p>

            {/* Details table */}
            <div className="border border-[#E8E2D9] mb-6">
              <div className="flex border-b border-[#E8E2D9]">
                <div className="w-36 shrink-0 bg-[#F8F5F0] px-4 py-3 text-[11px] font-bold text-[#999] uppercase tracking-wider">
                  Светильник
                </div>
                <div className="px-4 py-3 text-[13px] text-[#2B2D2B]">{productName}</div>
              </div>
              <div className="flex border-b border-[#E8E2D9]">
                <div className="w-36 shrink-0 bg-[#F8F5F0] px-4 py-3 text-[11px] font-bold text-[#999] uppercase tracking-wider">
                  Заявка №
                </div>
                <div className="px-4 py-3 text-[13px] text-[#2B2D2B] font-mono">{requestId}</div>
              </div>
              <div className="flex">
                <div className="w-36 shrink-0 bg-[#F8F5F0] px-4 py-3 text-[11px] font-bold text-[#999] uppercase tracking-wider">
                  Дата
                </div>
                <div className="px-4 py-3 text-[13px] text-[#2B2D2B] font-mono">{now} МСК</div>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-[#FFF8F5] border border-[#F0C4B0] px-5 py-4 mb-6">
              <p className="text-[13px] text-[#555] leading-relaxed">
                Расчёт включает количество светильников, схему расстановки и итоговую мощность.
                По вопросам обращайтесь к нашим менеджерам.
              </p>
            </div>

            {/* Attachment pill */}
            <div className="flex items-center gap-3 bg-[#F4F1EA] border border-[#D5D0C5] px-4 py-3 mb-6">
              <div className="w-9 h-9 bg-[#2B2D2B] flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8500B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#2B2D2B]">Расчёт_освещения_№{requestId}.pdf</span>
                <span className="text-[11px] text-[#888]">Вложение · PDF файл</span>
              </div>
            </div>

            {/* Contact */}
            <p className="text-[13px] text-[#777]">
              Телефон:{" "}
              <span className="text-[#E8500B] font-semibold">{phone}</span>
              {" "}·{" "}
              <span className="text-[#E8500B]">info@lfour.ru</span>
            </p>
          </div>

          {/* Footer */}
          <div className="bg-[#F4F1EA] border-t border-[#D5D0C5] px-7 py-4 flex items-center justify-between">
            <span className="text-[11px] text-[#999]">© ЭЛФОР — промышленные LED светильники</span>
            <span className="text-[11px] text-[#E8500B]">lfour.ru</span>
          </div>
        </div>
      </div>
    </div>
  );
}
