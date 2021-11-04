import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs } from 'fs';
import mongoose from 'mongoose';

const TwitchConfig = JSON.parse(await fs.readFile('./config/twitch.json', 'UTF-8'));
const MongoConfig = JSON.parse(await fs.readFile('./config/mongodb.json', 'UTF-8'));
const TokenConfig = JSON.parse(await fs.readFile('./config/token.json', 'UTF-8'));

async function main() {
    //MongoDB
    await mongoose.connect(MongoConfig.uri);
    const { Schema } = mongoose;

    /*
    const tokenSchema = new Schema({
        access_token: String,
        expires_in: Number,
        refresh_token: String,
        scope: Array,
        token_type: String
    });

    const TwitchTokenModel = mongoose.model('token', tokenSchema)

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

    const ClientModel = mongoose.model('client', clientSchema);
    const query = await ClientModel.findOne()
    
    console.log(query.ClientId)

    /*
    // Auth
    const clientId = TwitchConfig.ClientId;
    const clientSecret = TwitchConfig.ClientSecret;
    const tokenData = JSON.parse(await fs.readFile('./config/token.json', 'UTF-8'));
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