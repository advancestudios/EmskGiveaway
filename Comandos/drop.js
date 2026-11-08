const { SlashCommandBuilder } = require('discord.js');
const { publicarReclamable } = require('../utils/reclamo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('drop')
        .setDescription('¡Suelta un drop de dinero aleatorio en el canal!')
        .setDMPermission(false),
    async execute(interaction) {
        const esPremioMayor = Math.random() < 0.004;
        const monedas = esPremioMayor
            ? 5_000_000
            : Math.floor(Math.pow(Math.random(), 2.2) * 1_000_000) + 500;

        await publicarReclamable(interaction, {
            aviso: '@here ¡Atención todos, hay dinero en juego!',
            titulo: esPremioMayor ? '🌟 ¡DROP PREMIO MAYOR!' : '🎁 ¡Nuevo Drop de Dinero!',
            descripcion: '¡Se ha soltado un drop en este canal! ¡Corre a reclamarlo, solo uno se lo lleva!',
            premio: { monedas },
            textoBoton: 'Reclamar drop',
            tiempoMs: 60_000,
        });
    },
};
