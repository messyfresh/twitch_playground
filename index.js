import { ApiClient } from 'twitch';
import { AccessToken, RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';

const refreshToken = process.env.REFRESHTOKEN
const clientId = process.env.CLIENTID
const clientSecret = process.env.CLIENTSECRET
const accessToken = process.env.ACCESSTOKEN

const authProvider = new RefreshableAuthProvider(
    new StaticAuthProvider(clientId, accessToken),
    {
        clientSecret,
        refreshToken,
        onRefresh: (token) => {
	        // do things with the new token data, e.g. save them in your database
            // TODO Maybe .env isn't the right option? Or at least need a modifyable config file to store new token in case of process restarts
        }
    }
);
const apiClient = new ApiClient({ authProvider });