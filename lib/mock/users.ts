import type { Admin, Importer, Agent } from '@/types';

export const admins: Admin[] = [
    {
        id: 'a1',
        name: 'Dnaara Admin',
        email: 'admin@dnaara.com',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
    },
];

export const importers: Importer[] = [
    {
        id: 'i1',
        name: 'Ahmed Al-Mansoori',
        email: 'ahmed@almansoori.com',
        phone: '+971501234567',
        status: 'active',
        businessName: 'Al-Mansoori Trading LLC',
        crNumber: 'CR-12345',
        documents: {
            commercialRegistrationUrl: 'cr-doc-1.pdf',
            chamberAuthUrl: 'chamber-doc-1.pdf',
        },
        createdAt: '2024-01-15T00:00:00Z',
    },
    {
        id: 'i2',
        name: 'Fatima Al-Zahra',
        email: 'fatima@zahraimports.com',
        phone: '+971502345678',
        status: 'active',
        businessName: 'Zahra Imports FZE',
        crNumber: 'CR-23456',
        documents: {
            commercialRegistrationUrl: 'cr-doc-2.pdf',
        },
        createdAt: '2024-01-20T00:00:00Z',
    },
    {
        id: 'i3',
        name: 'Mohammed Hassan',
        email: 'mohammed@hassan.com',
        phone: '+971503456789',
        status: 'pending',
        businessName: 'Hassan Trading Co.',
        crNumber: 'CR-34567',
        createdAt: '2024-02-01T00:00:00Z',
    },
    {
        id: 'i4',
        name: 'Sara Al-Ahmad',
        email: 'sara@ahmad.com',
        status: 'active',
        businessName: 'Ahmad International',
        crNumber: 'CR-45678',
        documents: {
            commercialRegistrationUrl: 'cr-doc-4.pdf',
            chamberAuthUrl: 'chamber-doc-4.pdf',
        },
        createdAt: '2024-02-10T00:00:00Z',
    },
    {
        id: 'i5',
        name: 'Khalid Al-Rashid',
        email: 'khalid@rashid.com',
        phone: '+971505678901',
        status: 'active',
        businessName: 'Rashid Global Trading',
        crNumber: 'CR-56789',
        createdAt: '2024-02-15T00:00:00Z',
    },
];

export const agents: Agent[] = [
    {
        id: 'ag1',
        name: 'Ali Customs Services',
        email: 'ali@customs.com',
        phone: '+971506789012',
        status: 'active',
        companyName: 'Ali Customs Services LLC',
        commercialLicenseNumber: 'CL-1001',
        documents: {
            commercialLicenseUrl: 'cl-doc-1.pdf',
            tradeLicenseUrl: 'tl-doc-1.pdf',
        },
        createdAt: '2024-01-10T00:00:00Z',
    },
    {
        id: 'ag2',
        name: 'Dubai Clearance Pro',
        email: 'info@dubaiclearance.com',
        phone: '+971507890123',
        status: 'active',
        companyName: 'Dubai Clearance Pro FZE',
        commercialLicenseNumber: 'CL-1002',
        documents: {
            commercialLicenseUrl: 'cl-doc-2.pdf',
        },
        createdAt: '2024-01-12T00:00:00Z',
    },
    {
        id: 'ag3',
        name: 'Express Customs',
        email: 'contact@expresscustoms.com',
        status: 'pending',
        companyName: 'Express Customs LLC',
        commercialLicenseNumber: 'CL-1003',
        createdAt: '2024-02-05T00:00:00Z',
    },
    {
        id: 'ag4',
        name: 'Global Logistics Clearance',
        email: 'info@globallogistics.com',
        phone: '+971509012345',
        status: 'active',
        companyName: 'Global Logistics Clearance FZE',
        commercialLicenseNumber: 'CL-1004',
        documents: {
            commercialLicenseUrl: 'cl-doc-4.pdf',
            tradeLicenseUrl: 'tl-doc-4.pdf',
        },
        createdAt: '2024-02-08T00:00:00Z',
    },
    {
        id: 'ag5',
        name: 'Fast Track Customs',
        email: 'support@fasttrack.com',
        phone: '+971510123456',
        status: 'active',
        companyName: 'Fast Track Customs LLC',
        commercialLicenseNumber: 'CL-1005',
        createdAt: '2024-02-12T00:00:00Z',
    },
];

