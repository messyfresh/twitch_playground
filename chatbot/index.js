import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs } from 'fs';
import mongoose from 'mongoose';
import { parse } from 'path';

const TwitchConfig = JSON.parse(await fs.readFile('./config/twitch.json', 'UTF-8'));
const MongoConfig = JSON.parse(await fs.readFile('./config/mongodb.json', 'UTF-8'));
const TokenConfig = JSON.parse(await fs.readFile('./config/token.json', 'UTF-8'));

async function main() {
    //MongoDB
    await mongoose.connect(MongoConfig.uri);
    const { Schema } = mongoose;


    const tokenSchema = new Schema({
        access_token: String,
        expires_in: Number,
        refresh_token: String,
        scope: Array,
        token_type: String
    });

    const TwitchTokenModel = mongoose.model('token', tokenSchema)
    /*
    const TwitchToken = new TwitchTokenModel({
        access_token: TokenConfig.access_token,
        expires_in: TokenConfig.expires_in,
        refresh_token: TokenConfig.refresh_token,
        scope: TokenConfig.scope,
        token_type: TokenConfig.token_type
    })

    TwitchToken.save((err) => {
        if (err) return console.error(err);
    })
    */
    const clientSchema = new Schema({
        ClientId: String,
        ClientSecret: String
    })

    // Find one document, stringify it, then parse it as JSON
    // This is needed to pass the token data into authProvider (RefreshingAuthProvider)
    async function parseQuery (Model) {
        const data = await Model.findOne();
        const jsonData = JSON.stringify(data);
        return JSON.parse(jsonData);
    }

    const tokenData = await parseQuery(TwitchTokenModel);

    const ClientModel = mongoose.model('client', clientSchema);
    const clientData = ClientModel.findOne();

    //console.log(clientData);
    console.log(tokenData);
    /*
    // Auth
    const clientId = clientData.ClientId;
    const clientSecret = clientData.ClientSecret;
    //const tokenDataRaw = JSON.parse(await TwitchTokenModel.findOne());
    //const parsedTokenData
    const authProvider = new RefreshingAuthProvider(
        {
            clientId,
            clientSecret,
            onRefresh: async newTokenData => {
                await fs.writeFile('./config/token.json', JSON.stringify(newTokenData, null, 4), 'UTF-8');
                console.log("Token Refreshed: ", newTokenData);
            }
        },
        tokenData
    );

    /*
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
    */
}

main();