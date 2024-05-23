export interface Thirdparty {
    id?: string;
    Iban: string;
    address: string;
    addressComp: string;
    city: string;
    companyType: string;
    fiscalId: string;
    fiscalName: string;
    postalCode: string;
    state: string;
    tpType: string;
    createdBy: {
        id: string;
        name: string;
    };
    createdAt: Date;
    updatedAt?: Date;
    updatedBy?: {
        id: string;
        name: string;
    };
};