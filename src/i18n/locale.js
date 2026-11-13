// Tiny module so non-React helpers (date formatting) know the active language.
let code = 'en';
export const setLocaleCode = (c) => { code = c; };
export const getLocale = () => (code === 'ta' ? 'ta-IN' : 'en-IN');
