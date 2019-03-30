

Object.defineProperty(exports, '__esModule', { value: true });
const nativescript_oauth2_1 = require('nativescript-oauth2');
const providers_1 = require('nativescript-oauth2/providers');

let client = null;
function configureOAuthProviders() {
  const microsoftProvider = configureOAuthProviderMicrosoft();
  nativescript_oauth2_1.configureTnsOAuth([microsoftProvider]);
}
exports.configureOAuthProviders = configureOAuthProviders;
function configureOAuthProviderMicrosoft() {
  const microsoftProviderOptions = {
    openIdSupport: 'oid-full',
    clientId: 'fb17bb1b-2b64-43ba-b4ae-c81f88c55c70',
    // redirectUri: "urn:ietf:wg:oauth:2.0:oob",
    redirectUri: 'fileitup://login',
    urlScheme: 'fileitup',
    scopes: ['files.readwrite.appfolder', 'offline_access'],
  };
  const microsoftProvider = new providers_1.TnsOaProviderMicrosoft(microsoftProviderOptions);
  return microsoftProvider;
}
function tnsOauthLogin(providerType) {
  client = new nativescript_oauth2_1.TnsOAuthClient(providerType);
  return new Promise((resolve) => {
    client.loginWithCompletion((tokenResult, error) => {
      if (error) {
        console.error('back to main page with error: ');
        console.error(error);
      } else {
        resolve(tokenResult.accessToken);
      }
    });
  });
}
exports.tnsOauthLogin = tnsOauthLogin;
function tnsOauthLogout() {
  if (client) {
    console.log('logout');
    client.logout();
  }
}
exports.tnsOauthLogout = tnsOauthLogout;
