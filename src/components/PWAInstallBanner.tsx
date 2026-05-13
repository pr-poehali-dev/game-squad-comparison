import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('pwa-banner-dismissed')) return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') handleDismiss();
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', '1');
  };

  if (!show || dismissed) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 text-xs"
      style={{
        background: 'linear-gradient(90deg, hsl(222 18% 11%) 0%, hsl(222 18% 13%) 100%)',
        borderBottom: '1px solid hsl(42 76% 50% / 0.2)',
        boxShadow: 'inset 0 1px 0 hsl(42 76% 58% / 0.08)',
      }}
    >
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-base"
        style={{ background: 'linear-gradient(135deg, hsl(48 80% 68%) 0%, hsl(32 64% 40%) 100%)' }}
      >
        ⚔️
      </span>

      <span style={{ color: 'hsl(38 20% 78%)', fontFamily: '"Manrope", sans-serif' }}>
        {isIOS ? (
          <>
            Установи приложение: нажми{' '}
            <Icon name="Share" size={11} className="inline-block mx-0.5" style={{ color: 'hsl(42 76% 58%)' }} />
            {' '}→ «На экран "Домой"»
          </>
        ) : (
          'Установи «Хоругвь» как приложение на телефон'
        )}
      </span>

      <div className="ml-auto flex items-center gap-2 flex-shrink-0">
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="px-3 py-1 rounded text-xs font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, hsl(48 80% 68%) 0%, hsl(32 64% 40%) 100%)',
              color: 'hsl(222 30% 10%)',
              fontFamily: '"Manrope", sans-serif',
            }}
          >
            Установить
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="p-1 transition-colors"
          style={{ color: 'hsl(222 10% 45%)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'hsl(222 10% 65%)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'hsl(222 10% 45%)')}
          title="Закрыть"
        >
          <Icon name="X" size={14} />
        </button>
      </div>
    </div>
  );
}
