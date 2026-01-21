import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';
import { useState, useEffect } from 'react';
import { Scissors, Save, Building2, Phone, MapPin } from 'lucide-react';
import { db, Settings as ShopSettings } from '@/db/database';
import toast from 'react-hot-toast';

import PageTransition from '@/components/ui/PageTransition';

export default function Settings() {
    const { t, i18n } = useTranslation();
    const { language, setLanguage } = useUIStore();
    const [appVersion, setAppVersion] = useState<string>('');

    // Shop Settings State
    const [settings, setSettings] = useState<ShopSettings>({
        shopName: 'M.R.S ٹیلرز اینڈ فیبرکس',
        address: 'گل پلازہ روڈ اپوزٹ ٹاؤن شیل مارکیٹ تارو جب',
        phone1: '0313-9003733',
        phone2: '0313-9645010',
        updatedAt: new Date()
    });

    useEffect(() => {
        // Load App Version
        if (window.electronAPI) {
            window.electronAPI.getAppVersion().then(setAppVersion);
        }

        // Load Shop Settings
        const loadSettings = async () => {
            const savedSettings = await db.settings.get(1);
            if (savedSettings) {
                setSettings(savedSettings);
            }
        };
        loadSettings();
    }, []);

    const handleLanguageChange = (lang: 'en' | 'ur') => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    const handleSaveSettings = async () => {
        try {
            await db.settings.put({ ...settings, id: 1, updatedAt: new Date() });
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        }
    };

    return (
        <PageTransition className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('nav.settings')}</h1>

            {/* Shop Settings Section */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Shop Details (Print Header)
                    </h2>
                    <button
                        onClick={handleSaveSettings}
                        className="btn btn-primary flex items-center gap-2 text-sm py-1.5"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="col-span-2">
                        <label className="label">Shop Name (Urdu/English)</label>
                        <input
                            type="text"
                            className="input font-urdu"
                            value={settings.shopName}
                            onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                            dir="auto"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="label">Address (Urdu/English)</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                className="input pl-10 font-urdu"
                                value={settings.address}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                dir="auto"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">Phone 1</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                className="input pl-10"
                                value={settings.phone1}
                                onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">Phone 2 (Optional)</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                className="input pl-10"
                                value={settings.phone2}
                                onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

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
