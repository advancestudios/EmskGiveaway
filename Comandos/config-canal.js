const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

function saveConfig(data) {
    const configPath = path.join(__dirname, '../config.json');
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

function getConfig() {
    const configPath = path.join(__dirname, '../config.json');
    if (!fs.existsSync(configPath)) return {};
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-canal')
        .setDescription('Establece el canal donde se lanzarán los drops.')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('Selecciona el canal para los drops')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel('canal');
            const config = getConfig();

            if (!config[interaction.guildId]) {
                config[interaction.guildId] = {};
            }

            config[interaction.guildId].channelId = channel.id;
            saveConfig(config);

            await interaction.reply({
                content: `### ⚙️ Configuración del Canal
> El canal para los drops ha sido establecido correctamente en <#${channel.id}>.`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '💥 Ups, algo ha fallado. Revisa tus permisos o los míos, o contacta con el desarrollador',
                ephemeral: true
            });
        }
    }
};
