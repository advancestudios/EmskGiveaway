const { Client, GatewayIntentBits, Collection, REST, Routes, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const commandsArray = [];

const commandsPath = path.join(__dirname, 'Comandos');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsArray.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log(`🤖 Bot iniciado con éxito como ${client.user.tag}`);
    try {
        console.log('🔄 Registrando comandos de barra (Slash Commands)...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commandsArray }
        );
        console.log('✅ Comandos registrados globalmente con éxito.');
    } catch (error) {
        console.error('❌ Error al registrar comandos:', error);
    }
});

// Manejador de Interacciones
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            await command.execute(interaction);
        } else if (interaction.isButton()) {
            if (interaction.customId.startsWith('claim_drop_')) {
                const amount = interaction.customId.split('_')[2];
                
                const updatedContainer = {
                    type: 17, // Contenedor V2
                    components: [
                        {
                            type: 10, // Text Display
                            content: `### 🎁 DROP RECLAMADO
¡Reclamado con éxito por **${interaction.user}**!

> 💰 **Recompensa Reclamada:** \`$${Number(amount).toLocaleString()}\`
> 📌 **Estado:** 🔒 **Cerrado**

⚠️ **Abre un Ticket y envía una captura para poder reclamar tu dinero.**`
                        },
                        {
                            type: 1, // Action Row
                            components: [
                                {
                                    type: 2, // Button
                                    style: 2, // Secondary
                                    label: `Reclamado por ${interaction.user.username}`,
                                    custom_id: 'claimed_disabled',
                                    disabled: true
                                }
                            ]
                        }
                    ]
                };

                await interaction.update({
                    components: [updatedContainer],
                    flags: MessageFlags.IsComponentsV2
                });
            }
        }
    } catch (error) {
        console.error(`Error procesando interacción:`, error);
        const errorMessage = '💥 Ups, algo ha fallado. Revisa tus permisos o los míos, o contacta con el desarrollador';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true }).catch(() => {});
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true }).catch(() => {});
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
