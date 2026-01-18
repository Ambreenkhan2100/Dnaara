export type UserStatus = 'active' | 'pending' | 'disabled';

export interface BaseUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    status: UserStatus;
    createdAt: string;
}

export interface Importer extends BaseUser {
    type: 'importer';
    businessName: string;
    crNumber: string;
    documents?: {
        commercialRegistrationUrl?: string;
        chamberAuthUrl?: string;
        profilePictureUrl?: string;
    };
}

export interface Agent extends BaseUser {
    type: 'agent';
    companyName: string;
    commercialLicenseNumber: string;
    documents?: {
        commercialLicenseUrl?: string;
        tradeLicenseUrl?: string;
        profilePictureUrl?: string;
    };
}

export interface Admin extends BaseUser {
    type: 'admin';
    role: 'admin';
}


export interface UseProfile {
    id: string;
    user_id: string;
    legal_business_name: string;
    trade_registration_number: string;
    national_address: string;
    full_name: string;
    position: string;
    phone_number: string;
    national_id: string;
    company_email: string;
    created_at: string;
    emails: string[];
    role: string
}