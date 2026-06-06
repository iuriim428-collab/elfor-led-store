import React from 'react';
import { 
  Building2, 
  Lightbulb, 
  ShieldCheck, 
  Factory, 
  Award, 
  ArrowRight,
  Menu,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import './_group.css';

export default function VariantA() {
  return (
    <div style={{ backgroundColor: '#F4F1EA', color: '#1A1A1A', fontFamily: "'Manrope', sans-serif" }} className="min-h-screen flex flex-col overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@700;900&family=Manrope:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');
        
        .font-unbounded { font-family: 'Unbounded', sans-serif; }
        .font-jetbrains { font-family: 'JetBrains Mono', monospace; }
        
        /* Smooth scrolling */
        html { scroll-behavior: smooth; }
      `}</style>

      {/* 1. Шапка */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white z-50 border-b border-gray-200 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#E8500B] relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 80%)' }}></div>
          <span className="font-unbounded font-black text-2xl tracking-tighter text-[#1A1A1A]">ЭЛФОР</span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8 font-medium text-sm tracking-wide">
          <a href="#catalog" className="hover:text-[#E8500B] transition-colors">КАТАЛОГ</a>
          <a href="#about" className="hover:text-[#E8500B] transition-colors">О КОМПАНИИ</a>
          <a href="#production" className="hover:text-[#E8500B] transition-colors">ПРОИЗВОДСТВО</a>
          <a href="#contacts" className="hover:text-[#E8500B] transition-colors">КОНТАКТЫ</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block bg-[#E8500B] hover:bg-[#d04508] text-white px-6 py-2.5 rounded font-bold text-sm transition-colors">
            ПОЛУЧИТЬ КП
          </button>
          <button className="lg:hidden text-[#1A1A1A]">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* 2. Герой */}
      <section className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-8">
          <h1 className="font-unbounded text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-[#1A1A1A] uppercase">
            Промышленное <br/>
            <span className="text-[#E8500B]">LED-освещение</span><br/>
            от производителя
          </h1>
          
          <div className="flex flex-wrap gap-3">
            <span className="bg-white border border-gray-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <Award size={16} className="text-[#E8500B]" /> ГОСТ
            </span>
            <span className="bg-white border border-gray-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#E8500B]" /> 5 лет гарантии
            </span>
            <span className="bg-white border border-gray-300 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <Lightbulb size={16} className="text-[#E8500B]" /> 200 лм/Вт
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button className="bg-[#E8500B] hover:bg-[#d04508] text-white px-8 py-4 rounded font-bold transition-colors">
              В КАТАЛОГ
            </button>
            <button className="border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-8 py-4 rounded font-bold transition-colors">
              О КОМПАНИИ
            </button>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-8 aspect-square relative flex flex-col justify-between overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8500B] opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="text-white/60 font-jetbrains text-sm">#TECH_PREVIEW</div>
            <div className="text-white font-jetbrains text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">L4-PRO-MAX</div>
          </div>
          
          {/* Abstract LED Graphic */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
             <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="80" width="160" height="40" rx="4" fill="#333333" />
              <rect x="40" y="130" width="160" height="10" rx="2" fill="#333333" />
              <path d="M60 120 L80 130 L160 130 L180 120" stroke="#444444" strokeWidth="2" fill="none"/>
              <circle cx="60" cy="100" r="12" fill="#FDE68A" className="animate-pulse" />
              <circle cx="100" cy="100" r="12" fill="#FDE68A" className="animate-pulse" style={{animationDelay: '100ms'}} />
              <circle cx="140" cy="100" r="12" fill="#FDE68A" className="animate-pulse" style={{animationDelay: '200ms'}} />
              <circle cx="180" cy="100" r="12" fill="#FDE68A" className="animate-pulse" style={{animationDelay: '300ms'}} />
              {/* Glow effects */}
              <circle cx="60" cy="100" r="24" fill="#E8500B" opacity="0.4" filter="blur(8px)" />
              <circle cx="100" cy="100" r="24" fill="#E8500B" opacity="0.4" filter="blur(8px)" />
              <circle cx="140" cy="100" r="24" fill="#E8500B" opacity="0.4" filter="blur(8px)" />
              <circle cx="180" cy="100" r="24" fill="#E8500B" opacity="0.4" filter="blur(8px)" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
            <div>
              <div className="text-white/50 text-xs mb-1">Световой поток</div>
              <div className="text-white font-unbounded text-xl">32 000 лм</div>
            </div>
            <div>
              <div className="text-white/50 text-xs mb-1">Защита</div>
              <div className="text-white font-unbounded text-xl">IP67 / IK10</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Бегущая строка доверия */}
      <div className="bg-[#1A1A1A] py-4 overflow-hidden flex border-y-4 border-[#E8500B]/20 whitespace-nowrap relative">
        <div className="animate-marquee flex gap-8 items-center text-white/80 font-unbounded font-black tracking-widest text-lg w-max">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span>РЖД</span>
              <span className="text-[#E8500B]">·</span>
              <span>ГАЗПРОМ</span>
              <span className="text-[#E8500B]">·</span>
              <span>РОСНЕФТЬ</span>
              <span className="text-[#E8500B]">·</span>
              <span>ЛУКОЙЛ</span>
              <span className="text-[#E8500B]">·</span>
              <span>СБЕРБАНК</span>
              <span className="text-[#E8500B]">·</span>
              <span>МАГНИТ</span>
              <span className="text-[#E8500B]">·</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 4. Категории */}
      <section id="catalog" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <h2 className="font-unbounded text-3xl md:text-4xl font-black mb-12 uppercase">Каталог продукции</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Промышленные", icon: Factory, color: "bg-[#E8500B]" },
            { title: "Уличные", icon: MapPin, color: "bg-[#1A1A1A]" },
            { title: "Офисные", icon: Building2, color: "bg-[#1A1A1A]" },
            { title: "Взрывозащищенные", icon: ShieldCheck, color: "bg-[#1A1A1A]" }
          ].map((cat, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer group flex flex-col h-full">
              <div className={`${cat.color} h-2 w-full`}></div>
              <div className="p-8 flex-1 flex flex-col">
                <cat.icon size={32} className={`mb-6 ${cat.color === 'bg-[#E8500B]' ? 'text-[#E8500B]' : 'text-[#1A1A1A]'}`} />
                <h3 className="font-bold text-xl mb-6 group-hover:text-[#E8500B] transition-colors flex-1">{cat.title}</h3>
                <div className="text-sm font-bold flex items-center gap-2 text-[#1A1A1A] group-hover:text-[#E8500B] transition-colors">
                  Подробнее <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Популярные товары */}
      <section className="py-12 px-6 lg:px-12 max-w-7xl mx-auto w-full bg-[#EAE6DE] rounded-3xl mb-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-unbounded text-3xl md:text-4xl font-black uppercase">Популярное</h2>
          <button className="hidden sm:flex text-[#1A1A1A] font-bold items-center gap-2 hover:text-[#E8500B] transition-colors">
            Все товары <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col h-full group">
              <div className="bg-gray-100 aspect-square rounded-xl mb-6 relative flex items-center justify-center overflow-hidden">
                <div className="w-24 h-8 bg-gray-200 rounded"></div>
                <div className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded">ХИТ</div>
              </div>
              <div className="font-jetbrains text-xs text-gray-500 mb-2">SKU: L4-PRM-10{item}</div>
              <h4 className="font-unbounded font-bold text-lg mb-2 line-clamp-2 flex-1 group-hover:text-[#E8500B] transition-colors">
                Светильник Промышленный L4-{item}00W
              </h4>
              <div className="text-sm text-gray-600 mb-6">
                150 Вт • 22 500 лм • IP65
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <div className="font-bold text-xl">от 8 450 ₽</div>
                <button className="w-10 h-10 bg-[#F4F1EA] rounded-full flex items-center justify-center text-[#1A1A1A] group-hover:bg-[#E8500B] group-hover:text-white transition-colors">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Секция производства */}
      <section id="production" className="bg-[#1A1A1A] text-white py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-unbounded text-4xl sm:text-5xl lg:text-6xl font-black mb-8 leading-tight">
              15 ЛЕТ <br/>НА РЫНКЕ <br/><span className="text-[#E8500B]">ОСВЕЩЕНИЯ</span>
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Мы не просто собираем светильники — мы проектируем, тестируем и производим решения, которые работают в самых суровых условиях.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
            <div className="flex items-start gap-6 bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="w-16 h-16 bg-[#E8500B]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Factory className="text-[#E8500B]" size={32} />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-2">Собственный завод</h4>
                <p className="text-white/60 text-sm">Полный цикл производства от корпуса до электроники в РФ.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6 bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="w-16 h-16 bg-[#E8500B]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="text-[#E8500B]" size={32} />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-2">Инженерный отдел</h4>
                <p className="text-white/60 text-sm">Разработка кастомных решений под задачи заказчика.</p>
              </div>
            </div>

            <div className="flex items-start gap-6 bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="w-16 h-16 bg-[#E8500B]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="text-[#E8500B]" size={32} />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-2">Сертификация ГОСТ</h4>
                <p className="text-white/60 text-sm">Строгий контроль качества каждой партии. Гарантия до 7 лет.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Форма КП */}
      <section className="py-24 px-6 lg:px-12 bg-[#F4F1EA]">
        <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl p-8 lg:p-16 shadow-xl flex flex-col md:flex-row gap-12 border border-[#EAE6DE]">
          <div className="md:w-1/2 flex flex-col justify-center">
            <h2 className="font-unbounded text-3xl lg:text-4xl font-black mb-6">Получите КП за 30 минут</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Оставьте заявку, и наш инженер подготовит расчет освещенности и коммерческое предложение для вашего объекта.
            </p>
            <div className="flex items-center gap-4 text-sm font-bold bg-[#F4F1EA] p-4 rounded-xl self-start">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xl">👋</span>
              </div>
              <div>
                <div>Алексей Иванов</div>
                <div className="text-gray-500 font-normal">Главный инженер проектов</div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Компания</label>
                <input type="text" className="w-full bg-[#F4F1EA] border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#E8500B]" placeholder="ООО Индустрия" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Имя</label>
                  <input type="text" className="w-full bg-[#F4F1EA] border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#E8500B]" placeholder="Иван" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Телефон</label>
                  <input type="tel" className="w-full bg-[#F4F1EA] border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#E8500B]" placeholder="+7 (___) ___-__-__" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Email</label>
                <input type="email" className="w-full bg-[#F4F1EA] border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#E8500B]" placeholder="info@example.com" />
              </div>
              <button className="w-full bg-[#E8500B] hover:bg-[#d04508] text-white py-4 rounded-xl font-bold text-lg mt-4 transition-colors">
                ОТПРАВИТЬ ЗАЯВКУ
              </button>
              <p className="text-xs text-gray-400 text-center mt-4">
                Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* 8. Футер */}
      <footer id="contacts" className="bg-[#1A1A1A] text-white pt-20 pb-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#E8500B]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 80%)' }}></div>
              <span className="font-unbounded font-black text-2xl tracking-tighter text-white">ЭЛФОР</span>
            </div>
            <p className="text-white/50 text-sm mb-6 max-w-xs">
              Производство промышленных светодиодных светильников для любых задач.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E8500B] transition-colors cursor-pointer"></div>
              <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E8500B] transition-colors cursor-pointer"></div>
              <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#E8500B] transition-colors cursor-pointer"></div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Навигация</h4>
            <ul className="flex flex-col gap-4 text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">Каталог продукции</a></li>
              <li><a href="#" className="hover:text-white transition-colors">О компании</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Производство</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Проекты</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Контакты</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Каталог</h4>
            <ul className="flex flex-col gap-4 text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">Промышленное освещение</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Уличное освещение</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Архитектурное освещение</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Офисное освещение</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Контакты</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3 text-white/90">
                <Phone size={18} className="text-[#E8500B]" />
                <a href="tel:88000000000" className="hover:text-[#E8500B] transition-colors font-bold tracking-wider">8 (800) 000-00-00</a>
              </li>
              <li className="flex items-center gap-3 text-white/90">
                <Mail size={18} className="text-[#E8500B]" />
                <a href="mailto:info@lfour.ru" className="hover:text-[#E8500B] transition-colors">info@lfour.ru</a>
              </li>
              <li className="flex items-start gap-3 text-white/70 mt-2 text-sm">
                <MapPin size={18} className="text-white/40 flex-shrink-0 mt-0.5" />
                <span>г. Москва, ул. Производственная, д. 1, стр. 2</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto w-full border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} ООО «ЭЛФОР». Все права защищены.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white transition-colors">Пользовательское соглашение</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
