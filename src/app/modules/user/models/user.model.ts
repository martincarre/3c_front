export interface BackUser {
        email: string;
        name: string;
        surname: string;
        mobile: string;
        managedTpIds?: [string];
        relatedTpId?: string;
        role: string;
};