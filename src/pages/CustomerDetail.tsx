import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db, Customer, Order, CustomerMeasurement } from '@/db/database';
import { formatDate } from '@/utils/formatters';
import { orderStatusOptions } from '@/db/templates';
import CustomerMeasurementForm from '@/components/forms/CustomerMeasurementForm';
import MeasurementPrint from '@/components/forms/MeasurementPrint';

export default function CustomerDetail() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'measurements'>('measurements');
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
                <Link to="/customers" className="btn btn-primary mt-4">
                    ← {t('customers.title')}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link to="/customers" className="text-primary-600 hover:underline">
                ← {t('customers.title')}
            </Link>

            {/* Customer Info Card */}
            <div className="card">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold shrink-0">
                        {customer.photo ? (
                            <img
                                src={customer.photo}
                                alt={customer.name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            customer.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                        <p className="text-lg text-gray-600">{customer.phone}</p>
                        {customer.address && (
                            <p className="text-gray-400 mt-1">{customer.address}</p>
                        )}
                        <p className="text-sm text-gray-400 mt-2">
                            Customer ID: <span className="font-mono font-bold">{customer.id}</span>
                        </p>
                    </div>
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
                            to={`/orders?customer=${customer.id}`}
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
                                return (
                                    <Link
                                        key={order.id}
                                        to={`/orders/${order.id}`}
                                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{t(`garments.${order.garmentType}`)}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${statusOption?.color}`}>
                                                    {t(statusOption?.label || '')}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {formatDate(order.dueDate)}
                                            </span>
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
                />
            )}
        </div>
    );
}
