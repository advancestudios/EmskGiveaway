const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

function getConfig() {
    const configPath = path.join(__dirname, '../config.json');
    if (!fs.existsSync(configPath)) return {};
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('drop')
        .setDescription('Lanza un drop de economía usando Componentes V2 en el canal configurado.'),
    
    async execute(interaction) {
        try {
            const config = getConfig();
            const guildConfig = config[interaction.guildId];

            if (!guildConfig || !guildConfig.modRoleId) {
                return interaction.reply({
                    content: '⚠️ No se ha configurado el rol de moderador. Usa `/mod-perms` primero.',
                    ephemeral: true
                });
            }

            const hasRole = interaction.member.roles.cache.has(guildConfig.modRoleId);
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

            if (!hasRole && !isAdmin) {
                return interaction.reply({
                    content: '💥 Ups, algo ha fallado. Revisa tus permisos o los míos, o contacta con el desarrollador',
                    ephemeral: true
                });
            }

            const targetChannelId = guildConfig.channelId || interaction.channelId;
            const targetChannel = interaction.guild.channels.cache.get(targetChannelId);

            if (!targetChannel) {
                return interaction.reply({
                    content: '⚠️ El canal configurado no existe o no tengo acceso a él.',
                    ephemeral: true
                });
            }

            const randomAmount = Math.floor(Math.random() * (5000 - 100 + 1)) + 100;

            const container = {
                type: 17, // Container v2
                components: [
                    {
                        type: 10, // Text display
                        content: `### ⚡ DROP DE ECONOMÍA DISPONIBLE
¡Un nuevo drop misterioso ha aparecido! Sé el más rápido en pulsar el botón inferior para reclamar tu recompensa de economía.

> 💵 **Monto del Drop:** \`$${randomAmount.toLocaleString()}\`
> 🟢 **Estado:** \`Disponible\``
                    },
                    {
                        type: 1, // Action Row
                        components: [
                            {
                                type: 2, // Button
                                style: 3, // Success
                                label: 'Reclamar Drop',
                                custom_id: `claim_drop_${randomAmount}`,
                                emoji: { name: '🎁' }
                            }
                        ]
                    }
                ]
            };

            await targetChannel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

            if (targetChannelId !== interaction.channelId) {
                await interaction.reply({
                    content: `✅ Drop de **$${randomAmount}** enviado con éxito al canal <#${targetChannelId}>.`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '✅ Drop lanzado con éxito.',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error(error);
            const errorMessage = '💥 Ups, algo ha fallado. Revisa tus permisos o los míos, o contacta con el desarrollador';
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
