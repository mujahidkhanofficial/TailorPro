import { CustomerMeasurement, Customer, db, Settings } from '@/db/database';
import { X, Printer } from 'lucide-react';
import { generateMeasurementSlipHTML } from '@/utils/printHelpers';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface MeasurementPrintProps {
    customer: Customer;
    measurement: CustomerMeasurement;
    onClose: () => void;
}

export default function MeasurementPrint({
    customer,
    measurement,
    onClose,
}: MeasurementPrintProps) {
    const [isPrinting, setIsPrinting] = useState(false);
    const [settings, setSettings] = useState<Settings | undefined>(undefined);

    useEffect(() => {
        const loadSettings = async () => {
            const savedSettings = await db.settings.get(1);
            setSettings(savedSettings);
        };
        loadSettings();
    }, []);

    const handlePrint = async () => {
        setIsPrinting(true);
        try {
            const html = generateMeasurementSlipHTML(customer, measurement, settings);

            if (window.electronAPI && window.electronAPI.printToPDF) {
                const result = await window.electronAPI.printToPDF(html);
                if (result.success) {
                    toast.success('PDF Generated Successfully');
                } else {
                    if (result.error !== 'Cancelled') {
                        toast.error('Failed to generate PDF: ' + result.error);
                    }
                }
            } else {
                // Browser Fallback using hidden iframe
                const iframe = document.createElement('iframe');
                // Use visibility hidden instead of display none so it renders for print
                iframe.style.position = 'fixed';
                iframe.style.right = '0';
                iframe.style.bottom = '0';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                document.body.appendChild(iframe);

                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    iframeDoc.open();
                    iframeDoc.write(html);
                    iframeDoc.close();

                    // Small delay to ensure content is rendered before printing
                    setTimeout(() => {
                        if (iframe.contentWindow) {
                            iframe.contentWindow.focus();
                            iframe.contentWindow.print();
                        }
                        // Cleanup
                        setTimeout(() => {
                            if (document.body.contains(iframe)) {
                                document.body.removeChild(iframe);
                            }
                        }, 1000);
                    }, 500);
                } else {
                    toast.error('Printing failed in this environment');
                }
            }
        } catch (error) {
            console.error('Print Error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <>
            {/* Modal Overlay */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-bold">پرنٹ پرچی</h3>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Printer className="w-8 h-8 text-primary-600" />
                        </div>
                        <p className="text-gray-600 mb-2 font-urdu">PDF تیار کریں</p>
                        <p className="text-sm text-gray-400 font-urdu">
                            {customer.name} - کسٹمر نمبر {customer.id}
                        </p>
                    </div>
                    <div className="p-4 border-t space-y-2">
                        <button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isPrinting ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            ) : (
                                <Printer className="w-5 h-5" />
                            )}
                            <span className="font-urdu">{isPrinting ? 'PDF بن رہا ہے...' : 'PDF بنائیں'}</span>
                        </button>
                        <button onClick={onClose} className="btn btn-secondary w-full font-urdu">
                            بند کریں
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
