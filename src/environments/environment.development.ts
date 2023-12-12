export const environment = {
    production: false,
    extInfoService: {
        credentials: {
            client_id: 'm7ud4ufes8xnuyycxxswimoz9bsbcl1ud5sz9nj7.api.einforma.com',
            client_secret: 'DBpge5yEe9nUPA9MCzsMZplDuRu-E3Af2ZB1rwB3t0A',
            grant_type: 'client_credentials',
            scope: 'buscar:consultar:empresas',
        },
        endpoint: {
            base: 'https://developers.einforma.com/api/v1',
            paths: {
                auth: '/oauth/token',
                getBasicInfo: '/companies/'
            }
        }
    }
};
