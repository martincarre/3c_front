export const environment = {
    production: true,
    firebase: {
        apiKey: "AIzaSyCjHXu5m6SfRrfQ7VCtmFajn1bEniPasQo",
        authDomain: "c-dev-9dda0.firebaseapp.com",
        projectId: "c-dev-9dda0",
        storageBucket: "c-dev-9dda0.appspot.com",
        messagingSenderId: "812435085339",
        appId: "1:812435085339:web:53b2ff36d2d46e9e7e00be",
        measurementId: "G-S4G3QN2B4R"
    },
    informa: {
        apiUrls: {},
        credentials: {
            user: '926071',
            password: 'xCK8jLz47tUW2'
        },
    },
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