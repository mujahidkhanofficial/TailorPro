import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Customers from '@/pages/Customers';
import CustomerDetail from '@/pages/CustomerDetail';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import Backup from '@/pages/Backup';
import Settings from '@/pages/Settings';

function App() {
    const { i18n } = useTranslation();
    const language = useUIStore((state) => state.language);

    useEffect(() => {
        i18n.changeLanguage(language);
        document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language, i18n]);

    return (
        <div
            dir={language === 'ur' ? 'rtl' : 'ltr'}
            className={`h-full ${language === 'ur' ? 'font-urdu' : 'font-sans'}`}
        >
            <AppLayout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/customers/:id" element={<CustomerDetail />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route path="/backup" element={<Backup />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </AppLayout>
        </div>
    );
}

export default App;
