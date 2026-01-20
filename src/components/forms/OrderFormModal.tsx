import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrderStore } from '@/stores/orderStore';
import { db, Customer, GarmentType } from '@/db/database';
import { garmentTypeOptions, measurementTemplates } from '@/db/templates';
import { addDays, toInputDateFormat } from '@/utils/formatters';
import { Check, Plus } from 'lucide-react';
import CustomerFormModal from './CustomerFormModal';

interface OrderFormModalProps {
    onClose: () => void;
}

export default function OrderFormModal({ onClose }: OrderFormModalProps) {
    const { t } = useTranslation();
    const { addOrder } = useOrderStore();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [formData, setFormData] = useState({
        customerId: 0,
        garmentType: 'sherwani' as GarmentType,
        dueDate: toInputDateFormat(addDays(new Date(), 3)),
        advancePayment: '',
        deliveryNotes: '',
    });
    const [measurements, setMeasurements] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [customerSearch, setCustomerSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    // Escape key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        loadCustomers();
    }, []);

    async function loadCustomers() {
        const allCustomers = await db.customers.toArray();
        setCustomers(allCustomers);
    }

    const filteredCustomers = customers.filter(
        (c) =>
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            c.phone.includes(customerSearch)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};

        if (!formData.customerId) {
            newErrors.customerId = t('validation.required');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            // Create order
            const orderId = await addOrder({
                customerId: formData.customerId,
                garmentType: formData.garmentType,
                status: 'new',
                dueDate: new Date(formData.dueDate),
                advancePayment: formData.advancePayment || undefined,
                deliveryNotes: formData.deliveryNotes || undefined,
            });

            // Save measurements if any
            const hasAnyMeasurement = Object.values(measurements).some((v) => v.trim());
            if (hasAnyMeasurement) {
                await db.measurements.add({
                    orderId,
                    template: formData.garmentType,
                    fields: measurements,
                });
            }

            onClose();
        } catch (error) {
            console.error('Error creating order:', error);
        } finally {
            setIsSubmitting(false);
        }
    };


    const currentTemplate = measurementTemplates[formData.garmentType] || [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">{t('orders.addNew')}</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Customer Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('orders.selectCustomer')} *
                            </label>
                            {customers.length === 0 ? (
                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm mb-4 border border-yellow-200">
                                    <p className="font-medium mb-1">No customers found</p>
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomerModalOpen(true)}
                                        className="text-primary-600 font-medium hover:underline flex items-center gap-1 mt-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add New Customer
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    className="input mb-2"
                                    placeholder={t('customers.search')}
                                />
                            )}

                            {customerSearch && !formData.customerId && (
                                <div className="border rounded-lg max-h-40 overflow-y-auto mb-4">
                                    {filteredCustomers.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData((prev) => ({ ...prev, customerId: c.id! }));
                                                setCustomerSearch(c.name);
                                            }}
                                            className="w-full text-start p-3 hover:bg-gray-50 border-b last:border-b-0"
                                        >
                                            <p className="font-medium">{c.name}</p>
                                            <p className="text-sm text-gray-500">{c.phone}</p>
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setIsCustomerModalOpen(true)}
                                        className="w-full text-start p-3 hover:bg-primary-50 text-primary-600 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="font-medium">Create "{customerSearch}"</span>
                                    </button>
                                </div>
                            )}


                            {formData.customerId > 0 && (
                                <div className="p-3 bg-primary-50 rounded-lg flex justify-between items-center">
                                    <span className="font-medium flex items-center gap-2">
                                        <Check className="w-4 h-4 text-primary-600" />
                                        {customers.find((c) => c.id === formData.customerId)?.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, customerId: 0 }));
                                            setCustomerSearch('');
                                        }}
                                        className="text-sm text-gray-500 hover:text-red-500"
                                    >
                                        {t('common.change')}
                                    </button>
                                </div>
                            )}

                            {errors.customerId && (
                                <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>
                            )}
                        </div>

                        {/* Garment Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('orders.garmentType')}
                            </label>
                            <select
                                value={formData.garmentType}
                                onChange={(e) => {
                                    setFormData((prev) => ({ ...prev, garmentType: e.target.value as GarmentType }));
                                    setMeasurements({});
                                }}
                                className="input"
                            >
                                {garmentTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {t(option.label)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('orders.dueDate')}
                            </label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                                className="input"
                                dir="ltr"
                            />
                        </div>

                        {/* Measurements */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('measurements.title')}
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {currentTemplate.map((field) => (
                                    <div key={field}>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            {t(`measurements.${field}`)}
                                        </label>
                                        <input
                                            type="text"
                                            value={measurements[field] || ''}
                                            onChange={(e) =>
                                                setMeasurements((prev) => ({ ...prev, [field]: e.target.value }))
                                            }
                                            className="input text-sm"
                                            placeholder="—"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Advance Payment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('orders.advancePayment')}
                            </label>
                            <input
                                type="text"
                                value={formData.advancePayment}
                                onChange={(e) => setFormData((prev) => ({ ...prev, advancePayment: e.target.value }))}
                                className="input"
                                placeholder="Rs. 5000"
                            />
                        </div>

                        {/* Delivery Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('orders.deliveryNotes')}
                            </label>
                            <textarea
                                value={formData.deliveryNotes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, deliveryNotes: e.target.value }))}
                                className="input"
                                rows={2}
                                placeholder="Any special instructions..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-secondary flex-1">
                                {t('common.cancel')}
                            </button>
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                                {isSubmitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t('common.loading')}
                                    </>
                                ) : (
                                    t('common.save')
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {isCustomerModalOpen && (
                <CustomerFormModal
                    onClose={() => setIsCustomerModalOpen(false)}
                    onSuccess={async (newCustomerId) => {
                        await loadCustomers();
                        const newCustomer = await db.customers.get(newCustomerId);
                        if (newCustomer) {
                            setFormData((prev) => ({ ...prev, customerId: newCustomerId }));
                            setCustomerSearch(newCustomer.name);
                        }
                    }}
                />
            )}
        </div>
    );
}
