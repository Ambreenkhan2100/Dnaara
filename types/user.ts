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
    businessName: string;
    crNumber: string;
    documents?: {
        commercialRegistrationUrl?: string;
        chamberAuthUrl?: string;
        profilePictureUrl?: string;
    };
}

export interface Agent extends BaseUser {
    companyName: string;
    commercialLicenseNumber: string;
    documents?: {
        commercialLicenseUrl?: string;
        tradeLicenseUrl?: string;
        profilePictureUrl?: string;
    };
}

export interface Admin extends BaseUser {
    role: 'admin';
}

