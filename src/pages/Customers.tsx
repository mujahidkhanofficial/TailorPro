import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCustomerStore } from '@/stores/customerStore';
import { Customer } from '@/db/database';
import CustomerFormModal from '@/components/forms/CustomerFormModal';
import { Plus, Search, Users, History, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import PageTransition from '@/components/ui/PageTransition';
import Skeleton from '@/components/ui/Skeleton';

export default function Customers() {
    const { t } = useTranslation();
    const { customers, loading, searchQuery, loadCustomers, setSearchQuery, deleteCustomer } = useCustomerStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

    useEffect(() => {
        loadCustomers();

        const handleKeyDown = (e: KeyboardEvent) => {
            // New Customer: Ctrl + N
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                handleAddNew();
            }
            // Focus Search: Ctrl + K
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                document.getElementById('customer-search')?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const [localSearch, setLocalSearch] = useState(searchQuery);

    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(localSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearch, setSearchQuery]);

    const handleAddNew = () => {
        setEditingCustomer(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        toast((t_toast) => (
            <div className="flex items-center gap-3">
                <span>{t('common.confirmDelete')}</span>
                <button
                    onClick={async () => {
                        toast.dismiss(t_toast.id);
                        await deleteCustomer(id);
                        toast.success(t('common.deleteSuccess'));
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                >
                    {t('common.delete')}
                </button>
                <button
                    onClick={() => toast.dismiss(t_toast.id)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                    {t('common.cancel')}
                </button>
            </div>
        ), { duration: 10000 });
    };

    return (
        <PageTransition className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">{t('customers.title')}</h1>
                <button onClick={handleAddNew} className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {t('customers.addNew')}
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    id="customer-search"
                    type="text"
                    placeholder={t('customers.search')}
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="input ps-10"
                />
                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5" />
                </span>
            </div>

            {/* Customer List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card flex items-start gap-4">
                            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : customers.length === 0 ? (
                <div className="text-center py-12 card flex flex-col items-center">
                    <div className="transform scale-150 mb-4 opacity-50"><Users className="w-24 h-24 text-gray-200" /></div>
                    <p className="text-gray-500 text-lg">{t('customers.noCustomers')}</p>
                    <button onClick={handleAddNew} className="btn btn-primary mt-4 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        {t('customers.addNew')}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customers.map((customer) => (
                        <div key={customer.id} className="card hover:shadow-md transition-shadow group">
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0 overflow-hidden border border-primary-100">
                                    {customer.photo ? (
                                        <img
                                            src={customer.photo}
                                            alt={customer.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Users className="w-6 h-6 opacity-80" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                                    <p className="text-sm text-gray-600">{customer.phone}</p>
                                    {customer.address && (
                                        <p className="text-sm text-gray-400 truncate">{customer.address}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                                <Link
                                    to={`/customers/${customer.id}`}
                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    title={t('customers.viewHistory')}
                                >
                                    <History className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => handleEdit(customer)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title={t('common.edit')}
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(customer.id!)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title={t('common.delete')}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <CustomerFormModal
                    customer={editingCustomer}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </PageTransition>
    );
}
