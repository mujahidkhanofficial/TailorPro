import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db, Customer, Order, CustomerMeasurement } from '@/db/database';
import { formatDate, formatDaysRemaining } from '@/utils/formatters';
import { orderStatusOptions } from '@/db/templates';
import CustomerMeasurementForm from '@/components/forms/CustomerMeasurementForm';
import MeasurementPrint from '@/components/forms/MeasurementPrint';
import { ArrowLeft, Phone, MapPin } from 'lucide-react';

export default function CustomerDetail() {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const { t, i18n } = useTranslation();
    const isUrdu = i18n.language === 'ur';
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const initialTab = searchParams.get('tab') === 'orders' ? 'orders' : 'measurements';
    const [activeTab, setActiveTab] = useState<'orders' | 'measurements'>(initialTab);
    const [printData, setPrintData] = useState<CustomerMeasurement | null>(null);

    useEffect(() => {
        async function loadData() {
            if (!id) return;

            setLoading(true);
            const customerId = parseInt(id);
            const customerData = await db.customers.get(customerId);
            const orderData = await db.orders
                .where('customerId')
                .equals(customerId)
                .reverse()
                .sortBy('createdAt');

            setCustomer(customerData || null);
            setOrders(orderData);
            setLoading(false);
        }

        loadData();
    }, [id]);

    function handlePrint(measurement: CustomerMeasurement) {
        setPrintData(measurement);
    }

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">{t('common.loading')}</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">{t('common.noResults')}</p>
                <Link to="/customers" className="btn bg-gray-200 text-gray-700 border-b-4 border-gray-400 hover:bg-gray-300 active:border-b-0 active:mt-1 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                    {t('customers.title')}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link to="/customers" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg border-b-4 border-gray-400 hover:bg-gray-300 active:border-b-0 active:mt-1 transition-all text-sm font-medium">
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                {t('customers.title')}
            </Link>

            {/* Customer Info Card - Dark Slate Theme */}
            <div className="bg-slate-800 rounded-xl p-6 shadow-lg text-slate-200 border border-slate-700">
                {/* Header with Name and ID */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-700 mb-4">
                    <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
                    <div className="text-xs bg-slate-700 px-3 py-1.5 rounded text-blue-300 font-medium">
                        #{customer.id}
                    </div>
                </div>

                {/* Info Section */}
                <div className="space-y-3">
                    {/* Phone */}
                    <div className="flex items-center text-slate-300 gap-3">
                        <span className="p-2 bg-slate-700 rounded-full shrink-0">
                            <Phone className="w-4 h-4" />
                        </span>
                        <span className="text-lg">{customer.phone}</span>
                    </div>

                    {/* Address */}
                    {customer.address && (
                        <div className="flex items-center text-slate-300 gap-3">
                            <span className="p-2 bg-slate-700 rounded-full shrink-0">
                                <MapPin className="w-4 h-4" />
                            </span>
                            <span className="text-lg">{customer.address}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('measurements')}
                    className={`px-4 py-2 -mb-px font-medium text-sm border-b-2 transition-colors ${activeTab === 'measurements'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('measurements.title')}
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 -mb-px font-medium text-sm border-b-2 transition-colors ${activeTab === 'orders'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('customers.viewHistory')} ({orders.length})
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'measurements' && (
                <div className="card">
                    <CustomerMeasurementForm
                        customerId={customer.id!}
                        customerName={customer.name}
                        onPrint={handlePrint}
                    />
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">{t('customers.viewHistory')}</h2>
                        <Link
                            to={`/orders/create?customerId=${customer.id}`}
                            className="btn btn-primary text-sm"
                        >
                            + {t('orders.addNew')}
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">{t('orders.noOrders')}</p>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => {
                                const statusOption = orderStatusOptions.find((s) => s.value === order.status);
                                const daysInfo = formatDaysRemaining(order.dueDate, isUrdu);
                                return (
                                    <Link
                                        key={order.id}
                                        to={`/orders/${order.id}`}
                                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">Order #{order.id}</p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusOption?.color}`}>
                                                        {t(statusOption?.label || '')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {isUrdu ? 'تاریخ' : 'Created'}: {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <div className="text-end">
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {formatDate(order.dueDate)}
                                                </p>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${daysInfo.color}`}>
                                                    {daysInfo.text}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Print Modal */}
            {printData && customer && (
                <MeasurementPrint
                    customer={customer}
                    measurement={printData}
                    onClose={() => setPrintData(null)}
                    autoPrint={true}
                />
            )}
        </div>
    );
}
