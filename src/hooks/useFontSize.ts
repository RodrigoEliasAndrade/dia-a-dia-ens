import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type FontSizePreset = 'normal' | 'grande' | 'extra-grande';

const FONT_SIZE_MAP: Record<FontSizePreset, string> = {
  'normal': '100%',
  'grande': '120%',
  'extra-grande': '140%',
};

const FONT_SIZE_LABELS: Record<FontSizePreset, string> = {
  'normal': 'Normal',
  'grande': 'Grande',
  'extra-grande': 'Extra Grande',
};

const PRESETS: FontSizePreset[] = ['normal', 'grande', 'extra-grande'];

/**
 * Font size preference hook.
 *
 * - Persists a preset (Normal / Grande / Extra Grande) in localStorage
 * - Applies the preset as a percentage on <html> font-size
 * - Percentages compound with the system/browser font size:
 *   e.g. if the phone is already set to 20px, "Grande" (120%) = 24px
 * - All rem-based values (Tailwind classes + our converted values) scale automatically
 */
export function useFontSize() {
  const [preset, setPreset] = useLocalStorage<FontSizePreset>(
    'ens-font-size',
    'normal'
  );

  // Apply to <html> element whenever preset changes
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_MAP[preset];

    // Cleanup: reset to browser default when unmounting
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [preset]);

  return {
    preset,
    setPreset,
    presets: PRESETS,
    labels: FONT_SIZE_LABELS,
    sizes: FONT_SIZE_MAP,
  };
}
