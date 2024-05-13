export interface BackUser {
        email: string;
        name: string;
        surname: string;
        mobile: string;
        role: string;
        managedTpIds?: [string];
        relatedTpId?: string;
        relatedTpName?: string;
        relatedTpFiscalId?: string;
        managedUserIds?: [string];
        createdBy?: {
                uid: string;
                name: string;
        };
        createdAt?: Date;
        updatedAt?: {
                seconds: number;
                nanoseconds: number;
        };
        updatedBy?: {
                uid: string;
                name: string;
        };
        validationSetup?: boolean;
};