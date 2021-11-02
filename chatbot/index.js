import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs } from 'fs';

const TwitchConfig = JSON.parse(await fs.readFile('./config/twitch.json', 'UTF-8'));

async function main() {
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