const { Collection, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const path = require('path');
const config = require('../config/bot_config.json')

module.exports = (client) => {
    client.slashCommands = new Collection();
    client.registeredCommands = new Collection();
    client.cooldowns = new Collection();

    const loadCommands = (folderPath) => {
        const commandFolders = fs.readdirSync(folderPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${folderPath}/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`${folderPath}/${folder}/${file}`)

                if (!command.config || !command.config.name) {
                    console.error(`Slash komut dosyası boş! ${folder}/${file}`);
                    continue;
                }

                if (!command.config.description) {
                    command.config.description = `Açıklama Yok`;
                }

                client.slashCommands.set(command.config.name, command);
                client.registeredCommands.set(command.config.name, command.config);
            }
        }
    }

    const loadEvents = () => {
        const Eventsss = path.join(__dirname, '../function/');
        for (const event of fs.readdirSync(Eventsss).filter(file => file.endsWith(".js"))) {
            const evt = require(`${Eventsss}${event}`);

            if (evt.config.once) {
                client.once(evt.config.name, (...args) => {
                    evt.execute(client, ...args);
                });
            } else {
                client.on(evt.config.name, (...args) => {
                    evt.execute(client, ...args);
                });
            }
        }
    }

    const slashCommandsRegister = () => {
        const { REST } = require("@discordjs/rest");
        const { Routes } = require("discord-api-types/v10");

        client.once("ready", async () => {
            const rest = new REST({ version: "10" }).setToken(config.token);
            try {
                await rest.put(Routes.applicationCommands(config.id), {
                    body: client.registeredCommands.toJSON(),
                }).then(() => {
                    console.log(`> "Slash" command number: ${client.registeredCommands.size}`)
                });
            } catch (error) {
                throw error;
            }
        })
    };

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;

        try {
            // Execute the command
            await command.execute(client, interaction);
        } catch (error) {
            console.error(`Error executing command ${interaction.commandName}:`, error);
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({ 
                        content: 'An error occurred while executing this command.', 
                        ephemeral: true 
                    });
                } catch (replyError) {
                    console.error('Could not send error response:', replyError);
                }
            }
        }
    });

    const commandFolderPath = path.join(__dirname, '../../command/slash_command');
    loadCommands(commandFolderPath);
    loadEvents();
    slashCommandsRegister();

}
