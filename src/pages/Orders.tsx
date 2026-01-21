import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useOrderStore } from '@/stores/orderStore';
import { db, Customer, OrderStatus } from '@/db/database';
import { orderStatusOptions } from '@/db/templates';
import { formatDate, formatDaysRemaining } from '@/utils/formatters';
import OrderFormModal from '@/components/forms/OrderFormModal';
import { Plus, ShoppingBag, Search, Calendar, Phone, Trash2 } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import Skeleton from '@/components/ui/Skeleton';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import toast from 'react-hot-toast';

export default function Orders() {
    const { t, i18n } = useTranslation();
    const isUrdu = i18n.language === 'ur';
    const {
        orders,
        loading,
        statusFilter,
        setStatusFilter,
        loadOrders,
        deleteOrder
    } = useOrderStore();

    // Alternatively load customers map if store doesn't provide easy access
    // But useCustomerStore has an array. Let's create a map for easier lookup if needed, 
    // or just rely on the store's data if it's already loaded.
    // For now, let's load customers to ensure we have names.
    const [customerMap, setCustomerMap] = useState<Record<number, Customer>>({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

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
        all.forEach((c: Customer) => { if (c.id) map[c.id] = c; });
        setCustomerMap(map);
    };

    // Solid color mapping for active states
    const statusConfig: Record<string, string> = {
        new: 'bg-blue-500',
        in_progress: 'bg-yellow-500',
        ready: 'bg-green-500',
        delivered: 'bg-gray-500',
        completed: 'bg-purple-500',
    };

    const [searchQuery, setSearchQuery] = useState('');

    // Filter by search query
    const filteredOrders = orders.filter(order => {
        const customer = customerMap[order.customerId];
        const searchLower = searchQuery.toLowerCase();

        return !searchQuery ||
            order.id?.toString().includes(searchLower) ||
            customer?.name.toLowerCase().includes(searchLower) ||
            customer?.phone.includes(searchLower);
    });

    const confirmDelete = async () => {
        if (deleteId) {
            await deleteOrder(deleteId);
            toast.success(t('common.deleteSuccess'));
            setDeleteId(null);
        }
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${statusFilter === 'all'
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    {t('common.all')}
                </button>
                {orderStatusOptions.map((option) => {
                    const isActive = statusFilter === option.value;
                    const solidColor = statusConfig[option.value] || 'bg-gray-500';

                    return (
                        <button
                            key={option.value}
                            onClick={() => setStatusFilter(option.value as OrderStatus)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${isActive
                                ? `${solidColor} text-white border-transparent`
                                : `bg-white text-gray-600 border-gray-200 hover:bg-gray-50`
                                }`}
                        >
                            {t(option.label)}
                        </button>
                    );
                })}
            </div>

            {/* Search - Grid wrapper to match other pages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex rounded-xl overflow-hidden border border-gray-200 border-b-4 border-b-gray-300 bg-white shadow-sm">
                    <div className="bg-gray-800 w-12 flex items-center justify-center shrink-0 border-b-4 border-b-gray-950">
                        <Search className="w-5 h-5 text-white" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('customers.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-3 bg-transparent outline-none border-0 ring-0 focus:outline-none focus:ring-0 focus:border-0 text-gray-900 placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Order List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card h-40 flex flex-col justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 card flex flex-col items-center">
                    <div className="transform scale-150 mb-4 opacity-50"><ShoppingBag className="w-24 h-24 text-gray-200" /></div>
                    <p className="text-gray-500 text-lg">{searchQuery ? t('common.noResults') : t('orders.noOrders')}</p>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary mt-4 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        {t('orders.addNew')}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredOrders.map((order) => {
                        const customer = customerMap[order.customerId];
                        const statusOption = orderStatusOptions.find((s) => s.value === order.status);
                        const isOverdue =
                            new Date(order.dueDate) < new Date() &&
                            !['completed', 'delivered'].includes(order.status);

                        const daysInfo = formatDaysRemaining(order.dueDate, isUrdu);

                        // Dark theme status colors
                        const darkStatusColors: Record<string, string> = {
                            new: 'bg-blue-500/20 text-blue-300',
                            in_progress: 'bg-yellow-500/20 text-yellow-300',
                            ready: 'bg-green-500/20 text-green-300',
                            delivered: 'bg-slate-600 text-slate-300',
                            completed: 'bg-purple-500/20 text-purple-300',
                        };

                        return (
                            <Link
                                key={order.id}
                                to={`/orders/${order.id}`}
                                className={`bg-slate-800 rounded-xl p-6 shadow-lg text-slate-200 border border-slate-700 flex flex-col justify-between h-full group hover:border-slate-600 transition-colors ${isOverdue ? 'ring-2 ring-red-500/30' : ''}`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-center pb-4 border-b border-slate-700 mb-4">
                                    <span className="font-bold text-lg text-white hover:text-blue-300 transition-colors truncate pr-2">
                                        {customer?.name || 'Unknown'}
                                    </span>
                                    <div className="text-xs bg-slate-700 px-2 py-1 rounded text-blue-300 shrink-0">
                                        #{order.id}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="space-y-2.5 mb-4 flex-1 text-sm">
                                    {/* Phone */}
                                    {customer && (
                                        <div className="flex items-center text-slate-300 gap-2">
                                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{customer.phone}</span>
                                        </div>
                                    )}

                                    {/* Order Date */}
                                    <div className="flex items-center text-slate-400 gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-slate-500">{t('orders.orderDate')}:</span>
                                        <span className="text-slate-300">{formatDate(order.createdAt)}</span>
                                    </div>

                                    {/* Due Date */}
                                    <div className="flex items-center text-slate-400 gap-2">
                                        <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-slate-500">{t('orders.dueDate')}:</span>
                                        <span className="text-slate-300">{formatDate(order.dueDate)}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${daysInfo.color.includes('red') ? 'bg-red-500/20 text-red-300' : daysInfo.color.includes('yellow') ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                                            {daysInfo.text}
                                        </span>
                                    </div>

                                    {/* Advance Payment */}
                                    {order.advancePayment && (
                                        <div className="flex items-center text-slate-400 gap-2">
                                            <span className="text-slate-500">{t('orders.advancePayment')}:</span>
                                            <span className="text-emerald-400 font-semibold">{order.advancePayment}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Footer - Status */}
                                <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${darkStatusColors[order.status] || 'bg-slate-600 text-slate-300'}`}>
                                        {t(statusOption?.label || '')}
                                    </span>
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
