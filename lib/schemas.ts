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

