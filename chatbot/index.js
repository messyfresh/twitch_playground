import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs } from 'fs';
import mongoose from 'mongoose';

const MongoConfig = JSON.parse(await fs.readFile('./config/mongodb.json', 'UTF-8'));

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
    async function parseQuery (query) {
        console.log(query)
        const jsonQuery = JSON.stringify(query);
        return await JSON.parse(jsonQuery);
    }

    async function updateToken (query, newTokenData) {
        await query.findOneAndUpdate({}, newTokenData, {new: true}, (err, doc) => {
            if (err) return console.error(err);
            console.log(doc)
        })
        //console.log(newTokenData)
    }

    const TwitchTokenModel = mongoose.model('token', tokenSchema)
    const ClientModel = mongoose.model('client', clientSchema);

    // Auth
    const TokenQuery = await TwitchTokenModel.findOne().lean();
    let tokenData = parseQuery(TokenQuery);
    const clientData = await parseQuery(ClientModel);
    const clientId = clientData.ClientId;
    const clientSecret = clientData.ClientSecret;
    const authProvider = new RefreshingAuthProvider(
        {
            clientId,
            clientSecret,
            onRefresh: async newTokenData => {
                //await fs.writeFile('./config/token.json', JSON.stringify(newTokenData, null, 4), 'UTF-8');
                await updateToken(TokenQuery, newTokenData);
                //console.log("Token Refreshed: ", newTokenData);
                tokenData.accessToken = newTokenData.accessToken;
                tokenData.scope = newTokenData.scope;
                tokenData.expiresIn = newTokenData.expiresIn;
                tokenData.refreshToken = newTokenData.refreshToken;
                tokenData.obtainmentTimestamp = newTokenData.obtainmentTimestamp;
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