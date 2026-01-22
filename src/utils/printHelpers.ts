import { Customer, CustomerMeasurement, Settings, Order } from '@/db/database';
import { measurementFields, designOptions, collarNokOptions, banPattiOptions, cuffOptions, frontPocketOptions, sidePocketOptions, frontStripOptions, hemStyleOptions, shalwarFarmaishOptions } from '@/db/templates';
import { formatDate } from '@/utils/formatters';

export const generateMeasurementSlipHTML = (
    customer: Customer,
    measurement: CustomerMeasurement,
    settings?: Settings,
    workerNames?: { cutter?: string; checker?: string; karigar?: string },
    order?: Order
): string => {

    const shopName = settings?.shopName || 'M.R.S Fabrics & Tailors';
    const address = settings?.address || 'Gul Plaza Wapda Town Main Market Taru Jabba';
    const phones = [settings?.phone1, settings?.phone2].filter(Boolean).join(' | ') || '0313-9003733';

    // Helper to get option label
    const getOptionLabel = (options: any[], value: string) => {
        return options.find(o => o.value === value)?.labelUr || '';
    };

    // Workers
    const cutterName = workerNames?.cutter || '________';
    const checkerName = workerNames?.checker || '________';
    const karigarName = workerNames?.karigar || '________';

    // Build measurement rows (Right Column - Primary Measurements)
    const measurementRows = measurementFields.map(field => ({
        label: field.labelUr,
        value: measurement.fields[field.key] || ''
    }));

    // Build option rows (Left Column - Design Options)
    const optionRows: { label: string; value: string }[] = [];
    if (measurement.fields['collarNok']) optionRows.push({ label: 'کالر نوک', value: getOptionLabel(collarNokOptions, measurement.fields['collarNok']) });
    if (measurement.fields['banPatti']) optionRows.push({ label: 'بین پٹی', value: getOptionLabel(banPattiOptions, measurement.fields['banPatti']) });
    if (measurement.fields['cuff']) optionRows.push({ label: 'کف', value: getOptionLabel(cuffOptions, measurement.fields['cuff']) });
    if (measurement.fields['frontPocket']) optionRows.push({ label: 'سامنے جیب', value: getOptionLabel(frontPocketOptions, measurement.fields['frontPocket']) });
    if (measurement.fields['sidePocket']) optionRows.push({ label: 'سائیڈ جیب', value: getOptionLabel(sidePocketOptions, measurement.fields['sidePocket']) });
    if (measurement.fields['frontStrip']) optionRows.push({ label: 'سامنے کی پٹی', value: getOptionLabel(frontStripOptions, measurement.fields['frontStrip']) });
    if (measurement.fields['hemStyle']) optionRows.push({ label: 'دامن', value: getOptionLabel(hemStyleOptions, measurement.fields['hemStyle']) });
    if (measurement.fields['shalwarFarmaish']) optionRows.push({ label: 'شلوار', value: getOptionLabel(shalwarFarmaishOptions, measurement.fields['shalwarFarmaish']) });

    // Merge into rows for a unified table
    // RTL Order: Measurement Label (right) | Measurement Value | Option Label | Option Value (left)
    const maxRows = Math.max(measurementRows.length, optionRows.length);
    let tableBodyHTML = '';
    for (let i = 0; i < maxRows; i++) {
        const m = measurementRows[i] || { label: '', value: '' };
        const o = optionRows[i] || { label: '', value: '' };
        tableBodyHTML += `
            <tr>
                <td class="lbl">${m.label}</td>
                <td class="num">${m.value}</td>
                <td class="lbl">${o.label}</td>
                <td class="val">${o.value}</td>
            </tr>
        `;
    }

    // Farmaish
    const selectedFarmaish = designOptions.filter(opt => measurement.designOptions[opt.key]).map(opt => opt.labelUr);
    const farmaishText = selectedFarmaish.length > 0 ? selectedFarmaish.join('، ') : 'کوئی نہیں';

    return `
<!DOCTYPE html>
<html lang="ur">
<head>
    <meta charset="UTF-8">
    <title>Order Slip - ${customer.name}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        /* Reset */
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* Base */
        body {
            font-family: 'Noto Nastaliq Urdu', serif;
            font-size: 15px;
            background: #ccc;
            color: #000;
            line-height: 1.5;
            direction: rtl;
        }

        /* Page Container - A5 Portrait */
        .slip {
            width: 148mm;
            min-height: 210mm;
            margin: 10mm auto;
            padding: 10mm 8mm;
            background: #fff;
            border: 3px dashed #c00;
            position: relative;
        }

        @page {
            size: A5 portrait;
            margin: 0;
        }

        @media print {
            body { 
                background: #fff; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .slip {
                width: 100%;
                min-height: auto;
                margin: 0;
                padding: 6mm 5mm;
                border: none; /* No border in PDF */
            }
        }

        /* ============ HEADER ============ */
        .header {
            text-align: center;
            margin-bottom: 2px;
            padding-bottom: 4px;
            border-bottom: 1px dashed #999; /* Dashed line separator below header */
        }

        .shop-name {
            font-size: 32px; /* Increased size */
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 2px;
            color: #000;
        }

        .shop-address {
            font-size: 14px;
            color: #444;
            margin-top: 0;
            line-height: 1.2;
            font-weight: 500;
        }

        .shop-phone {
            font-size: 16px;
            font-weight: 700;
            margin-top: 2px;
            direction: ltr;
            display: inline-block;
            margin-bottom: 4px;
        }

        /* ============ INFO GRID ============ */
        .info-section {
            border-bottom: 1px dashed #999;
            margin: 8px 0;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px dashed #ccc;
        }

        .info-row:last-child {
            border-bottom: none;
        }

        .info-cell {
            flex: 1;
            font-size: 14px;
            font-weight: 600;
        }

        .info-cell:first-child { text-align: right; }
        .info-cell:nth-child(2) { text-align: center; }
        .info-cell:last-child { text-align: left; }

        /* ============ MEASUREMENTS TABLE ============ */
        .measurements-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 15px;
        }

        .measurements-table td {
            padding: 4px 6px;
            vertical-align: middle;
        }

        /* Label columns - right aligned, bold */
        .measurements-table .lbl {
            text-align: right;
            color: #333;
            font-weight: 700;
            width: 15%; /* Reduced width to bring value closer */
            white-space: nowrap;
            padding-right: 5px;
        }

        /* Value columns for numbers - bold, larger */
        .measurements-table .num {
            text-align: right; /* Changed to right align to stick to label */
            font-weight: 700;
            font-size: 18px;
            width: 35%; /* Increased width to push next column away */
            direction: ltr; /* Keeps numbers LTR but aligns right in RTL context */
            padding-right: 10px;
        }

        /* Value columns for text options - right aligned */
        .measurements-table .val {
            text-align: right;
            font-weight: 600;
            width: 35%;
            padding-right: 10px;
        }

        /* Alternate row shading for readability */
        .measurements-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        /* ============ FARMAISH SECTION ============ */
        .farmaish-section {
            margin-top: 15px;
            padding-top: 8px;
            padding-bottom: 8px;
            border-top: 1px dashed #999;
            border-bottom: 1px dashed #999;
        }

        .farmaish-label {
            font-weight: 700;
            font-size: 14px;
        }

        .farmaish-value {
            font-size: 15px;
            font-weight: 600;
        }

        /* ============ FOOTER / ADVANCE ============ */
        .footer-section {
            margin-top: 12px;
            padding-top: 10px;
            text-align: left;
        }

        .advance-label {
            font-size: 16px;
            font-weight: 700;
        }

        .advance-amount {
            font-size: 22px;
            font-weight: 700;
        }

        .notes {
            margin-top: 5px;
            font-size: 13px;
            color: #555;
        }

    </style>
</head>
<body>
<div class="slip">

    <!-- HEADER -->
    <div class="header">
        <div class="shop-name">${shopName}</div>
        <div class="shop-address">${address}</div>
        <div class="shop-phone">${phones}</div>
    </div>

    <!-- INFO GRID -->
    <div class="info-section">
        ${order ? `
        <div class="info-row">
            <div class="info-cell">آرڈر نمبر: ${order.id}</div>
            <div class="info-cell">بلنگ: ${formatDate(order.createdAt)}</div>
            <div class="info-cell">ادائیگی: ${formatDate(order.dueDate)}</div>
        </div>
        ` : ''}
        <div class="info-row">
            <div class="info-cell">نام: ${customer.name}</div>
            <div class="info-cell">فون: ${customer.phone}</div>
            <div class="info-cell">S.No: ${customer.id}</div>
        </div>
        ${order ? `
        <div class="info-row">
            <div class="info-cell">کٹر: ${cutterName}</div>
            <div class="info-cell">چیکر: ${checkerName}</div>
            <div class="info-cell">کاریگر: ${karigarName}</div>
        </div>
        ` : ''}
    </div>

    <!-- MEASUREMENTS TABLE -->
    <table class="measurements-table">
        <tbody>
            ${tableBodyHTML}
        </tbody>
    </table>

    <!-- FARMAISH -->
    <div class="farmaish-section">
        <span class="farmaish-label">فرمائش:</span>
        <span class="farmaish-value">${farmaishText}</span>
    </div>

    <!-- FOOTER / ADVANCE -->
    ${order ? `
    <div class="footer-section">
        <span class="advance-label">پیشگی رقم:</span>
        <span class="advance-amount">${order.advancePayment || '0'}</span>
        ${order.deliveryNotes ? `<div class="notes">نوٹس: ${order.deliveryNotes}</div>` : ''}
    </div>
    ` : ''}

</div>
</body>
</html>
    `;
};
