import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { db, CustomerMeasurement } from '@/db/database';
import { measurementFields, designOptions, collarNokOptions, banPattiOptions, cuffOptions, frontPocketOptions, sidePocketOptions, frontStripOptions, hemStyleOptions, shalwarFarmaishOptions } from '@/db/templates';
import { Save, Printer, RotateCcw, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useAutosave } from '@/hooks/useAutosave';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import toast from 'react-hot-toast';

interface CustomerMeasurementFormProps {
    customerId: number;
    customerName?: string; // Optional, for future use
    onPrint?: (measurement: CustomerMeasurement) => void;
    onPreview?: (measurement: CustomerMeasurement) => void;
}

export default function CustomerMeasurementForm({
    customerId,
    onPrint,
    onPreview
}: CustomerMeasurementFormProps) {
    const { i18n } = useTranslation();
    const isUrdu = i18n.language === 'ur';

    const [fields, setFields] = useState<Record<string, string>>({});
    const [options, setOptions] = useState<Record<string, boolean>>({});
    const [existingId, setExistingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Load existing measurements on mount
    useEffect(() => {
        loadMeasurements();
    }, [customerId]);

    async function loadMeasurements() {
        setLoading(true);
        try {
            const existing = await db.customerMeasurements
                .where('customerId')
                .equals(customerId)
                .first();

            if (existing) {
                setFields(existing.fields || {});
                setOptions(existing.designOptions || {});
                setExistingId(existing.id || null);
            } else {
                // Initialize empty fields
                const emptyFields: Record<string, string> = {};
                measurementFields.forEach((f) => (emptyFields[f.key] = ''));
                setFields(emptyFields);

                const emptyOptions: Record<string, boolean> = {};
                designOptions.forEach((o) => (emptyOptions[o.key] = false));
                setOptions(emptyOptions);
            }
        } catch (error) {
            console.error('Error loading measurements:', error);
        }
        setLoading(false);
    }

    const saveData = useCallback(async (data: { fields: Record<string, string>, options: Record<string, boolean> }) => {
        const now = new Date();
        try {
            if (existingId) {
                // Update existing
                await db.customerMeasurements.update(existingId, {
                    fields: data.fields,
                    designOptions: data.options,
                    updatedAt: now,
                });
            } else {
                // Create new
                const id = await db.customerMeasurements.add({
                    customerId,
                    fields: data.fields,
                    designOptions: data.options,
                    createdAt: now,
                    updatedAt: now,
                });
                setExistingId(id);
            }
        } catch (error) {
            console.error('Error saving measurements:', error);
            throw error;
        }
    }, [existingId, customerId]);

    const saveStatus = useAutosave({ fields, options }, saveData, 1000);

    function handleReset() {
        setShowResetConfirm(true);
    }

    function confirmReset() {
        const emptyFields: Record<string, string> = {};
        measurementFields.forEach((f) => (emptyFields[f.key] = ''));
        setFields(emptyFields);

        const emptyOptions: Record<string, boolean> = {};
        designOptions.forEach((o) => (emptyOptions[o.key] = false));
        setOptions(emptyOptions);
        setShowResetConfirm(false);
        toast.success(isUrdu ? 'ناپ صاف کر دیے گئے' : 'Measurements cleared successfully');
    }

    function handlePrint() {
        if (onPrint) {
            const measurement: CustomerMeasurement = {
                id: existingId || undefined,
                customerId,
                fields,
                designOptions: options,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            onPrint(measurement);
        }
    }

    function handlePreview() {
        console.log('Preview button clicked');
        if (onPreview) {
            console.log('Calling onPreview prop');
            const measurement: CustomerMeasurement = {
                id: existingId || undefined,
                customerId,
                fields,
                designOptions: options,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            onPreview(measurement);
        } else {
            console.error('onPreview prop is missing');
            toast.error('Preview feature not connected');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                    {isUrdu ? 'ناپ' : 'Measurements'}
                    {saveStatus === 'saving' && (
                        <span className="text-xs font-normal text-gray-500 flex items-center gap-1 animate-pulse bg-gray-100 px-2 py-1 rounded-full">
                            <Save className="w-3 h-3" /> {isUrdu ? 'محفوظ ہو رہا ہے...' : 'Saving...'}
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="text-xs font-normal text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> {isUrdu ? 'محفوظ' : 'Saved'}
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="text-xs font-normal text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3" /> {isUrdu ? 'خرابی' : 'Error'}
                        </span>
                    )}
                </h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="btn btn-danger text-sm flex items-center gap-1"
                    >
                        <RotateCcw className="w-4 h-4" />
                        {isUrdu ? 'ری سیٹ' : 'Reset'}
                    </button>
                    <button
                        type="button"
                        onClick={handlePreview}
                        className="btn btn-secondary text-sm flex items-center gap-2"
                        title={isUrdu ? 'پریویو' : 'Preview'}
                    >
                        <Eye className="w-4 h-4" />
                        {isUrdu ? 'پریویو' : 'Preview'}
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="btn btn-primary text-sm flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        {isUrdu ? 'پرنٹ' : 'Print'}
                    </button>
                </div>
            </div>

            {/* Measurement Fields & Dropdowns in Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {measurementFields.map((field) => (
                    <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {isUrdu ? field.labelUr : field.labelEn}
                        </label>
                        <input
                            type="text"
                            value={fields[field.key] || ''}
                            onChange={(e) =>
                                setFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                            }
                            className="input text-center text-lg font-semibold"
                            placeholder="—"
                            dir="ltr"
                        />
                    </div>
                ))}

                {/* Collar Nok Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        {isUrdu ? 'کالر نوک' : 'Collar Nok'}
                    </label>
                    <select
                        value={fields['collarNok'] || ''}
                        onChange={(e) => setFields((prev) => ({ ...prev, collarNok: e.target.value }))}
                        className="input w-full"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                    >
                        {collarNokOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {isUrdu ? opt.labelUr : opt.labelEn}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Ban Patti Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        {isUrdu ? 'بین پٹی' : 'Ban Patti'}
                    </label>
                    <select
                        value={fields['banPatti'] || ''}
                        onChange={(e) => setFields((prev) => ({ ...prev, banPatti: e.target.value }))}
                        className="input w-full"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                    >
                        {banPattiOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {isUrdu ? opt.labelUr : opt.labelEn}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Cuff Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        {isUrdu ? 'کف' : 'Cuff'}
                    </label>
                    <select
                        value={fields['cuff'] || ''}
                        onChange={(e) => setFields((prev) => ({ ...prev, cuff: e.target.value }))}
                        className="input w-full"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                    >
                        {cuffOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {isUrdu ? opt.labelUr : opt.labelEn}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Front Pocket Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        {isUrdu ? 'سامنے جیب' : 'Front Pocket'}
                    </label>
                    <select
                        value={fields['frontPocket'] || ''}
                        onChange={(e) => setFields((prev) => ({ ...prev, frontPocket: e.target.value }))}
                        className="input w-full"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                    >
                        {frontPocketOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {isUrdu ? opt.labelUr : opt.labelEn}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Side Pocket Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        {isUrdu ? 'سائیڈ جیب' : 'Side Pocket'}
                    </label>
                    <select
                        value={fields['sidePocket'] || ''}
                        onChange={(e) => setFields((prev) => ({ ...prev, sidePocket: e.target.value }))}
                        className="input w-full"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                    >
                        {sidePocketOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {isUrdu ? opt.labelUr : opt.labelEn}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Front Strip Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        {isUrdu ? 'سامنے کی پٹی' : 'Front Strip'}
                    </label>
                    <select
                        value={fields['frontStrip'] || ''}
                        onChange={(e) => setFields((prev) => ({ ...prev, frontStrip: e.target.value }))}
                        className="input w-full"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                    >
                        {frontStripOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {isUrdu ? opt.labelUr : opt.labelEn}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Hem Style Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        {isUrdu ? 'دامن' : 'Daman'}
                    </label>
                    <select
                        value={fields['hemStyle'] || ''}
                        onChange={(e) => setFields((prev) => ({ ...prev, hemStyle: e.target.value }))}
                        className="input w-full"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                    >
                        {hemStyleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {isUrdu ? opt.labelUr : opt.labelEn}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Shalwar Farmaish Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        {isUrdu ? 'شلوار فرمائش' : 'Shalwar Farmaish'}
                    </label>
                    <select
                        value={fields['shalwarFarmaish'] || ''}
                        onChange={(e) => setFields((prev) => ({ ...prev, shalwarFarmaish: e.target.value }))}
                        className="input w-full"
                        dir={isUrdu ? 'rtl' : 'ltr'}
                    >
                        {shalwarFarmaishOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {isUrdu ? opt.labelUr : opt.labelEn}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Shalwar Width Input - Keeping as it might be 'Ghera' separate from Shalwar Length */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                        {isUrdu ? 'شلوار چوڑائی' : 'Shalwar Width'}
                    </label>
                    <input
                        type="text"
                        value={fields['shalwarWidth'] || ''}
                        onChange={(e) => setFields((prev) => ({ ...prev, shalwarWidth: e.target.value }))}
                        className="input text-center text-lg font-semibold w-full"
                        placeholder="—"
                        dir="ltr"
                    />
                </div>
            </div>
            {/* Design Options (Checkboxes) */}
            <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">
                    {isUrdu ? 'فرمائش آپشنز' : 'Design Options'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {designOptions.map((option) => (
                        <label
                            key={option.key}
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${options[option.key]
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={options[option.key] || false}
                                onChange={(e) =>
                                    setOptions((prev) => ({ ...prev, [option.key]: e.target.checked }))
                                }
                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium">
                                {isUrdu ? option.labelUr : option.labelEn}
                            </span>
                        </label>
                    ))}
                </div>
            </div >

            <ConfirmationModal
                isOpen={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                onConfirm={confirmReset}
                title={isUrdu ? 'ری سیٹ کی تصدیق' : 'Reset Confirmation'}
                message={isUrdu ? 'کیا آپ واقعی تمام ناپ صاف کرنا چاہتے ہیں؟' : 'Are you sure you want to clear all measurements?'}
                confirmText={isUrdu ? 'ری سیٹ' : 'Reset'}
            />
        </div >
    );
}
