const Discord = require('discord.js');
const client = new Discord.Client({
    allowedMentions: {
        parse: ['users', 'roles']
    },
    repliedUser: true,
    intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'],
    partials: ['CHANNEL']
})
require('dotenv').config()
const token = process.env.token
client.events = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.commands = new Discord.Collection();
['event_handler', 'slash_command_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
});
process.on('unhandledRejection', (err) => {
    console.log(err)
})
client.snipes = []
client.login(token);