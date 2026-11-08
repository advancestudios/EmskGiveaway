const {
    ContainerBuilder,
    TextDisplayBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    MessageFlags,
} = require('discord.js');

const formatear = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const texto = (contenido) => new TextDisplayBuilder().setContent(contenido);

function textoPremio(premio) {
    const lineas = [`💰 **Dinero:** \`${formatear(premio.monedas)} monedas\``];
    if (premio.gemas) lineas.push(`💎 **Gemas:** \`${premio.gemas}\``);
    return lineas.join('\n');
}

const INSTRUCCIONES = 'Abre un ticket y envía una captura dentro del mismo para reclamar tu recompensa.';

// Mensaje privado (solo lo ve quien reclamó): felicitaciones + instrucciones.
function mensajePrivado(premio) {
    const resumen = premio.gemas
        ? `**${formatear(premio.monedas)} monedas** y **${premio.gemas} gemas**`
        : `**${formatear(premio.monedas)} monedas**`;

    return new ContainerBuilder()
        .addTextDisplayComponents(
            texto('# 🎉 ¡Felicidades!'),
            texto(`Reclamaste ${resumen}.`),
            texto(`📩 **¿Cómo cobrarlo?**\n${INSTRUCCIONES}`),
        );
}

// Construye el Container (Components V2) según el estado del mensaje.
function construirPanel({ estado, titulo, descripcion, premio, idBoton, textoBoton, reclamadoPor }) {
    const boton = new ButtonBuilder().setCustomId(idBoton);
    if (estado === 'abierto') {
        boton.setStyle(ButtonStyle.Success).setLabel(textoBoton).setEmoji('🎁');
    } else if (estado === 'reclamado') {
        boton.setStyle(ButtonStyle.Secondary).setLabel('Reclamado').setEmoji('✅').setDisabled(true);
    } else {
        boton.setStyle(ButtonStyle.Secondary).setLabel('Expirado').setEmoji('⌛').setDisabled(true);
    }

    const cuerpo = {
        abierto: descripcion,
        reclamado: `✅ **¡Reclamado por <@${reclamadoPor}>!**`,
        expirado: '⌛ Nadie lo reclamó a tiempo.',
    }[estado];

    return new ContainerBuilder()
        .addTextDisplayComponents(texto(`# ${titulo}`), texto(cuerpo), texto(textoPremio(premio)))
        .addActionRowComponents(new ActionRowBuilder().addComponents(boton));
}

/**
 * Publica un mensaje Components V2 con botón de reclamar.
 *
 * opciones:
 *  - titulo, descripcion
 *  - premio: { monedas, gemas? }
 *  - aviso: texto fuera del container (ej. "@here ...")
 *  - soloInvocador: si true, solo quien ejecutó el comando puede reclamar
 *  - tiempoMs: cuánto tiempo queda disponible el botón
 *  - textoBoton: texto del botón
 */
async function publicarReclamable(interaction, opciones) {
    const { aviso, premio, soloInvocador = false, tiempoMs = 60_000, textoBoton = 'Reclamar', ...base } = opciones;
    const idBoton = `reclamar_${interaction.id}`;
    const flags = MessageFlags.IsComponentsV2;

    const armar = (estado, extra = {}) => {
        const componentes = [];
        if (estado === 'abierto' && aviso) componentes.push(texto(aviso));
        componentes.push(construirPanel({ ...base, premio, estado, idBoton, textoBoton, ...extra }));
        return componentes;
    };

    await interaction.reply({
        components: armar('abierto'),
        flags,
        allowedMentions: { parse: aviso ? ['everyone'] : [] },
    });
    const mensaje = await interaction.fetchReply();

    let reclamado = false;
    const collector = mensaje.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.customId === idBoton,
        time: tiempoMs,
    });

    collector.on('collect', async (i) => {
        if (soloInvocador && i.user.id !== interaction.user.id) {
            return i.reply({ content: '❌ Este botón no es para ti.', flags: MessageFlags.Ephemeral });
        }
        if (reclamado) {
            return i.reply({ content: '😔 Ya lo reclamaron.', flags: MessageFlags.Ephemeral });
        }

        reclamado = true; // se marca antes de cualquier await: solo el primero gana
        collector.stop('reclamado');

        await i.update({
            components: armar('reclamado', { reclamadoPor: i.user.id }),
            flags,
            allowedMentions: { parse: [] },
        });

        // Felicitaciones + instrucciones, visibles solo para quien reclamó
        await i.followUp({
            components: [mensajePrivado(premio)],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });
    });

    collector.on('end', async (_, razon) => {
        if (razon === 'reclamado') return;
        await interaction
            .editReply({ components: armar('expirado'), flags, allowedMentions: { parse: [] } })
            .catch(() => {});
    });
}

module.exports = { publicarReclamable };
