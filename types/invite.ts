export enum CompanyType {
    IMPORTER = 'IMPORTER',
    AGENT = 'AGENT'
}

export enum RelationshipStatus {
    ACTIVE = 'ACTIVE',
    INVITED = 'INVITED'
}

export interface InviteRequest {
    id: string;
    email: string;
    company_type: CompanyType;
}

export interface ConnectedUser {
    id: string;
    relationship_status: RelationshipStatus;
    created_at: string;
    user_id: string;
    legal_business_name: string;
    trade_registration_number: string;
    national_address: string;
    full_name: string;
    position: string;
    phone_number: string;
    national_id: string;
    company_email: string;
    importer_id: string;
    agent_id: string;
}