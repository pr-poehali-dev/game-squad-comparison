import Icon from '@/components/ui/icon';

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">О проекте</h1>
        <p className="text-muted-foreground">Боевой компаньон для стратегических решений на поле боя</p>
      </div>

      <div className="space-y-4">
        {/* About */}
        <div className="bg-card border border-border rounded-sm p-6">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon name="Info" size={16} className="text-primary" />
            Что это
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Боевой Компаньон — полный справочник отрядов, их характеристик и трактатов. 
            Помогает принимать стратегические решения: какой отряд нанять, как усилить его трактатами, 
            и как сравнить несколько отрядов для оптимального состава армии.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Все данные хранятся локально в браузере — ваши конфигурации трактатов не пропадут.
          </p>
        </div>

        {/* How to use */}
        <div className="bg-card border border-border rounded-sm p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="BookOpen" size={16} className="text-primary" />
            Инструкция
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: 'Grid3X3',
                title: 'Каталог отрядов',
                desc: 'Просматривайте все доступные отряды. Фильтруйте по классу (пехота, кавалерия...), роли (танк, урон...) и редкости. Нажмите на карточку для подробной информации.'
              },
              {
                icon: 'GitCompare',
                title: 'Сравнение',
                desc: 'Добавьте до 4 отрядов и сравните их параметры рядом. Лучшие показатели подсвечиваются автоматически.'
              },
              {
                icon: 'ScrollText',
                title: 'Трактаты',
                desc: 'Выберите отряд и примените совместимые трактаты. Характеристики обновляются мгновенно, показывая итоговые бонусы.'
              },
              {
                icon: 'ChevronRight',
                title: 'Детальная страница',
                desc: 'Кликните на карточку в каталоге — откроется полная информация: все характеристики, лор, способности и примённые трактаты.'
              },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name={item.icon} size={16} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">{item.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats legend */}
        <div className="bg-card border border-border rounded-sm p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="BarChart2" size={16} className="text-primary" />
            Характеристики отрядов
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { stat: 'Атака', desc: 'Урон в ближнем/дальнем бою' },
              { stat: 'Защита', desc: 'Снижение входящего урона' },
              { stat: 'Скорость', desc: 'Дальность перемещения за ход' },
              { stat: 'Здоровье', desc: 'Стойкость к потерям' },
              { stat: 'Мораль', desc: 'Устойчивость к паническому отступлению' },
              { stat: 'Дальность', desc: 'Дистанция атаки в клетках' },
            ].map(item => (
              <div key={item.stat} className="flex gap-2">
                <span className="font-mono-data text-xs text-primary w-20 flex-shrink-0">{item.stat}</span>
                <span className="text-xs text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card border border-border rounded-sm p-6">
          <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon name="Mail" size={16} className="text-primary" />
            Контакты разработчика
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            По вопросам добавления отрядов, исправления данных и предложениям:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Icon name="Globe" size={14} className="text-primary" />
              <span className="font-mono-data text-xs">poehali.dev</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Icon name="MessageCircle" size={14} className="text-primary" />
              <span className="text-xs">Telegram: @developer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
