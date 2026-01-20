import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomerStore } from '@/stores/customerStore';
import { Customer } from '@/db/database';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomerFormModalProps {
    customer?: Customer | null;
    onClose: () => void;
    onSuccess?: (customerId: number) => void;
}

export default function CustomerFormModal({ customer, onClose, onSuccess }: CustomerFormModalProps) {
    const { t } = useTranslation();
    const { addCustomer, updateCustomer } = useCustomerStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: customer?.name || '',
        phone: customer?.phone || '',
        address: customer?.address || '',
        photo: customer?.photo || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Escape key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);


    const validatePhone = (phone: string): boolean => {
        // Pakistani phone format: 03XX-XXXXXXX or landline
        const mobilePattern = /^03\d{2}-?\d{7}$/;
        const landlinePattern = /^0\d{2,3}-?\d{6,7}$/;
        return mobilePattern.test(phone) || landlinePattern.test(phone);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('validation.required');
        }

        if (!formData.phone.trim()) {
            newErrors.phone = t('validation.required');
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = t('validation.invalidPhone');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            if (customer?.id) {
                await updateCustomer(customer.id, formData);
                if (onSuccess) onSuccess(customer.id);
            } else {
                const newId = await addCustomer(formData);
                if (onSuccess) onSuccess(newId);
            }
            onClose();
        } catch (error) {
            console.error('Error saving customer:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit to 500KB
        if (file.size > 500000) {
            toast.error('Photo must be less than 500KB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setFormData((prev) => ({
                ...prev,
                photo: event.target?.result as string,
            }));
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">
                        {customer ? t('common.edit') : t('customers.addNew')}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Photo */}
                        <div className="text-center">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 mx-auto rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden"
                            >

                                {formData.photo ? (
                                    <img
                                        src={formData.photo}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Camera className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                            <p className="text-xs text-gray-500 mt-2">{t('customers.photo')} (optional)</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('customers.name')} *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                className={`input ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="Muhammad Ali"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('customers.phone')} *
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                                className={`input ${errors.phone ? 'border-red-500' : ''}`}
                                placeholder="03XX-XXXXXXX"
                                dir="ltr"
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('customers.address')}
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                                className="input"
                                rows={2}
                                placeholder="Shop address..."
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
        </div>
    );
}
