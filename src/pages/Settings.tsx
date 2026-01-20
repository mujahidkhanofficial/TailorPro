import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';
import { useState, useEffect } from 'react';
import { Scissors } from 'lucide-react';

import PageTransition from '@/components/ui/PageTransition';

export default function Settings() {
    const { t, i18n } = useTranslation();
    const { language, setLanguage } = useUIStore();
    const [appVersion, setAppVersion] = useState<string>('');

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.getAppVersion().then(setAppVersion);
        }
    }, []);

    const handleLanguageChange = (lang: 'en' | 'ur') => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    return (
        <PageTransition className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('nav.settings')}</h1>

            {/* Language Selection */}
            <div className="card">
                <h2 className="text-lg font-semibold mb-4">{t('settings.language')}</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => handleLanguageChange('en')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${language === 'en'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <span className="text-3xl mb-2 block">🇬🇧</span>
                        <span className="font-medium">English</span>
                    </button>

                    <button
                        onClick={() => handleLanguageChange('ur')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${language === 'ur'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <span className="text-3xl mb-2 block">🇵🇰</span>
                        <span className="font-urdu font-medium">اردو</span>
                    </button>
                </div>
            </div>

            {/* About Section */}
            <div className="card">
                <h2 className="text-lg font-semibold mb-4">{t('settings.about')}</h2>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
                            <Scissors className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{t('app.name')}</h3>
                            <p className="text-gray-500">{t('app.tagline')}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-gray-600">{t('settings.version')}</span>
                        <span className="font-semibold text-gray-900">v{appVersion || '1.0.0'}</span>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
