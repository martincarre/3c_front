import { Injectable, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subscription, catchError, of, switchMap, takeUntil, tap, throwError } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class ExtInfoService implements OnDestroy{
    private endPointUri: string;
    private accessToken: string | null = null;
    private tokenExpirationDate: Date | null = null;

    private authSub: Subscription = new Subscription();

	constructor(
        private http: HttpClient
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

                return this.http.get<any>(`${this.endPointUri}${environment.extInfoService.endpoint.paths.getBasicInfo}${fiscalId}/test`, { headers });
            }),
            catchError(error => {
                console.error('Error fetching TP Info:', error);
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
