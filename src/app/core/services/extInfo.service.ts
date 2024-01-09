import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subscription, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { ToastService } from './toast.service';

interface AuthResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
};

interface ErrorResponse {
    message: string;
    status: number;
};

interface CompanyInfo {
    denominacion: string;
    nombreComercial: string[];
    domicilioSocial: string;
    localidad: string;
    formaJuridica: string;
    cnae: string;
    fechaUltimoBalance: string;
    identificativo: string;
    situacion: string;
    telefono: number[];
    fax: number[];
    web: string[];
    email: string;
    cargoPrincipal: string;
    cargoPrincipalPuesto: string;
    capitalSocial: number;
    ventas: number;
    anioVentas: number;
    empleados: number;
    fechaConstitucion: string;
}

@Injectable({ providedIn: 'root' })
export class ExtInfoService implements OnDestroy{
    private endPointUri: string;
    private accessToken: string | null = null;
    private tokenExpirationDate: Date | null = null;

    private authSub: Subscription = new Subscription();

	constructor(
        private http: HttpClient,
        private toastService: ToastService
    ) {
        this.endPointUri = environment.extInfoService.endpoint.base;
        this.authSub = this.auth().subscribe();
    }

    private auth(): Observable<AuthResponse> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        // Convert credentials object to URL-encoded string
        const body = new URLSearchParams();
        body.set('client_id', environment.extInfoService.credentials.client_id);
        body.set('client_secret', environment.extInfoService.credentials.client_secret);
        body.set('grant_type', environment.extInfoService.credentials.grant_type);
        body.set('scope', environment.extInfoService.credentials.scope);

        return this.http.post<AuthResponse>(
            this.endPointUri + environment.extInfoService.endpoint.paths.auth,
            body.toString(),
            { headers }
        )
        .pipe(
            tap((response: AuthResponse) => {
                this.accessToken = response.access_token;
                this.tokenExpirationDate = new Date(Date.now() + response.expires_in * 1000);
            }),
            catchError((error: ErrorResponse) => {
                console.error('Auth Error:', error.message);
                return throwError(() =>  error);
            }),
        );
    }

    private isTokenExpired(): boolean {
        if (!this.tokenExpirationDate) {
            return true;
        }
        return this.tokenExpirationDate.getTime() <= new Date().getTime();
    }

    getTpInfo(fiscalId: string): Observable<any> {
        return this.ensureAuthenticated().pipe(
            switchMap((authResponse: AuthResponse) => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${authResponse.access_token}`,
                    'Accept': 'application/json'
                });

                return this.http.get<any>(`${this.endPointUri}${environment.extInfoService.endpoint.paths.getBasicInfo}${fiscalId}/test`, { headers })
                .pipe(
                    map((response: CompanyInfo) => {
                        return {
                            fiscalName: response.denominacion, // Done
                            fiscalId: response.identificativo, // Done
                            address: response.domicilioSocial, // Todo
                            city: response.localidad, // Todo
                            postalCode: '', // Todo
                            state: '', // Todo
                            phone: response.telefono[0].toString(), // Done
                            fax: response.fax[0].toString(), // Done
                            website: response.web[0], // Done
                            email: response.email, // Done
                            alias: response.nombreComercial[0], 
                            companyType: response.formaJuridica, // Done
                            activityCode: response.cnae,
                            latestFSDate: response.fechaUltimoBalance, // Done
                            equity: response.capitalSocial, // Done
                            sales: response.ventas, // Done 
                            salesYear: response.anioVentas, // Done
                            employees: response.empleados, // Done
                            constitutionDate: response.fechaConstitucion, // Done
                            companyStatus: response.situacion, 
                        }
                    })
                );
            }),
            catchError(error => {
                switch(error.status) {
                    case 404: 
                        this.toastService.show('bg-danger text-light', 'Este tercero no está en la base de datos', 'Tercero no encontrado',  7000);
                        break;
                    case 401:
                        this.toastService.show('bg-danger text-light', 'No autorizado - hay un problema con el servicio de datos', 'No autorizado', 7000);
                        break;
                    default:
                        this.toastService.show('bg-danger text-light', `Hay un problema con el servicio de datos: ${error.message}`, 'Error Desconocido', 7000);
                        break;
                };
                return throwError(() => error);
            })
        );
    }

    private ensureAuthenticated(): Observable<AuthResponse> {
        if (this.accessToken && !this.isTokenExpired()) {
            return of({
                access_token: this.accessToken,
                expires_in: this.tokenExpirationDate ? (this.tokenExpirationDate.getTime() - new Date().getTime()) / 1000 : 0,
                scope: '',
                token_type: 'Bearer'
            });
        }
        return this.auth();
    }

    ngOnDestroy(): void {
        this.authSub.unsubscribe();
    }
}
