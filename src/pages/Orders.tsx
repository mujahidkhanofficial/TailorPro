import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useOrderStore } from '@/stores/orderStore';
import { db, Customer, OrderStatus } from '@/db/database';
import { orderStatusOptions } from '@/db/templates';
import { formatDate } from '@/utils/formatters';
import OrderFormModal from '@/components/forms/OrderFormModal';
import { Plus, ShoppingBag, Users, AlertCircle } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import Skeleton from '@/components/ui/Skeleton';

export default function Orders() {
    const { t } = useTranslation();
    const {
        orders,
        loading,
        statusFilter,
        setStatusFilter,
        loadOrders
    } = useOrderStore();

    // Alternatively load customers map if store doesn't provide easy access
    // But useCustomerStore has an array. Let's create a map for easier lookup if needed, 
    // or just rely on the store's data if it's already loaded.
    // For now, let's load customers to ensure we have names.
    const [customerMap, setCustomerMap] = useState<Record<number, Customer>>({});

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadOrders();
        loadCustomersMap();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                setIsModalOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const loadCustomersMap = async () => {
        const all = await db.customers.toArray();
        const map: Record<number, Customer> = {};
        all.forEach(c => { if (c.id) map[c.id] = c; });
        setCustomerMap(map);
    };

    return (
        <PageTransition className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">{t('orders.title')}</h1>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {t('orders.addNew')}
                </button>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {t('common.all')}
                </button>
                {orderStatusOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value as OrderStatus)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === option.value
                            ? 'bg-gray-900 text-white'
                            : `${option.color} hover:opacity-80`
                            }`}
                    >
                        {t(option.label)}
                    </button>
                ))}
            </div>

            {/* Order List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card flex justify-between items-start">
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-20 rounded-full" />
                            </div>
                            <div className="text-end space-y-2">
                                <Skeleton className="h-4 w-20 ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 card flex flex-col items-center">
                    <div className="transform scale-150 mb-4 opacity-50"><ShoppingBag className="w-24 h-24 text-gray-200" /></div>
                    <p className="text-gray-500 text-lg">{t('orders.noOrders')}</p>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary mt-4 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        {t('orders.addNew')}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => {
                        const customer = customerMap[order.customerId];
                        const statusOption = orderStatusOptions.find((s) => s.value === order.status);
                        const isOverdue =
                            new Date(order.dueDate) < new Date() &&
                            !['completed', 'delivered'].includes(order.status);

                        return (
                            <Link
                                key={order.id}
                                to={`/orders/${order.id}`}
                                className={`block card hover:shadow-md transition-shadow group ${isOverdue ? 'border-red-300 bg-red-50' : ''
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-gray-900">
                                            {t(`garments.${order.garmentType}`)}
                                        </p>
                                        {customer && (
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                {customer.name} • {customer.phone}
                                            </p>
                                        )}
                                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${statusOption?.color}`}>
                                            {t(statusOption?.label || '')}
                                        </span>
                                    </div>
                                    <div className="text-end">
                                        <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                            {formatDate(order.dueDate)}
                                        </p>
                                        {isOverdue && (
                                            <span className="text-xs text-red-600 flex items-center gap-1 justify-end">
                                                <AlertCircle className="w-3 h-3" />
                                                Overdue
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <OrderFormModal onClose={() => setIsModalOpen(false)} />
            )}
        </PageTransition>
    );
}
