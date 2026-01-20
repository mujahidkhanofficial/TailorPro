import Dexie, { Table } from 'dexie';

// Types
export type GarmentType =
    | 'sherwani'
    | 'kurta_pajama'
    | 'western_suit'
    | 'pathani_suit'
    | 'casual';

export type OrderStatus =
    | 'new'
    | 'in_progress'
    | 'ready'
    | 'delivered'
    | 'completed';

export interface Customer {
    id?: number;
    name: string;
    phone: string;
    address?: string;
    photo?: string; // base64 encoded
    createdAt: Date;
    updatedAt: Date;
}

export interface Order {
    id?: number;
    customerId: number;
    garmentType: GarmentType;
    status: OrderStatus;
    dueDate: Date;
    advancePayment?: string;
    deliveryNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Measurement {
    id?: number;
    orderId: number;
    template: GarmentType;
    fields: Record<string, string>;
}

// NEW: Customer-level measurements (not order-specific)
export interface CustomerMeasurement {
    id?: number;
    customerId: number;
    fields: Record<string, string>;
    designOptions: Record<string, boolean>;
    createdAt: Date;
    updatedAt: Date;
}

// Database Class
class TailorProDB extends Dexie {
    customers!: Table<Customer, number>;
    orders!: Table<Order, number>;
    measurements!: Table<Measurement, number>;
    customerMeasurements!: Table<CustomerMeasurement, number>;

    constructor() {
        super('TailorProDB');

        this.version(1).stores({
            customers: '++id, name, phone, createdAt',
            orders: '++id, customerId, status, dueDate, createdAt',
            measurements: '++id, orderId, template',
        });

        // Version 2: Add customer-level measurements
        this.version(2).stores({
            customers: '++id, name, phone, createdAt',
            orders: '++id, customerId, status, dueDate, createdAt',
            measurements: '++id, orderId, template',
            customerMeasurements: '++id, customerId, updatedAt',
        });
    }
}

// Export singleton instance
export const db = new TailorProDB();

// Helper for getting today's date range
export function getTodayRange(): { start: Date; end: Date } {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    return { start, end };
}
// Helper for downloading blobs
export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
