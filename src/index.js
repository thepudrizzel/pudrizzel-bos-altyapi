const Discord = require('discord.js');
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildEmojisAndStickers, Discord.GatewayIntentBits.GuildMessageReactions, Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.GuildPresences], messages: { interval: 3600, lifetime: 1800, }, users: { interval: 3600, filter: () => user => user.bot && user.id !== client.user.id, } })

// Document
require("./client/event/ready.js")(client);
require("./client/handler/login_handler.js")(client);
require("./client/handler/mongo_handler.js")(client);
require("./client/handler/prefix_handler.js")(client);
require("./client/handler/slash_handler.js")(client);

// Bot
process.on('uncaughtException', (err) => {
    if (err.message.includes("Unknown interaction")) return;
});

process.on('unhandledRejection', (reason) => {
    if (reason?.message?.includes("Unknown interaction")) return;
});
