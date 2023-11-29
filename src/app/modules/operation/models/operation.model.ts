export interface Operation {
    tpFiscalId: string;
    investment: number;
    date: string;
    item: string;
    comment: string;
    tenor: number;
    rv: number;
    margin: number;
    reference: string;
    // attachments: Blob[]; // Check this one later -> How do I do this? 
}