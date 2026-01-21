import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db, Customer, Order, CustomerMeasurement, OrderStatus } from '@/db/database';
import { useOrderStore } from '@/stores/orderStore';
import {
    orderStatusOptions,
    measurementFields,
    collarNokOptions,
    banPattiOptions,
    cuffOptions,
    frontPocketOptions,
    sidePocketOptions,
    frontStripOptions,
    hemStyleOptions,
    shalwarFarmaishOptions
} from '@/db/templates';
import { formatDate, formatDaysRemaining } from '@/utils/formatters';
import { Calendar, User, Phone, FileText, Banknote } from 'lucide-react';

export default function OrderDetail() {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const isUrdu = i18n.language === 'ur';
    const { updateOrderStatus } = useOrderStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [customerMeasurement, setCustomerMeasurement] = useState<CustomerMeasurement | null>(null);
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

            // Load customer measurements (not order measurements)
            if (customerData?.id) {
                const measurement = await db.customerMeasurements
                    .where('customerId')
                    .equals(customerData.id)
                    .first();
                setCustomerMeasurement(measurement || null);
            }
        }

        setLoading(false);
    }

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!order?.id) return;
        await updateOrderStatus(order.id, newStatus);
        setOrder({ ...order, status: newStatus });
    };

    // Helper to get translated field label
    const getFieldLabel = (key: string) => {
        // Check standard fields
        const field = measurementFields.find(f => f.key === key);
        if (field) return isUrdu ? field.labelUr : field.labelEn;

        // Check custom fields
        const customLabels: Record<string, { en: string; ur: string }> = {
            collarNok: { en: 'Collar Nok', ur: 'کالر نوک' },
            banPatti: { en: 'Ban Patti', ur: 'بین پٹی' },
            cuff: { en: 'Cuff', ur: 'کف' },
            frontPocket: { en: 'Front Pocket', ur: 'سامنے جیب' },
            sidePocket: { en: 'Side Pocket', ur: 'سائیڈ جیب' },
            frontStrip: { en: 'Front Strip', ur: 'سامنے کی پٹی' },
            hemStyle: { en: 'Hem Style', ur: 'دامن' },
            shalwarFarmaish: { en: 'Shalwar Farmaish', ur: 'شلوار فرمائش' },
            shalwarWidth: { en: 'Shalwar Width', ur: 'شلوار چوڑائی' },
            aasan: { en: 'Aasan', ur: 'آسن' },
            bazuCenter: { en: 'Bazu Center', ur: 'بازو سینٹر' },
        };

        if (customLabels[key]) {
            return isUrdu ? customLabels[key].ur : customLabels[key].en;
        }

        // Fallback to translation key or raw key
        return t(`measurements.${key}`) !== `measurements.${key}` ? t(`measurements.${key}`) : key;
    };

    // Helper to get translated value for dropdowns
    const getFieldValue = (key: string, value: string) => {
        let options: { value: string; labelEn: string; labelUr: string }[] = [];

        switch (key) {
            case 'collarNok': options = collarNokOptions; break;
            case 'banPatti': options = banPattiOptions; break;
            case 'cuff': options = cuffOptions; break;
            case 'frontPocket': options = frontPocketOptions; break;
            case 'sidePocket': options = sidePocketOptions; break;
            case 'frontStrip': options = frontStripOptions; break;
            case 'hemStyle': options = hemStyleOptions; break;
            case 'shalwarFarmaish': options = shalwarFarmaishOptions; break;
        }

        if (options.length > 0) {
            const opt = options.find(o => o.value === value);
            if (opt) return isUrdu ? opt.labelUr : opt.labelEn;
        }

        return value;
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

    const daysInfo = formatDaysRemaining(order.dueDate, isUrdu);
    const isOverdue = daysInfo.color.includes('red');

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link to="/orders" className="text-primary-600 hover:underline">
                ← {t('orders.title')}
            </Link>

            {/* Order Header Card */}
            <div className={`card ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-3">
                        {/* Customer Info */}
                        {customer && (
                            <div>
                                <Link
                                    to={`/customers/${customer.id}`}
                                    className="text-2xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
                                >
                                    {customer.name}
                                </Link>
                                <div className="flex items-center gap-4 mt-1 text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        {customer.phone}
                                    </span>
                                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                                        ID: {customer.id}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Order Info */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-lg flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                Order #{order.id}
                            </span>
                            <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-lg flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(order.createdAt)}
                            </span>
                        </div>

                        {/* Due Date with Days Remaining */}
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                                {t('orders.dueDate')}: {formatDate(order.dueDate)}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${daysInfo.color}`}>
                                {daysInfo.text}
                            </span>
                        </div>
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

                {/* Payment & Notes */}
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    {order.advancePayment && (
                        <p className="text-gray-600 flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-green-600" />
                            {t('orders.advancePayment')}: <span className="font-medium">{order.advancePayment}</span>
                        </p>
                    )}
                    {order.deliveryNotes && (
                        <p className="text-gray-600 flex items-center gap-2">
                            📝 {t('orders.deliveryNotes')}: {order.deliveryNotes}
                        </p>
                    )}
                </div>
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

            {/* Customer Measurements (Read-Only View) */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-600" />
                        {isUrdu ? 'گاہک کی ناپ' : "Customer's Measurements"}
                    </h2>
                    {customer && (
                        <Link
                            to={`/customers/${customer.id}`}
                            className="text-sm text-primary-600 hover:underline"
                        >
                            {isUrdu ? 'ناپ تبدیل کریں' : 'Edit Measurements'} →
                        </Link>
                    )}
                </div>

                {customerMeasurement && Object.keys(customerMeasurement.fields).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {Object.entries(customerMeasurement.fields).map(([key, value]) => (
                            value && (
                                <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500 mb-1">{getFieldLabel(key)}</p>
                                    <p className="text-lg font-semibold text-gray-900">{getFieldValue(key, value)}</p>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                            {isUrdu ? 'ابھی تک کوئی ناپ نہیں' : 'No measurements saved yet'}
                        </p>
                        {customer && (
                            <Link
                                to={`/customers/${customer.id}`}
                                className="btn btn-primary mt-3 inline-flex items-center gap-2"
                            >
                                {isUrdu ? 'ناپ شامل کریں' : 'Add Measurements'}
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
