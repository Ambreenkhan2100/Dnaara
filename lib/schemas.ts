import { z } from 'zod';

export const createUpcomingRequestSchema = z.object({
    preBayanNumber: z.string().min(1, 'Pre-Bayan Number is required'),
    preBayanFileName: z.string().optional(),
    waybillNumber: z.string().min(1, 'Waybill Number is required'),
    waybillFileName: z.string().optional(),
    agentId: z.string().optional(),
});

export const companyEmailSchema = z.string().email('Invalid email address').refine((email) => {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    const forbidden = ['gmail', 'yahoo', 'hotmail', 'outlook'];
    return !forbidden.some(f => domain.includes(f));
}, 'Public email domains are not allowed. Please use a company email.');

export const linkAgentSchema = z.object({
    email: companyEmailSchema,
});

export const finalBayanSchema = z.object({
    finalBayanNumber: z.string().min(1, 'Final Bayan Number is required'),
    finalBayanFileName: z.string().optional(),
    dutyAmount: z.number().min(0, 'Duty amount must be positive'),
    notes: z.string().optional(),
});

export const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: companyEmailSchema,
    phone: z.string().optional(),
    type: z.enum(['importer', 'agent']),
    businessName: z.string().optional(),
    crNumber: z.string().optional(),
    companyName: z.string().optional(),
    commercialLicenseNumber: z.string().optional(),
});

export type CreateUpcomingRequestInput = z.infer<typeof createUpcomingRequestSchema>;
export type LinkAgentInput = z.infer<typeof linkAgentSchema>;
export type FinalBayanInput = z.infer<typeof finalBayanSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const addImporterSchema = z.object({
    email: companyEmailSchema,
});

export type AddImporterInput = z.infer<typeof addImporterSchema>;

export const createPaymentSchema = z.object({
    amount: z.coerce.string().min(1, 'Amount must be greater than 0'),
    description: z.string().min(1, 'Description is required'),
    shipmentId: z.string().min(1, 'Shipment is required'),
    importerId: z.string().min(1, 'Importer is required'),
    billNumber: z.string().optional(),
    bayanNumber: z.string().optional(),
    paymentDeadline: z.string().optional(),
    paymentType: z.string().min(1, 'Payment type is required'),
    otherPaymentName: z.string().optional(),
    payment_document_url: z.string().min(1, 'Payment document is required'),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const createAdminShipmentSchema = z.object({
    importerId: z.string().min(1, 'Importer is required'),
    agentId: z.string().min(1, 'Agent is required'),
    type: z.enum(['air', 'sea', 'land']),
    portOfShipment: z.string().min(1, 'Port of Shipment is required'),
    portOfDestination: z.string().min(1, 'Port of Destination is required'),
    expectedArrival: z.string().min(1, 'Expected Arrival Date is required'),
    billNumber: z.string().min(1, 'Bill Number is required'),
    bayanNumber: z.string().min(1, 'Bayan Number is required'),
    bayanFile: z.any().optional(), // File upload handling
    dutyAmount: z.coerce.number().min(0, 'Duty Amount must be positive'),
    comments: z.string().optional(),
    notifyImporter: z.boolean().default(false),
    notifyAgent: z.boolean().default(false),
    numberOfPallets: z.number().optional(),
    trucks: z.array(z.object({
        id: z.string(),
        vehicleNumber: z.string(),
        driverName: z.string(),
        driverMobileOrigin: z.string(),
        driverMobileDestination: z.string(),
    })).optional(),
});

export type CreateAdminShipmentInput = z.infer<typeof createAdminShipmentSchema>;

export const addAgentSchema = z.object({
    companyName: z.string().min(1, 'Company Name is required'),
    name: z.string().min(1, 'Agent Name is required'),
    email: companyEmailSchema,
    phone: z.string().min(1, 'Phone number is required'),
    sendInvite: z.boolean(),
});

export type AddAgentInput = z.infer<typeof addAgentSchema>;

export const addAdminImporterSchema = z.object({
    companyName: z.string().min(1, 'Company Name is required'),
    name: z.string().min(1, 'Importer Name is required'),
    email: companyEmailSchema,
    phone: z.string().min(1, 'Phone number is required'),
    sendInvite: z.boolean(),
});

export type AddAdminImporterInput = z.infer<typeof addAdminImporterSchema>;

export const createAdminPaymentSchema = z.object({
    shipmentType: z.enum(['air', 'sea', 'land']),
    shipmentId: z.string().min(1, 'Shipment is required'),
    billNumber: z.string().min(1, 'Bill Number is required'),
    bayanNumber: z.string().min(1, 'Bayan Number is required'),
    amount: z.coerce.number().min(1, 'Amount must be positive'),
    paymentDeadline: z.string().min(1, 'Payment Deadline is required'),
    comments: z.string().optional(),
});

export type CreateAdminPaymentInput = z.infer<typeof createAdminPaymentSchema>;

export const signupSchema = z.object({
    role: z.enum(['Importer', 'Agent']),
    legalBusinessName: z.string().min(1, 'Legal Business Name is required'),
    tradeRegistrationNumber: z.string().min(1, 'Trade Registration Number is required'),
    nationalAddress: z.string().min(1, 'National Address is required'),
    fullName: z.string().min(1, 'Full Name is required'),
    position: z.string().min(1, 'Position/Role is required'),
    phoneNumber: z.string().min(1, 'Phone Number is required'),
    nationalId: z.string().min(1, 'National ID is required'),
    companyEmail: companyEmailSchema,
    password: z.string().min(6, 'Password must be at least 6 characters'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

export type SignupInput = z.infer<typeof signupSchema>;
