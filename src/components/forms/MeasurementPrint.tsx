import { CustomerMeasurement, Customer } from '@/db/database';
import { measurementFields, designOptions, collarNokOptions, banPattiOptions, cuffOptions, frontPocketOptions, sidePocketOptions, frontStripOptions, hemStyleOptions, shalwarFarmaishOptions } from '@/db/templates';
import { X, Printer } from 'lucide-react';

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
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            {/* Modal Overlay - Hidden on print */}
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
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
                        <p className="text-gray-600 mb-2 font-urdu">پرنٹ کے لیے تیار ہے</p>
                        <p className="text-sm text-gray-400 font-urdu">
                            {customer.name} - کسٹمر نمبر {customer.id}
                        </p>
                    </div>
                    <div className="p-4 border-t space-y-2">
                        <button onClick={handlePrint} className="btn btn-primary w-full flex items-center justify-center gap-2">
                            <Printer className="w-5 h-5" />
                            <span className="font-urdu">پرنٹ کریں</span>
                        </button>
                        <button onClick={onClose} className="btn btn-secondary w-full font-urdu">
                            بند کریں
                        </button>
                    </div>
                </div>
            </div>

            {/* Printable Slip - A5 Portrait (Half A4) */}
            <div className="hidden print:block print:fixed print:inset-0 print:bg-white">
                <div className="w-full h-full p-4 font-urdu text-[12px]" dir="rtl">

                    {/* Header - Clean Centered Design */}
                    <div className="text-center border-b-2 border-black pb-3 mb-3">
                        <h1 className="text-2xl font-bold mb-1">M.R.S ٹیلرز اینڈ فیبرکس</h1>
                        <p className="text-[11px] mb-1">پتہ: گل پلازہ روڈ اپوزٹ ٹاؤن شیل مارکیٹ تارو جب</p>
                        <p className="text-[12px] font-medium" dir="ltr">
                            📞 0313-9003733 &nbsp;|&nbsp; 0313-9645010
                        </p>
                    </div>

                    {/* Customer Info - Single Clean Row */}
                    <div className="grid grid-cols-4 gap-2 border-b pb-2 mb-3 text-[11px]">
                        <div>
                            <span className="text-gray-500">نام:</span>
                            <span className="font-bold ms-1">{customer.name}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">نمبر:</span>
                            <span className="font-bold ms-1" dir="ltr">{customer.phone}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">S.No:</span>
                            <span className="font-bold ms-1">{customer.id}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">تاریخ:</span>
                            <span className="font-bold ms-1" dir="ltr">{new Date().toLocaleDateString('en-GB')}</span>
                        </div>
                    </div>

                    {/* Worker Info Row */}
                    <div className="flex justify-between border-b pb-2 mb-3 text-[13px]">
                        <div>کٹر: ____________________</div>
                        <div>چیکر: ____________________</div>
                        <div>کاریگر: ____________________</div>
                    </div>

                    {/* Main Content - 2 Column Layout with Tables */}
                    <div className="flex gap-4" style={{ direction: 'ltr' }}>

                        {/* LEFT Column - Options Table */}
                        <div className="w-1/2" dir="rtl">
                            <table className="w-full border-collapse text-[12px]">
                                <tbody>
                                    {measurement.fields['collarNok'] && (
                                        <tr>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">کالر نوک</td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2">
                                                {collarNokOptions.find(o => o.value === measurement.fields['collarNok'])?.labelUr}
                                            </td>
                                        </tr>
                                    )}
                                    {measurement.fields['banPatti'] && (
                                        <tr>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">بین پٹی</td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2">
                                                {banPattiOptions.find(o => o.value === measurement.fields['banPatti'])?.labelUr}
                                            </td>
                                        </tr>
                                    )}
                                    {measurement.fields['cuff'] && (
                                        <tr>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">کف</td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2">
                                                {cuffOptions.find(o => o.value === measurement.fields['cuff'])?.labelUr}
                                            </td>
                                        </tr>
                                    )}
                                    {measurement.fields['frontPocket'] && (
                                        <tr>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">سامنے جیب</td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2">
                                                {frontPocketOptions.find(o => o.value === measurement.fields['frontPocket'])?.labelUr}
                                            </td>
                                        </tr>
                                    )}
                                    {measurement.fields['sidePocket'] && (
                                        <tr>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">سائیڈ جیب</td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2">
                                                {sidePocketOptions.find(o => o.value === measurement.fields['sidePocket'])?.labelUr}
                                            </td>
                                        </tr>
                                    )}
                                    {measurement.fields['frontStrip'] && (
                                        <tr>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">سامنے کی پٹی</td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2">
                                                {frontStripOptions.find(o => o.value === measurement.fields['frontStrip'])?.labelUr}
                                            </td>
                                        </tr>
                                    )}
                                    {measurement.fields['hemStyle'] && (
                                        <tr>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">دامن</td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2">
                                                {hemStyleOptions.find(o => o.value === measurement.fields['hemStyle'])?.labelUr}
                                            </td>
                                        </tr>
                                    )}
                                    {measurement.fields['shalwarFarmaish'] && (
                                        <tr>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">شلوار فرمائش</td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2">
                                                {shalwarFarmaishOptions.find(o => o.value === measurement.fields['shalwarFarmaish'])?.labelUr}
                                            </td>
                                        </tr>
                                    )}
                                    {measurement.fields['shalwarWidth'] && (
                                        <tr>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">شلوار چوڑائی</td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2" dir="ltr">
                                                {measurement.fields['shalwarWidth']}
                                            </td>
                                        </tr>
                                    )}
                                    {measurement.fields['aasan'] && (
                                        <tr>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">آسن</td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2" dir="ltr">
                                                {measurement.fields['aasan']}
                                            </td>
                                        </tr>
                                    )}
                                    {measurement.fields['bazuCenter'] && (
                                        <tr>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">بازو سینٹر</td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2" dir="ltr">
                                                {measurement.fields['bazuCenter']}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* RIGHT Column - Measurements Table */}
                        <div className="w-1/2" dir="rtl">
                            <table className="w-full border-collapse text-[12px]">
                                <tbody>
                                    {measurementFields.map((field) => (
                                        <tr key={field.key}>
                                            <td className="border border-black p-2 text-right font-medium w-1/2">
                                                {field.labelUr}
                                            </td>
                                            <td className="border border-black p-2 text-center font-bold w-1/2" dir="ltr">
                                                {measurement.fields[field.key] || ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Farmaish Section - Below Tables */}
                    <div className="mt-3 pt-2 border-t" dir="rtl">
                        <p className="font-bold text-[11px] mb-2">فرمائش:</p>
                        <div className="flex flex-wrap gap-4 text-[11px]">
                            {designOptions
                                .filter((opt) => measurement.designOptions[opt.key])
                                .map((opt) => (
                                    <div key={opt.key} className="flex items-center gap-2">
                                        <div className="w-4 h-4 border border-black flex-shrink-0 bg-black"></div>
                                        <span>{opt.labelUr}</span>
                                    </div>
                                ))}
                            {designOptions.filter((opt) => measurement.designOptions[opt.key]).length === 0 && (
                                <p className="text-gray-500 text-[10px]">کوئی فرمائش منتخب نہیں</p>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row - Additional Checkboxes */}
                    <div className="flex justify-around mt-3 pt-2 border-t text-[11px]">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-black"></div>
                            <span>جیکر</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-black"></div>
                            <span>ٹیل</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-black"></div>
                            <span>فل ڈاؤن</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-2 border-t text-[9px] text-center text-gray-600">
                        <p>نوٹ: سوٹ خراب ہونے کی صورت میں کارگر ذمہ دار ہوگا۔</p>
                        <p className="font-bold">کسٹمر نمبر: {customer.id}</p>
                    </div>
                </div>
            </div>

            {/* Print Styles - A5 Portrait (Half A4) */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print\\:block, .print\\:block * { visibility: visible; }
                    .print\\:hidden { display: none !important; }
                    @page { 
                        size: A5 portrait; 
                        margin: 3mm; 
                    }
                    body {
                        font-family: 'NotoNastaliqUrdu', serif !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </>
    );
}
