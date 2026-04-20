import Icon from '@/components/ui/icon';

/* ─── Мелкие кирпичики страницы ─────────────────────────── */

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-[7px] h-[7px] rotate-45 bg-primary shrink-0" />
      <Icon name={icon} size={18} style={{ color: 'hsl(18 62% 58%)' }} />
      <h2
        className="uppercase"
        style={{
          fontFamily: '"IM Fell English SC", serif',
          fontSize: '1.05rem',
          letterSpacing: '0.22em',
          color: 'hsl(40 32% 84%)',
        }}
      >
        {title}
      </h2>
      <span className="flex-1 h-px bg-primary/25" />
    </div>
  );
}

function Paragraph({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`leading-relaxed ${className}`}
      style={{
        fontFamily: '"IM Fell English", serif',
        fontSize: '1.02rem',
        color: 'hsl(30 22% 74%)',
      }}
    >
      {children}
    </p>
  );
}

function Scroll({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative p-7 md:p-9"
      style={{
        background:
          'linear-gradient(180deg, hsl(26 12% 10%) 0%, hsl(22 10% 7%) 100%)',
        border: '1px solid hsl(30 14% 20%)',
        boxShadow:
          'inset 0 1px 0 hsl(30 30% 28% / 0.22), 0 4px 14px hsl(0 0% 0% / 0.35)',
      }}
    >
      <span className="absolute -top-[3px] -left-[3px] w-[6px] h-[6px] rotate-45 bg-primary" />
      <span className="absolute -top-[3px] -right-[3px] w-[6px] h-[6px] rotate-45 bg-primary" />
      <span className="absolute -bottom-[3px] -left-[3px] w-[6px] h-[6px] rotate-45 bg-primary" />
      <span className="absolute -bottom-[3px] -right-[3px] w-[6px] h-[6px] rotate-45 bg-primary" />
      {children}
    </div>
  );
}

/* ─── Страница О проекте ────────────────────────────────── */

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Герб-заголовок */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          <span className="flex-1 h-px bg-primary/30" />
          <span className="w-2 h-2 bg-primary rotate-45" />
          <span
            className="uppercase"
            style={{
              fontFamily: '"IM Fell English SC", serif',
              fontSize: '0.72rem',
              letterSpacing: '0.42em',
              color: 'hsl(18 52% 52%)',
            }}
          >
            Грамота
          </span>
          <span className="w-2 h-2 bg-primary rotate-45" />
          <span className="flex-1 h-px bg-primary/30" />
        </div>

        <h1
          style={{
            fontFamily: '"UnifrakturCook", serif',
            fontSize: 'clamp(2rem, 4.5vw, 3.3rem)',
            fontWeight: 700,
            color: 'hsl(40 38% 90%)',
            textShadow: '0 2px 0 hsl(0 0% 0% / 0.7)',
            lineHeight: 1,
          }}
        >
          О Хоругви
        </h1>

        <p
          className="mt-4 italic mx-auto max-w-xl"
          style={{
            fontFamily: '"IM Fell English", serif',
            fontSize: '1.05rem',
            color: 'hsl(30 18% 58%)',
          }}
        >
          «Сiе есть указъ гильдейскаго писца, въ коемъ изъяснено назначенiе книги
          и порядокъ пользованiя оною.»
        </p>
      </header>

      <div className="space-y-6">
        {/* ── Что такое Хоругвь ── */}
        <Scroll>
          <SectionHeader icon="Flame" title="Что такое Хоругвь" />
          <Paragraph className="drop-cap mb-4">
            Хоругвь — это боевое знамя, вокругъ котораго собирается дружина, и всякiй
            отрядъ имѣетъ своё. Сiя книга — именно таковъ штандартъ: подъ нимъ собраны
            всѣ ведомыя ротамъ характеристики, трактаты и боевыя искусства, дабы
            воевода могъ въ единый мигъ уразумѣть достоинства и слабости своего войска.
          </Paragraph>
          <Paragraph>
            Здѣсь нѣтъ магiи и чародѣйства — токмо сталь, доспѣхъ, дисциплина и
            прiобрѣтённый кровью опытъ. Каждый отрядъ записанъ писцомъ въ особую
            грамоту: рангъ, классъ, назначенiе, рѣчь о былыхъ подвигахъ и реэстръ
            статей.
          </Paragraph>
        </Scroll>

        {/* ── Разделы книги ── */}
        <Scroll>
          <SectionHeader icon="BookOpenText" title="Разделы книги" />
          <div className="space-y-5">
            {[
              {
                icon: 'LayoutGrid',
                title: 'Каталогъ',
                desc:
                  'Полный реэстръ всехъ отрядовъ. Отборъ по классу (пѣхота, кавалерiя, стрѣлки, осадныя машины), назначенiю (танкъ, борьба съ кавалерiею и иныя) и рангу — отъ простаго до легендарнаго.',
              },
              {
                icon: 'Swords',
                title: 'Сравненiе',
                desc:
                  'Поставьте рядомъ до четырёхъ отрядовъ и сравните ихъ плечомъ къ плечу. Лучшiе показатели самостоятельно отмѣчаются писцомъ.',
              },
              {
                icon: 'ScrollText',
                title: 'Трактаты',
                desc:
                  'Укрѣпительныя грамоты, примѣнимыя къ отрядамъ совмѣстныхъ классовъ. Итоговыя числа пересчитываются на глазахъ — видно, что прибавитъ стали, а что убавитъ скорости.',
              },
              {
                icon: 'MessageSquare',
                title: 'Форумъ',
                desc:
                  'Мѣсто, гдѣ воеводы бесѣдуютъ о построенiяхъ, разбираютъ походы и делятся наставленiями. Писцы принимаютъ правки и предложенiя.',
              },
              {
                icon: 'FileSearch',
                title: 'Грамота отряда',
                desc:
                  'Откройте любую карточку — и писецъ вынесетъ вамъ подробный листъ: всѣ характеристики, лѣтопись рода, боевыя искусства и примѣнённые трактаты.',
              },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div
                  className="w-9 h-9 rotate-45 flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: 'hsl(18 52% 42% / 0.2)',
                    border: '1px solid hsl(18 52% 48%)',
                    boxShadow: 'inset 0 1px 0 hsl(18 52% 60% / 0.25)',
                  }}
                >
                  <span className="-rotate-45">
                    <Icon name={item.icon} size={16} style={{ color: 'hsl(18 62% 58%)' }} />
                  </span>
                </div>
                <div>
                  <div
                    className="mb-1"
                    style={{
                      fontFamily: '"IM Fell English SC", serif',
                      fontSize: '1rem',
                      letterSpacing: '0.08em',
                      color: 'hsl(40 32% 86%)',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    className="leading-relaxed"
                    style={{
                      fontFamily: '"IM Fell English", serif',
                      fontSize: '0.94rem',
                      color: 'hsl(30 16% 62%)',
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Scroll>

        {/* ── Статьи отряда ── */}
        <Scroll>
          <SectionHeader icon="Scale" title="Статьи отряда" />
          <Paragraph className="mb-5">
            Подъ «статьею» разумеется числовая мѣра достоинства отряда. Писецъ ведётъ
            счётъ по единой шкалѣ, дабы всякiй воевода судилъ по справедливости:
          </Paragraph>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {[
              { stat: 'Численность',  desc: 'Сколько душъ въ строю — отъ сего зависитъ устойчивость роты.' },
              { stat: 'Лидерство',    desc: 'Сколько стоитъ нанять и удержать сiю хоругвь въ войскѣ.' },
              { stat: 'Скорость',     desc: 'Какъ быстро отрядъ одолѣваетъ поле сраженiя.' },
              { stat: 'Мораль',       desc: 'Стойкость духа при потеряхъ и натискѣ.' },
              { stat: 'Натискъ',      desc: 'Уронъ въ ближней сѣчѣ — рубящiй, проникающiй и дробящiй.' },
              { stat: 'Защита',       desc: 'Сопротивленiе тремъ родамъ урона и прочность доспѣха.' },
              { stat: 'Пробиванiе',   desc: 'Способность обойти броню противника тремя родами оружiя.' },
              { stat: 'Дальность',    desc: 'Для стрѣлковъ и осадныхъ — на сколько клѣтокъ бьётъ.' },
              { stat: 'Блокъ',        desc: 'Умѣнiе щитомъ или оружiемъ отвести ударъ.' },
              { stat: 'Боезапасъ',    desc: 'Сколько стрѣлъ, болтовъ или снарядовъ у роты при себѣ.' },
            ].map(item => (
              <div
                key={item.stat}
                className="flex gap-3 py-2 px-3"
                style={{
                  borderLeft: '2px solid hsl(18 52% 42% / 0.5)',
                  background: 'hsl(24 10% 6%)',
                }}
              >
                <span
                  className="uppercase shrink-0"
                  style={{
                    fontFamily: '"IM Fell English SC", serif',
                    fontSize: '0.72rem',
                    letterSpacing: '0.18em',
                    color: 'hsl(18 62% 58%)',
                    width: '6.5rem',
                  }}
                >
                  {item.stat}
                </span>
                <span
                  style={{
                    fontFamily: '"IM Fell English", serif',
                    fontSize: '0.88rem',
                    color: 'hsl(30 16% 64%)',
                  }}
                >
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </Scroll>

        {/* ── Ранги отрядов ── */}
        <Scroll>
          <SectionHeader icon="Award" title="Ранги отрядовъ" />
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Обычный',     hue: '30 10% 48%',  lore: 'Рядовая пѣхота, подёнщики брани.' },
              { label: 'Необычный',   hue: '70 22% 38%',  lore: 'Проверенные временемъ вольныя роты.' },
              { label: 'Редкій',      hue: '198 30% 42%', lore: 'Дружины подъ знаменемъ короны.' },
              { label: 'Уникальный',  hue: '280 20% 40%', lore: 'Вассалы высокой крови.' },
              { label: 'Легендарный', hue: '14 62% 44%',  lore: 'О нихъ складываютъ пѣсни.' },
            ].map(r => (
              <div
                key={r.label}
                className="flex-1 min-w-[180px] p-3"
                style={{
                  background: `hsl(${r.hue} / 0.16)`,
                  border: `1px solid hsl(${r.hue} / 0.6)`,
                  boxShadow: `inset 0 1px 0 hsl(${r.hue} / 0.3)`,
                }}
              >
                <div
                  className="uppercase mb-1"
                  style={{
                    fontFamily: '"IM Fell English SC", serif',
                    fontSize: '0.82rem',
                    letterSpacing: '0.18em',
                    color: `hsl(${r.hue})`,
                    textShadow: '0 1px 0 hsl(0 0% 0% / 0.5)',
                  }}
                >
                  {r.label}
                </div>
                <div
                  className="italic leading-snug"
                  style={{
                    fontFamily: '"IM Fell English", serif',
                    fontSize: '0.84rem',
                    color: 'hsl(30 16% 62%)',
                  }}
                >
                  {r.lore}
                </div>
              </div>
            ))}
          </div>
        </Scroll>

        {/* ── Замѣтка писца ── */}
        <Scroll>
          <SectionHeader icon="Feather" title="Замѣтка писца" />
          <Paragraph>
            Записи ведутся въ ручную и пополняются по мѣрѣ прибытiя новыхъ дружинъ.
            Ежели найдёте ошибку, обнаружите пропущенный отрядъ или пожелаете
            предложить правку — обратитесь къ писцу черезъ форумъ или по нижеслѣдующимъ
            каналамъ. Писецъ сей работаетъ честно и правокъ не чуждается.
          </Paragraph>
        </Scroll>

        {/* ── Контакты ── */}
        <Scroll>
          <SectionHeader icon="Mail" title="Какъ связаться" />
          <div className="space-y-3">
            {[
              { icon: 'Globe',          label: 'Мастерская',  value: 'poehali.dev' },
              { icon: 'MessageCircle',  label: 'Телеграмъ',   value: '@developer' },
              { icon: 'MessageSquare',  label: 'Форумъ',      value: 'разделъ «Форумъ» въ реэстрѣ' },
            ].map(c => (
              <div
                key={c.label}
                className="flex items-center gap-3 py-2 px-3"
                style={{
                  borderLeft: '2px solid hsl(18 52% 42% / 0.5)',
                  background: 'hsl(24 10% 6%)',
                }}
              >
                <Icon name={c.icon} size={15} style={{ color: 'hsl(18 62% 58%)' }} />
                <span
                  className="uppercase"
                  style={{
                    fontFamily: '"IM Fell English SC", serif',
                    fontSize: '0.7rem',
                    letterSpacing: '0.22em',
                    color: 'hsl(18 52% 52%)',
                    width: '7rem',
                  }}
                >
                  {c.label}
                </span>
                <span
                  className="font-mono-data"
                  style={{ color: 'hsl(40 28% 80%)', fontSize: '0.88rem' }}
                >
                  {c.value}
                </span>
              </div>
            ))}
          </div>
        </Scroll>

        {/* Подпись-печать */}
        <div className="text-center pt-6">
          <div className="inline-flex flex-col items-center gap-2">
            <div
              className="w-14 h-14 rotate-45 flex items-center justify-center"
              style={{
                background: 'hsl(4 48% 32%)',
                border: '1px solid hsl(4 48% 44%)',
                boxShadow:
                  'inset 0 1px 0 hsl(4 48% 60% / 0.35), 0 4px 10px hsl(0 0% 0% / 0.5)',
              }}
            >
              <span
                className="-rotate-45 uppercase"
                style={{
                  fontFamily: '"IM Fell English SC", serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.18em',
                  color: 'hsl(40 40% 94%)',
                }}
              >
                Х·П
              </span>
            </div>
            <div
              className="italic"
              style={{
                fontFamily: '"IM Fell English", serif',
                fontSize: '0.88rem',
                color: 'hsl(30 14% 54%)',
              }}
            >
              Печать писца · Anno MMXXVI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
