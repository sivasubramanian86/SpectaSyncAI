import { describe, it, expect } from 'vitest';
import i18n from '../i18n';
import { TRANSLATIONS } from '../translations';

describe('i18n configuration', () => {
  it('should have initialized all requested languages', () => {
    expect(i18n).toBeDefined();
    expect(i18n.isInitialized).toBe(true);
    
    // Check if resources have been correctly mapped to lower case
    const hiTranslation = i18n.getResourceBundle('hi', 'translation');
    expect(hiTranslation).toBeDefined();
    expect(hiTranslation.tabs.dashboard).toBe(TRANSLATIONS.HI.tabs.dashboard);
    
    const taTranslation = i18n.getResourceBundle('ta', 'translation');
    expect(taTranslation).toBeDefined();
    expect(taTranslation.tabs.dashboard).toBe(TRANSLATIONS.TA.tabs.dashboard);
  });

  it('should switch languages correctly', async () => {
    await i18n.changeLanguage('hi');
    expect(i18n.language).toBe('hi');
    expect(i18n.t('tabs.dashboard')).toBe(TRANSLATIONS.HI.tabs.dashboard);

    await i18n.changeLanguage('ta');
    expect(i18n.language).toBe('ta');
    expect(i18n.t('tabs.dashboard')).toBe(TRANSLATIONS.TA.tabs.dashboard);

    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
  });
});
