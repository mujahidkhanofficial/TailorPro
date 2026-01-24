import { useState } from 'react';
import { db } from '@/db/database';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function usePrinter() {
    const { i18n } = useTranslation();
    const isUrdu = i18n.language === 'ur';

    const [isPrinting, setIsPrinting] = useState(false);

    const printSlip = async (htmlContent: string) => {
        setIsPrinting(true);
        const toastId = toast.loading(
            isUrdu ? 'پرنٹر چیک کیا جا رہا ہے...' : 'Checking printer...',
            { position: 'bottom-center' }
        );

        try {
            // 1. Check for Default Printer
            const settings = await db.settings.get(1);
            const defaultPrinter = settings?.defaultPrinter;

            if (defaultPrinter && window.electronAPI) {
                // 2. Direct Silent Print
                toast.loading(
                    isUrdu ? `پرنٹ ہو رہا ہے... (${defaultPrinter})` : `Printing to ${defaultPrinter}...`,
                    { id: toastId }
                );

                const result = await window.electronAPI.printSilent(htmlContent, defaultPrinter);

                if (result.success) {
                    toast.success(
                        isUrdu ? 'پرنٹ کامیابی سے بھیج دیا گیا' : 'Sent to printer successfully',
                        { id: toastId }
                    );
                } else {
                    throw new Error(result.error || 'Unknown print error');
                }
            } else {
                // 3. Fallback to Preview / System Dialog
                toast.loading(
                    isUrdu ? 'سسٹم ڈائیلاگ کھول رہا ہے...' : 'Opening system dialog...',
                    { id: toastId }
                );

                if (window.electronAPI) {
                    await window.electronAPI.printToPDF(htmlContent);
                    toast.dismiss(toastId);
                } else {
                    // Browser Fallback
                    const iframe = document.createElement('iframe');
                    iframe.style.position = 'fixed';
                    iframe.style.width = '0';
                    iframe.style.height = '0';
                    iframe.style.border = '0';
                    document.body.appendChild(iframe);

                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc) {
                        iframeDoc.open();
                        iframeDoc.write(htmlContent);
                        iframeDoc.close();
                        setTimeout(() => {
                            if (iframe.contentWindow) {
                                iframe.contentWindow.print();
                            }
                            document.body.removeChild(iframe);
                            toast.dismiss(toastId);
                        }, 500);
                    }
                }
            }
        } catch (error: any) {
            console.error('Print Error:', error);
            const errorMessage = error.message === 'Printer not found'
                ? (isUrdu ? 'منتخب کردہ پرنٹر نہیں ملا۔ براہ کرم settings چیک کریں۔' : 'Selected printer not found. Please check settings.')
                : (isUrdu ? 'پرنٹ کرنے میں ناکامی: ' + error.message : 'Print failed: ' + error.message);

            toast.error(errorMessage, { id: toastId, duration: 5000 });
        } finally {
            setIsPrinting(false);
        }
    };

    return { printSlip, isPrinting };
}
