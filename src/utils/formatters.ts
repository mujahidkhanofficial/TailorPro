// Date formatter: DD/MM/YYYY
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// Indian numbering system: 1,23,456
export function formatIndianNumber(num: number): string {
    const str = num.toString();
    if (str.length <= 3) return str;

    let result = str.slice(-3);
    let remaining = str.slice(0, -3);

    while (remaining.length > 2) {
        result = remaining.slice(-2) + ',' + result;
        remaining = remaining.slice(0, -2);
    }

    if (remaining) {
        result = remaining + ',' + result;
    }

    return result;
}

// Add days to a date
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Format date to ISO string for input[type="date"]
export function toInputDateFormat(date: Date): string {
    return date.toISOString().split('T')[0];
}

// Parse input date to Date object
export function fromInputDateFormat(dateString: string): Date {
    return new Date(dateString + 'T00:00:00');
}
