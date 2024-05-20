export interface BackUser {
        email: string;
        name: string;
        surname: string;
        mobile: string;
        role: string;
        managedTpIds?: [string];
        relatedTpId?: string;
        partner?: any;
        relatedTpName?: string;
        relatedTpFiscalId?: string;
        managedUserIds?: [string];
        createdBy?: {
                id: string;
                name: string;
        };
        createdAt?: Date;
        updatedAt?: Date;
        updatedBy?: {
                id: string;
                name: string;
        };
        validationSetup?: boolean;
};