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
    shalwarFarmaishOptions,
    designOptions
} from '@/db/templates';
import MeasurementPrint from '@/components/forms/MeasurementPrint';
import { formatDate, formatDaysRemaining } from '@/utils/formatters';
import { generateMeasurementSlipHTML } from '@/utils/printHelpers';
import { usePrinter } from '@/hooks/usePrinter';
import { Calendar, User, Phone, FileText, Banknote, ArrowRight, ArrowLeft, Scissors, Check, Printer, Eye } from 'lucide-react';

export default function OrderDetail() {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const isUrdu = i18n.language === 'ur';
    const { updateOrderStatus } = useOrderStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [customerMeasurement, setCustomerMeasurement] = useState<CustomerMeasurement | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const { printSlip, isPrinting } = usePrinter();

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

    const handleDirectPrint = async () => {
        if (!order || !customer || !customerMeasurement) return;

        const settings = await db.settings.get(1);

        // Fetch worker names
        const cutter = order.cutterId ? await db.workers.get(order.cutterId) : undefined;
        const checker = order.checkerId ? await db.workers.get(order.checkerId) : undefined;
        const karigar = order.karigarId ? await db.workers.get(order.karigarId) : undefined;

        const workerNames = {
            cutter: cutter?.name,
            checker: checker?.name,
            karigar: karigar?.name
        };

        const html = generateMeasurementSlipHTML(customer, customerMeasurement, settings, workerNames, order);
        await printSlip(html);
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
            hemStyle: { en: 'Daman', ur: 'دامن' },
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
        <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0">
            {/* Back Link */}
            <div className="flex justify-start">
                <Link to="/orders" className="btn btn-secondary inline-flex items-center justify-center w-10 h-10 p-0 rounded-full shadow-sm hover:shadow-md transition-all">
                    {isUrdu ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Order Info & Status */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Header Card - Dark Slate Theme */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                        {/* Dark Header */}
                        <div className="bg-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    {t('orders.title')} #{order.id}
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isOverdue ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                        {daysInfo.text}
                                    </span>
                                </h1>
                                <div className="flex items-center gap-4 mt-2 text-slate-300 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(order.createdAt)}
                                    </span>
                                    {isUrdu ? <span>|</span> : <span>•</span>}
                                    <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-300 font-bold' : ''}`}>
                                        {t('orders.dueDate')}: {formatDate(order.dueDate)}
                                    </span>
                                </div>
                            </div>

                        </div>

                        <div className="flex items-center gap-3">
                            {/* Print Button */}
                            {/* Preview Button */}
                            <button
                                onClick={() => setShowPrintModal(true)}
                                className="btn btn-secondary px-3 py-2 text-sm flex items-center gap-2 shadow-sm"
                                title={isUrdu ? 'پیش نظارہ' : 'Preview'}
                            >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">{isUrdu ? 'پیش نظارہ' : 'Preview'}</span>
                            </button>

                            {/* Direct Print Button */}
                            <button
                                onClick={handleDirectPrint}
                                disabled={isPrinting}
                                className="btn btn-primary px-3 py-2 text-sm flex items-center gap-2 shadow-sm"
                                title={isUrdu ? 'پرنٹ کریں' : 'Print Slip'}
                            >
                                <Printer className="w-4 h-4" />
                                <span className="hidden sm:inline">{isUrdu ? 'پرنٹ سلپ' : 'Print Slip'}</span>
                            </button>

                            {/* Status Selector */}
                            <div className="w-full md:w-auto">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                                    className="w-full md:w-48 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                >
                                    {orderStatusOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {t(option.label)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6">
                            {/* Customer Info Row */}
                            {customer && (
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <Link
                                                to={`/customers/${customer.id}`}
                                                className="text-lg font-bold text-slate-900 hover:text-primary-600 transition-colors block"
                                            >
                                                {customer.name}
                                            </Link>
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {customer.phone}
                                                </span>
                                                <span className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 text-xs shadow-sm">
                                                    ID: {customer.id}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/customers/${customer.id}`}
                                        className="btn btn-secondary py-1.5 px-4 text-xs shadow-sm flex items-center gap-1"
                                    >
                                        {isUrdu ? 'پروفائل دیکھیں' : 'View Profile'}
                                        {isUrdu ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                                    </Link>
                                </div>
                            )}

                            {/* Payment & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {order.advancePayment && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                            <Banknote className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-emerald-600 font-medium">{t('orders.advancePayment')}</p>
                                            <p className="text-lg font-bold text-emerald-900">{order.advancePayment}</p>
                                        </div>
                                    </div>
                                )}
                                {order.deliveryNotes && (
                                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg col-span-1 md:col-span-2">
                                        <p className="text-xs text-amber-600 font-medium mb-1 flex items-center gap-1">
                                            <FileText className="w-3 h-3" /> {t('orders.deliveryNotes')}
                                        </p>
                                        <p className="text-sm text-amber-900">{order.deliveryNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            {t('orders.status')}
                        </h3>

                        {/* Stepper Container */}
                        <div className="relative w-full">
                            {/* Background Line (centered in 5 cols: 10% offset start, 80% total width) */}
                            <div className="absolute top-4 left-[10%] w-[80%] h-1 bg-slate-100 -z-10 rounded-full" />

                            {/* Progress Line */}
                            <div
                                className="absolute top-4 left-[10%] h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
                                style={{
                                    width: `${(Math.max(0, orderStatusOptions.findIndex(o => o.value === order.status)) / (orderStatusOptions.length - 1)) * 80}%`
                                }}
                            />

                            <div className="grid grid-cols-5 text-center">
                                {orderStatusOptions.map((option, index) => {
                                    const currentIndex = orderStatusOptions.findIndex(o => o.value === order.status);
                                    const isCompleted = index < currentIndex;
                                    const isCurrent = index === currentIndex;

                                    return (
                                        <div
                                            key={option.value}
                                            className="flex flex-col items-center gap-3 cursor-pointer group"
                                            onClick={() => handleStatusChange(option.value as OrderStatus)}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${isCurrent ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_0_4px_rgba(16,185,129,0.2)] scale-110' :
                                                isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                                                    'bg-white border-slate-200 text-slate-300 group-hover:border-slate-300'
                                                }`}>
                                                {isCompleted ? (
                                                    <Check className="w-5 h-5" />
                                                ) : isCurrent ? (
                                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                                                ) : (
                                                    <div className="w-2.5 h-2.5 bg-slate-300 rounded-full group-hover:bg-slate-400" />
                                                )}
                                            </div>
                                            <span className={`text-xs font-semibold px-2 transition-colors duration-300 ${isCurrent ? 'text-emerald-700' :
                                                isCompleted ? 'text-emerald-600' :
                                                    'text-slate-400'
                                                }`}>
                                                {t(option.label)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Design Options (Farmaish) */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-emerald-600" />
                            {isUrdu ? 'فرمائش آپشنز' : 'Design Options (Farmaish)'}
                        </h3>
                        {customerMeasurement && customerMeasurement.designOptions && Object.keys(customerMeasurement.designOptions).some(k => customerMeasurement.designOptions[k]) ? (
                            <div className="flex flex-wrap gap-2">
                                {designOptions.map((option) => {
                                    const isSelected = customerMeasurement.designOptions[option.key];
                                    if (!isSelected) return null;
                                    return (
                                        <span
                                            key={option.key}
                                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100"
                                        >
                                            {isUrdu ? option.labelUr : option.labelEn}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm italic">
                                {isUrdu ? 'کوئی آپشن منتخب نہیں' : 'No design options selected'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column: Measurements */}
                <div>
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden sticky top-6">
                        {/* Header */}
                        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-400" />
                                {isUrdu ? 'گاہک کی ناپ' : "Measurements"}
                            </h2>
                            {customer && (
                                <Link
                                    to={`/customers/${customer.id}`}
                                    className="btn btn-primary py-1.5 px-3 text-xs flex items-center gap-1 shadow-sm"
                                >
                                    {isUrdu ? 'تبدیل کریں' : 'Edit'}
                                    {isUrdu ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                                </Link>
                            )}
                        </div>

                        <div className="p-6">
                            {customerMeasurement && Object.keys(customerMeasurement.fields).length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(customerMeasurement.fields).map(([key, value]) => (
                                        value && (
                                            <div key={key} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100 hover:border-emerald-200 transition-colors">
                                                <p className="text-xs text-slate-500 mb-1">{getFieldLabel(key)}</p>
                                                <p className="text-lg font-bold text-slate-800">{getFieldValue(key, value)}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm mb-4">
                                        {isUrdu ? 'کوئی ناپ نہیں' : 'No measurements'}
                                    </p>
                                    {customer && (
                                        <Link
                                            to={`/customers/${customer.id}`}
                                            className="btn btn-primary text-sm inline-flex items-center gap-2"
                                        >
                                            {isUrdu ? 'ناپ شامل کریں' : 'Add'}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Modal */}
            {showPrintModal && customer && customerMeasurement && order && (
                <MeasurementPrint
                    customer={customer}
                    measurement={customerMeasurement}
                    order={order}
                    onClose={() => setShowPrintModal(false)}
                    autoPrint={true}
                />
            )}
        </div>
    );
}
