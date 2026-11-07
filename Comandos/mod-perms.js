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
        .setName('mod-perms')
        .setDescription('Establece el rol de moderador autorizado para usar /drop.')
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Selecciona el rol de moderador')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const role = interaction.options.getRole('rol');
            const config = getConfig();

            if (!config[interaction.guildId]) {
                config[interaction.guildId] = {};
            }

            config[interaction.guildId].modRoleId = role.id;
            saveConfig(config);

            await interaction.reply({
                content: `### 🛡️ Permisos de Moderación
> El rol **${role.name}** ahora está autorizado para ejecutar el comando \`/drop\`.`,
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
