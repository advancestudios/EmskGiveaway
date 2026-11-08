const { SlashCommandBuilder } = require('discord.js');
const { publicarReclamable } = require('../utils/reclamo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Recoge tu recompensa diaria de dinero.'),
    async execute(interaction) {
        const monedas = Math.floor(Math.random() * 1500) + 2500;

        await publicarReclamable(interaction, {
            titulo: '📅 Recompensa Diaria',
            descripcion: `¡Hola <@${interaction.user.id}>! Tu recompensa de hoy está lista. Solo tú puedes reclamarla.`,
            premio: { monedas },
            textoBoton: 'Reclamar daily',
            soloInvocador: true,
            tiempoMs: 120_000,
        });
    },
};
