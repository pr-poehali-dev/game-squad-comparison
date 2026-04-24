export default function MedievalClashPage() {
  const features = [
    { icon: '⚔️', title: 'PvP до 30 игроков', desc: 'Арены в реальном времени — захват точек, бои отрядов, тактика' },
    { icon: '🏹', title: 'Классы юнитов', desc: 'Пехота, лучники, всадники, рыцари, инженеры — у каждого роль' },
    { icon: '🏰', title: 'Укрепления и осада', desc: 'Строй башни и катапульты, штурмуй чужие замки' },
    { icon: '⚡', title: 'Система противостояний', desc: 'Камень–ножницы–бумага: всадники бьют лучников, пехота — всадников' },
    { icon: '📈', title: 'Прокачка и ранги', desc: 'От Новобранца до Полководца — опыт, скины, ежедневные задания' },
    { icon: '🗺️', title: 'Мини-карта и ресурсы', desc: 'Шахты дают золото, фермы — еду. Контролируй территорию' },
  ];

  const ranks = [
    { name: 'Новобранец', color: '#8b9aad' },
    { name: 'Ратник', color: '#7eb87e' },
    { name: 'Сержант', color: '#6ab0d4' },
    { name: 'Рыцарь', color: '#c9a84c' },
    { name: 'Барон', color: '#c47ac4' },
    { name: 'Полководец', color: '#e8734a' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">

      {/* Шапка-анонс */}
      <div
        className="relative rounded-2xl overflow-hidden p-10 text-center"
        style={{
          background: 'linear-gradient(135deg, hsl(222 20% 8%) 0%, hsl(222 30% 5%) 50%, hsl(12 50% 8%) 100%)',
          border: '1px solid hsl(42 76% 50% / 0.3)',
          boxShadow: '0 0 80px hsl(42 76% 30% / 0.12), inset 0 1px 0 hsl(42 76% 60% / 0.1)',
        }}
      >
        {/* Декоративные угловые черты */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 rounded-tl-sm" style={{ borderColor: 'hsl(42 76% 50% / 0.5)' }} />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 rounded-tr-sm" style={{ borderColor: 'hsl(42 76% 50% / 0.5)' }} />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 rounded-bl-sm" style={{ borderColor: 'hsl(42 76% 50% / 0.5)' }} />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 rounded-br-sm" style={{ borderColor: 'hsl(42 76% 50% / 0.5)' }} />

        <div
          className="text-xs uppercase tracking-[0.4em] mb-4"
          style={{ color: 'hsl(42 60% 58% / 0.8)', fontFamily: '"Manrope", sans-serif', fontWeight: 600 }}
        >
          скоро · в разработке
        </div>

        <h1
          className="text-5xl md:text-6xl font-black mb-2"
          style={{
            fontFamily: '"Cinzel Decorative", serif',
            background: 'linear-gradient(135deg, hsl(48 80% 80%) 0%, hsl(42 76% 58%) 40%, hsl(30 64% 48%) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            letterSpacing: '0.02em',
          }}
        >
          Medieval
        </h1>
        <h1
          className="text-5xl md:text-6xl font-black mb-6"
          style={{
            fontFamily: '"Cinzel Decorative", serif',
            background: 'linear-gradient(135deg, hsl(355 60% 70%) 0%, hsl(355 72% 56%) 50%, hsl(350 62% 40%) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            letterSpacing: '0.02em',
          }}
        >
          Clash<span style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 300, fontSize: '0.7em' }}>.io</span>
        </h1>

        <p
          className="text-lg max-w-xl mx-auto mb-8 leading-relaxed"
          style={{ color: 'hsl(222 10% 68%)', fontFamily: '"Manrope", sans-serif' }}
        >
          Браузерная многопользовательская стратегия в средневековом сеттинге.
          Собери отряд, захвати территорию, сокруши врагов.
        </p>

        {/* Бейдж «Ожидается» */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, hsl(42 76% 50% / 0.15), hsl(42 76% 40% / 0.05))',
            border: '1px solid hsl(42 76% 50% / 0.4)',
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(42 80% 60%)' }} />
          <span
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'hsl(42 76% 68%)', fontFamily: '"Manrope", sans-serif' }}
          >
            В активной разработке
          </span>
        </div>
      </div>

      {/* Фичи */}
      <div>
        <h2
          className="text-xs uppercase tracking-[0.35em] mb-5"
          style={{ color: 'hsl(42 40% 55% / 0.7)', fontFamily: '"Manrope", sans-serif', fontWeight: 600 }}
        >
          Что тебя ждёт
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-5 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, hsl(222 16% 10%) 0%, hsl(222 18% 7%) 100%)',
                border: '1px solid hsl(222 14% 16%)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(42 76% 50% / 0.35)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px hsl(42 76% 30% / 0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(222 14% 16%)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <div
                className="font-bold mb-1.5 text-sm"
                style={{ color: 'hsl(38 18% 90%)', fontFamily: '"Manrope", sans-serif' }}
              >
                {f.title}
              </div>
              <div
                className="text-sm leading-relaxed"
                style={{ color: 'hsl(222 10% 58%)', fontFamily: '"Manrope", sans-serif' }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ранговая система */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'linear-gradient(135deg, hsl(222 16% 10%) 0%, hsl(222 18% 7%) 100%)',
          border: '1px solid hsl(222 14% 16%)',
        }}
      >
        <h2
          className="text-xs uppercase tracking-[0.35em] mb-5"
          style={{ color: 'hsl(42 40% 55% / 0.7)', fontFamily: '"Manrope", sans-serif', fontWeight: 600 }}
        >
          Путь воина · ранговая система
        </h2>
        <div className="flex flex-wrap gap-3">
          {ranks.map((r, i) => (
            <div
              key={r.name}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg"
              style={{
                background: `${r.color}14`,
                border: `1px solid ${r.color}40`,
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: r.color, color: '#111' }}
              >
                {i + 1}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: r.color, fontFamily: '"Manrope", sans-serif' }}
              >
                {r.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Технические детали */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Игроков на арене', value: 'до 30' },
          { label: 'Задержка', value: '< 100 мс' },
          { label: 'FPS', value: '60' },
          { label: 'Платформы', value: 'ПК + Мобайл' },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, hsl(222 16% 10%) 0%, hsl(222 18% 7%) 100%)',
              border: '1px solid hsl(222 14% 16%)',
            }}
          >
            <div
              className="text-2xl font-black mb-1"
              style={{
                fontFamily: '"Cinzel Decorative", serif',
                background: 'linear-gradient(135deg, hsl(48 80% 72%), hsl(32 64% 48%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {s.value}
            </div>
            <div
              className="text-xs"
              style={{ color: 'hsl(222 10% 52%)', fontFamily: '"Manrope", sans-serif' }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Футер */}
      <div
        className="text-center text-xs py-4"
        style={{ color: 'hsl(222 10% 40%)', fontFamily: '"Manrope", sans-serif', letterSpacing: '0.05em' }}
      >
        Medieval Clash.io · находится в разработке · следи за обновлениями
      </div>
    </div>
  );
}
