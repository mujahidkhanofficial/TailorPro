
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCustomerStore } from '@/stores/customerStore';
import { useOrderStore } from '@/stores/orderStore';
import {
    Users,
    ShoppingBag,
    Calendar,
    AlertCircle,
    Plus,
    ChevronRight,
    Check
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { ReactNode } from 'react';

import PageTransition from '@/components/ui/PageTransition';
import OrderFormModal from '@/components/forms/OrderFormModal';
import { useUIStore } from '@/stores/uiStore';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export default function Dashboard() {
    const { t } = useTranslation();
    const { customers, loadCustomers } = useCustomerStore();
    const pendingOrders = useOrderStore((state) => state.pendingOrders);
    const dueTodayOrders = useOrderStore((state) => state.dueTodayOrders);
    const overdueOrders = useOrderStore((state) => state.overdueOrders);
    // @ts-ignore
    const stats = useOrderStore((state) => state.stats);
    const { onboardingCompleted } = useUIStore();

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadCustomers();
        useOrderStore.getState().loadDashboardData();

        // Keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // New Order: Ctrl + N
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                setIsModalOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <PageTransition className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('dashboard.title')}</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="w-6 h-6" />}
                    label={t('dashboard.totalCustomers')}
                    value={customers.length}
                    color="blue"
                />
                <StatCard
                    icon={<ShoppingBag className="w-6 h-6" />}
                    label={t('dashboard.pendingOrders')}
                    value={pendingOrders.length}
                    color="yellow"
                />
                <StatCard
                    icon={<Calendar className="w-6 h-6" />}
                    label={t('dashboard.dueToday')}
                    value={dueTodayOrders.length}
                    color="green"
                />
                <StatCard
                    icon={<AlertCircle className="w-6 h-6" />}
                    label={t('dashboard.overdue')}
                    value={overdueOrders.length}
                    color="red"
                />
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Due Today */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card h-full flex flex-col">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-gray-800">
                            <div className="p-2.5 bg-warning-50 text-warning-600 rounded-xl shadow-sm">
                                <Calendar className="w-5 h-5" />
                            </div>
                            {t('dashboard.dueToday')}
                        </h2>

                        {dueTodayOrders.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium mb-4">{t('dashboard.noOrdersDueToday')}</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="btn btn-primary inline-flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    {t('orders.addNew')}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dueTodayOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        to={`/orders/${order.id}`}
                                        className="block p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200/60 transition-all duration-300 group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-1.5 h-10 bg-success-500 rounded-full shadow-sm"></div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                        {t(`garments.${order.garmentType}`)}
                                                    </p>
                                                    <p className="text-xs font-medium text-gray-500">
                                                        {t(`orders.status${order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', '')}`)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-success-700 bg-success-50 px-2.5 py-1 rounded-full border border-success-100 shadow-sm">
                                                {formatDate(order.dueDate)}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Overdue */}
                <div className="space-y-6">
                    {overdueOrders.length > 0 ? (
                        <div className="card border-danger-100 bg-gradient-to-b from-danger-50/30 to-white">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-danger-700">
                                <div className="p-2.5 bg-danger-100 rounded-xl shadow-sm text-danger-600">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                {t('dashboard.overdue')}
                            </h2>
                            <div className="space-y-3">
                                {overdueOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        to={`/orders/${order.id}`}
                                        className="block p-3 bg-white rounded-xl shadow-sm border border-danger-100 hover:shadow-md hover:border-danger-200 transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1 h-8 bg-danger-500 rounded-full"></div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 group-hover:text-danger-600 transition-colors">
                                                        {t(`garments.${order.garmentType}`)}
                                                    </p>
                                                    <p className="text-xs text-danger-600 font-medium flex items-center gap-1">
                                                        <span>⚠️</span> {formatDate(order.dueDate)}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-danger-500" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="card bg-gradient-to-br from-success-50 to-emerald-50/30 border-success-100 flex flex-col items-center justify-center text-center p-8 h-full">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg shadow-success-100 mb-4 animate-in zoom-in duration-300">
                                <Check className="w-8 h-8 text-success-500" />
                            </div>
                            <h3 className="font-bold text-success-800 text-lg">All Caught Up!</h3>
                            <p className="text-success-600 text-sm mt-1">No overdue orders pending.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && <OrderFormModal onClose={() => setIsModalOpen(false)} />}

            {!onboardingCompleted && (
                <OnboardingWizard
                    onComplete={() => { }} // Store handles state update, this is for any extra logic
                    onOpenNewOrder={() => setIsModalOpen(true)}
                />
            )}
        </PageTransition>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
    trend,
}: {
    icon: ReactNode;
    label: string;
    value: number;
    color: 'blue' | 'yellow' | 'green' | 'red';
    trend?: string;
}) {
    const gradients = {
        blue: 'from-primary-50 to-white border-primary-200',
        yellow: 'from-warning-50 to-white border-warning-200',
        green: 'from-success-50 to-white border-success-200',
        red: 'from-danger-50 to-white border-danger-200',
    };

    const iconStyles = {
        blue: 'text-primary-600 bg-white border-2 border-primary-200 shadow-sm',
        yellow: 'text-warning-600 bg-white border-2 border-warning-200 shadow-sm',
        green: 'text-success-600 bg-white border-2 border-success-200 shadow-sm',
        red: 'text-danger-600 bg-white border-2 border-danger-200 shadow-sm',
    };

    const trendStyles = {
        blue: 'text-primary-600 bg-primary-50 border border-primary-200',
        yellow: 'text-warning-600 bg-warning-50 border border-warning-200',
        green: 'text-success-600 bg-success-50 border border-success-200',
        red: 'text-danger-600 bg-danger-50 border border-danger-200',
    };

    return (
        <div className={`bg-gradient-to-br ${gradients[color]} border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 min-h-[130px]`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${iconStyles[color]}`}>
                    {icon}
                </div>
            </div>
            {trend && (
                <div className="mt-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${trendStyles[color]}`}>
                        {trend}
                    </span>
                </div>
            )}
        </div>
    );
}
