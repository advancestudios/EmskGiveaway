const { SlashCommandBuilder } = require('discord.js');
const { publicarReclamable } = require('../utils/reclamo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('drop')
        .setDescription('¡Suelta un drop de dinero aleatorio en el canal!')
        .setDMPermission(false),

    async execute(interaction) {
        const monedas = Math.floor(Math.random() * 150001) + 50000;

        await publicarReclamable(interaction, {
            aviso: '@here ¡Atención todos, hay dinero en juego!',
            titulo: '🎁 ¡Nuevo Drop de Dinero!',
            descripcion: '¡Se ha soltado un drop en este canal! ¡Corre a reclamarlo, solo uno se lo lleva!',
            premio: { monedas },
            textoBoton: 'Reclamar drop',
            tiempoMs: 60_000,
        });
    },
};
