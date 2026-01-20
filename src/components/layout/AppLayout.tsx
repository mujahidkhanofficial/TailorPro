import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

import { Toaster } from 'react-hot-toast';

import { ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans text-gray-900" dir="auto">
            <Toaster position="top-right" reverseOrder={false} />

            {/* Sidebar */}
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col transition-all duration-300">
                <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden glass"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
