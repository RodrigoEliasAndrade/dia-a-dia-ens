import { useState, useEffect } from 'react';
import type { LiturgyData } from '../types';
import gospelFallbacks from '../data/gospelFallbacks.json';

const API_URL = 'https://liturgia.up.railway.app/';

export function useLiturgy() {
  const [liturgy, setLiturgy] = useState<LiturgyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFromFallback, setIsFromFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchWithRetry(attempts: number): Promise<Response | null> {
      for (let i = 0; i < attempts; i++) {
        try {
          const response = await fetch(API_URL);
          if (response.ok) return response;
        } catch {
          // continue to retry
        }
        if (i < attempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      return null;
    }

    async function loadLiturgy() {
      setLoading(true);
      const response = await fetchWithRetry(2);

      if (cancelled) return;

      if (response) {
        try {
          const data = await response.json();
          // API returns evangelho/primeiraLeitura/salmo as objects with {referencia, titulo, texto}
          const evangelhoObj = data.evangelho;
          const evangelhoText = typeof evangelhoObj === 'string' ? evangelhoObj : evangelhoObj?.texto ?? '';
          const evangelhoRef = typeof evangelhoObj === 'object' ? evangelhoObj?.referencia : undefined;
          const evangelhoTitulo = typeof evangelhoObj === 'object' ? evangelhoObj?.titulo : undefined;

          setLiturgy({
            data: data.data ?? '',
            liturgia: data.liturgia ?? '',
            cor: data.cor ?? '',
            dia: data.dia ?? '',
            evangelho: evangelhoText,
            evangelhoReferencia: evangelhoRef,
            evangelhoTitulo: evangelhoTitulo,
          });
          setIsFromFallback(false);
          setLoading(false);
          return;
        } catch {
          // fall through to fallback
        }
      }

      // Use fallback
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
      );
      const fallbackIndex = dayOfYear % gospelFallbacks.length;
      const fallback = gospelFallbacks[fallbackIndex];
      setLiturgy({
        data: new Date().toLocaleDateString('pt-BR'),
        liturgia: fallback.liturgia,
        cor: fallback.cor,
        dia: fallback.dia,
        evangelho: fallback.evangelho,
      });
      setIsFromFallback(true);
      setLoading(false);
    }

    loadLiturgy();
    return () => { cancelled = true; };
  }, []);

  return { liturgy, loading, isFromFallback };
}
