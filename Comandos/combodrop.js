const { SlashCommandBuilder } = require('discord.js');
const { publicarReclamable } = require('../utils/reclamo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('combodrop')
        .setDescription('¡Un drop combinado con dinero y gemas!')
        .setDMPermission(false),
    async execute(interaction) {
        const monedas = Math.floor(Math.pow(Math.random(), 1.8) * 2_000_000) + 10_000;
        const gemas = Math.floor(Math.random() * 6) + 3; // de 3 a 8

        await publicarReclamable(interaction, {
            aviso: '@here ¡Un **COMBO DROP** ha aparecido!',
            titulo: '⚡ ¡COMBO DROP ACTIVADO! ⚡',
            descripcion: '¡Un combo drop épico con dinero y gemas! ¡Corre a reclamarlo, solo uno se lo lleva!',
            premio: { monedas, gemas },
            textoBoton: 'Reclamar combo',
            tiempoMs: 60_000,
        });
    },
};
