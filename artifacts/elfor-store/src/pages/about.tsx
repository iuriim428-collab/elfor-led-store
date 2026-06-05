import { Link } from "wouter";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex gap-2 text-xs font-mono text-muted-foreground mb-8">
        <Link href="/" className="hover:text-primary">Главная</Link>
        <span>/</span>
        <span className="text-primary">О компании</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-serif font-black uppercase mb-12">О компании ЭЛФОР</h1>

      <div className="space-y-12 font-mono text-sm leading-relaxed">
        <section>
          <h2 className="text-2xl font-serif font-bold uppercase mb-4 text-primary">Надежный производитель</h2>
          <p className="text-muted-foreground">
            ELFOR (ООО "ЭЛФОР") — российский производитель промышленных светодиодных светильников. 
            Мы специализируемся на разработке и серийном производстве надежного освещения для заводов, 
            складских комплексов, спортивных объектов и уличной инфраструктуры.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-border py-12">
          <div className="flex flex-col gap-2">
            <div className="text-4xl font-serif font-black text-accent">5 лет</div>
            <div className="font-bold uppercase">Гарантия</div>
            <div className="text-muted-foreground text-xs">Безусловная гарантия на всю продукцию</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-4xl font-serif font-black text-accent">200 лм/Вт</div>
            <div className="font-bold uppercase">Эффективность</div>
            <div className="text-muted-foreground text-xs">Максимальная энергоэффективность</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-4xl font-serif font-black text-accent">100 000+</div>
            <div className="font-bold uppercase">Часов работы</div>
            <div className="text-muted-foreground text-xs">Срок службы светодиодов</div>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-serif font-bold uppercase mb-4 text-primary">Наше производство</h2>
          <p className="text-muted-foreground mb-4">
            Производственные мощности ELFOR расположены в России, что позволяет нам жестко контролировать качество на каждом этапе сборки и оперативно реагировать на потребности заказчиков. Мы используем только проверенные комплектующие от мировых и отечественных лидеров отрасли.
          </p>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>Собственная линия поверхностного монтажа (SMD)</li>
            <li>Автоматизированный контроль качества</li>
            <li>Климатические и фотометрические лаборатории для тестирования</li>
            <li>Адаптация светильников под специфические нужды заказчика (оптика, крепления, БАП)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}