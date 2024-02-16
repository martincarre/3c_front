import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, where, query, deleteDoc, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MailService {

    private mailCollection;

    constructor(
        private fs: Firestore,
    ) {
        this.mailCollection = collection(this.fs,'mail');
    }

    public async fetchMailById(id: string): Promise<any> {
        const mailRef = doc(this.mailCollection, id);
        return  (await getDoc(mailRef)).data();
        // return await getDoc(opRef)
        // .then((doc) => {
        //     if (!doc.exists()) {
        //         return null;
        //     }
        //     return doc.data().map((opMail) => {
        //         return { id: opMail.id, ...opMail.data() };
        //     });
        // })
        // .catch((err) => {
        //     console.log(err);
        // });
    }
}