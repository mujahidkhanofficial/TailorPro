import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db, Customer, Order, Measurement, OrderStatus } from '@/db/database';
import { useOrderStore } from '@/stores/orderStore';
import { orderStatusOptions, measurementTemplates } from '@/db/templates';
import { formatDate } from '@/utils/formatters';
import { useAutosave } from '@/hooks/useAutosave';
import { Save, CheckCircle, AlertCircle } from 'lucide-react'; // For indicator icons

export default function OrderDetail() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { updateOrderStatus } = useOrderStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [measurement, setMeasurement] = useState<Measurement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        if (!id) return;

        setLoading(true);
        const orderId = parseInt(id);
        const orderData = await db.orders.get(orderId);

        if (orderData) {
            setOrder(orderData);
            const customerData = await db.customers.get(orderData.customerId);
            setCustomer(customerData || null);

            const measurementData = await db.measurements
                .where('orderId')
                .equals(orderId)
                .first();
            setMeasurement(measurementData || null);
        }

        setLoading(false);
    }

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!order?.id) return;
        await updateOrderStatus(order.id, newStatus);
        setOrder({ ...order, status: newStatus });
    };

    const saveMeasurements = useCallback(async (m: Measurement | null) => {
        if (!m || !order?.id) return;

        if (m.id) {
            await db.measurements.update(m.id, { fields: m.fields });
        } else {
            const newId = await db.measurements.add({
                orderId: order.id,
                template: m.template,
                fields: m.fields,
            });
            setMeasurement((prev) => (prev ? { ...prev, id: newId } : null));
        }
    }, [order?.id]);

    const saveStatus = useAutosave(measurement, saveMeasurements, 800);

    const handleMeasurementChange = (field: string, value: string) => {
        if (!order?.id) return;

        setMeasurement((prev) => {
            const currentFields = prev?.fields || {};
            const newFields = { ...currentFields, [field]: value };

            return {
                id: prev?.id,
                orderId: order.id!,
                template: order.garmentType,
                fields: newFields,
            };
        });
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">{t('common.loading')}</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">{t('common.noResults')}</p>
                <Link to="/orders" className="btn btn-primary mt-4">
                    ← {t('orders.title')}
                </Link>
            </div>
        );
    }

    const templateFields = measurementTemplates[order.garmentType] || [];
    const isOverdue =
        new Date(order.dueDate) < new Date() &&
        !['completed', 'delivered'].includes(order.status);

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link to="/orders" className="text-primary-600 hover:underline">
                ← {t('orders.title')}
            </Link>

            {/* Order Info */}
            <div className={`card ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t(`garments.${order.garmentType}`)}
                        </h1>
                        {customer && (
                            <Link
                                to={`/customers/${customer.id}`}
                                className="text-primary-600 hover:underline"
                            >
                                {customer.name} • {customer.phone}
                            </Link>
                        )}
                        <p className={`mt-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {t('orders.dueDate')}: {formatDate(order.dueDate)}
                            {isOverdue && ' ⚠️'}
                        </p>
                    </div>

                    {/* Status Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('orders.status')}
                        </label>
                        <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                            className="input"
                        >
                            {orderStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {t(option.label)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {order.advancePayment && (
                    <p className="mt-4 text-gray-600">
                        💰 {t('orders.advancePayment')}: {order.advancePayment}
                    </p>
                )}
                {order.deliveryNotes && (
                    <p className="mt-2 text-gray-600">
                        📝 {t('orders.deliveryNotes')}: {order.deliveryNotes}
                    </p>
                )}
            </div>

            {/* Status Timeline */}
            <div className="card">
                <h2 className="text-lg font-semibold mb-4">{t('orders.status')}</h2>
                <div className="flex flex-wrap gap-2">
                    {orderStatusOptions.map((option, index) => {
                        const currentIndex = orderStatusOptions.findIndex(
                            (o) => o.value === order.status
                        );
                        const isPast = index <= currentIndex;

                        return (
                            <div
                                key={option.value}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isPast ? option.color : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                <span className="text-sm font-medium">{t(option.label)}</span>
                                {index < orderStatusOptions.length - 1 && (
                                    <span className="text-gray-300">→</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Measurements */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-3">
                        {t('measurements.title')}
                        {saveStatus === 'saving' && (
                            <span className="text-xs font-normal text-gray-500 flex items-center gap-1 animate-pulse bg-gray-100 px-2 py-1 rounded-full">
                                <Save className="w-3 h-3" /> {t('common.saving') || 'Saving...'}
                            </span>
                        )}
                        {saveStatus === 'saved' && (
                            <span className="text-xs font-normal text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3" /> {t('common.saved') || 'Saved'}
                            </span>
                        )}
                        {saveStatus === 'error' && (
                            <span className="text-xs font-normal text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                                <AlertCircle className="w-3 h-3" /> Error
                            </span>
                        )}
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {templateFields.map((field) => (
                        <div key={field}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t(`measurements.${field}`)}
                            </label>
                            <input
                                type="text"
                                value={measurement?.fields[field] || ''}
                                onChange={(e) => handleMeasurementChange(field, e.target.value)}
                                className="input"
                                placeholder="—"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
