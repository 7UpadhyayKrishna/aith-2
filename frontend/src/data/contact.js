/**
 * Contact details - thin re-export from company.js for existing imports.
 */
import { COMPANY, isConfigured } from './company';

export { isConfigured };

export const CONTACT = {
    email: COMPANY.email,
    phone: COMPANY.phone,
    phoneTel: COMPANY.phoneTel,
    whatsapp: COMPANY.whatsapp,
    addressLine1: COMPANY.addressLine1,
    addressLine2: COMPANY.addressLine2,
    corporateOffice: COMPANY.corporateOffice,
    branches: COMPANY.branches,
    gstin: COMPANY.gstin,
    coordinates: COMPANY.coordinates,
    hours: COMPANY.hours,
    responseSla: COMPANY.responseSla,
};
