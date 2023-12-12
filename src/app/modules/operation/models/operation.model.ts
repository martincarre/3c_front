export interface Operation {
    partnerId: string;
    investment: number;
    date: string;
    item: string;
    comment: string;
    tenor: number;
    rv: number;
    margin: number;
    description: string;
    // attachments: Blob[]; // Check this one later -> How do I do this? 
}