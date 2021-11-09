import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs } from 'fs';
import Nano from 'nano';

const CouchDBConfig = JSON.parse(await fs.readFile('./config/couchdb.json', 'UTF-8'));

async function main() {
    //CouchDB
    let nano = Nano(CouchDBConfig.uri);

    const user = CouchDBConfig.username;
    const pass = CouchDBConfig.password;
    await nano.auth(user, pass)

    async function getDocJSON(database, doc) {
        const db = nano.use(database)
        let dbStringJSON = JSON.stringify(await db.get(doc))
        return JSON.parse(dbStringJSON);
    }

    async function updateToken(database, newToken) {
        const db = nano.use(database);
        db.insert(newToken)
    }

    // Auth
    let tokenData = await getDocJSON('twitch_bot','twitchAPIToken');
    const clientData = await getDocJSON('twitch_bot','twitchClient');
    const clientId = clientData.clientId;
    const clientSecret = clientData.clientSecret;
    const authProvider = new RefreshingAuthProvider(
        {
            clientId,
            clientSecret,
            onRefresh: async newTokenData => {
                newTokenData._id = tokenData._id;
                newTokenData._rev = tokenData._rev;
                await updateToken('twitch_bot', newTokenData);
            }
        },
        tokenData
    );

    
    // Chat
    const chatClient = new ChatClient({ authProvider, channels: ['messyfresh'] });
    await chatClient.connect();

    chatClient.onMessage((channel, user, message) => {
        if (message === '!ping') {
            chatClient.say(channel, 'Pong!');
        } else if (message === '!dice') {
            const diceRoll = Math.floor(Math.random() * 20) + 1;
            chatClient.say(channel, `@${user} rolled a ${diceRoll}`)
        }
    });

    chatClient.onSub((channel, user) => {
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
    });
    
    chatClient.onResub((channel, user, subInfo) => {
        chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
    });
    
    chatClient.onSubGift((channel, user, subInfo) => {
        chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
    });
}

main();