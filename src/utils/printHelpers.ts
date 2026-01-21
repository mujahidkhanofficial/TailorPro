import { Customer, CustomerMeasurement, Settings } from '@/db/database';
import { measurementFields, designOptions, collarNokOptions, banPattiOptions, cuffOptions, frontPocketOptions, sidePocketOptions, frontStripOptions, hemStyleOptions, shalwarFarmaishOptions } from '@/db/templates';

export const generateMeasurementSlipHTML = (customer: Customer, measurement: CustomerMeasurement, settings?: Settings): string => {

    const shopName = settings?.shopName || 'M.R.S ٹیلرز اینڈ فیبرکس';
    const address = settings?.address || 'گل پلازہ روڈ اپوزٹ ٹاؤن شیل مارکیٹ تارو جب';
    const phones = [settings?.phone1, settings?.phone2].filter(Boolean).join(' | ') || '0313-9003733 | 0313-9645010';

    // Helper to get option label
    const getOptionLabel = (options: any[], value: string) => {
        return options.find(o => o.value === value)?.labelUr || '';
    };

    // Helper to generate rows
    const generateRow = (label: string, value: string) => `
        <tr>
            <td class="label-cell">${label}</td>
            <td class="value-cell">${value}</td>
        </tr>
    `;

    // 1. Generate Left Table Rows (Options)
    let leftTableRows = '';

    if (measurement.fields['collarNok']) leftTableRows += generateRow('کالر نوک', getOptionLabel(collarNokOptions, measurement.fields['collarNok']));
    if (measurement.fields['banPatti']) leftTableRows += generateRow('بین پٹی', getOptionLabel(banPattiOptions, measurement.fields['banPatti']));
    if (measurement.fields['cuff']) leftTableRows += generateRow('کف', getOptionLabel(cuffOptions, measurement.fields['cuff']));
    if (measurement.fields['frontPocket']) leftTableRows += generateRow('سامنے جیب', getOptionLabel(frontPocketOptions, measurement.fields['frontPocket']));
    if (measurement.fields['sidePocket']) leftTableRows += generateRow('سائیڈ جیب', getOptionLabel(sidePocketOptions, measurement.fields['sidePocket']));
    if (measurement.fields['frontStrip']) leftTableRows += generateRow('سامنے کی پٹی', getOptionLabel(frontStripOptions, measurement.fields['frontStrip']));
    if (measurement.fields['hemStyle']) leftTableRows += generateRow('دامن', getOptionLabel(hemStyleOptions, measurement.fields['hemStyle']));
    if (measurement.fields['shalwarFarmaish']) leftTableRows += generateRow('شلوار فرمائش', getOptionLabel(shalwarFarmaishOptions, measurement.fields['shalwarFarmaish']));
    if (measurement.fields['shalwarWidth']) leftTableRows += generateRow('شلوار چوڑائی', measurement.fields['shalwarWidth']);
    if (measurement.fields['aasan']) leftTableRows += generateRow('آسن', measurement.fields['aasan']);
    if (measurement.fields['bazuCenter']) leftTableRows += generateRow('بازو سینٹر', measurement.fields['bazuCenter']);


    // 2. Generate Right Table Rows (Measurements)
    let rightTableRows = measurementFields
        .map(field => generateRow(field.labelUr, measurement.fields[field.key] || ''))
        .join('');

    // 3. Generate Farmaish List
    const selectedDesignOptions = designOptions
        .filter(opt => measurement.designOptions[opt.key])
        .map(opt => `
            <div style="display: flex; align-items: center; gap: 5px; margin-right: 10px; margin-bottom: 4px;">
                <div style="width: 12px; height: 12px; background: black; border: 1px solid black;"></div>
                <span>${opt.labelUr}</span>
            </div>
        `)
        .join('');

    return `
<!DOCTYPE html>
<html lang="ur">
<head>
    <meta charset="UTF-8">
    <title>Measurement Slip</title>
    <!-- Load Noto Nastaliq Urdu from Google Fonts CDN -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Noto Nastaliq Urdu', serif !important;
            font-size: 14px;
            background: #e0e0e0;
            color: #000;
            line-height: 1.6;
        }

        /* A5 Page Container */
        .page-container {
            width: 148mm;
            height: 210mm;
            margin: 5mm auto;
            padding: 8mm;
            background: white;
            border: 2px dashed #ff0000;
            overflow: hidden;
        }

        @page {
            size: A5 portrait;
            margin: 0;
        }

        @media print {
            body {
                background: white;
            }
            .page-container {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 6mm;
                border: none !important;
            }
        }

        /* HEADER */
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 6px;
            margin-bottom: 8px;
        }

        .header h1 {
            font-family: 'Noto Nastaliq Urdu', serif !important;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 4px 0;
            line-height: 1.3;
        }

        .header .address {
            font-family: 'Noto Nastaliq Urdu', serif !important;
            font-size: 13px;
            font-weight: 400;
            color: #333;
            margin: 0;
        }

        .header .phones {
            font-family: 'Noto Nastaliq Urdu', serif !important;
            font-size: 14px;
            font-weight: 600;
            color: #000;
            direction: ltr;
            margin-top: 2px;
        }

        /* CUSTOMER INFO */
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-family: 'Noto Nastaliq Urdu', serif !important;
            font-size: 14px;
            font-weight: 600;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
        }
        
        .info-row div {
            white-space: nowrap;
        }

        /* TABLES SECTION */
        .main-content {
            display: flex;
            gap: 10px;
            direction: ltr;
        }

        .column {
            width: 50%;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-family: 'Noto Nastaliq Urdu', serif !important;
            font-size: 13px;
        }
        
        tr {
            border-bottom: 1px solid #ddd;
        }
        
        tr:last-child {
            border-bottom: 1px solid #999;
        }
        
        tr:nth-child(even) {
            background-color: #f8f8f8;
        }

        td {
            font-family: 'Noto Nastaliq Urdu', serif !important;
            padding: 5px 6px;
        }

        .label-cell {
            text-align: right;
            border-right: 1px solid #ddd;
            width: 55%;
            color: #333;
            font-weight: 500;
            font-size: 13px;
        }

        .value-cell {
            text-align: center;
            width: 45%;
            font-weight: 700;
            font-size: 15px;
            color: #000;
            direction: ltr;
        }
        
        .column table {
            border: 1px solid #bbb;
        }

        /* FARMAISH SECTION */
        .farmaish-container {
            margin-top: 8px;
            padding-top: 6px;
            border-top: 1px dashed #888;
            direction: rtl;
        }
        
        .farmaish-title {
            font-family: 'Noto Nastaliq Urdu', serif !important;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .farmaish-grid {
            display: flex;
            flex-wrap: wrap;
            font-family: 'Noto Nastaliq Urdu', serif !important;
            font-size: 13px;
            gap: 4px 12px;
        }
        
        .farmaish-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .box {
            width: 12px;
            height: 12px;
            background: #222;
            border: 1px solid #222;
        }

        .no-farmaish {
            font-family: 'Noto Nastaliq Urdu', serif !important;
            color: #666;
            font-size: 12px;
        }

    </style>
</head>
<body dir="rtl">
<div class="page-container">

    <!-- Header -->
    <div class="header">
        <h1>${shopName}</h1>
        <p class="address">${address}</p>
        <p class="phones">${phones}</p>
    </div>

    <!-- Customer Info -->
    <div class="info-row">
        <div style="flex: 1; text-align: right;">نام: ${customer.name}</div>
        <div style="flex: 1; text-align: center;">فون: ${customer.phone}</div>
        <div style="flex: 0.5; text-align: left;">S.No: ${customer.id}</div>
    </div>
    
    <div class="info-row" style="font-weight: 500;">
        <div style="flex: 1; text-align: right;">کٹر: ________________</div>
        <div style="flex: 1; text-align: center;">چیکر: ________________</div>
        <div style="flex: 1; text-align: left;">کاریگر: ________________</div>
    </div>

    <!-- Main Tables -->
    <div class="main-content">
        <!-- LEFT Column (Options) -->
        <div class="column" dir="rtl">
            <table>
                <tbody>
                    ${leftTableRows}
                </tbody>
            </table>
        </div>

        <!-- RIGHT Column (Measurements) -->
        <div class="column" dir="rtl">
            <table>
                <tbody>
                    ${rightTableRows}
                </tbody>
            </table>
        </div>
    </div>

    <!-- Farmaish Section -->
    ${selectedDesignOptions ? `
        <div class="farmaish-container">
            <p class="farmaish-title">فرمائش:</p>
            <div class="farmaish-grid">
                ${designOptions.filter(opt => measurement.designOptions[opt.key]).map(opt => `
                    <div class="farmaish-item">
                        <div class="box"></div>
                        <span>${opt.labelUr}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : `
        <div class="farmaish-container">
            <p class="no-farmaish">کوئی فرمائش نہیں</p>
        </div>
    `}

</div>
</body>
</html>
    `;
};
