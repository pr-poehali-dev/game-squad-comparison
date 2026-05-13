import { useEffect } from 'react';

interface MetaOptions {
  title?: string;
  description?: string;
  image?: string;
}

const DEFAULT_TITLE = 'Хоругвь — Каталог отрядов';
const DEFAULT_DESC = 'Современный справочник отрядов с историческим духом: характеристики, трактаты, сравнения.';
const DEFAULT_IMAGE = 'https://cdn.poehali.dev/projects/455c24fb-ce5d-4076-9543-1ca6ad6daa72/files/a757706d-9fb5-4b1e-98c4-a78a305f8679.jpg';

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useDocumentMeta({ title, description, image }: MetaOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} — Хоругвь` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESC;
    const img = image || DEFAULT_IMAGE;

    document.title = fullTitle;
    setMeta('description', desc);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('og:image', img, 'property');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('description', DEFAULT_DESC);
      setMeta('og:title', DEFAULT_TITLE, 'property');
      setMeta('og:description', DEFAULT_DESC, 'property');
      setMeta('og:image', DEFAULT_IMAGE, 'property');
      setMeta('twitter:title', DEFAULT_TITLE);
      setMeta('twitter:description', DEFAULT_DESC);
      setMeta('twitter:image', DEFAULT_IMAGE);
    };
  }, [title, description, image]);
}
