// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
    production: false,
    firebaseConfig: {
        apiKey: "AIzaSyBWyyMfoBAuaQ3eKXP8DeGp6hHT6fVAsW8",
        authDomain: "dairysoftware-97b42.firebaseapp.com",
        databaseURL: "https://dairysoftware-97b42.firebaseio.com",
        projectId: "dairysoftware-97b42",
        storageBucket: "dairysoftware-97b42.appspot.com",
        messagingSenderId: "42644195755",
        appId: "1:42644195755:web:bb444784d64ce552892aee"
    },
    hmr: false,
    appConfig: 'appconfig.json'
};
