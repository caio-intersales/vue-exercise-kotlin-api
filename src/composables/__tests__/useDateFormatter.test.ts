import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDateFormatter } from '../useDateFormatter';

describe('useDateFormatter Composable', () => {
    let store: ReturnType<typeof useDateFormatter>;

    beforeEach(() => {
        // Instantiate the store before each test
        store = useDateFormatter();
    });

    // ===============================================
    // 1. Test Default Formatting (en-GB)
    // ===============================================
    describe('Default Formatting (en-GB)', () => {
        it('should format a valid ISO string using the default en-GB locale and options', () => {
            // A specific ISO date/time for reliable testing
            const isoString = '2025-10-25T14:35:00.000Z'; 
            
            // Expected output based on defaults: dd/mm/yyyy, 24-hour time.
            // NOTE: The locale 'en-GB' defaults to comma separation between date and time.
            // NOTE 2: Timezone difference is accounted for in the test environment.
            // 2025-10-25 14:35:00Z (UTC) is 2025-10-25 15:35:00 in CET/CEST (Europe/Cologne).
            // Mock is used to ensure a consistent timezone (UTC in this case).
            
            // Mock the Date object to control the environment
            vi.useFakeTimers();
            
            // Ensure the system timezone won't prevent the test from running correctly (set to UTC)
            vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
            
            // Expected output if the environment is UTC (since TDD/MM/YYYY hh:mm is used)
            // If running in CET (UTC+1), the output would be 25/10/2025, 15:35
            
            // Use the explicit Intl options being used on the input date
            // The expectation should be what Intl.DateTimeFormat('en-GB', defaultOptions) returns for that ISO string.
            const result = store.formatDate(isoString);
            
            // Example if running in UTC: "25/10/2025, 14:35"
            // Example if running in CET (UTC+1): "25/10/2025, 15:35"
            
            // For robustness, we test parts and ensure format consistency:
            expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/); 
            
            // Specific example for CET
            const date = new Date(isoString);
            const expected = new Intl.DateTimeFormat('en-GB', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: 'numeric', minute: '2-digit', hour12: false 
            }).format(date);

            expect(result).toBe(expected);

            vi.useRealTimers();
        });
    });

    // ===============================================
    // 2. Test Custom Configuration Overrides
    // ===============================================
    describe('Custom Configuration', () => {
        const isoString = '2025-10-25T14:35:00.000Z'; 

        it('should use a custom locale (de-DE) and format correctly', () => {
            const result = store.formatDate(isoString, { locale: 'de-DE' });
            
            // testing for de-DE configuration
            expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/);
        });

        it('should use custom options to show only the date', () => {
            const options: Intl.DateTimeFormatOptions = {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC' // Force UTC to avoid local timezone offset
            };
            
            const result = store.formatDate(isoString, { locale: 'en-US', options });
            
            // Expected: October 25, 2025 (US locale default)
            expect(result).toBe('October 25, 2025');
        });

        it('should use custom options to show time with 12-hour clock (hour12: true)', () => {
            const options: Intl.DateTimeFormatOptions = {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true, // 12-hour clock
                timeZone: 'UTC'
            };

            // 14:35 UTC should be "2:35 PM" in the default locale
            const result = store.formatDate(isoString, { options });
            
            expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/i);
            // Specific check for 14:35 UTC in US locale
            expect(result).toBe('2:35 pm');
        });
    });

    // ===============================================
    // 3. Test Error Handling
    // ===============================================
    describe('Error Handling', () => {
        it('should return "Invalid Date" for a completely invalid string', () => {
            const invalidString = 'Not a date';
            const result = store.formatDate(invalidString);
            expect(result).toBe('Invalid Date');
        });

        it('should return "Invalid Date" for an empty string', () => {
            const emptyString = '';
            const result = store.formatDate(emptyString);
            expect(result).toBe('Invalid Date');
        });

        it('should return a formatted string for a valid date string without time', () => {
            const validDateOnly = '2025-05-01'; // Valid date, time defaults to midnight
            const result = store.formatDate(validDateOnly);
            
            // Expected for UTC+0: 01/05/2025, 00:00 (or 01:00 for CET)
            expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2}$/);
        });
    });

    // ===============================================================
    // 4. Test formatOnlyDate Function
    // ===============================================================
    describe('formatOnlyDate Function', () => {
        const isoString = '2025-11-08T10:15:30.000Z'; 

        // 4.1 Test Default Formatting
        it('should format a valid ISO string to DD/MM/YYYY using default en-GB locale', () => {
            const result = store.formatOnlyDate(isoString);
            
            // Expected for en-GB default options: 08/11/2025
            expect(result).toBe('08/11/2025');
        });

        // 4.2 Test Custom Locale
        it('should format correctly using a custom locale (de-DE)', () => {
            const result = store.formatOnlyDate(isoString, { locale: 'de-DE' });
            
            // Expected for de-DE default options: 08.11.2025
            expect(result).toBe('08.11.2025');
        });

        // 4.3 Test Custom Options
        it('should apply custom options to show full month and no year', () => {
            const options: Intl.DateTimeFormatOptions = {
                day: '2-digit',
                month: 'long',
                year: undefined, // Explicitly remove year
            };

            const result = store.formatOnlyDate(isoString, { locale: 'en-US', options });
            
            // Expected for en-US: November 08
            expect(result).toBe('November 08');
        });
        
        // 4.4 Test Date-Only String
        it('should correctly format a date string without time data', () => {
            const dateOnlyString = '2026-01-20'; 
            const result = store.formatOnlyDate(dateOnlyString);
            
            expect(result).toBe('20/01/2026');
        });

        // 4.5 Test Error Handling
        it('should return "Invalid Date" for an invalid string', () => {
            const invalidString = 'bad-date-format';
            const result = store.formatOnlyDate(invalidString);
            expect(result).toBe('Invalid Date');
        });

        it('should return "Invalid Date" for an empty string', () => {
            const emptyString = '';
            const result = store.formatOnlyDate(emptyString);
            expect(result).toBe('Invalid Date');
        });
    });
});