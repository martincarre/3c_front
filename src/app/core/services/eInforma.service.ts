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
// Informe Financiero
// {
//     "campoCodificadoRespuesta": {
//         "valor": 0,
//         "tablaDecodificacion": "tablaCodigoRespuesta"
//     },
//     "datosPeticion": {
//         "productoSolicitado": "informe_financiero",
//         "numeroVersionTablasInformacionComercial": 5.55,
//         "parametrosCliente": {
//             "username": "926071",
//             "formato": "json",
//             "cif": "A00000000"
//         }
//     },
//     "datosProducto": {
//         "informacionComercial": {
//             "identificacion": {
//                 "cif": "A00000000",
//                 "denominacionActual": "LA NUEVA SOCIEDAD PARA DEMOSTRACION SAU",
//                 "listaDenominacionesAntiguas": [
//                     "SOCIEDAD PARA DEMOSTRACION SAU"
//                 ],
//                 "listaTelefonos": [
//                     "917633072"
//                 ],
//                 "fax": "910006666",
//                 "email": "laficticianueva@empresa.com",
//                 "listaUrls": [
//                     "www.laprimerasd.es",
//                     "www.informa.es"
//                 ],
//                 "listaContactos": [
//                     {
//                         "campoCodificadoTipoContactoEmpresa": {
//                             "valor": "05",
//                             "tablaDecodificacion": "tablaTipoContactos"
//                         },
//                         "descripcionContacto": "http://www.facebook.com/laprimerasd"
//                     },
//                     {
//                         "campoCodificadoTipoContactoEmpresa": {
//                             "valor": "05",
//                             "tablaDecodificacion": "tablaTipoContactos"
//                         },
//                         "descripcionContacto": "http://www.facebook.com/informadb"
//                     },
//                     {
//                         "campoCodificadoTipoContactoEmpresa": {
//                             "valor": "06",
//                             "tablaDecodificacion": "tablaTipoContactos"
//                         },
//                         "descripcionContacto": "https://twitter.com/informa"
//                     },
//                     {
//                         "campoCodificadoTipoContactoEmpresa": {
//                             "valor": "07",
//                             "tablaDecodificacion": "tablaTipoContactos"
//                         },
//                         "descripcionContacto": "http://www.linkedin.com/company/informa-d&b"
//                     },
//                     {
//                         "campoCodificadoTipoContactoEmpresa": {
//                             "valor": "08",
//                             "tablaDecodificacion": "tablaTipoContactos"
//                         },
//                         "descripcionContacto": "http://www.empresaactual.com/"
//                     }
//                 ]
//             },
//             "datosGenerales": {
//                 "campoCodificadoVida": {
//                     "valor": "00",
//                     "tablaDecodificacion": "tablaVida"
//                 },
//                 "fechaCodigoVidaActual": "2024-02-27",
//                 "campoCodificadoSubcodigoVida": {
//                     "valor": "10",
//                     "tablaDecodificacion": "tablaStatus"
//                 },
//                 "campoCodificadoVidaEmpresaCompleto": {
//                     "valor": "001003000000000000",
//                     "tablaDecodificacion": "tablaResumenEjecutivo"
//                 },
//                 "numeroConsultasUltimoTrimestre": 21333,
//                 "numeroConsultasTotales": 363994,
//                 "fechaUltimoDatoIncluidoInforme": "2024-05-22",
//                 "fechaSituacionEspecialStatus": "2024-02-27",
//                 "formaJuridica": {
//                     "campoCodificadoFormaJuridica": {
//                         "valor": "01",
//                         "tablaDecodificacion": "tablaFormaJuridica"
//                     },
//                     "campoCodificadoFormaJuridicaAmpliada": {
//                         "valor": "0104",
//                         "tablaDecodificacion": "tablaFormaJuridicaClase"
//                     },
//                     "fechaFuente": "2023-10-26"
//                 },
//                 "capitalSocial": {
//                     "importeCapitalSocial": 500000.0,
//                     "campoCodificadoTipoCapitalSocial": {
//                         "valor": "CS",
//                         "tablaDecodificacion": "tablaTipoCapitalSocial"
//                     },
//                     "fechaCapitalSocial": "2023-12-31"
//                 },
//                 "capitalDesembolsado": {
//                     "importeCapitalDesembolsado": 500000.0,
//                     "campoCodificadoTipoCapitalDesembolsado": {
//                         "valor": "CS",
//                         "tablaDecodificacion": "tablaTipoCapitalDesembolsado"
//                     },
//                     "fechaCapitalDesembolsado": "2023-12-31"
//                 }
//             },
//             "marcas": {
//                 "totalMarcas": "0"
//             },
//             "listaRotulos": [
//                 "PRISODE"
//             ],
//             "direcciones": {
//                 "direccionActual": {
//                     "campoCodificadoTipoVia": {
//                         "valor": "CL",
//                         "tablaDecodificacion": "tipoVia"
//                     },
//                     "nombreVia": "GRAN VIA",
//                     "numeroVia": "25",
//                     "codigoPostal": "28013",
//                     "municipio": "MADRID",
//                     "campoCodificadoProvincia": {
//                         "valor": "28",
//                         "tablaDecodificacion": "tablaProvincias"
//                     },
//                     "campoCodificadoComunidadAutonoma": {
//                         "valor": "28",
//                         "tablaDecodificacion": "tablaComunidadAutonoma"
//                     },
//                     "coordenadaX": -3.7022,
//                     "coordenadaY": 40.41987,
//                     "precisionCoordenadas": 1
//                 },
//                 "direccionAnterior": {
//                     "campoCodificadoTipoVia": {
//                         "valor": "CL",
//                         "tablaDecodificacion": "tipoVia"
//                     },
//                     "nombreVia": "ALCALA",
//                     "numeroVia": "445",
//                     "restoNumeroVia": "PLANTA 1",
//                     "codigoPostal": "28027",
//                     "municipio": "MADRID",
//                     "campoCodificadoProvincia": {
//                         "valor": "28",
//                         "tablaDecodificacion": "tablaProvincias"
//                     },
//                     "campoCodificadoComunidadAutonoma": {
//                         "valor": "28",
//                         "tablaDecodificacion": "tablaComunidadAutonoma"
//                     },
//                     "coordenadaX": -3.6353,
//                     "coordenadaY": 40.43875,
//                     "precisionCoordenadas": 1
//                 }
//             },
//             "sucursales": {
//                 "totalSucursales": 11,
//                 "listaSucursales": [
//                     {
//                         "campoCodificadoTipoVia": {
//                             "valor": "AV",
//                             "tablaDecodificacion": "tipoVia"
//                         },
//                         "nombreVia": "SANT JORDI",
//                         "numeroVia": "308",
//                         "codigoPostal": "08960",
//                         "localidad": "SANT JUST DESVERN",
//                         "municipio": "SANT JUST DESVERN",
//                         "campoCodificadoProvincia": {
//                             "valor": "08",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "campoCodificadoComunidadAutonoma": {
//                             "valor": "90",
//                             "tablaDecodificacion": "tablaComunidadAutonoma"
//                         }
//                     },
//                     {
//                         "campoCodificadoTipoVia": {
//                             "valor": "CL",
//                             "tablaDecodificacion": "tipoVia"
//                         },
//                         "nombreVia": "VELAZQUEZ",
//                         "numeroVia": "21",
//                         "codigoPostal": "28001",
//                         "localidad": "MADRID",
//                         "municipio": "MADRID",
//                         "campoCodificadoProvincia": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "campoCodificadoComunidadAutonoma": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaComunidadAutonoma"
//                         },
//                         "coordenadaX": -3.68446,
//                         "coordenadaY": 40.42354,
//                         "precisionCoordenadas": 1
//                     },
//                     {
//                         "campoCodificadoTipoVia": {
//                             "valor": "CL",
//                             "tablaDecodificacion": "tipoVia"
//                         },
//                         "nombreVia": "VELAZQUEZ",
//                         "numeroVia": "18",
//                         "codigoPostal": "28001",
//                         "localidad": "MADRID",
//                         "municipio": "MADRID",
//                         "campoCodificadoProvincia": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "campoCodificadoComunidadAutonoma": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaComunidadAutonoma"
//                         },
//                         "coordenadaX": -3.68408,
//                         "coordenadaY": 40.42334,
//                         "precisionCoordenadas": 1
//                     },
//                     {
//                         "campoCodificadoTipoVia": {
//                             "valor": "CL",
//                             "tablaDecodificacion": "tipoVia"
//                         },
//                         "nombreVia": "RIBERA DE CURTIDORES",
//                         "numeroVia": "18",
//                         "codigoPostal": "28005",
//                         "localidad": "MADRID",
//                         "municipio": "MADRID",
//                         "campoCodificadoProvincia": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "campoCodificadoComunidadAutonoma": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaComunidadAutonoma"
//                         },
//                         "coordenadaX": -3.70747,
//                         "coordenadaY": 40.40742,
//                         "precisionCoordenadas": 1
//                     },
//                     {
//                         "campoCodificadoTipoVia": {
//                             "valor": "BO",
//                             "tablaDecodificacion": "tipoVia"
//                         },
//                         "nombreVia": "PILAR",
//                         "codigoPostal": "28029",
//                         "localidad": "MADRID",
//                         "municipio": "MADRID",
//                         "campoCodificadoProvincia": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "campoCodificadoComunidadAutonoma": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaComunidadAutonoma"
//                         }
//                     },
//                     {
//                         "campoCodificadoTipoVia": {
//                             "valor": "AV",
//                             "tablaDecodificacion": "tipoVia"
//                         },
//                         "nombreVia": "BUCARAMANGA",
//                         "restoNombreVia": "BJ",
//                         "numeroVia": "20",
//                         "codigoPostal": "28033",
//                         "localidad": "MADRID",
//                         "municipio": "MADRID",
//                         "campoCodificadoProvincia": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "campoCodificadoComunidadAutonoma": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaComunidadAutonoma"
//                         },
//                         "coordenadaX": -3.63817,
//                         "coordenadaY": 40.47227,
//                         "precisionCoordenadas": 4
//                     },
//                     {
//                         "campoCodificadoTipoVia": {
//                             "valor": "CL",
//                             "tablaDecodificacion": "tipoVia"
//                         },
//                         "nombreVia": "IMPALA",
//                         "numeroVia": "5",
//                         "codigoPostal": "28033",
//                         "localidad": "MADRID",
//                         "municipio": "MADRID",
//                         "campoCodificadoProvincia": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "campoCodificadoComunidadAutonoma": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaComunidadAutonoma"
//                         },
//                         "coordenadaX": -3.63676,
//                         "coordenadaY": 40.47274,
//                         "precisionCoordenadas": 1
//                     },
//                     {
//                         "campoCodificadoTipoVia": {
//                             "valor": "PS",
//                             "tablaDecodificacion": "tipoVia"
//                         },
//                         "nombreVia": "DE LA CHOPERA",
//                         "restoNombreVia": "4 B",
//                         "numeroVia": "25",
//                         "codigoPostal": "28100",
//                         "localidad": "ALCOBENDAS",
//                         "municipio": "ALCOBENDAS",
//                         "campoCodificadoProvincia": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "campoCodificadoComunidadAutonoma": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaComunidadAutonoma"
//                         },
//                         "coordenadaX": -3.641,
//                         "coordenadaY": 40.54052,
//                         "precisionCoordenadas": 1
//                     },
//                     {
//                         "campoCodificadoTipoVia": {
//                             "valor": "PS",
//                             "tablaDecodificacion": "tipoVia"
//                         },
//                         "nombreVia": "DE LA CHOPERA",
//                         "numeroVia": "80",
//                         "codigoPostal": "28100",
//                         "localidad": "ALCOBENDAS",
//                         "municipio": "ALCOBENDAS",
//                         "campoCodificadoProvincia": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "campoCodificadoComunidadAutonoma": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaComunidadAutonoma"
//                         },
//                         "coordenadaX": -3.64255765,
//                         "coordenadaY": 40.54296975,
//                         "precisionCoordenadas": 1
//                     },
//                     {
//                         "campoCodificadoTipoVia": {
//                             "valor": "PZ",
//                             "tablaDecodificacion": "tipoVia"
//                         },
//                         "nombreVia": "BANARES",
//                         "numeroVia": "44",
//                         "codigoPostal": "48003",
//                         "localidad": "BILBAO",
//                         "municipio": "BILBAO",
//                         "campoCodificadoProvincia": {
//                             "valor": "48",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "campoCodificadoComunidadAutonoma": {
//                             "valor": "96",
//                             "tablaDecodificacion": "tablaComunidadAutonoma"
//                         }
//                     }
//                 ]
//             },
//             "actividad": {
//                 "campoCodificadoCaci": {
//                     "valor": "1451000",
//                     "tablaDecodificacion": "tablaCaci"
//                 },
//                 "campoCodificadoCnae1993": {
//                     "valor": "1930",
//                     "tablaDecodificacion": "tablaCnae"
//                 },
//                 "campoCodificadoCnae2009": {
//                     "valor": "1520",
//                     "tablaDecodificacion": "tablaCnae09"
//                 },
//                 "campoCodificadoSics": {
//                     "listaValores": [],
//                     "tablaDecodificacion": "tablaSIC"
//                 },
//                 "fechaInicioActividad": "1981-04-01",
//                 "campoCodificadoOrigenFechaInicioActividad": {
//                     "valor": "I",
//                     "tablaDecodificacion": "tablaOrigen"
//                 },
//                 "campoCodificadoFuenteFechaInicioActividad": {
//                     "valor": "I6",
//                     "tablaDecodificacion": "tablaTiposFuente"
//                 },
//                 "objetoSocial": "Plantación, cultivo, distribución y transporte de toda clase de frutos, frutas y hortalizas, comercio al por mayor y al por menor de productos alimenticios."
//             },
//             "empleados": {
//                 "annoActualizacionEmpleados": 2024,
//                 "campoCodificadoFuenteEmpleados": {
//                     "valor": "I7",
//                     "tablaDecodificacion": "tablaTiposFuente"
//                 },
//                 "numeroTotalEmpleados": 28,
//                 "numeroTotalEmpleadosFijos": 23.0,
//                 "numeroTotalEmpleadosEventuales": 5.0,
//                 "porcentajeHombres": 40.0,
//                 "porcentajeMujeres": 60.0
//             },
//             "contratosPublicos": {
//                 "contratosPublicosAdjudicados": {
//                     "totalContratosPublicosAdjudicados": 109,
//                     "listaResumenContratosPublicosAdjudicados": [
//                         {
//                             "campoCodificadoCodTipoAdministracion": {
//                                 "valor": "01",
//                                 "tablaDecodificacion": "tablaTipoOrganismoLicitacion"
//                             },
//                             "numeroContratos": 12,
//                             "importeTotal": 104659466.5,
//                             "fechaUltimoContrato": "2024-04-29"
//                         },
//                         {
//                             "campoCodificadoCodTipoAdministracion": {
//                                 "valor": "02",
//                                 "tablaDecodificacion": "tablaTipoOrganismoLicitacion"
//                             },
//                             "numeroContratos": 32,
//                             "importeTotal": 27508713.9,
//                             "fechaUltimoContrato": "2024-05-20"
//                         },
//                         {
//                             "campoCodificadoCodTipoAdministracion": {
//                                 "valor": "03",
//                                 "tablaDecodificacion": "tablaTipoOrganismoLicitacion"
//                             },
//                             "numeroContratos": 53,
//                             "importeTotal": 109939298.1,
//                             "fechaUltimoContrato": "2024-04-19"
//                         },
//                         {
//                             "campoCodificadoCodTipoAdministracion": {
//                                 "valor": "04",
//                                 "tablaDecodificacion": "tablaTipoOrganismoLicitacion"
//                             },
//                             "numeroContratos": 1,
//                             "importeTotal": 619882.0,
//                             "fechaUltimoContrato": "2024-02-13"
//                         },
//                         {
//                             "campoCodificadoCodTipoAdministracion": {
//                                 "valor": "06",
//                                 "tablaDecodificacion": "tablaTipoOrganismoLicitacion"
//                             },
//                             "numeroContratos": 4,
//                             "importeTotal": 5407765.6,
//                             "fechaUltimoContrato": "2023-11-28"
//                         },
//                         {
//                             "campoCodificadoCodTipoAdministracion": {
//                                 "valor": "07",
//                                 "tablaDecodificacion": "tablaTipoOrganismoLicitacion"
//                             },
//                             "numeroContratos": 2,
//                             "importeTotal": 251928.8,
//                             "fechaUltimoContrato": "2023-04-04"
//                         },
//                         {
//                             "campoCodificadoCodTipoAdministracion": {
//                                 "valor": "08",
//                                 "tablaDecodificacion": "tablaTipoOrganismoLicitacion"
//                             },
//                             "numeroContratos": 3,
//                             "importeTotal": 1393543.0,
//                             "fechaUltimoContrato": "2024-05-07"
//                         },
//                         {
//                             "campoCodificadoCodTipoAdministracion": {
//                                 "valor": "09",
//                                 "tablaDecodificacion": "tablaTipoOrganismoLicitacion"
//                             },
//                             "numeroContratos": 1,
//                             "importeTotal": 5000.0,
//                             "fechaUltimoContrato": "2020-09-10"
//                         },
//                         {
//                             "campoCodificadoCodTipoAdministracion": {
//                                 "valor": "10",
//                                 "tablaDecodificacion": "tablaTipoOrganismoLicitacion"
//                             },
//                             "numeroContratos": 1,
//                             "fechaUltimoContrato": "2020-01-10"
//                         }
//                     ],
//                     "listaContratosPublicosAdjudicados": [
//                         {
//                             "numExpediente": "CSE/9900/1101047835/22/AM",
//                             "entidad": "Servicio Murciano de Salud - Gerencia",
//                             "nombreOrganismoSuperior": "Comunidades Autonomas>Región de Murcia",
//                             "campoCodificadoCodTipoProyecto": {
//                                 "valor": "2",
//                                 "tablaDecodificacion": "tablaTiposProyectoLicitaciones"
//                             },
//                             "descripcionContrato": "Acuerdo Marco para la contratación de los servicios de Desarrollo y Soporte de los Sistemas de Información del Servicio Murciano de Salud",
//                             "presupuesto": 15977280,
//                             "campoCodificadoCodTipoContratacion": {
//                                 "valor": "1",
//                                 "tablaDecodificacion": "tablaTipoContratacionLicitaciones"
//                             },
//                             "campoCodificadoCodFuente": {
//                                 "valor": "ME",
//                                 "tablaDecodificacion": "tablaTiposFuente"
//                             },
//                             "fechaFuente": "2024-05-20",
//                             "descripcionFechaFin": "plazo de ejecución de 2 Años",
//                             "linkDetalle": "https://contrataciondelestado.es/wps/poc?uri=deeplink:detalle_licitacion&idEvl=QzcJsgTFxKPnSoTX3z%2F7wA%3D%3D",
//                             "numContratos": 1,
//                             "listaEmpresasAdjudicatarias": [
//                                 {
//                                     "razonSocial": "LA NUEVA SOCIEDAD PARA DEMOSTRACION SAU",
//                                     "cif": "A00000000",
//                                     "fecha": "2022-10-20",
//                                     "duracion": 2,
//                                     "unidadDuracion": "ANN",
//                                     "descripcionContrato": "Acuerdo Marco para la contratación de los servicios de Desarrollo y Soporte de los Sistemas de Información del Servicio Murciano de Salud",
//                                     "indPyme": "N",
//                                     "idContrato": "1101047835"
//                                 }
//                             ]
//                         },
//                         {
//                             "numExpediente": "2023-44706/ PRO 40-23",
//                             "entidad": "Órgano de Contratación de la Ciudad Autónoma de Ceuta",
//                             "nombreOrganismoSuperior": "Sector Público>COMUNIDADES Y CIUDADES AUTÓNOMAS>Ciudad Autónoma de Ceuta>Consejería de Economía, Hacienda, Administración Pública y Empleo",
//                             "campoCodificadoCodTipoProyecto": {
//                                 "valor": "3",
//                                 "tablaDecodificacion": "tablaTiposProyectoLicitaciones"
//                             },
//                             "descripcionContrato": "Obras contenidas en el \"Proyecto de ampliación del cementerio musulmán de Ceuta - FASE 2\", rasí como en la adenda en la que se recogen el presupuesto actualizado y los planos de detalle de las nuevas soluciones constructivas",
//                             "presupuesto": 1502308,
//                             "campoCodificadoCodTipoContratacion": {
//                                 "valor": "9",
//                                 "tablaDecodificacion": "tablaTipoContratacionLicitaciones"
//                             },
//                             "campoCodificadoCodFuente": {
//                                 "valor": "ME",
//                                 "tablaDecodificacion": "tablaTiposFuente"
//                             },
//                             "fechaFuente": "2024-05-09",
//                             "descripcionFechaFin": "plazo de ejecución de 8 Meses",
//                             "linkDetalle": "https://contrataciondelestado.es/wps/poc?uri=deeplink:detalle_licitacion&idEvl=GGOVewOMFoN4zIRvjBVCSw%3D%3D",
//                             "numContratos": 1,
//                             "listaEmpresasAdjudicatarias": [
//                                 {
//                                     "razonSocial": "LA NUEVA SOCIEDAD PARA DEMOSTRACION SAU",
//                                     "cif": "A00000000",
//                                     "importe": 1500805.69,
//                                     "fecha": "2024-04-09",
//                                     "descripcionContrato": "Obras contenidas en el \"Proyecto de ampliación del cementerio musulmán de Ceuta - FASE 2\", rasí como en la adenda en la que se recogen el presupuesto actualizado y los planos de detalle de las nuevas soluciones constructivas",
//                                     "indPyme": "N",
//                                     "idContrato": "PRO 40/23"
//                                 }
//                             ]
//                         },
//                         {
//                             "numExpediente": "AB/2023/0000003823",
//                             "entidad": "Consejo de Administración de la Sociedad Mercantil Estatal de Gestión Inmobiliaria de Patrimonio, M.P.S.A. (Segipsa)",
//                             "nombreOrganismoSuperior": "OTRAS ENTIDADES DEL SECTOR PÚBLICO>SOCIEDADES, FUNDACIONES y CONSORCIOS ESTATALES>Ministerio de Hacienda>SEGIPSA",
//                             "campoCodificadoCodTipoProyecto": {
//                                 "valor": "3",
//                                 "tablaDecodificacion": "tablaTiposProyectoLicitaciones"
//                             },
//                             "descripcionContrato": "Ejecución de las obras para la mejora de la eficiencia energética en determinados inmuebles de Patrimonio Sindical Acumulado que se ejecutarán en el marco de financiación por el Plan de Recuperación, Transformación y Resiliencia financiado por la Unión Europea -NEXT GENERATION. Grupo_03",
//                             "presupuesto": 22695249.26,
//                             "campoCodificadoCodTipoContratacion": {
//                                 "valor": "1",
//                                 "tablaDecodificacion": "tablaTipoContratacionLicitaciones"
//                             },
//                             "campoCodificadoCodFuente": {
//                                 "valor": "ME",
//                                 "tablaDecodificacion": "tablaTiposFuente"
//                             },
//                             "fechaFuente": "2024-05-07",
//                             "descripcionFechaFin": "plazo de ejecución de 20 Meses",
//                             "linkDetalle": "https://contrataciondelestado.es/wps/poc?uri=deeplink:detalle_licitacion&idEvl=cvISSuZykYyS81gZFETWmA%3D%3D",
//                             "numContratos": 1,
//                             "listaEmpresasAdjudicatarias": [
//                                 {
//                                     "razonSocial": "LA NUEVA SOCIEDAD PARA DEMOSTRACION SAU",
//                                     "cif": "A00000000",
//                                     "importe": 982474.16,
//                                     "fecha": "2024-03-21",
//                                     "descripcionContrato": "Ceuta",
//                                     "indPyme": "N",
//                                     "idContrato": "L13"
//                                 }
//                             ]
//                         },
//                         {
//                             "numExpediente": "04.199-0012/2113",
//                             "entidad": "Dirección General del Agua",
//                             "nombreOrganismoSuperior": "Sector Público>ADMINISTRACIÓN GENERAL DEL ESTADO>Ministerio para la Transición Ecológica y el Reto Demográfico>Secretaría de Estado de Medio Ambiente>Dirección General del Agua",
//                             "campoCodificadoCodTipoProyecto": {
//                                 "valor": "3",
//                                 "tablaDecodificacion": "tablaTiposProyectoLicitaciones"
//                             },
//                             "descripcionContrato": "Contratación de obras para del proyecto de trasvase entre las cuencas de los ríos Pizarroso, Alcollarín y Búrdalo, TT. MM. de Abertura, Alcollarín, Escurial y Zorita (Cáceres).",
//                             "presupuesto": 86668636.81,
//                             "campoCodificadoCodTipoContratacion": {
//                                 "valor": "1",
//                                 "tablaDecodificacion": "tablaTipoContratacionLicitaciones"
//                             },
//                             "campoCodificadoCodFuente": {
//                                 "valor": "ME",
//                                 "tablaDecodificacion": "tablaTiposFuente"
//                             },
//                             "fechaFuente": "2024-04-29",
//                             "descripcionFechaFin": "plazo de ejecución de 45 Meses",
//                             "linkDetalle": "https://contrataciondelestado.es/wps/poc?uri=deeplink:detalle_licitacion&idEvl=671XqcpZK2rIGlsa0Wad%2Bw%3D%3D",
//                             "numContratos": 1,
//                             "listaEmpresasAdjudicatarias": [
//                                 {
//                                     "razonSocial": "LA NUEVA SOCIEDAD PARA DEMOSTRACION SAU",
//                                     "cif": "A00000000",
//                                     "importe": 80151155.32,
//                                     "fecha": "2024-02-21",
//                                     "descripcionContrato": "Contratación de obras para del proyecto de trasvase entre las cuencas de los ríos Pizarroso, Alcollarín y Búrdalo, TT. MM. de Abertura, Alcollarín, Escurial y Zorita (Cáceres).",
//                                     "indPyme": "N"
//                                 }
//                             ]
//                         },
//                         {
//                             "numExpediente": "PA 109/2023",
//                             "entidad": "Junta de Gobierno del Ayuntamiento de Torrejón de Ardoz",
//                             "nombreOrganismoSuperior": "Entidades Locales",
//                             "campoCodificadoCodTipoProyecto": {
//                                 "valor": "2",
//                                 "tablaDecodificacion": "tablaTiposProyectoLicitaciones"
//                             },
//                             "descripcionContrato": "Servicio dinamización y marketplace plataforma técnica y servicios tecnológicos de soporte y apoyo, dentro del proyecto \"MERCATORREJÓN: digitalización, sostenibilidad y optimización del comercio local en Torrejón de Ardoz\" en el marco del plan de recuperación transformación y resiliencia, cofinanciado a través de los fondos europeos Next Generation",
//                             "presupuesto": 547200,
//                             "campoCodificadoCodTipoContratacion": {
//                                 "valor": "1",
//                                 "tablaDecodificacion": "tablaTipoContratacionLicitaciones"
//                             },
//                             "campoCodificadoCodFuente": {
//                                 "valor": "ME",
//                                 "tablaDecodificacion": "tablaTiposFuente"
//                             },
//                             "fechaFuente": "2024-04-19",
//                             "descripcionFechaFin": "plazo de ejecución de 6 Meses",
//                             "linkDetalle": "https://contrataciondelestado.es/wps/poc?uri=deeplink:detalle_licitacion&idEvl=MHOkjF08V7nzAq95uGTrDQ%3D%3D",
//                             "numContratos": 1,
//                             "listaEmpresasAdjudicatarias": [
//                                 {
//                                     "razonSocial": "LA NUEVA SOCIEDAD PARA DEMOSTRACION SAU",
//                                     "cif": "A00000000",
//                                     "importe": 509906.16,
//                                     "fecha": "2024-03-18",
//                                     "duracion": 6,
//                                     "unidadDuracion": "MON",
//                                     "descripcionContrato": "Servicio dinamización y marketplace plataforma técnica y servicios tecnológicos de soporte y apoyo, dentro del proyecto \"MERCATORREJÓN: digitalización, sostenibilidad y optimización del comercio local en Torrejón de Ardoz\" en el marco del plan de recuperación transformación y resiliencia, cofinanciado a través de los fondos europeos Next Generation",
//                                     "indPyme": "N",
//                                     "idContrato": "1"
//                                 }
//                             ]
//                         }
//                     ]
//                 },
//                 "contratosPublicosLicitados": {
//                     "totalContratosPublicosLicitados": 1,
//                     "listaResumenContratosPublicosLicitados": [
//                         {
//                             "campoCodificadoCodTipoProyecto": {
//                                 "valor": "2",
//                                 "tablaDecodificacion": "tablaTiposProyectoLicitaciones"
//                             },
//                             "numeroContratos": 1,
//                             "importeTotal": 15.0,
//                             "fechaUltimoContrato": "2020-09-10"
//                         }
//                     ],
//                     "listaContratosPublicosLicitados": [
//                         {
//                             "numExpediente": "1/2020",
//                             "campoCodificadoCodTipoTramitacion": {
//                                 "valor": "1",
//                                 "tablaDecodificacion": "tablaTipoTramitacionContratoPublico"
//                             },
//                             "campoCodificadoCodTipoProyecto": {
//                                 "valor": "2",
//                                 "tablaDecodificacion": "tablaTiposProyectoLicitaciones"
//                             },
//                             "desContrato": "Acceso a la Base de datos",
//                             "presupuesto": 15,
//                             "campoCodificadoCodEstado": {
//                                 "valor": "RES",
//                                 "tablaDecodificacion": "tablaEstadoContratoPublico"
//                             },
//                             "fechaLimite": "2020-09-30",
//                             "fechaFuente": "2020-09-10",
//                             "numContratos": 1,
//                             "listaEmpresasAdjudicatarias": [
//                                 {
//                                     "razonSocial": "NUEVO CATERING DE DEMOSTRACION SL",
//                                     "cif": "B00000000",
//                                     "importe": 15000,
//                                     "fecha": "2020-09-10",
//                                     "descripcionContrato": "Acceso a la Base de datos"
//                                 }
//                             ]
//                         }
//                     ]
//                 }
//             },
//             "operacionesComerciales": {
//                 "compras": {
//                     "porcentajeImportacion": 40.00,
//                     "listaPaisesImporta": "CHILE"
//                 },
//                 "ventas": {
//                     "porcentajeDistribucionNacional": 100.00
//                 },
//                 "proveedores": {
//                     "numeroTotalProveedores": "2",
//                     "listaProveedores": [
//                         {
//                             "razonSocial": "PROVEEDOR UNICO, S.L.",
//                             "indicadorInternacional": false,
//                             "annoOperaciones": 2019
//                         },
//                         {
//                             "razonSocial": "PROVEEDOR DEMO SPA",
//                             "indicadorInternacional": true,
//                             "annoOperaciones": 2019
//                         }
//                     ]
//                 },
//                 "clientes": {
//                     "numeroTotalClientes": 2,
//                     "listaClientes": [
//                         {
//                             "razonSocial": "LA LEGAL SL",
//                             "indicadorInternacional": false,
//                             "annoOperaciones": 2022
//                         },
//                         {
//                             "razonSocial": "CLIENTE DEMOSTRACION SL",
//                             "indicadorInternacional": true,
//                             "annoOperaciones": 2019
//                         }
//                     ]
//                 },
//                 "campoCodificadoOperacionesInternacionales": {
//                     "valor": "1",
//                     "tablaDecodificacion": "tablaOperacionesInternacionales"
//                 },
//                 "fechaFuenteComprasVentas": "2013-12-31"
//             },
//             "aplazamientoPagoProveedores": {
//                 "listaAplazamientoPagoProveedores": [
//                     {
//                         "annoDatos": 2019,
//                         "fechaFuente": "2019-12-31",
//                         "campoCodificadoOrigen": {
//                             "valor": "I",
//                             "tablaDecodificacion": "tablaOrigen"
//                         },
//                         "importeEnPlazo": 750000.00,
//                         "porcentajeEnPlazo": 75.00,
//                         "importeExcedido": 250000.00,
//                         "porcentajeExcedido": 25.00,
//                         "importeTotal": 1000000.00,
//                         "periodoMedioPagoExcedidos": 25,
//                         "importeAplazamientoCierre": 35000.00,
//                         "porcentajeAplazamientoCierre": 12.00
//                     },
//                     {
//                         "annoDatos": 2011,
//                         "fechaFuente": "2011-12-31",
//                         "campoCodificadoOrigen": {
//                             "valor": "I",
//                             "tablaDecodificacion": "tablaOrigen"
//                         },
//                         "importeEnPlazo": 1500.00,
//                         "porcentajeEnPlazo": 75.00,
//                         "importeExcedido": 500.00,
//                         "porcentajeExcedido": 25.00,
//                         "importeTotal": 2000.00
//                     },
//                     {
//                         "annoDatos": 2010,
//                         "fechaFuente": "2010-12-31",
//                         "campoCodificadoOrigen": {
//                             "valor": "I",
//                             "tablaDecodificacion": "tablaOrigen"
//                         },
//                         "importeEnPlazo": 60.00,
//                         "porcentajeEnPlazo": 60.00,
//                         "importeExcedido": 40.00,
//                         "porcentajeExcedido": 40.00,
//                         "importeTotal": 100.00,
//                         "periodoMedioPagoExcedidos": 365,
//                         "importeAplazamientoCierre": 11.00,
//                         "porcentajeAplazamientoCierre": 15.00
//                     }
//                 ]
//             },
//             "periodoMedioPago": {
//                 "listaPeriodoMedioPago": [
//                     {
//                         "annoDatos": 2022,
//                         "fechaFuente": "2022-12-31",
//                         "campoCodificadoOrigen": {
//                             "valor": "I",
//                             "tablaDecodificacion": "tablaOrigen"
//                         },
//                         "periodoMedioPagoProveedores": "88.6",
//                         "ratioOperacionesPagadas": 91.55,
//                         "ratioOperacionesPendientes": 63.23,
//                         "importePagosRealizados": 55142618.81,
//                         "importePagosPendientes": 6402503.78
//                     },
//                     {
//                         "annoDatos": 2021,
//                         "fechaFuente": "2021-12-31",
//                         "campoCodificadoOrigen": {
//                             "valor": "I",
//                             "tablaDecodificacion": "tablaOrigen"
//                         },
//                         "periodoMedioPagoProveedores": "103.5",
//                         "ratioOperacionesPagadas": 110.41,
//                         "ratioOperacionesPendientes": 82.69,
//                         "importePagosRealizados": 36255110.66,
//                         "importePagosPendientes": 12101113.95
//                     },
//                     {
//                         "annoDatos": 2020,
//                         "fechaFuente": "2020-12-31",
//                         "campoCodificadoOrigen": {
//                             "valor": "I",
//                             "tablaDecodificacion": "tablaOrigen"
//                         },
//                         "periodoMedioPagoProveedores": "105.25",
//                         "ratioOperacionesPagadas": 112.75,
//                         "ratioOperacionesPendientes": 93.40,
//                         "importePagosRealizados": 35455275.25,
//                         "importePagosPendientes": 10101495.32
//                     }
//                 ]
//             },
//             "entidadesBancarias": {
//                 "totalEntidadesBancarias": 8,
//                 "listaEntidadesBancarias": [
//                     {
//                         "nombreEntidad": "BANCO DE DEPOSITOS, S.A.",
//                         "fechaFuente": "2024-04-16"
//                     },
//                     {
//                         "nombreEntidad": "CAJAMAR CAJA RURAL, S.C.C.",
//                         "nombreSucursal": "ALMERIA-PASEO",
//                         "numeroSucursal": "0000",
//                         "direccionSucursal": "PASEO DE ALMERIA 75",
//                         "localidad": "ALMERIA",
//                         "campoCodificadoProvincia": {
//                             "valor": "04",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "fechaFuente": "2024-04-16"
//                     },
//                     {
//                         "nombreEntidad": "BANKINTER, S.A.",
//                         "fechaFuente": "2022-05-28"
//                     },
//                     {
//                         "nombreEntidad": "BANCO BILBAO VIZCAYA ARGENTARIA, S.A.",
//                         "fechaFuente": "2020-12-15"
//                     },
//                     {
//                         "nombreEntidad": "BANCO SANTANDER, S.A.",
//                         "localidad": "ZARAGOZA",
//                         "fechaFuente": "2020-12-15"
//                     }
//                 ]
//             },
//             "operacionesBancarias": {
//                 "totalOperacionesBancariasActuales": 4,
//                 "totalOperacionesBancariasHistoricas": 8,
//                 "listaResumenOperacionesBanacarias": [
//                     {
//                         "campoCodificadoTipoDeuda": {
//                             "valor": "01",
//                             "tablaDecodificacion": "tablaTipoDeuda"
//                         },
//                         "numeroTotalOperaciones": 1
//                     },
//                     {
//                         "campoCodificadoTipoDeuda": {
//                             "valor": "02",
//                             "tablaDecodificacion": "tablaTipoDeuda"
//                         },
//                         "numeroTotalOperaciones": 1
//                     },
//                     {
//                         "campoCodificadoTipoDeuda": {
//                             "valor": "03",
//                             "tablaDecodificacion": "tablaTipoDeuda"
//                         },
//                         "numeroTotalOperaciones": 2
//                     }
//                 ],
//                 "listaOperacionesBancarias": [
//                     {
//                         "fechaFuente": "2019-12-31",
//                         "campoCodificadoFuente": {
//                             "valor": "I3",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "campoCodificadoTipoDeuda": {
//                             "valor": "02",
//                             "tablaDecodificacion": "tablaTipoDeuda"
//                         },
//                         "importeLimiteConcedido": 200000,
//                         "importeLimiteDispuesto": 100000,
//                         "importeLimiteDisponible": 100000
//                     },
//                     {
//                         "codigoEntidad": "0057",
//                         "descripcionEntidad": "BANCO DEPOSITARIO BBVA, S.A.",
//                         "fechaFuente": "2019-12-31",
//                         "campoCodificadoFuente": {
//                             "valor": "I3",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "campoCodificadoTipoDeuda": {
//                             "valor": "01",
//                             "tablaDecodificacion": "tablaTipoDeuda"
//                         },
//                         "importeLimiteConcedido": 400000,
//                         "importeLimiteDispuesto": 30000,
//                         "importeLimiteDisponible": 370000
//                     },
//                     {
//                         "fechaFuente": "2019-12-31",
//                         "campoCodificadoFuente": {
//                             "valor": "I3",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "campoCodificadoTipoDeuda": {
//                             "valor": "03",
//                             "tablaDecodificacion": "tablaTipoDeuda"
//                         },
//                         "importeConcedido": 400000,
//                         "importePendienteCortoPlazo": 200000,
//                         "importePendienteLargoPlazo": 200000,
//                         "importePendienteTotal": 400000
//                     }
//                 ]
//             },
//             "subvenciones": {
//                 "totalSubvencionesActuales": 2,
//                 "listaSubvenciones": [
//                     {
//                         "campoCodificadoFuente": {
//                             "valor": "B7",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "fechaFuente": "2013-03-01",
//                         "organismo": "ICO",
//                         "campoCodificadoTipoSubvencion": {
//                             "valor": "18",
//                             "tablaDecodificacion": "tablaTipoSubvenciones"
//                         },
//                         "annoConcesion": 2002,
//                         "importeNominal": 150000,
//                         "importeRecibido": 50000,
//                         "importePendienteCobro": 100000
//                     },
//                     {
//                         "campoCodificadoFuente": {
//                             "valor": "B7",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "fechaFuente": "2008-12-31",
//                         "organismo": "JUNTA CASTILLA LA MANCHA",
//                         "campoCodificadoTipoSubvencion": {
//                             "valor": "16",
//                             "tablaDecodificacion": "tablaTipoSubvenciones"
//                         },
//                         "annoConcesion": 2003,
//                         "importeNominal": 250000
//                     }
//                 ]
//             },
//             "operacionesLeasing": {
//                 "totalOperacionesLeasingActuales": "4",
//                 "listaOperacionesLeasing": [
//                     {
//                         "descripcionEntidad": "CAIXA LEASING",
//                         "descripcionBienAfecto": "ELEMENTOS TRANSPORTES",
//                         "importePagos1Anno": 30000,
//                         "importePagos1_5Annos": 15000,
//                         "importePagos5Annos": 150000,
//                         "campoCodificadoFuente": {
//                             "valor": "B7",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "fechaFuente": "2013-03-01"
//                     },
//                     {
//                         "descripcionEntidad": "CAIXA LEASING",
//                         "descripcionBienAfecto": "ELEMENTOS DE TRANSPORTE",
//                         "importePagos1Anno": 50000,
//                         "importePagos1_5Annos": 70000,
//                         "importePagos5Annos": 90000,
//                         "campoCodificadoFuente": {
//                             "valor": "I3",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "fechaFuente": "2009-06-30"
//                     },
//                     {
//                         "descripcionEntidad": "CAIXA LEASING",
//                         "descripcionBienAfecto": "ELEMENTOS DE TRANSPORTE",
//                         "importePagos1Anno": 90000,
//                         "importePagos1_5Annos": 70000,
//                         "importePagos5Annos": 90000,
//                         "campoCodificadoFuente": {
//                             "valor": "I3",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "fechaFuente": "2009-06-30"
//                     }
//                 ]
//             },
//             "datosValorAnnadido": {
//                 "listaDatosValorAnnadido": [
//                     {
//                         "campoCodificadoDva": {
//                             "valor": "0005",
//                             "tablaDecodificacion": "tablaCodigosDva"
//                         },
//                         "fechaAlta": "2016-09-29",
//                         "fechaFuente": "2024-05-22"
//                     },
//                     {
//                         "campoCodificadoDva": {
//                             "valor": "0016",
//                             "tablaDecodificacion": "tablaCodigosDva"
//                         },
//                         "fechaAlta": "2024-05-22",
//                         "datosDvaIndicadorRiesgoComercial": {
//                             "campoCodificadoRiesgoRetrasoPagosSector": {
//                                 "valor": "3",
//                                 "tablaDecodificacion": "tablaRiesgoRetrasoPagos"
//                             },
//                             "campoCodificadoRiesgoCeseSector": {
//                                 "valor": "2",
//                                 "tablaDecodificacion": "tablaRiesgoCese"
//                             },
//                             "campoCodificadoRiesgoRetrasoPagosEmpresa": {
//                                 "valor": "5",
//                                 "tablaDecodificacion": "tablaRiesgoRetrasoPagos"
//                             },
//                             "campoCodificadoRiesgoCeseEmpresa": {
//                                 "valor": "3",
//                                 "tablaDecodificacion": "tablaRiesgoCese"
//                             },
//                             "campoCodificadoIndicadorRiesgoComercial": {
//                                 "valor": "2",
//                                 "tablaDecodificacion": "tablaIndicadorRiesgoComercial"
//                             },
//                             "ratingInformaSector": "12",
//                             "scoreLiquidezSector": "39"
//                         }
//                     }
//                 ]
//             }
//         },
//         "riesgoComercial": {
//             "rating": {
//                 "fechaCalculoRating": "2024-05-22",
//                 "ratingInforma": 7,
//                 "opinionCredito": 30000,
//                 "rawScoreEntregable": 1400.00,
//                 "scoreEntregable": 26,
//                 "probabilidadFallo": 0.92
//             },
//             "ratingLiquidez": {
//                 "fechaCalculoRating": "2024-05-22",
//                 "scoreLiquidez": 1,
//                 "probabilidadRetrasoPagos": 98.44
//             },
//             "indicadoresRating": {
//                 "fechaCalculoRating": "2023-12-31",
//                 "campoCodificadoIndicadorLiquidezInmediata": {
//                     "valor": "5",
//                     "tablaDecodificacion": "tablaPuntoFlashLiquidez"
//                 },
//                 "campoCodificadoIndicadorEndeudamiento": {
//                     "valor": "2",
//                     "tablaDecodificacion": "tablaEndeudamiento"
//                 },
//                 "campoCodificadoIndicadorRentabilidad": {
//                     "valor": "1",
//                     "tablaDecodificacion": "tablaRentabilidad"
//                 },
//                 "campoCodificadoIndicadorSolidez": {
//                     "valor": "4",
//                     "tablaDecodificacion": "tablaPuntoFlashSolidez"
//                 },
//                 "campoCodificadoIndicadorIncidencias": {
//                     "valor": "4",
//                     "tablaDecodificacion": "tablaIncidencias"
//                 },
//                 "campoCodificadoIndicadorTrayectoriaEmpresarial": {
//                     "valor": "4",
//                     "tablaDecodificacion": "tablaTrayectoriaEmpresarial"
//                 }
//             },
//             "incidencias": {
//                 "resumenIncidencias": {
//                     "resumenIncidenciasJudiciales": {
//                         "numeroTotalIncidenciasJudiciales": 4,
//                         "fechaPrimeraIncidencia": "2016-06-20",
//                         "fechaUltimaIncidencia": "2023-06-14",
//                         "numeroTotalIncidenciasProcedimientoPreconcursal": 0,
//                         "numeroTotalIncidenciasProcedimientoConcursal": 0,
//                         "numeroTotalIncidenciasJuzgadoCivil": 2,
//                         "numeroTotalIncidenciasJuzgadoSocial": 2
//                     },
//                     "resumenReclamacionesAdministrativas": {
//                         "numeroTotalReclamacionesAdministrativas": 3,
//                         "fechaPrimeraReclamacion": "2019-02-11",
//                         "fechaUltimaReclamacion": "2022-05-16",
//                         "numeroTotalCreditosIncobrables": 0,
//                         "numeroTotalReclamacionesConSeguridadSocial": 0,
//                         "numeroTotalReclamacionesConHacienda": 0,
//                         "numeroTotalReclamacionesConOtrosOrganismos": 3
//                     },
//                     "afectadaPorEmpresasEnProcedimientoConcursal": 0
//                 },
//                 "ultimasIncidenciasJudiciales": {
//                     "listaUltimasIncidenciasJuzgadoCivil": [
//                         {
//                             "fechaEstadoIncidencia": "2023-06-14",
//                             "campoCodificadoFaseDemanda": {
//                                 "valor": "A2",
//                                 "tablaDecodificacion": "tablaTipoInformacion"
//                             },
//                             "demandante": "BANCO SANTANDER SA"
//                         },
//                         {
//                             "fechaEstadoIncidencia": "2020-05-13",
//                             "campoCodificadoFaseDemanda": {
//                                 "valor": "A0",
//                                 "tablaDecodificacion": "tablaTipoInformacion"
//                             },
//                             "demandante": "BANCO SANTANDER SA",
//                             "importe": 7840.00
//                         }
//                     ],
//                     "listaUltimasIncidenciasJuzgadoSocial": [
//                         {
//                             "fechaEstadoIncidencia": "2020-02-18",
//                             "campoCodificadoFaseDemanda": {
//                                 "valor": "AR",
//                                 "tablaDecodificacion": "tablaTipoInformacion"
//                             },
//                             "demandante": "DESCONOCIDO",
//                             "importe": 1520.05
//                         },
//                         {
//                             "fechaEstadoIncidencia": "2018-12-27",
//                             "campoCodificadoFaseDemanda": {
//                                 "valor": "AI",
//                                 "tablaDecodificacion": "tablaTipoInformacion"
//                             },
//                             "demandante": "DESCONOCIDO",
//                             "importe": 8000.00
//                         }
//                     ]
//                 },
//                 "ultimasReclamacionesAdministrativas": {
//                     "listaUltimasReclamacionesConOtrosOrganismos": {
//                         "embargos": [
//                             {
//                                 "campoCodificadoSubtipoReclamacion": {
//                                     "valor": "5",
//                                     "tablaDecodificacion": "tablaIndicativoSubtipoReclamacion"
//                                 },
//                                 "campoCodificadoOrganismoReclamacion": {
//                                     "valor": "20",
//                                     "tablaDecodificacion": "tablaOrganismos"
//                                 },
//                                 "nombreOrganismo": "DE MADRID",
//                                 "fechaReclamacion": "2022-05-16",
//                                 "importe": 231.0
//                             },
//                             {
//                                 "campoCodificadoSubtipoReclamacion": {
//                                     "valor": "5",
//                                     "tablaDecodificacion": "tablaIndicativoSubtipoReclamacion"
//                                 },
//                                 "campoCodificadoOrganismoReclamacion": {
//                                     "valor": "40",
//                                     "tablaDecodificacion": "tablaOrganismos"
//                                 },
//                                 "nombreOrganismo": "DE TRANSPORTES, MOVILIDAD E INFAESTRUCTURAS DE MADRID",
//                                 "fechaReclamacion": "2020-06-03",
//                                 "importe": 2001.0
//                             }
//                         ]
//                     }
//                 }
//             },
//             "planReestructuracion": {
//                 "planReestructuracionResumen": {
//                     "planReestructuracion": true,
//                     "campoCodificadoCodTpoPdmto": {
//                         "valor": "10",
//                         "tablaDecodificacion": "tpoPdmto"
//                     },
//                     "fechaUltimoPlan": "2022-11-14"
//                 },
//                 "planReestructuracionDetalle": {
//                     "campoCodificadoCodFaseDema": {
//                         "valor": "TN",
//                         "tablaDecodificacion": "tablaTipoInformacion"
//                     },
//                     "campoCodificadoCodTpoPdmto": {
//                         "valor": "10",
//                         "tablaDecodificacion": "tpoPdmto"
//                     },
//                     "campoCodificadoCodJuzgado": {
//                         "valor": "280797002",
//                         "tablaDecodificacion": "tablaJuzgados"
//                     },
//                     "numAuto": 407,
//                     "numAnoAuto": 2023,
//                     "fecDemanda": "2022-11-14",
//                     "listaHistorialPlanReestructuracion": [
//                         {
//                             "campoCodificadoCodFaseDema": {
//                                 "valor": "TN",
//                                 "tablaDecodificacion": "tablaTipoInformacion"
//                             },
//                             "campoCodificadoCodTpoDema": {
//                                 "valor": "22",
//                                 "tablaDecodificacion": "tpoDema"
//                             },
//                             "fecEstado": "2022-11-14",
//                             "campoCodificadoCodFuente": {
//                                 "valor": "BB",
//                                 "tablaDecodificacion": "tablaTiposFuente"
//                             },
//                             "fecFuente": "2023-01-13",
//                             "observacion": "SE PRESENTA LA PROPUESTA DEL PLAN DE REESTRUCTURACION"
//                         }
//                     ]
//                 }
//             }
//         },
//         "estructuraCorporativa": {
//             "accionistas": {
//                 "totalAccionistasActuales": 1,
//                 "totalAccionistasHistoricos": 16,
//                 "listaAccionistas": [
//                     {
//                         "razonSocial": "NUEVO CATERING DE DEMOSTRACION SL",
//                         "cif": "B00000000",
//                         "campoCodificadoPais": {
//                             "valor": "102050",
//                             "tablaDecodificacion": "tablaPaises"
//                         },
//                         "campoCodificadoProvincia": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorRatingMenor7": false,
//                         "campoCodificadoTipoPorcentaje": {
//                             "valor": "98",
//                             "tablaDecodificacion": "tablaClaveCotizacion"
//                         },
//                         "porcentajeParticipacion": 100.00,
//                         "fechaFuente": "2022-12-22",
//                         "campoCodificadoFuente": {
//                             "valor": "I7",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         }
//                     }
//                 ]
//             },
//             "participaciones": {
//                 "totalParticipacionesActuales": 2,
//                 "totalParticipacionesHistoricas": 1,
//                 "totalParticipacionesMayoritarias": 2,
//                 "listaParticipaciones": [
//                     {
//                         "razonSocial": "LA EMPRESA DE VIAJES DE DEMOSTRACION SL",
//                         "cif": "B99999999",
//                         "campoCodificadoPais": {
//                             "valor": "102050",
//                             "tablaDecodificacion": "tablaPaises"
//                         },
//                         "campoCodificadoProvincia": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorRatingMenor7": false,
//                         "campoCodificadoTipoPorcentaje": {
//                             "valor": "98",
//                             "tablaDecodificacion": "tablaClaveCotizacion"
//                         },
//                         "porcentajeParticipacion": 100.00,
//                         "fechaFuente": "2022-12-22",
//                         "campoCodificadoFuente": {
//                             "valor": "I7",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "fechaConstitucion": "1969-12-25"
//                     },
//                     {
//                         "razonSocial": "SEGUNDA PRUEBA BT",
//                         "cif": "D00000000",
//                         "campoCodificadoPais": {
//                             "valor": "102050",
//                             "tablaDecodificacion": "tablaPaises"
//                         },
//                         "campoCodificadoProvincia": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorRatingMenor7": false,
//                         "campoCodificadoTipoPorcentaje": {
//                             "valor": "98",
//                             "tablaDecodificacion": "tablaClaveCotizacion"
//                         },
//                         "porcentajeParticipacion": 100.00,
//                         "fechaFuente": "2022-05-28",
//                         "campoCodificadoFuente": {
//                             "valor": "I6",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "fechaConstitucion": "2002-03-01"
//                     }
//                 ]
//             },
//             "administradores": {
//                 "resumenAdministradores": {
//                     "porcentajeHombres": 90,
//                     "porcentajeMujeres": 10,
//                     "totalAdministradoresActuales": 23,
//                     "totalFuncionalesActuales": 13
//                 },
//                 "listaAdministradores": [
//                     {
//                         "denominacion": {
//                             "nombre": "JOSE LUIS",
//                             "apellido1": "RODRIGO",
//                             "apellido2": "DEMOSTRACION",
//                             "denominacionCompleta": "RODRIGO DEMOSTRACION, JOSE LUIS"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "05",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "campoCodificadoTipoCargo": {
//                             "valor": "2",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         },
//                         "fechaNombramiento": "2021-07-27",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "MARIA CARMEN",
//                             "apellido1": "DEMOSTRACION",
//                             "apellido2": "DEMOSTRACION",
//                             "denominacionCompleta": "DEMOSTRACION DEMOSTRACION, MARIA CARMEN"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "10",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "campoCodificadoTipoCargo": {
//                             "valor": "2",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         },
//                         "fechaNombramiento": "2009-06-01"
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "FRANCISCO",
//                             "apellido1": "MERAYO",
//                             "apellido2": "RICOL",
//                             "denominacionCompleta": "MERAYO RICOL, FRANCISCO"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "40",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "campoCodificadoTipoCargo": {
//                             "valor": "2",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         },
//                         "fechaNombramiento": "2020-06-19",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "JAVIER",
//                             "apellido1": "DEMOSTRACION",
//                             "apellido2": "RUEDA",
//                             "denominacionCompleta": "DEMOSTRACION RUEDA, JAVIER"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "40",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "campoCodificadoTipoCargo": {
//                             "valor": "2",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         },
//                         "fechaNombramiento": "2018-05-29",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "RUBEN",
//                             "apellido1": "SOROYA",
//                             "apellido2": "RECIO",
//                             "denominacionCompleta": "SOROYA RECIO, RUBEN"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "40",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "campoCodificadoTipoCargo": {
//                             "valor": "2",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         },
//                         "fechaNombramiento": "2015-03-27",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "CESAR MANUEL",
//                             "apellido1": "RODRIGO",
//                             "apellido2": "PEÑALBA",
//                             "denominacionCompleta": "RODRIGO PEÑALBA, CESAR MANUEL"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "40",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "campoCodificadoTipoCargo": {
//                             "valor": "2",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         },
//                         "fechaNombramiento": "2014-12-03",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "ASUNCION",
//                             "apellido1": "FICTICIO",
//                             "apellido2": "DEMOSTRACION",
//                             "denominacionCompleta": "FICTICIO DEMOSTRACION, ASUNCION"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "40",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "campoCodificadoTipoCargo": {
//                             "valor": "2",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         },
//                         "fechaNombramiento": "2013-12-19",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "MANUEL",
//                             "apellido1": "DEMOSTRACION",
//                             "apellido2": "DEMOSTRACION",
//                             "denominacionCompleta": "DEMOSTRACION DEMOSTRACION, MANUEL"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "40",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "campoCodificadoTipoCargo": {
//                             "valor": "2",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         },
//                         "fechaNombramiento": "2009-06-04",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "SERGIO",
//                             "apellido1": "DEMOSTRACION",
//                             "apellido2": "DEMOSTRACION",
//                             "denominacionCompleta": "DEMOSTRACION DEMOSTRACION, SERGIO"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "40",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "campoCodificadoTipoCargo": {
//                             "valor": "2",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         },
//                         "fechaNombramiento": "2007-12-07",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "JOSE",
//                             "apellido1": "DEMOSTRACIOÑ",
//                             "apellido2": "DEMOSTRAÇIOÑ",
//                             "denominacionCompleta": "DEMOSTRACIOÑ DEMOSTRAÇIOÑ, JOSE"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "40",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "campoCodificadoTipoCargo": {
//                             "valor": "2",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         },
//                         "fechaNombramiento": "2006-07-12",
//                         "indicadorPersonaFisica": true
//                     }
//                 ],
//                 "listaAuditores": [
//                     {
//                         "denominacion": {
//                             "denominacionCompleta": "DELOITTE SL"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "50",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2010-12-31",
//                         "campoCodificadoTipoCargo": {
//                             "valor": "3",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         }
//                     },
//                     {
//                         "denominacion": {
//                             "denominacionCompleta": "DELOITTE SL"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "51",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2018-12-31",
//                         "campoCodificadoTipoCargo": {
//                             "valor": "3",
//                             "tablaDecodificacion": "tablaTiposCargoAdministradores"
//                         }
//                     }
//                 ],
//                 "listaDirectivosFuncionales": [
//                     {
//                         "denominacion": {
//                             "nombre": "JUAN LUIS",
//                             "apellido1": "PRUEBA",
//                             "apellido2": "DEMOSTRACION",
//                             "denominacionCompleta": "PRUEBA DEMOSTRACION, JUAN LUIS"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "61",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2021-07-27",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "JESUS",
//                             "apellido1": "DEMO",
//                             "apellido2": "SANCHEZ",
//                             "denominacionCompleta": "DEMO SANCHEZ, JESUS"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "62",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2008-01-10",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "PEDRO",
//                             "apellido1": "DEMO",
//                             "apellido2": "LOPEZ",
//                             "denominacionCompleta": "DEMO LOPEZ, PEDRO"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "62",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2007-12-28",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "ERNESTO",
//                             "apellido1": "MATEN",
//                             "apellido2": "SALSA",
//                             "denominacionCompleta": "MATEN SALSA, ERNESTO"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "63",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2006-07-12",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "MARIA CARMEN",
//                             "apellido1": "DEMOSTRACION",
//                             "apellido2": "DEMOSTRACION",
//                             "denominacionCompleta": "DEMOSTRACION DEMOSTRACION, MARIA CARMEN"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "65",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2014-12-04",
//                         "indicadorPersonaFisica": false
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "LUIS",
//                             "apellido1": "DEMOSTRACION",
//                             "apellido2": "FUNCIONAL",
//                             "denominacionCompleta": "DEMOSTRACION FUNCIONAL, LUIS"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "66",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2008-01-10",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "ROGELIO",
//                             "apellido1": "DEMOSTRACION",
//                             "apellido2": "FICTICIO",
//                             "denominacionCompleta": "DEMOSTRACION FICTICIO, ROGELIO"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "67",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2012-12-10",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "ROGELIO",
//                             "apellido1": "DEMOS",
//                             "apellido2": "DEMOS",
//                             "denominacionCompleta": "DEMOS DEMOS, ROGELIO"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "71",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2010-06-09",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "JAVIER",
//                             "apellido1": "RULLAN",
//                             "apellido2": "ROMAN",
//                             "denominacionCompleta": "RULLAN ROMAN, JAVIER"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "73",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2014-12-03",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "ERNESTO",
//                             "apellido1": "FUNCIONAL",
//                             "apellido2": "PRUEBA",
//                             "denominacionCompleta": "FUNCIONAL PRUEBA, ERNESTO"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "73",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2014-12-03",
//                         "indicadorPersonaFisica": true
//                     }
//                 ],
//                 "listaDirectivosFuncionalesHistoricos": [
//                     {
//                         "denominacion": {
//                             "nombre": "JOSE",
//                             "apellido1": "DEMO",
//                             "apellido2": "GARCIA",
//                             "denominacionCompleta": "DEMO GARCIA, JOSE"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "69",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaNombramiento": "2008-01-10",
//                         "fechaCese": "2014-12-31",
//                         "indicadorPersonaFisica": true
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "MARIA CARMEN",
//                             "apellido1": "DEMOSTRACION",
//                             "apellido2": "DEMOSTRACION",
//                             "denominacionCompleta": "DEMOSTRACION DEMOSTRACION, MARIA CARMEN"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "79",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaCese": "2014-12-04",
//                         "indicadorPersonaFisica": false
//                     },
//                     {
//                         "denominacion": {
//                             "nombre": "LUIS",
//                             "apellido1": "DEMOSTRACION",
//                             "apellido2": "FUNCIONAL",
//                             "denominacionCompleta": "DEMOSTRACION FUNCIONAL, LUIS"
//                         },
//                         "campoCodificadoCargo": {
//                             "valor": "65",
//                             "tablaDecodificacion": "tablaCargo"
//                         },
//                         "fechaCese": "2008-01-25",
//                         "indicadorPersonaFisica": true
//                     }
//                 ]
//             }
//         },
//         "estructuraLegal": {
//             "datosConstitucion": {
//                 "fechaConstitucion": "1980-02-01",
//                 "fechaInicioActividad": "1981-04-01",
//                 "campoCodificadoOrigenFechaConstitucion": {
//                     "valor": "B",
//                     "tablaDecodificacion": "tablaOrigen"
//                 },
//                 "campoCodificadoFuenteFechaConstitucion": {
//                     "valor": "B7",
//                     "tablaDecodificacion": "tablaTiposFuente"
//                 },
//                 "fechaFuenteFechaConstitucion": "2012-12-31",
//                 "campoCodificadoFormaJuridicaAbreviada": {
//                     "valor": "A",
//                     "tablaDecodificacion": "tablaFormaLegal"
//                 },
//                 "importeCapitalSocial": 1280000.00,
//                 "datosRegistrales": {
//                     "tomo": "2230",
//                     "folio": "112",
//                     "hoja": "39383",
//                     "seccion": "8",
//                     "inscripcion": "1",
//                     "numeroAnuncio": 1111111,
//                     "fechaInscripcion": "2009-02-10",
//                     "fechaPublicacion": "2009-03-02",
//                     "campoCodificadoRegistroMercantil": {
//                         "valor": "28",
//                         "tablaDecodificacion": "tablaProvincias"
//                     }
//                 }
//             },
//             "aspectosLegales": {
//                 "indicadorObligadoPresentarCuentas": true,
//                 "indicadorCotizaBolsa": true,
//                 "listaMercadosInformacionBursatil": [
//                     {
//                         "campoCodificadoTipoMercado": {
//                             "valor": "BME",
//                             "tablaDecodificacion": "tablaTipoMercado"
//                         },
//                         "campoCodificadoPlazaCotizacion": {
//                             "valor": "VA",
//                             "tablaDecodificacion": "tablaPlazaCotizacion"
//                         },
//                         "campoCodificadoEstado": {
//                             "valor": "S",
//                             "tablaDecodificacion": "tablaEstadoInfoBursatil"
//                         }
//                     },
//                     {
//                         "campoCodificadoTipoMercado": {
//                             "valor": "BME",
//                             "tablaDecodificacion": "tablaTipoMercado"
//                         },
//                         "campoCodificadoPlazaCotizacion": {
//                             "valor": "BA",
//                             "tablaDecodificacion": "tablaPlazaCotizacion"
//                         },
//                         "campoCodificadoEstado": {
//                             "valor": "S",
//                             "tablaDecodificacion": "tablaEstadoInfoBursatil"
//                         }
//                     },
//                     {
//                         "campoCodificadoTipoMercado": {
//                             "valor": "BME",
//                             "tablaDecodificacion": "tablaTipoMercado"
//                         },
//                         "campoCodificadoPlazaCotizacion": {
//                             "valor": "MA",
//                             "tablaDecodificacion": "tablaPlazaCotizacion"
//                         },
//                         "campoCodificadoTipoCotizacion": {
//                             "valor": "1",
//                             "tablaDecodificacion": "tablaTipoCotizacion"
//                         },
//                         "campoCodificadoEstado": {
//                             "valor": "S",
//                             "tablaDecodificacion": "tablaEstadoInfoBursatil"
//                         }
//                     },
//                     {
//                         "campoCodificadoTipoMercado": {
//                             "valor": "BME",
//                             "tablaDecodificacion": "tablaTipoMercado"
//                         },
//                         "campoCodificadoPlazaCotizacion": {
//                             "valor": "BI",
//                             "tablaDecodificacion": "tablaPlazaCotizacion"
//                         },
//                         "campoCodificadoTipoCotizacion": {
//                             "valor": "3",
//                             "tablaDecodificacion": "tablaTipoCotizacion"
//                         },
//                         "campoCodificadoEstado": {
//                             "valor": "A",
//                             "tablaDecodificacion": "tablaEstadoInfoBursatil"
//                         }
//                     }
//                 ]
//             },
//             "actosBorme": {
//                 "totalActosBorme": 14,
//                 "listaActosBorme": [
//                     {
//                         "campoCodificadoActo": {
//                             "valor": "05",
//                             "tablaDecodificacion": "tablaActosBORME"
//                         },
//                         "fechaPublicacion": "2020-07-07",
//                         "numeroAnuncio": 1009982,
//                         "campoCodificadoRegistroMercantil": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorDetalleDisponible": true
//                     },
//                     {
//                         "campoCodificadoActo": {
//                             "valor": "02",
//                             "tablaDecodificacion": "tablaActosBORME"
//                         },
//                         "fechaPublicacion": "2020-06-19",
//                         "numeroAnuncio": 998587,
//                         "campoCodificadoRegistroMercantil": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorDetalleDisponible": true
//                     },
//                     {
//                         "campoCodificadoActo": {
//                             "valor": "02",
//                             "tablaDecodificacion": "tablaActosBORME"
//                         },
//                         "fechaPublicacion": "2018-05-29",
//                         "numeroAnuncio": 8599798,
//                         "campoCodificadoRegistroMercantil": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorDetalleDisponible": true
//                     },
//                     {
//                         "campoCodificadoActo": {
//                             "valor": "02",
//                             "tablaDecodificacion": "tablaActosBORME"
//                         },
//                         "fechaPublicacion": "2014-12-03",
//                         "numeroAnuncio": 8587842,
//                         "campoCodificadoRegistroMercantil": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorDetalleDisponible": true
//                     },
//                     {
//                         "campoCodificadoActo": {
//                             "valor": "02",
//                             "tablaDecodificacion": "tablaActosBORME"
//                         },
//                         "fechaPublicacion": "2013-12-19",
//                         "numeroAnuncio": 9789789,
//                         "campoCodificadoRegistroMercantil": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorDetalleDisponible": true
//                     },
//                     {
//                         "campoCodificadoActo": {
//                             "valor": "27",
//                             "tablaDecodificacion": "tablaActosBORME"
//                         },
//                         "fechaPublicacion": "2012-06-26",
//                         "numeroAnuncio": 5858528,
//                         "campoCodificadoRegistroMercantil": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorDetalleDisponible": true
//                     },
//                     {
//                         "campoCodificadoActo": {
//                             "valor": "48",
//                             "tablaDecodificacion": "tablaActosBORME"
//                         },
//                         "fechaPublicacion": "2011-12-19",
//                         "numeroAnuncio": 8528528,
//                         "campoCodificadoRegistroMercantil": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorDetalleDisponible": true
//                     },
//                     {
//                         "campoCodificadoActo": {
//                             "valor": "06",
//                             "tablaDecodificacion": "tablaActosBORME"
//                         },
//                         "fechaPublicacion": "2011-12-13",
//                         "numeroAnuncio": 8978978,
//                         "campoCodificadoRegistroMercantil": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorDetalleDisponible": true
//                     },
//                     {
//                         "campoCodificadoActo": {
//                             "valor": "60",
//                             "tablaDecodificacion": "tablaActosBORME"
//                         },
//                         "fechaPublicacion": "2011-07-16",
//                         "numeroAnuncio": 8963896,
//                         "campoCodificadoRegistroMercantil": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorDetalleDisponible": true,
//                         "actoDepositoCuentasAnno": 2010,
//                         "campoCodificadoTipoDepositoCuentas": {
//                             "valor": "0",
//                             "tablaDecodificacion": "tablaBormeActoDeposito"
//                         }
//                     },
//                     {
//                         "campoCodificadoActo": {
//                             "valor": "67",
//                             "tablaDecodificacion": "tablaActosBORME"
//                         },
//                         "fechaPublicacion": "2010-07-16",
//                         "numeroAnuncio": 9999995,
//                         "campoCodificadoRegistroMercantil": {
//                             "valor": "28",
//                             "tablaDecodificacion": "tablaProvincias"
//                         },
//                         "indicadorDetalleDisponible": true
//                     }
//                 ]
//             },
//             "articulosPrensa": {
//                 "totalArticulosPrensa": 15,
//                 "listaArticulosPrensa": [
//                     {
//                         "fechaPublicacion": "2020-06-02",
//                         "campoCodificadoPublicacion": {
//                             "valor": "23",
//                             "tablaDecodificacion": "tablaFuentes"
//                         },
//                         "campoCodificadoTipoInformacion": {
//                             "valor": "1",
//                             "tablaDecodificacion": "tablaTipoInformacionPrensa"
//                         },
//                         "texto": "LA PRIMERA SOCIEDAD DE DEMOSTRACIÓN destinará 58.201 euros en la remodelación de sus instalaciones, a fin de adaptarlas a las nuevas medidas de seguridad e higiene frente al Covid-19."
//                     },
//                     {
//                         "fechaPublicacion": "2014-06-05",
//                         "campoCodificadoPublicacion": {
//                             "valor": "24",
//                             "tablaDecodificacion": "tablaFuentes"
//                         },
//                         "campoCodificadoTipoInformacion": {
//                             "valor": "D",
//                             "tablaDecodificacion": "tablaTipoInformacionPrensa"
//                         },
//                         "texto": "LA NUEVA FICTICIA ha obtenido una cosecha récord de frutos, que ha superado los 555.000 kilos. La implantación de técnicas y prácticas de cultivo innovadoras ha contribuido a la optimización del rendimiento en tres de sus plantaciones, que han superado en un 40% la media de producción por hectárea de la comarca y en un 20% la producción óptima de plantación tradicional por hectárea. LA NUEVA FICTICIA explota cinco fincas en las vegas del río Vélez, de las que tres ya han alcanzado su máximo nivel productivo, otra debe iniciarlo en la próxima campaña 2014-2015, y una quinta dará su primera cosecha en esta campaña. En total la firma cultiva 63 hectáreas."
//                     },
//                     {
//                         "fechaPublicacion": "2014-02-24",
//                         "campoCodificadoPublicacion": {
//                             "valor": "02",
//                             "tablaDecodificacion": "tablaFuentes"
//                         },
//                         "campoCodificadoTipoInformacion": {
//                             "valor": "8",
//                             "tablaDecodificacion": "tablaTipoInformacionPrensa"
//                         },
//                         "texto": "El grupo LA NUEVA FICTICIA ha cerrado un acuerdo de compra en Irlanda para pasar a controlar el 50% de la sociedad encargada de la explotación de cultivos de frutos tropicales LABICHA. \nCon este acuerdo de compra, LA NUEVA FICTICIA dispondrá de nuevos almacenes para poder distribuir sus productos a otros países, incrementando al 99% su nivel de exportación."
//                     }
//                 ]
//             },
//             "listaInformacionComplementaria": [
//                 {
//                     "campoCodificadoEntidadInformacionComplementaria": {
//                         "valor": "FIN",
//                         "tablaDecodificacion": "tablaSubEntidad"
//                     },
//                     "texto": "Por causas ajenas a nuestra voluntad el Depósito de cuentas del Registro Mercantil del ejercicio 2013, se ha recibido erróneamente, teniendo disponible el Depósito consolidado."
//                 },
//                 {
//                     "campoCodificadoEntidadInformacionComplementaria": {
//                         "valor": "RES",
//                         "tablaDecodificacion": "tablaSubEntidad"
//                     },
//                     "texto": "Entidad Familiarmente Responsable -EFR© desde el 03/11/2011 Nº de registro:118/01-2011 Norma:1000-1 Entidad de certificación:AUDELCO"
//                 }
//             ]
//         },
//         "informacionFinanciera": {
//             "datosGeneralesInformacionFinanciera": {
//                 "fechaBalanceMasRecienteDisponibleEnInforma": "2023-12-31",
//                 "annoUltimoDepositoIndividualDisponibleRegistroMercantil": 2022,
//                 "fechaFuenteUltimoDepositoIndividualDisponibleRegistroMercantil": "2024-02-27"
//             },
//             "listaBalances": [
//                 {
//                     "cabeceraBalance": {
//                         "indicadorBalanceIndividual": false,
//                         "campoCodificadoTipoPlantilla": {
//                             "valor": "13",
//                             "tablaDecodificacion": "tablaTipoPlantilla"
//                         },
//                         "fechaCierre": "2023-12-31",
//                         "fechaRecepcion": "2024-05-08",
//                         "annoBalance": 2023,
//                         "annoDeposito": 2023,
//                         "campoCodificadoUnidadDivisa": {
//                             "valor": "001",
//                             "tablaDecodificacion": "tablaUnidadDivisa"
//                         },
//                         "campoCodificadoUnidadDivisaOrigen": {
//                             "valor": "001",
//                             "tablaDecodificacion": "tablaUnidadDivisa"
//                         },
//                         "duracionMeses": 12,
//                         "campoCodificadoOrigen": {
//                             "valor": "I",
//                             "tablaDecodificacion": "tablaOrigen"
//                         },
//                         "campoCodificadoFuente": {
//                             "valor": "I3",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "numeroTotalEmpleados": 22.0,
//                         "indicadorPgc2007": true,
//                         "campoCodificadoCnae2009": {
//                             "valor": "0123",
//                             "tablaDecodificacion": "tablaCnae09"
//                         },
//                         "campoCodificadoOpinionAuditoria": {
//                             "valor": "5",
//                             "tablaDecodificacion": "tablaOpinionAuditor"
//                         }
//                     },
//                     "listaPartidasBalanceActivo": [
//                         {
//                             "codigoPartida": "10000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "10000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 16500000
//                         },
//                         {
//                             "codigoPartida": "11000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 12790000
//                         },
//                         {
//                             "codigoPartida": "11100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11100GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 700000
//                         },
//                         {
//                             "codigoPartida": "11150",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 700000
//                         },
//                         {
//                             "codigoPartida": "11200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11200GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 12000000
//                         },
//                         {
//                             "codigoPartida": "11220",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 12000000
//                         },
//                         {
//                             "codigoPartida": "11300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11300GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 90000
//                         },
//                         {
//                             "codigoPartida": "11310",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 90000
//                         },
//                         {
//                             "codigoPartida": "12000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "12000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 3710000
//                         },
//                         {
//                             "codigoPartida": "12300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "1230010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 2810000
//                         },
//                         {
//                             "codigoPartida": "12310",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1500000
//                         },
//                         {
//                             "codigoPartida": "12312",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1500000
//                         },
//                         {
//                             "codigoPartida": "12330",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 674000
//                         },
//                         {
//                             "codigoPartida": "12340",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 636000
//                         },
//                         {
//                             "codigoPartida": "12700",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "1270010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 900000
//                         },
//                         {
//                             "codigoPartida": "12710",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 900000
//                         }
//                     ],
//                     "listaPartidasBalancePasivo": [
//                         {
//                             "codigoPartida": "20000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "20000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 11353000
//                         },
//                         {
//                             "codigoPartida": "21000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 11353000
//                         },
//                         {
//                             "codigoPartida": "21100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21100GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "21110",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21110GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "21300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21300GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "21320",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "21500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21500GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 9053000
//                         },
//                         {
//                             "codigoPartida": "21510",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 9053000
//                         },
//                         {
//                             "codigoPartida": "21700",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21700GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 980000
//                         },
//                         {
//                             "codigoPartida": "30000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "30000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 16500000
//                         },
//                         {
//                             "codigoPartida": "31000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "31000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 90000
//                         },
//                         {
//                             "codigoPartida": "31200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "31200GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 90000
//                         },
//                         {
//                             "codigoPartida": "31220",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "31220GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 90000
//                         },
//                         {
//                             "codigoPartida": "32000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "32000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 5057000
//                         },
//                         {
//                             "codigoPartida": "32300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "3230010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 4100000
//                         },
//                         {
//                             "codigoPartida": "32320",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "32320GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 4000000
//                         },
//                         {
//                             "codigoPartida": "32340",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 100000
//                         },
//                         {
//                             "codigoPartida": "32500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "3250010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 957000
//                         },
//                         {
//                             "codigoPartida": "32510",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "32512",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "32530",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 457000
//                         }
//                     ],
//                     "listaPartidasCuentaPerdidasGanancias": [
//                         {
//                             "codigoPartida": "40100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40100GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1490000
//                         },
//                         {
//                             "codigoPartida": "40110",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1400000
//                         },
//                         {
//                             "codigoPartida": "40120",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 90000
//                         },
//                         {
//                             "codigoPartida": "40200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40200GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 100000
//                         },
//                         {
//                             "codigoPartida": "40400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40400GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -190000
//                         },
//                         {
//                             "codigoPartida": "40410",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -190000
//                         },
//                         {
//                             "codigoPartida": "40500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40500GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 85000
//                         },
//                         {
//                             "codigoPartida": "40510",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 85000
//                         },
//                         {
//                             "codigoPartida": "40600",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40600GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -350000
//                         },
//                         {
//                             "codigoPartida": "40610",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -280000
//                         },
//                         {
//                             "codigoPartida": "40620",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -70000
//                         },
//                         {
//                             "codigoPartida": "40700",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40700GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -500000
//                         },
//                         {
//                             "codigoPartida": "40710",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -450000
//                         },
//                         {
//                             "codigoPartida": "40720",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -50000
//                         },
//                         {
//                             "codigoPartida": "41300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4130010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 265000
//                         },
//                         {
//                             "codigoPartida": "41400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4140010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 180000
//                         },
//                         {
//                             "codigoPartida": "41410",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 180000
//                         },
//                         {
//                             "codigoPartida": "41412",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 180000
//                         },
//                         {
//                             "codigoPartida": "41500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4150010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -50000
//                         },
//                         {
//                             "codigoPartida": "41520",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -50000
//                         },
//                         {
//                             "codigoPartida": "41900",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4190010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -50000
//                         },
//                         {
//                             "codigoPartida": "49100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4910010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 900000
//                         },
//                         {
//                             "codigoPartida": "49200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4920010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 130000
//                         },
//                         {
//                             "codigoPartida": "49300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "49300GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1030000
//                         },
//                         {
//                             "codigoPartida": "49400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 980000
//                         },
//                         {
//                             "codigoPartida": "49500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4950010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 980000
//                         }
//                     ],
//                     "listaPartidasCambiosPatrimonio": [
//                         {
//                             "codigoPartida": "51101",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51101GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "51104",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51104GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "51106",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51106GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 8103000
//                         },
//                         {
//                             "codigoPartida": "51108",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51108GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "51113",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51113GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 10373000
//                         },
//                         {
//                             "codigoPartida": "51401",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51401GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "51404",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51404GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "51406",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51406GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 8103000
//                         },
//                         {
//                             "codigoPartida": "51408",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51408GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "51413",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51413GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 10373000
//                         },
//                         {
//                             "codigoPartida": "51508",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 980000
//                         },
//                         {
//                             "codigoPartida": "51513",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 980000
//                         },
//                         {
//                             "codigoPartida": "52406",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52406GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "52408",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52408GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -950000
//                         },
//                         {
//                             "codigoPartida": "52501",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52501GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "52504",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52504GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "52506",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52506GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 9053000
//                         },
//                         {
//                             "codigoPartida": "52508",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52508GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 980000
//                         },
//                         {
//                             "codigoPartida": "52513",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52513GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 11353000
//                         },
//                         {
//                             "codigoPartida": "53206",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "53206GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "53208",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "53208GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -950000
//                         },
//                         {
//                             "codigoPartida": "59100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 980000
//                         },
//                         {
//                             "codigoPartida": "59400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 980000
//                         }
//                     ],
//                     "listaPartidasFlujosEfectivo": [
//                         {
//                             "codigoPartida": "61100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1030000
//                         },
//                         {
//                             "codigoPartida": "61200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -130000
//                         },
//                         {
//                             "codigoPartida": "61207",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -180000
//                         },
//                         {
//                             "codigoPartida": "61208",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 50000
//                         },
//                         {
//                             "codigoPartida": "61300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -545000
//                         },
//                         {
//                             "codigoPartida": "61302",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 540000
//                         },
//                         {
//                             "codigoPartida": "61304",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -1085000
//                         },
//                         {
//                             "codigoPartida": "61400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 130000
//                         },
//                         {
//                             "codigoPartida": "61401",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -50000
//                         },
//                         {
//                             "codigoPartida": "61403",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 180000
//                         },
//                         {
//                             "codigoPartida": "61500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 485000
//                         },
//                         {
//                             "codigoPartida": "62100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -18000
//                         },
//                         {
//                             "codigoPartida": "62102",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -18000
//                         },
//                         {
//                             "codigoPartida": "62200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 70000
//                         },
//                         {
//                             "codigoPartida": "62203",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 70000
//                         },
//                         {
//                             "codigoPartida": "62300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 52000
//                         },
//                         {
//                             "codigoPartida": "63200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -737000
//                         },
//                         {
//                             "codigoPartida": "63207",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -737000
//                         },
//                         {
//                             "codigoPartida": "63209",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -735000
//                         },
//                         {
//                             "codigoPartida": "63212",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -2000
//                         },
//                         {
//                             "codigoPartida": "63400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -737000
//                         },
//                         {
//                             "codigoPartida": "65000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -200000
//                         },
//                         {
//                             "codigoPartida": "65100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1100000
//                         },
//                         {
//                             "codigoPartida": "65200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 900000
//                         }
//                     ],
//                     "listaRatios": [
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93601",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": -1347000
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93602",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": -0.082
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93603",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0.888
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93604",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 362.416
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93605",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 281.25
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93606",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 73.364
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93607",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 17.797
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93608",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 25.394
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93609",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0.012
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93610",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": -20.95
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93611",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 18
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93612",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": -13.423
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93613",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": -1.212
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93614",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 2.525
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93615",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 67727.273
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93616",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 15909.091
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93617",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0.09
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93619",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 5.455
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93620",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 5.455
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93621",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 9.072
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93622",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 900000
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93623",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 900000
//                         }
//                     ]
//                 },
//                 {
//                     "cabeceraBalance": {
//                         "indicadorBalanceIndividual": false,
//                         "campoCodificadoTipoPlantilla": {
//                             "valor": "13",
//                             "tablaDecodificacion": "tablaTipoPlantilla"
//                         },
//                         "fechaCierre": "2022-12-31",
//                         "fechaRecepcion": "2023-01-11",
//                         "annoBalance": 2022,
//                         "annoDeposito": 2022,
//                         "campoCodificadoUnidadDivisa": {
//                             "valor": "001",
//                             "tablaDecodificacion": "tablaUnidadDivisa"
//                         },
//                         "campoCodificadoUnidadDivisaOrigen": {
//                             "valor": "001",
//                             "tablaDecodificacion": "tablaUnidadDivisa"
//                         },
//                         "duracionMeses": 12,
//                         "campoCodificadoOrigen": {
//                             "valor": "I",
//                             "tablaDecodificacion": "tablaOrigen"
//                         },
//                         "campoCodificadoFuente": {
//                             "valor": "I3",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "numeroTotalEmpleados": 19.0,
//                         "indicadorPgc2007": true,
//                         "campoCodificadoCnae2009": {
//                             "valor": "0124",
//                             "tablaDecodificacion": "tablaCnae09"
//                         },
//                         "campoCodificadoOpinionAuditoria": {
//                             "valor": "5",
//                             "tablaDecodificacion": "tablaOpinionAuditor"
//                         }
//                     },
//                     "listaPartidasBalanceActivo": [
//                         {
//                             "codigoPartida": "10000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "10000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 16054000
//                         },
//                         {
//                             "codigoPartida": "11000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 14380000
//                         },
//                         {
//                             "codigoPartida": "11100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11100GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 800000
//                         },
//                         {
//                             "codigoPartida": "11170",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 800000
//                         },
//                         {
//                             "codigoPartida": "11200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11200GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 13500000
//                         },
//                         {
//                             "codigoPartida": "11210",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 13500000
//                         },
//                         {
//                             "codigoPartida": "11300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11300GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 80000
//                         },
//                         {
//                             "codigoPartida": "11310",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 80000
//                         },
//                         {
//                             "codigoPartida": "12000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "12000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1674000
//                         },
//                         {
//                             "codigoPartida": "12300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "1230010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 574000
//                         },
//                         {
//                             "codigoPartida": "12330",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 364000
//                         },
//                         {
//                             "codigoPartida": "12340",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 210000
//                         },
//                         {
//                             "codigoPartida": "12700",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "1270010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1100000
//                         },
//                         {
//                             "codigoPartida": "12710",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1100000
//                         }
//                     ],
//                     "listaPartidasBalancePasivo": [
//                         {
//                             "codigoPartida": "20000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "20000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 10373000
//                         },
//                         {
//                             "codigoPartida": "21000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 10373000
//                         },
//                         {
//                             "codigoPartida": "21100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21100GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "21110",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21110GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "21300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21300GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "21320",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "21500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21500GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 8103000
//                         },
//                         {
//                             "codigoPartida": "21510",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 8103000
//                         },
//                         {
//                             "codigoPartida": "21700",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21700GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "30000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "30000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 16054000
//                         },
//                         {
//                             "codigoPartida": "31000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "31000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 85000
//                         },
//                         {
//                             "codigoPartida": "31200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "31200GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 85000
//                         },
//                         {
//                             "codigoPartida": "31220",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "31220GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 85000
//                         },
//                         {
//                             "codigoPartida": "32000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "32000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 5596000
//                         },
//                         {
//                             "codigoPartida": "32300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "3230010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 3980000
//                         },
//                         {
//                             "codigoPartida": "32320",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "32320GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 3980000
//                         },
//                         {
//                             "codigoPartida": "32500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "3250010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1616000
//                         },
//                         {
//                             "codigoPartida": "32530",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1616000
//                         }
//                     ],
//                     "listaPartidasCuentaPerdidasGanancias": [
//                         {
//                             "codigoPartida": "40100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40100GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1580000
//                         },
//                         {
//                             "codigoPartida": "40110",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1500000
//                         },
//                         {
//                             "codigoPartida": "40120",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 80000
//                         },
//                         {
//                             "codigoPartida": "40200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40200GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 150000
//                         },
//                         {
//                             "codigoPartida": "40400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40400GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -180000
//                         },
//                         {
//                             "codigoPartida": "40410",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -180000
//                         },
//                         {
//                             "codigoPartida": "40500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40500GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 90000
//                         },
//                         {
//                             "codigoPartida": "40510",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 90000
//                         },
//                         {
//                             "codigoPartida": "40600",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40600GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -320000
//                         },
//                         {
//                             "codigoPartida": "40610",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -290000
//                         },
//                         {
//                             "codigoPartida": "40620",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -30000
//                         },
//                         {
//                             "codigoPartida": "40700",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40700GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -700000
//                         },
//                         {
//                             "codigoPartida": "40710",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -700000
//                         },
//                         {
//                             "codigoPartida": "40800",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40800GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -9000
//                         },
//                         {
//                             "codigoPartida": "41300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4130010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 279000
//                         },
//                         {
//                             "codigoPartida": "41400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4140010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 170000
//                         },
//                         {
//                             "codigoPartida": "41410",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 170000
//                         },
//                         {
//                             "codigoPartida": "41412",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 170000
//                         },
//                         {
//                             "codigoPartida": "41500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4150010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -40000
//                         },
//                         {
//                             "codigoPartida": "41520",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -40000
//                         },
//                         {
//                             "codigoPartida": "41900",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4190010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -70000
//                         },
//                         {
//                             "codigoPartida": "49100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4910010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 890000
//                         },
//                         {
//                             "codigoPartida": "49200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4920010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 130000
//                         },
//                         {
//                             "codigoPartida": "49300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "49300GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1020000
//                         },
//                         {
//                             "codigoPartida": "49400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "49500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4950010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         }
//                     ],
//                     "listaPartidasCambiosPatrimonio": [
//                         {
//                             "codigoPartida": "51101",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51101GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "51104",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51104GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "51106",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51106GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 7193000
//                         },
//                         {
//                             "codigoPartida": "51108",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51108GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         },
//                         {
//                             "codigoPartida": "51113",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51113GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 9423000
//                         },
//                         {
//                             "codigoPartida": "51401",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51401GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "51404",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51404GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "51406",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51406GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 7193000
//                         },
//                         {
//                             "codigoPartida": "51408",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51408GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         },
//                         {
//                             "codigoPartida": "51413",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51413GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 9423000
//                         },
//                         {
//                             "codigoPartida": "51508",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "51513",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "52406",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52406GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         },
//                         {
//                             "codigoPartida": "52408",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52408GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -910000
//                         },
//                         {
//                             "codigoPartida": "52501",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52501GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "52504",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52504GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "52506",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52506GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 8103000
//                         },
//                         {
//                             "codigoPartida": "52508",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52508GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "52513",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52513GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 10373000
//                         },
//                         {
//                             "codigoPartida": "53206",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "53206GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         },
//                         {
//                             "codigoPartida": "53208",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "53208GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -910000
//                         },
//                         {
//                             "codigoPartida": "59100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "59400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         }
//                     ],
//                     "listaPartidasFlujosEfectivo": [
//                         {
//                             "codigoPartida": "61100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1020000
//                         },
//                         {
//                             "codigoPartida": "61200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -121000
//                         },
//                         {
//                             "codigoPartida": "61201",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 9000
//                         },
//                         {
//                             "codigoPartida": "61207",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -170000
//                         },
//                         {
//                             "codigoPartida": "61208",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 40000
//                         },
//                         {
//                             "codigoPartida": "61300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -589000
//                         },
//                         {
//                             "codigoPartida": "61302",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 480000
//                         },
//                         {
//                             "codigoPartida": "61304",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -1069000
//                         },
//                         {
//                             "codigoPartida": "61400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 160000
//                         },
//                         {
//                             "codigoPartida": "61401",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -40000
//                         },
//                         {
//                             "codigoPartida": "61403",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 170000
//                         },
//                         {
//                             "codigoPartida": "61404",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 30000
//                         },
//                         {
//                             "codigoPartida": "61500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 470000
//                         },
//                         {
//                             "codigoPartida": "62100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -15000
//                         },
//                         {
//                             "codigoPartida": "62102",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -15000
//                         },
//                         {
//                             "codigoPartida": "62200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 95000
//                         },
//                         {
//                             "codigoPartida": "62203",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 95000
//                         },
//                         {
//                             "codigoPartida": "62300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 80000
//                         },
//                         {
//                             "codigoPartida": "63200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -400000
//                         },
//                         {
//                             "codigoPartida": "63207",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -400000
//                         },
//                         {
//                             "codigoPartida": "63209",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -400000
//                         },
//                         {
//                             "codigoPartida": "63400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -400000
//                         },
//                         {
//                             "codigoPartida": "65000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 150000
//                         },
//                         {
//                             "codigoPartida": "65100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "65200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1100000
//                         }
//                     ],
//                     "listaRatios": [
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93601",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": -3922000
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93602",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": -0.244
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93603",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0.721
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93604",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93605",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93606",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 29.914
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93607",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 19.657
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93608",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 25.321
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93609",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0.01
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93610",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 27.1
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93611",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 22.25
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93612",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 9.494
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93613",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0.934
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93614",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 2.29
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93615",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 83157.895
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93616",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 16842.105
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93617",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0.098
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93619",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 5.544
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93620",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 5.6
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93621",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 9.833
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93622",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 890000
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93623",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 899000
//                         }
//                     ]
//                 },
//                 {
//                     "cabeceraBalance": {
//                         "indicadorBalanceIndividual": false,
//                         "campoCodificadoTipoPlantilla": {
//                             "valor": "13",
//                             "tablaDecodificacion": "tablaTipoPlantilla"
//                         },
//                         "fechaCierre": "2021-12-31",
//                         "fechaRecepcion": "2022-06-02",
//                         "annoBalance": 2021,
//                         "annoDeposito": 2021,
//                         "campoCodificadoUnidadDivisa": {
//                             "valor": "001",
//                             "tablaDecodificacion": "tablaUnidadDivisa"
//                         },
//                         "campoCodificadoUnidadDivisaOrigen": {
//                             "valor": "001",
//                             "tablaDecodificacion": "tablaUnidadDivisa"
//                         },
//                         "duracionMeses": 12,
//                         "campoCodificadoOrigen": {
//                             "valor": "I",
//                             "tablaDecodificacion": "tablaOrigen"
//                         },
//                         "campoCodificadoFuente": {
//                             "valor": "I3",
//                             "tablaDecodificacion": "tablaTiposFuente"
//                         },
//                         "numeroTotalEmpleados": 16.0,
//                         "indicadorPgc2007": true,
//                         "campoCodificadoCnae2009": {
//                             "valor": "0124",
//                             "tablaDecodificacion": "tablaCnae09"
//                         },
//                         "campoCodificadoOpinionAuditoria": {
//                             "valor": "5",
//                             "tablaDecodificacion": "tablaOpinionAuditor"
//                         }
//                     },
//                     "listaPartidasBalanceActivo": [
//                         {
//                             "codigoPartida": "10000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "10000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 14640000
//                         },
//                         {
//                             "codigoPartida": "11000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 13540000
//                         },
//                         {
//                             "codigoPartida": "11100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11100GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 750000
//                         },
//                         {
//                             "codigoPartida": "11170",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 750000
//                         },
//                         {
//                             "codigoPartida": "11200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11200GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 12740000
//                         },
//                         {
//                             "codigoPartida": "11210",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 12740000
//                         },
//                         {
//                             "codigoPartida": "11300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "11300GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 50000
//                         },
//                         {
//                             "codigoPartida": "11310",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 50000
//                         },
//                         {
//                             "codigoPartida": "12000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "12000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1100000
//                         },
//                         {
//                             "codigoPartida": "12300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "1230010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 150000
//                         },
//                         {
//                             "codigoPartida": "12340",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 150000
//                         },
//                         {
//                             "codigoPartida": "12700",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "1270010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "codigoPartida": "12710",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         }
//                     ],
//                     "listaPartidasBalancePasivo": [
//                         {
//                             "codigoPartida": "20000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "20000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 9423000
//                         },
//                         {
//                             "codigoPartida": "21000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 9423000
//                         },
//                         {
//                             "codigoPartida": "21100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21100GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "21110",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21110GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "21300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21300GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "21320",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "21500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21500GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 7193000
//                         },
//                         {
//                             "codigoPartida": "21510",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 7193000
//                         },
//                         {
//                             "codigoPartida": "21700",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "21700GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         },
//                         {
//                             "codigoPartida": "30000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "30000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 14640000
//                         },
//                         {
//                             "codigoPartida": "31000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "31000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 70000
//                         },
//                         {
//                             "codigoPartida": "31200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "31200GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 70000
//                         },
//                         {
//                             "codigoPartida": "31220",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "31220GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 70000
//                         },
//                         {
//                             "codigoPartida": "32000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "32000GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 5147000
//                         },
//                         {
//                             "codigoPartida": "32300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "3230010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 4100000
//                         },
//                         {
//                             "codigoPartida": "32330",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "32330GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 4100000
//                         },
//                         {
//                             "codigoPartida": "32500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "3250010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1047000
//                         },
//                         {
//                             "codigoPartida": "32530",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1047000
//                         }
//                     ],
//                     "listaPartidasCuentaPerdidasGanancias": [
//                         {
//                             "codigoPartida": "40100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40100GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1050000
//                         },
//                         {
//                             "codigoPartida": "40110",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1000000
//                         },
//                         {
//                             "codigoPartida": "40120",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 50000
//                         },
//                         {
//                             "codigoPartida": "40200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40200GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 100000
//                         },
//                         {
//                             "codigoPartida": "40400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40400GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -200000
//                         },
//                         {
//                             "codigoPartida": "40410",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -200000
//                         },
//                         {
//                             "codigoPartida": "40500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40500GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 85000
//                         },
//                         {
//                             "codigoPartida": "40510",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 85000
//                         },
//                         {
//                             "codigoPartida": "40600",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40600GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -310000
//                         },
//                         {
//                             "codigoPartida": "40610",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -285000
//                         },
//                         {
//                             "codigoPartida": "40620",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -25000
//                         },
//                         {
//                             "codigoPartida": "40700",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40700GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -650000
//                         },
//                         {
//                             "codigoPartida": "40710",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -650000
//                         },
//                         {
//                             "codigoPartida": "40800",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "40800GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -8500
//                         },
//                         {
//                             "codigoPartida": "41300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4130010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 783500
//                         },
//                         {
//                             "codigoPartida": "41400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4140010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 185000
//                         },
//                         {
//                             "codigoPartida": "41410",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 185000
//                         },
//                         {
//                             "codigoPartida": "41412",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 185000
//                         },
//                         {
//                             "codigoPartida": "41500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4150010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -35000
//                         },
//                         {
//                             "codigoPartida": "41520",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -35000
//                         },
//                         {
//                             "codigoPartida": "41900",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4190010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -90000
//                         },
//                         {
//                             "codigoPartida": "49100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4910010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 850000
//                         },
//                         {
//                             "codigoPartida": "49200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4920010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 150000
//                         },
//                         {
//                             "codigoPartida": "49300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "49300GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1000000
//                         },
//                         {
//                             "codigoPartida": "49400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         },
//                         {
//                             "codigoPartida": "49500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "4950010",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         }
//                     ],
//                     "listaPartidasCambiosPatrimonio": [
//                         {
//                             "codigoPartida": "51101",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51101GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "51104",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51104GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "51106",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51106GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 6393000
//                         },
//                         {
//                             "codigoPartida": "51108",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51108GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 800000
//                         },
//                         {
//                             "codigoPartida": "51113",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51113GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 8513000
//                         },
//                         {
//                             "codigoPartida": "51401",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51401GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "51404",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51404GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "51406",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51406GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 6393000
//                         },
//                         {
//                             "codigoPartida": "51408",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51408GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 800000
//                         },
//                         {
//                             "codigoPartida": "51413",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "51413GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 8513000
//                         },
//                         {
//                             "codigoPartida": "51508",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         },
//                         {
//                             "codigoPartida": "51513",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         },
//                         {
//                             "codigoPartida": "52406",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52406GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 800000
//                         },
//                         {
//                             "codigoPartida": "52408",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52408GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -800000
//                         },
//                         {
//                             "codigoPartida": "52501",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52501GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 500000
//                         },
//                         {
//                             "codigoPartida": "52504",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52504GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 820000
//                         },
//                         {
//                             "codigoPartida": "52506",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52506GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 7193000
//                         },
//                         {
//                             "codigoPartida": "52508",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52508GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         },
//                         {
//                             "codigoPartida": "52513",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "52513GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 9423000
//                         },
//                         {
//                             "codigoPartida": "53206",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "53206GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 800000
//                         },
//                         {
//                             "codigoPartida": "53208",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": "53208GN",
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -800000
//                         },
//                         {
//                             "codigoPartida": "59100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         },
//                         {
//                             "codigoPartida": "59400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 910000
//                         }
//                     ],
//                     "listaPartidasFlujosEfectivo": [
//                         {
//                             "codigoPartida": "61100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 1000000
//                         },
//                         {
//                             "codigoPartida": "61200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -141500
//                         },
//                         {
//                             "codigoPartida": "61201",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 8500
//                         },
//                         {
//                             "codigoPartida": "61207",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -185000
//                         },
//                         {
//                             "codigoPartida": "61208",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 35000
//                         },
//                         {
//                             "codigoPartida": "61300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -593500
//                         },
//                         {
//                             "codigoPartida": "61302",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 450000
//                         },
//                         {
//                             "codigoPartida": "61304",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -1043500
//                         },
//                         {
//                             "codigoPartida": "61400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 175000
//                         },
//                         {
//                             "codigoPartida": "61401",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -35000
//                         },
//                         {
//                             "codigoPartida": "61403",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 185000
//                         },
//                         {
//                             "codigoPartida": "61404",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 25000
//                         },
//                         {
//                             "codigoPartida": "61500",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 440000
//                         },
//                         {
//                             "codigoPartida": "62100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -30000
//                         },
//                         {
//                             "codigoPartida": "62102",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -30000
//                         },
//                         {
//                             "codigoPartida": "62200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 90000
//                         },
//                         {
//                             "codigoPartida": "62203",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 90000
//                         },
//                         {
//                             "codigoPartida": "62300",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 60000
//                         },
//                         {
//                             "codigoPartida": "63200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -350000
//                         },
//                         {
//                             "codigoPartida": "63207",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -350000
//                         },
//                         {
//                             "codigoPartida": "63209",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -350000
//                         },
//                         {
//                             "codigoPartida": "63400",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": -350000
//                         },
//                         {
//                             "codigoPartida": "65000",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 150000
//                         },
//                         {
//                             "codigoPartida": "65100",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 800000
//                         },
//                         {
//                             "codigoPartida": "65200",
//                             "campoCodificadoPartidaConPlantilla": {
//                                 "valor": null,
//                                 "tablaDecodificacion": "tablaPartidasBalance"
//                             },
//                             "valor": 950000
//                         }
//                     ],
//                     "listaRatios": [
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93601",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": -4047000
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93602",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": -0.276
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93603",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0.696
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93604",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93605",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93606",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 21.372
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93607",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 18.457
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93608",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 28.484
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93609",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0.008
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93610",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 27.8
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93611",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 24.286
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93612",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 14.286
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93613",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 1.025
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93614",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 5.25
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93615",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 65625
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93616",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 19375
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93617",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 0.072
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93619",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 5.806
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93620",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 5.864
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93621",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 10.612
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93622",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 850000
//                         },
//                         {
//                             "campoCodificadoRatio": {
//                                 "valor": "93623",
//                                 "tablaDecodificacion": "tablaRatios"
//                             },
//                             "valor": 858500
//                         }
//                     ]
//                 }
//             ],
//             "listaElementosFinancieros": [
//                 {
//                     "cabeceraElementosFinancieros": {
//                         "annoDatos": 2023,
//                         "fechaCierre": "2023-12-31",
//                         "duracionMeses": 12,
//                         "campoCodificadoUnidadDivisa": {
//                             "valor": "001",
//                             "tablaDecodificacion": "tablaUnidadDivisa"
//                         },
//                         "campoCodificadoOrigen": {
//                             "valor": "01",
//                             "tablaDecodificacion": "origenDatosElementosFinanciero"
//                         }
//                     },
//                     "listaPartidasElementosFinancieros": [
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RAC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 3710000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RANC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 12790000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "REBD",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 900000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "REBIT",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 900000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RMB",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 1485000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RPC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 5057000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RPN",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 11353000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RPNC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 90000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RRN",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 980000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RTIE",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 4.85
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RVEN",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 1490000
//                         }
//                     ]
//                 },
//                 {
//                     "cabeceraElementosFinancieros": {
//                         "annoDatos": 2022,
//                         "fechaCierre": "2022-12-31",
//                         "duracionMeses": 12,
//                         "campoCodificadoUnidadDivisa": {
//                             "valor": "001",
//                             "tablaDecodificacion": "tablaUnidadDivisa"
//                         },
//                         "campoCodificadoOrigen": {
//                             "valor": "01",
//                             "tablaDecodificacion": "origenDatosElementosFinanciero"
//                         }
//                     },
//                     "listaPartidasElementosFinancieros": [
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RAC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 1674000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RANC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 14380000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "REBD",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 899000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "REBIT",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 890000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RMB",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 1640000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RPC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 5596000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RPN",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 10373000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RPNC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 85000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RRN",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 950000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RTIE",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 6.86
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RVEN",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 1580000
//                         }
//                     ]
//                 },
//                 {
//                     "cabeceraElementosFinancieros": {
//                         "annoDatos": 2021,
//                         "fechaCierre": "2021-12-31",
//                         "duracionMeses": 12,
//                         "campoCodificadoUnidadDivisa": {
//                             "valor": "001",
//                             "tablaDecodificacion": "tablaUnidadDivisa"
//                         },
//                         "campoCodificadoOrigen": {
//                             "valor": "01",
//                             "tablaDecodificacion": "origenDatosElementosFinanciero"
//                         }
//                     },
//                     "listaPartidasElementosFinancieros": [
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RAC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 1100000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RANC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 13540000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "REBD",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 858500
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "REBIT",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 850000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RMB",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 1035000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RPC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 5147000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RPN",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 9423000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RPNC",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 70000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RRN",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 910000
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RTIE",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 9.00
//                         },
//                         {
//                             "campoCodificadoPartidaElementoFinanciero": {
//                                 "valor": "RVEN",
//                                 "tablaDecodificacion": "partidasElementos"
//                             },
//                             "valor": 1050000
//                         }
//                     ]
//                 }
//             ],
//             "datosAdicionalesMemoria": {
//                 "annoDatos": "2020",
//                 "indicadorDescuadre": false,
//                 "distribucionResultados": {
//                     "campoCodificadoOrigen": {
//                         "valor": "I",
//                         "tablaDecodificacion": "tablaOrigenBalance"
//                     },
//                     "campoCodificadoUnidadDivisa": {
//                         "valor": "001",
//                         "tablaDecodificacion": "tablaUnidadDivisa"
//                     },
//                     "reparto": {
//                         "importePerdidasYGanancias": 800000.00,
//                         "importeTotalBaseReparto": 800000.00
//                     },
//                     "distribucion": {
//                         "importeReservasEspeciales": 800000.00,
//                         "totalAplicacion": 800000.00
//                     }
//                 }
//             },
//             "informacionSectorial": {
//                 "cabeceraInformacionSectorial": {
//                     "campoCodificadoCnae2009": {
//                         "valor": "1520",
//                         "tablaDecodificacion": "tablaCnae09"
//                     },
//                     "numeroEmpresas": 678,
//                     "campoCodificadoTamanno": {
//                         "valor": "2",
//                         "tablaDecodificacion": "tamanoEmpSect"
//                     }
//                 },
//                 "listaPartidasComparativaSectorial": [
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "RAC",
//                             "tablaDecodificacion": "tablaElementosFinancierosSectorial"
//                         },
//                         "valorSector": "76,21",
//                         "valorEmpresa": "22,48"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "RANC",
//                             "tablaDecodificacion": "tablaElementosFinancierosSectorial"
//                         },
//                         "valorSector": "23,79",
//                         "valorEmpresa": "77,52"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "REBIT",
//                             "tablaDecodificacion": "tablaElementosFinancierosSectorial"
//                         },
//                         "valorSector": "2,37",
//                         "valorEmpresa": "57,14"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "REBITDA",
//                             "tablaDecodificacion": "tablaElementosFinancierosSectorial"
//                         },
//                         "valorSector": "4,02",
//                         "valorEmpresa": "57,14"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "RMB",
//                             "tablaDecodificacion": "tablaElementosFinancierosSectorial"
//                         },
//                         "valorSector": "55,49",
//                         "valorEmpresa": "94,29"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "RPC",
//                             "tablaDecodificacion": "tablaElementosFinancierosSectorial"
//                         },
//                         "valorSector": "41,58",
//                         "valorEmpresa": "30,65"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "RPN",
//                             "tablaDecodificacion": "tablaElementosFinancierosSectorial"
//                         },
//                         "valorSector": "38,92",
//                         "valorEmpresa": "68,81"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "RPNC",
//                             "tablaDecodificacion": "tablaElementosFinancierosSectorial"
//                         },
//                         "valorSector": "19,49",
//                         "valorEmpresa": "0,55"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "RRN",
//                             "tablaDecodificacion": "tablaElementosFinancierosSectorial"
//                         },
//                         "valorSector": "1,33",
//                         "valorEmpresa": "62,22"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "RVEN",
//                             "tablaDecodificacion": "tablaElementosFinancierosSectorial"
//                         },
//                         "valorSector": "98,32",
//                         "valorEmpresa": "94,60"
//                     }
//                 ],
//                 "listaPartidasCuentaAnaliticaResultadosSectorial": [
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SA",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 98.32,
//                         "valorEmpresa": 94.60
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SB",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 1.68,
//                         "valorEmpresa": 5.40
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SC",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 100,
//                         "valorEmpresa": 100.00
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SD",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": -45.49,
//                         "valorEmpresa": -12.06
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SE",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 0.99,
//                         "valorEmpresa": 6.35
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SF",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 55.49,
//                         "valorEmpresa": 94.29
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SG",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": -14.32,
//                         "valorEmpresa": -31.75
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SH",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": -37.31,
//                         "valorEmpresa": -22.22
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SI",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 3.86,
//                         "valorEmpresa": 40.32
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SJ",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": -1.65,
//                         "valorEmpresa": 0
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SK",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": -0.01,
//                         "valorEmpresa": 0
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "S1",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 0.17,
//                         "valorEmpresa": 16.83
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SL",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 2.37,
//                         "valorEmpresa": 57.14
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SM",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": -0.53,
//                         "valorEmpresa": 8.25
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SN",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 1.84,
//                         "valorEmpresa": 65.40
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SO",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": -0.52,
//                         "valorEmpresa": -3.17
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "S2",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 1.33,
//                         "valorEmpresa": 62.22
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "S3",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 0,
//                         "valorEmpresa": 0
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "SP",
//                             "tablaDecodificacion": "tablaPartidasCuentaAnaliticaResultados"
//                         },
//                         "valor": 1.33,
//                         "valorEmpresa": 62.22
//                     }
//                 ],
//                 "listaPartidasRatiosSectorial": [
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93601",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "14425.17",
//                         "valorSectorPtile50": "73778.51",
//                         "valorSectorPtile75": "190212.45"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93602",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "0.09",
//                         "valorSectorPtile50": "0.34",
//                         "valorSectorPtile75": "0.56"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93603",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "0.66",
//                         "valorSectorPtile50": "1.73",
//                         "valorSectorPtile75": "5.25"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93604",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "18.09",
//                         "valorSectorPtile50": "50.28",
//                         "valorSectorPtile75": "107.77"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93605",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "15.76",
//                         "valorSectorPtile50": "55.61",
//                         "valorSectorPtile75": "107.07"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93606",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "113.87",
//                         "valorSectorPtile50": "176.44",
//                         "valorSectorPtile75": "300.91"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93607",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "11.55",
//                         "valorSectorPtile50": "50.93",
//                         "valorSectorPtile75": "122.52"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93608",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "1.47",
//                         "valorSectorPtile50": "23.4",
//                         "valorSectorPtile75": "45.65"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93609",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "0",
//                         "valorSectorPtile50": "0.02",
//                         "valorSectorPtile75": "0.04"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93610",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "0",
//                         "valorSectorPtile50": "1.91",
//                         "valorSectorPtile75": "10.31"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93611",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "1.05",
//                         "valorSectorPtile50": "3.43",
//                         "valorSectorPtile75": "16.16"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93612",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "0.59",
//                         "valorSectorPtile50": "2.38",
//                         "valorSectorPtile75": "6.63"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93613",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "0.74",
//                         "valorSectorPtile50": "3.39",
//                         "valorSectorPtile75": "8.09"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93614",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "1",
//                         "valorSectorPtile50": "1.02",
//                         "valorSectorPtile75": "1.06"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93615",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "35805.03",
//                         "valorSectorPtile50": "57882.43",
//                         "valorSectorPtile75": "88292.11"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93616",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "18660.27",
//                         "valorSectorPtile50": "21746.54",
//                         "valorSectorPtile75": "25607.19"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93617",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "0.78",
//                         "valorSectorPtile50": "1.29",
//                         "valorSectorPtile75": "2.08"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93618",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "6.56",
//                         "valorSectorPtile50": "90.47",
//                         "valorSectorPtile75": "268.77"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93619",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "0.53",
//                         "valorSectorPtile50": "3",
//                         "valorSectorPtile75": "7.04"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93620",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "1.48",
//                         "valorSectorPtile50": "4.97",
//                         "valorSectorPtile75": "10.15"
//                     },
//                     {
//                         "campoCodificadoPartida": {
//                             "valor": "93621",
//                             "tablaDecodificacion": "tablaRatios"
//                         },
//                         "valorSectorPtile25": "1.27",
//                         "valorSectorPtile50": "8.74",
//                         "valorSectorPtile75": "27.56"
//                     }
//                 ]
//             }
//         }
//     }
// }