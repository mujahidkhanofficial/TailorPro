import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { db, Customer, Order, CustomerMeasurement } from '@/db/database';
import PageTransition from '@/components/ui/PageTransition';
import { Upload, AlertTriangle, Download, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Backup() {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const backup = JSON.parse(text);

            if (!backup.data || !backup.data.customers || !backup.data.orders) {
                throw new Error('Invalid backup file');
            }

            await db.transaction('rw', db.customers, db.orders, db.measurements, db.customerMeasurements, async () => {
                await db.customers.bulkPut(backup.data.customers);
                await db.orders.bulkPut(backup.data.orders);
                // Support both legacy and new measurement tables
                if (backup.data.customerMeasurements) {
                    await db.customerMeasurements.bulkPut(backup.data.customerMeasurements);
                } else if (backup.data.measurements) {
                    // Legacy fallback
                    await db.measurements.bulkPut(backup.data.measurements);
                }
            });

            toast.success(t('backup.importSuccess'));
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Import failed:', error);
            toast.error(t('backup.importError') || 'Import failed');
        }
    };

    const handleExportFull = async () => {
        try {
            const data = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: {
                    customers: await db.customers.toArray(),
                    orders: await db.orders.toArray(),
                    measurements: await db.measurements.toArray(), // Legacy (optional)
                    customerMeasurements: await db.customerMeasurements.toArray(), // New Table
                },
            };

            const filename = `tailorpro-backup-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`;
            const content = JSON.stringify(data, null, 2);

            if (window.electronAPI) {
                const result = await window.electronAPI.saveFile(content, filename);
                if (result.success) {
                    toast.success(t('backup.exportSuccess'));
                }
            } else {
                // Fallback for web
                const blob = new Blob([content], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                toast.success(t('backup.exportSuccess'));
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error(t('backup.exportError') || 'Export failed');
        }
    };

    const handleExportCSV = async () => {
        try {
            const customers = await db.customers.toArray();
            const orders = await db.orders.toArray();
            const measurements = await db.customerMeasurements.toArray();

            // Create a map for quick access to measurements by customerId
            const measurementMap = measurements.reduce((acc, m) => {
                acc[m.customerId] = m;
                return acc;
            }, {} as Record<number, CustomerMeasurement>);

            // Build CSV
            // Added measurement columns: Length, Sleeve, Bazu Center, Chest, Tera, Collar, Daman, Shalwar, Aasan, Pancha
            const headers = [
                'Name', 'Phone', 'Address', 'Total Orders', 'Last Order Date',
                'Length', 'Sleeve', 'Bazu Center', 'Chest', 'Tera', 'Collar', 'Daman', 'Shalwar', 'Aasan', 'Pancha'
            ];

            const rows = customers.map((c: Customer) => {
                const customerOrders = orders.filter((o: Order) => o.customerId === c.id);
                const lastOrder = customerOrders.sort(
                    (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0];

                const m = measurementMap[c.id!]?.fields || {};

                return [
                    `"${c.name}"`,
                    c.phone,
                    `"${c.address || ''}"`,
                    customerOrders.length,
                    lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString() : '',
                    // Measurements
                    `"${m.length || ''}"`,
                    `"${m.sleeve || ''}"`,
                    `"${m.bazu_center || ''}"`,
                    `"${m.chest || ''}"`,
                    `"${m.tera || ''}"`,
                    `"${m.kalar || ''}"`,
                    `"${m.daaman || ''}"`,
                    `"${m.shalwar || ''}"`,
                    `"${m.aasan || ''}"`,
                    `"${m.pancha || ''}"`,
                ].join(',');
            });

            // Add BOM for Excel UTF-8 compatibility
            const BOM = '\uFEFF';
            const csv = BOM + [headers.join(','), ...rows].join('\n');
            const filename = `tailorpro-customers-${new Date().toISOString().split('T')[0]}.csv`;

            if (window.electronAPI) {
                const result = await window.electronAPI.saveFile(csv, filename);
                if (result.success) {
                    toast.success(t('backup.exportSuccess'));
                }
            } else {
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                toast.success(t('backup.exportSuccess'));
            }
        } catch (error) {
            console.error('CSV export error:', error);
            toast.error('Export failed');
        }
    };

    const handleImport = async () => {
        try {
            let content: string | null = null;

            if (window.electronAPI) {
                const result = await window.electronAPI.openFile();
                if (result.success && result.content) {
                    content = result.content;
                }
            } else {
                // Fallback for web
                // Trigger file input click
                if (fileInputRef.current) {
                    fileInputRef.current.click();
                }
                return;
            }

            if (!content) return;

            const backup = JSON.parse(content);

            // Validate backup structure
            if (!backup.data || !backup.data.customers || !backup.data.orders) {
                throw new Error('Invalid backup file');
            }

            // Import data (merge/replace)
            // Import data (merge/replace)
            await db.transaction('rw', db.customers, db.orders, db.measurements, db.customerMeasurements, async () => {
                // Use bulkPut to update or insert
                await db.customers.bulkPut(backup.data.customers);
                await db.orders.bulkPut(backup.data.orders);
                if (backup.data.customerMeasurements) {
                    await db.customerMeasurements.bulkPut(backup.data.customerMeasurements);
                } else if (backup.data.measurements) {
                    await db.measurements.bulkPut(backup.data.measurements);
                }
            });

            toast.success(t('backup.importSuccess'));
        } catch (error) {
            console.error('Import error:', error);
            toast.error(t('backup.importError') || 'Import failed');
        }
    };

    return (
        <PageTransition className="space-y-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900">{t('nav.backup')}</h1>

            {/* Export Section */}
            <div className="card space-y-4">
                <h2 className="text-lg font-semibold">{t('backup.export')}</h2>

                <button onClick={handleExportFull} className="btn btn-primary w-full flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5 text-white" />
                    {t('backup.exportFull')}
                </button>

                <button onClick={handleExportCSV} className="btn btn-secondary w-full flex items-center justify-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" />
                    {t('backup.exportCustomers')}
                </button>
            </div>

            {/* Import Section */}
            <div className="card space-y-4">
                <h2 className="text-lg font-semibold">{t('backup.import')}</h2>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    {t('backup.warning')}
                </div>

                <button onClick={handleImport} className="btn btn-success w-full flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    {t('backup.importBackup')}
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
            />
        </PageTransition>
    );
}
