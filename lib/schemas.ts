import { z } from 'zod';

export const createUpcomingRequestSchema = z.object({
    preBayanNumber: z.string().min(1, 'Pre-Bayan Number is required'),
    preBayanFileName: z.string().optional(),
    waybillNumber: z.string().min(1, 'Waybill Number is required'),
    waybillFileName: z.string().optional(),
    agentId: z.string().optional(),
});

export const linkAgentSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const finalBayanSchema = z.object({
    finalBayanNumber: z.string().min(1, 'Final Bayan Number is required'),
    finalBayanFileName: z.string().optional(),
    dutyAmount: z.number().min(0, 'Duty amount must be positive'),
    notes: z.string().optional(),
});

export const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
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
    companyName: z.string().min(1, 'Company Name is required'),
    name: z.string().min(1, 'Importer Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    linkAccount: z.boolean(),
});

export type AddImporterInput = z.infer<typeof addImporterSchema>;

export const createPaymentSchema = z.object({
    amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
    description: z.string().min(1, 'Description is required'),
    shipmentId: z.string().min(1, 'Shipment is required'),
    importerId: z.string().min(1, 'Importer is required'),
    billNumber: z.string().optional(),
    bayanNumber: z.string().optional(),
    paymentDeadline: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

