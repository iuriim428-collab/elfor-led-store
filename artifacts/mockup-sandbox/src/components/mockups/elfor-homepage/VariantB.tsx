import React from "react";
import "./_groupB.css";

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Manrope:wght@400;500;600&family=Unbounded:wght@700;900&display=swap');
`;

const VariantB = () => {
  return (
    <div 
      className="min-h-screen bg-[#111111] text-[#F4F1EA] overflow-x-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <style>{fonts}</style>

      {/* 1. Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#111111]/90 backdrop-blur-md border-b brutal-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H32V32H0V0Z" fill="#E8500B"/>
            <path d="M8 8H24V12H12V14H20V18H12V24H8V8Z" fill="#111111"/>
          </svg>
          <span className="font-bold tracking-widest text-lg" style={{ fontFamily: "'Unbounded', sans-serif" }}>ELFOR</span>
        </div>
        <nav className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-[#F4F1EA]/70">
          <a href="#catalog" className="hover:text-[#E8500B] transition-colors">Каталог</a>
          <a href="#about" className="hover:text-[#E8500B] transition-colors">О нас</a>
          <a href="#production" className="hover:text-[#E8500B] transition-colors">Производство</a>
          <a href="#contacts" className="hover:text-[#E8500B] transition-colors">Контакты</a>
        </nav>
        <div className="flex items-center gap-6">
          <a href="tel:+78000000000" className="hidden md:block text-sm font-medium hover:text-[#E8500B] transition-colors" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            8 (800) 555-35-35
          </a>
          <button className="bg-[#E8500B] text-[#F4F1EA] px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-[#c24209] transition-colors">
            Получить КП
          </button>
        </div>
      </header>

      {/* 2. Hero */}
      <section className="relative min-h-[100svh] flex flex-col justify-center pt-24 pb-12 px-6 lg:px-12 bg-[#111111] bg-pattern-plus">
        <div className="max-w-7xl mx-auto w-full relative z-10 mt-12">
          <h1 
            className="leading-[0.9] uppercase" 
            style={{ 
              fontFamily: "'Unbounded', sans-serif", 
              fontWeight: 900,
              fontSize: "clamp(50px, 9vw, 140px)"
            }}
          >
            <div className="block">Промышленные</div>
            <div className="block text-[#E8500B] italic pr-4">LED-светильники</div>
            <div className="block">От производителя</div>
          </h1>
          
          <div className="mt-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div className="flex gap-4">
              <button className="bg-[#E8500B] text-[#F4F1EA] px-8 py-4 text-sm uppercase tracking-widest font-bold hover:bg-[#c24209] transition-colors brutal-border border-[#E8500B]">
                Перейти в каталог
              </button>
              <button className="bg-transparent text-[#F4F1EA] px-8 py-4 text-sm uppercase tracking-widest font-bold hover:bg-[#1A1A1A] transition-colors brutal-border">
                О компании
              </button>
            </div>
            
            <div className="text-right flex flex-col items-end gap-2 text-[#F4F1EA]/60 text-sm md:text-base" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <div>[ 15 ЛЕТ НА РЫНКЕ ]</div>
              <div>[ ДО 200 ЛМ·ВТ ]</div>
              <div>[ 5 ЛЕТ ГАРАНТИИ ]</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Ticker */}
      <div className="bg-[#E8500B] text-[#F4F1EA] py-4 overflow-hidden flex items-center border-y border-[#F4F1EA]/20">
        <div className="animate-ticker-b text-xl font-medium tracking-widest uppercase flex gap-8" style={{ fontFamily: "'Unbounded', sans-serif" }}>
          {Array(4).fill("СОБСТВЕННОЕ ПРОИЗВОДСТВО • ГОСТ • ГАРАНТИЯ 5 ЛЕТ • ДОСТАВКА ПО ВСЕЙ РОССИИ • 200 ЛМ/ВТ • ").map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
      </div>

      {/* 4. Categories */}
      <section id="catalog" className="relative py-32 px-6 lg:px-12 bg-[#111111] overflow-hidden">
        <div 
          className="absolute -top-20 -left-10 text-[30vw] font-bold text-white/[0.02] pointer-events-none select-none leading-none z-0"
          style={{ fontFamily: "'Unbounded', sans-serif" }}
        >
          01
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-end mb-16 brutal-border-b border-white/20 pb-8">
            <h2 className="text-4xl md:text-6xl uppercase" style={{ fontFamily: "'Unbounded', sans-serif" }}>
              Каталог
            </h2>
            <div className="text-[#E8500B] text-lg" style={{ fontFamily: "'JetBrains Mono', monospace" }}>[01]</div>
          </div>

          <div className="flex flex-col">
            {[
              "Уличное освещение",
              "Парковое освещение",
              "Промышленные купольные (UFO)",
              "Промышленные линейные",
              "Магистральные светильники",
              "Взрывозащищенные",
              "Архитектурное освещение",
              "Светодиодная лента и профиль"
            ].map((cat, i) => (
              <a 
                key={i} 
                href="#"
                className="group flex flex-col md:flex-row md:items-center justify-between py-8 md:py-10 brutal-border-b hover:bg-[#1A1A1A] transition-colors -mx-6 px-6 lg:-mx-12 lg:px-12"
              >
                <div className="flex items-baseline gap-6 md:gap-12">
                  <span className="text-[#E8500B] text-xl md:text-2xl opacity-70" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    0{i + 1}
                  </span>
                  <span className="text-2xl md:text-4xl lg:text-5xl uppercase group-hover:text-[#E8500B] transition-colors" style={{ fontFamily: "'Unbounded', sans-serif" }}>
                    {cat}
                  </span>
                </div>
                <div className="mt-4 md:mt-0 text-[#F4F1EA]/40 group-hover:text-[#E8500B] transition-colors text-4xl">
                  →
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Popular Models */}
      <section className="py-24 px-6 lg:px-12 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16 brutal-border-b border-white/20 pb-8">
            <h2 className="text-4xl md:text-6xl uppercase" style={{ fontFamily: "'Unbounded', sans-serif" }}>
              Популярные модели
            </h2>
            <div className="text-[#E8500B] text-lg" style={{ fontFamily: "'JetBrains Mono', monospace" }}>[02]</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-[#111111] brutal-border flex flex-col relative group overflow-hidden">
                <div className="absolute top-4 right-4 text-xs text-[#F4F1EA]/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  SKU: LF-PRO-10{item}
                </div>
                
                <div className="h-64 bg-[#1A1A1A] m-4 flex justify-center items-center group-hover:bg-[#222] transition-colors">
                   {/* Placeholder for real image, using CSS shapes for mockup */}
                   <div className="w-32 h-32 border-4 border-[#333] rounded-full flex items-center justify-center">
                     <div className="w-16 h-16 bg-[#F4F1EA]/10 blur-xl rounded-full"></div>
                   </div>
                </div>
                
                <div className="p-6 pt-2 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl mb-4" style={{ fontFamily: "'Unbounded', sans-serif" }}>ELFOR MAX PRO {item}</h3>
                    <div className="flex gap-4 text-sm text-[#F4F1EA]/60 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <span>150 Вт</span>
                      <span>•</span>
                      <span>22 500 лм</span>
                      <span>•</span>
                      <span>IP67</span>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between mt-auto pt-6 border-t brutal-border">
                    <div className="text-2xl text-[#E8500B]" style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                      14 500 ₽
                    </div>
                    <button className="w-12 h-12 flex items-center justify-center bg-[#F4F1EA]/10 hover:bg-[#E8500B] transition-colors text-xl">
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Production */}
      <section id="production" className="py-0 flex flex-col md:flex-row bg-[#111111] brutal-border-y">
        <div className="md:w-1/2 p-12 lg:p-24 flex flex-col justify-center border-b md:border-b-0 md:border-r brutal-border">
          <div className="text-[#E8500B] text-lg mb-12" style={{ fontFamily: "'JetBrains Mono', monospace" }}>[03] О ПРОИЗВОДСТВЕ</div>
          <h2 className="text-3xl lg:text-5xl uppercase leading-tight mb-8" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Надежный свет для <br/>суровых условий
          </h2>
          <p className="text-[#F4F1EA]/70 text-lg max-w-md leading-relaxed">
            Мы не просто собираем светильники, мы разрабатываем решения под конкретные задачи промышленности. Собственная линия SMD-монтажа, строгий контроль качества на каждом этапе и комплектующие проверенных брендов.
          </p>
        </div>
        <div className="md:w-1/2 flex flex-col bg-[#1A1A1A]">
          {[
            { num: "15", text: "ЛЕТ НА РЫНКЕ" },
            { num: "200", text: "ЛМ·ВТ ЭФФЕКТИВНОСТЬ" },
            { num: "5", text: "ЛЕТ ГАРАНТИИ" }
          ].map((stat, i) => (
            <div key={i} className="flex-1 p-12 lg:p-16 border-b brutal-border last:border-0 flex items-center gap-8 hover:bg-[#111] transition-colors">
              <div className="text-[#E8500B] text-6xl lg:text-8xl" style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 900 }}>
                {stat.num}
              </div>
              <div className="text-xl lg:text-2xl text-[#F4F1EA]/60 uppercase" style={{ fontFamily: "'Unbounded', sans-serif" }}>
                / {stat.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Cases */}
      <section className="py-24 px-6 lg:px-12 bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16 brutal-border-b border-white/20 pb-8">
            <h2 className="text-4xl md:text-6xl uppercase" style={{ fontFamily: "'Unbounded', sans-serif" }}>
              Кейсы
            </h2>
            <div className="text-[#E8500B] text-lg" style={{ fontFamily: "'JetBrains Mono', monospace" }}>[04]</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
            {[
              { date: "24.10.2023", title: "Модернизация цеха машиностроительного завода", desc: "Замена устаревших ламп ДРЛ на LED-светильники серии PRO. Снижение энергопотребления на 65%." },
              { date: "12.08.2023", title: "Освещение логистического комплекса А-класса", desc: "Установка магистральных светильников с узкой оптикой для высоких стеллажей. Освещенность 300 люкс на уровне пола." },
              { date: "05.04.2023", title: "Архитектурная подсветка моста", desc: "Реализация сложного проекта с использованием RGBW-прожекторов и системы управления DMX." }
            ].map((article, i) => (
              <article key={i} className="flex flex-col border-t brutal-border pt-6 group">
                <time className="text-[#E8500B] mb-6 inline-block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {article.date}
                </time>
                <h3 className="text-2xl mb-4 group-hover:text-[#E8500B] transition-colors leading-snug" style={{ fontFamily: "'Unbounded', sans-serif" }}>
                  {article.title}
                </h3>
                <p className="text-[#F4F1EA]/60 text-sm leading-relaxed">
                  {article.desc}
                </p>
                <a href="#" className="mt-8 uppercase text-xs tracking-widest font-bold border-b border-[#F4F1EA]/30 pb-1 self-start hover:border-[#E8500B] hover:text-[#E8500B] transition-colors">
                  Читать кейс
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Contact */}
      <section id="contacts" className="py-32 px-6 lg:px-12 bg-[#E8500B] text-[#111111]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl uppercase mb-12" style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 900 }}>
            Работаем с <br/>промышленными <br/>предприятиями
          </h2>
          <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <input 
              type="text" 
              placeholder="ВАШ ТЕЛЕФОН" 
              className="flex-grow bg-[#111111] text-[#F4F1EA] px-6 py-4 outline-none placeholder:text-[#F4F1EA]/30 font-bold tracking-widest uppercase text-sm"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
            <button 
              type="button"
              className="bg-[#111111] text-[#F4F1EA] px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-[#222] transition-colors border-2 border-[#111] hover:border-[#F4F1EA]"
            >
              ОБСУДИТЬ ПРОЕКТ
            </button>
          </form>
          <p className="mt-6 text-xs text-[#111111]/70 font-medium">
            Оставляя заявку, вы соглашаетесь с политикой конфиденциальности.
          </p>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-[#111111] text-[#F4F1EA] pt-20 pb-10 px-6 lg:px-12 brutal-border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0H32V32H0V0Z" fill="#E8500B"/>
                <path d="M8 8H24V12H12V14H20V18H12V24H8V8Z" fill="#111111"/>
              </svg>
              <span className="font-bold tracking-widest text-2xl" style={{ fontFamily: "'Unbounded', sans-serif" }}>ELFOR</span>
            </div>
            <p className="text-[#F4F1EA]/50 text-sm max-w-xs">
              Производство промышленных LED-светильников в России.
            </p>
          </div>
          
          <div className="flex gap-16 text-sm">
            <div className="flex flex-col gap-4">
              <div className="text-[#E8500B] mb-2 font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>[ НАВИГАЦИЯ ]</div>
              <a href="#" className="hover:text-[#E8500B] transition-colors">Каталог</a>
              <a href="#" className="hover:text-[#E8500B] transition-colors">О компании</a>
              <a href="#" className="hover:text-[#E8500B] transition-colors">Доставка и оплата</a>
              <a href="#" className="hover:text-[#E8500B] transition-colors">Контакты</a>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-[#E8500B] mb-2 font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>[ КОНТАКТЫ ]</div>
              <a href="tel:+78000000000" className="hover:text-[#E8500B] transition-colors">8 (800) 555-35-35</a>
              <a href="mailto:info@lfour.ru" className="hover:text-[#E8500B] transition-colors">info@lfour.ru</a>
              <span className="text-[#F4F1EA]/50">Москва, Промзона, 12</span>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t brutal-border text-xs text-[#F4F1EA]/30 font-medium">
          <span>© 2024 ELFOR. Все права защищены.</span>
          <a href="#" className="hover:text-[#F4F1EA] transition-colors mt-4 md:mt-0">Политика конфиденциальности</a>
        </div>
      </footer>
    </div>
  );
};

export default VariantB;
