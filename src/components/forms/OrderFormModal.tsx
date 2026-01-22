import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrderStore } from '@/stores/orderStore';
import { db, Customer, Worker } from '@/db/database';
import { addDays, toInputDateFormat } from '@/utils/formatters';
import { Check, Plus, Calendar } from 'lucide-react';
import CustomerFormModal from './CustomerFormModal';

interface OrderFormModalProps {
    onClose: () => void;
}

export default function OrderFormModal({ onClose }: OrderFormModalProps) {
    const { t } = useTranslation();
    const { addOrder } = useOrderStore();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [activeWorkers, setActiveWorkers] = useState<Worker[]>([]);
    const [formData, setFormData] = useState({
        customerId: 0,
        dueDate: toInputDateFormat(addDays(new Date(), 3)),
        advancePayment: '',
        deliveryNotes: '',
        cutterId: 0,
        checkerId: 0,
        karigarId: 0,
    });
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

        const allWorkers = await db.workers.toArray();
        const activeWorkers = allWorkers.filter(w => w.isActive);
        setActiveWorkers(activeWorkers);
    }

    const filteredCustomers = customers.filter(
        (c) =>
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            c.phone.includes(customerSearch)
    );

    // Get selected customer info
    const selectedCustomer = customers.find((c) => c.id === formData.customerId);

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
            // Create order (no garmentType anymore)
            await addOrder({
                customerId: formData.customerId,
                status: 'new',
                dueDate: new Date(formData.dueDate),
                advancePayment: formData.advancePayment || undefined,
                deliveryNotes: formData.deliveryNotes || undefined,
                cutterId: formData.cutterId || undefined,
                checkerId: formData.checkerId || undefined,
                karigarId: formData.karigarId || undefined,
            });

            onClose();
        } catch (error) {
            console.error('Error creating order:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">{t('orders.addNew')}</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Customer Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('orders.selectCustomer')} *
                            </label>
                            {customers.length === 0 ? (
                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm mb-4 border border-yellow-200">
                                    <p className="font-medium mb-1">{t('customers.noCustomersFound')}</p>
                                    <button
                                        type="button"
                                        onClick={() => setIsCustomerModalOpen(true)}
                                        className="text-primary-600 font-medium hover:underline flex items-center gap-1 mt-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t('customers.addNewButton')}
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
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{c.name}</p>
                                                    <p className="text-sm text-gray-500">{c.phone}</p>
                                                </div>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                    ID: {c.id}
                                                </span>
                                            </div>
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setIsCustomerModalOpen(true)}
                                        className="w-full text-start p-3 hover:bg-primary-50 text-primary-600 flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="font-medium">{t('customers.createWithName', { name: customerSearch })}</span>
                                    </button>
                                </div>
                            )}


                            {formData.customerId > 0 && selectedCustomer && (
                                <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-primary-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                                                <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded font-medium">
                                                ID: {selectedCustomer.id}
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
                                    </div>
                                </div>
                            )}

                            {errors.customerId && (
                                <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>
                            )}
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar className="w-4 h-4 inline-block me-1" />
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
                                placeholder={t('orders.paymentPlaceholder')}
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
                                placeholder={t('orders.notesPlaceholder')}
                            />
                        </div>

                        {/* Worker Assignment Section */}
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('workers.assignment')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Cutter */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {t('workers.cutter')}
                                    </label>
                                    <select
                                        value={formData.cutterId || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cutterId: Number(e.target.value) || 0 }))}
                                        className="input text-sm py-1.5"
                                    >
                                        <option value="">{t('common.select')}</option>
                                        {activeWorkers.filter(w => w.role === 'cutter').map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Checker */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {t('workers.checker')}
                                    </label>
                                    <select
                                        value={formData.checkerId || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, checkerId: Number(e.target.value) || 0 }))}
                                        className="input text-sm py-1.5"
                                    >
                                        <option value="">{t('common.select')}</option>
                                        {activeWorkers.filter(w => w.role === 'checker').map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Karigar */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {t('workers.karigar')}
                                    </label>
                                    <select
                                        value={formData.karigarId || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, karigarId: Number(e.target.value) || 0 }))}
                                        className="input text-sm py-1.5"
                                    >
                                        <option value="">{t('common.select')}</option>
                                        {activeWorkers.filter(w => w.role === 'karigar').map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
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
