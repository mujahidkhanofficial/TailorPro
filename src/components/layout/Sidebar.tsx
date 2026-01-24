import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { LayoutDashboard, Users, ShoppingBag, Cloud, Settings, Scissors, HardHat, LogOut } from 'lucide-react';
import { ReactNode, useState } from 'react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface NavItem {
    path: string;
    icon: ReactNode;
    labelKey: string;
}

const navItems: NavItem[] = [
    { path: '/', icon: <LayoutDashboard size={20} />, labelKey: 'nav.dashboard' },
    { path: '/customers', icon: <Users size={20} />, labelKey: 'nav.customers' },
    { path: '/orders', icon: <ShoppingBag size={20} />, labelKey: 'nav.orders' },
    { path: '/workers', icon: <HardHat size={20} />, labelKey: 'nav.workers' },
    { path: '/backup', icon: <Cloud size={20} />, labelKey: 'nav.backup' },
    { path: '/settings', icon: <Settings size={20} />, labelKey: 'nav.settings' },
];


interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { t, i18n } = useTranslation();
    const isUrdu = i18n.language === 'ur';
    const { sidebarCollapsed } = useUIStore();
    const logout = useAuthStore(state => state.logout);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsLogoutModalOpen(false);
    };

    return (
        <>
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-30 bg-sidebar border-r border-gray-800 transition-all duration-300 transform 
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${sidebarCollapsed ? 'w-20' : 'w-64'}
                `}
            >
                {/* Logo */}
                <div className="p-4 border-b border-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20 transform hover:scale-105 transition-transform text-white">
                            <Scissors className="w-6 h-6" />
                        </div>
                        {!sidebarCollapsed && (
                            <div>
                                <h1 className="font-bold text-white text-lg tracking-tight">{t('app.name')}</h1>
                                <p className="text-xs text-gray-400">{t('app.tagline')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3">
                    <ul className="space-y-1.5">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                   ${isActive
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20 font-medium'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`
                                    }
                                >
                                    <span className={`transform transition-transform duration-200 ${!sidebarCollapsed && 'group-hover:scale-110'}`}>
                                        {item.icon}
                                    </span>
                                    {!sidebarCollapsed && (
                                        <span className="font-medium tracking-wide text-sm">{t(item.labelKey)}</span>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="p-3 border-t border-gray-800/50">
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden text-red-400 hover:bg-red-500/10 hover:text-red-300`}
                    >
                        <span className={`transform transition-transform duration-200 ${!sidebarCollapsed && 'group-hover:scale-110'}`}>
                            <LogOut size={20} />
                        </span>
                        {!sidebarCollapsed && (
                            <span className="font-medium tracking-wide text-sm">{t('nav.logout') || "Logout"}</span>
                        )}
                    </button>
                </div>

                {/* Footer */}
                {!sidebarCollapsed && (
                    <div className="p-4 border-t border-gray-800/50 text-center bg-gray-900/50">
                        <p className="text-xs text-gray-500 font-medium">v1.0.0</p>
                        <p className="text-xs text-gray-600 mt-1">Made for Pakistan 🇵🇰</p>
                    </div>
                )}
            </aside >
            {/* Overlay for mobile */}
            {
                isOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
                        onClick={onClose}
                    />
                )
            }

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title={isUrdu ? 'Logout / لاگ آؤٹ' : 'Logout'}
                message={t('common.logoutConfirm') || 'Are you sure you want to logout?'}
                confirmText={t('nav.logout')}
                isDestructive={true}
            />
        </>
    );
}
