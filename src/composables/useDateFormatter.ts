export interface DateFormatOptions {
    locale?: string;
    options?: Intl.DateTimeFormatOptions;
}

/**
 * Function for formatting dates coming from API
 * @returns {object} An object containing the formatDate function.
 */
export function useDateFormatter() {
    /**
     * This formats an ISO date string into a dd/mm/yyyy display format
     * @param {string} isoString (ISO 8601)
     * @param {DateFormatOptions} config It's the configuration for locale and date parts
     * @returns {string} The formatted date string
     */

    const formatDate = (
        isoString: string,
        config: DateFormatOptions = {}
    ): string => {
        // Sets default to DD/MM/YYYY format
        const locale = config.locale || 'en-GB';

        // Define the default output format (dd/mm/yyyy h:m, 24-hour)
        const defaultOptions: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
        };

        const options = config.options || defaultOptions;

        // Create the Date object
        const date = new Date(isoString);

        // Handle invalid dates
        if(isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        return new Intl.DateTimeFormat(locale, options).format(date);
    };

    /**
     * This formats an ISO date string into a dd/mm/yyyy without the time
     */
    const formatOnlyDate = (
        isoString: string,
        config: DateFormatOptions = {}
    ): string => {
        // Set default to DD/MM/YYYY format
        const locale = config.locale || 'en-GB';

        // Define the default output format (dd/mm/yyyy)
        const defaultOptions: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };

        const options = config.options || defaultOptions;

        // Create the Date object
        const date = new Date(isoString);

        // Handle invalid dates
        if(isNaN(date.getTime())){
            return 'Invalid Date';
        }

        return new Intl.DateTimeFormat(locale, options).format(date);
    }

    return {
        formatDate,
        formatOnlyDate
    };
}