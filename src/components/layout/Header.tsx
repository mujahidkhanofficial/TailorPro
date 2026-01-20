import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';

import { Menu } from 'lucide-react';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { i18n } = useTranslation();
    const { language, setLanguage, toggleSidebar } = useUIStore();

    const handleLanguageToggle = () => {
        const newLang = language === 'en' ? 'ur' : 'en';
        setLanguage(newLang);
        i18n.changeLanguage(newLang);
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Sidebar Toggle */}
                <button
                    onClick={() => {
                        // Desktop: toggle collapse
                        if (window.innerWidth >= 1024) {
                            toggleSidebar();
                        } else {
                            // Mobile: open drawer
                            onMenuClick();
                        }
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-5 h-5 text-gray-600" />
                </button>

                {/* Language Toggle */}
                <button
                    onClick={handleLanguageToggle}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    <span className="text-lg">{language === 'en' ? '🇬🇧' : '🇵🇰'}</span>
                    <span className="font-medium text-sm">
                        {language === 'en' ? 'English' : 'اردو'}
                    </span>
                </button>
            </div>
        </header>
    );
}
