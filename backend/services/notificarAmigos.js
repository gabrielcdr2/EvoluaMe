
const Amizade = require('../models/Amizade');
const Usuario = require('../models/Usuario');

async function notificarAmigosConclusao(usuario, tarefa) {
  try {
    // Busca somente amizades aceitas
    const amizades = await Amizade.find({
      status: 'aceita',
      $or: [
        { solicitante: usuario._id },
        { destinatario: usuario._id },
      ],
    });

    const idsAmigos = amizades.map((amizade) =>
      amizade.solicitante.equals(usuario._id)
        ? amizade.destinatario
        : amizade.solicitante
    );

    if (idsAmigos.length === 0) return;

    // Busca os tokens dos dispositivos dos amigos
    const amigos = await Usuario.find({
      _id: { $in: idsAmigos },
    }).select('+expoPushTokens');

    const tokens = [
      ...new Set(
        amigos.flatMap((amigo) => amigo.expoPushTokens || [])
      ),
    ].filter(
      (token) =>
        typeof token === 'string' &&
        /^(ExponentPushToken|ExpoPushToken)\[[^\]]+\]$/.test(token)
    );

    if (tokens.length === 0) return;

    const mensagens = tokens.map((to) => ({
      to,
      sound: 'default',
      title: '🏆 Seu amigo evoluiu!',
      body: `${usuario.nome} concluiu a tarefa "${tarefa.titulo}" no EvoluaMe!`,
      data: {
        tipo: 'tarefa_concluida',
      },
    }));

    // Envia em lotes de até 100 notificações
    for (let i = 0; i < mensagens.length; i += 100) {
      const lote = mensagens.slice(i, i + 100);

      const resposta = await fetch(
        'https://exp.host/--/api/v2/push/send',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lote),
        }
      );

      if (!resposta.ok) {
        console.error(
          'Falha no envio de notificações:',
          resposta.status
        );
        continue;
      }

      const resultado = await resposta.json();

      if (resultado.errors) {
        console.error(
          'Erros retornados pelo Expo:',
          resultado.errors
        );
      }

      const tickets = Array.isArray(resultado.data)
        ? resultado.data
        : [resultado.data];

      for (const ticket of tickets) {
        if (ticket?.status === 'error') {
          console.error(
            'Notificação rejeitada pelo Expo:',
            ticket.message
          );
        }
      }
    }
  } catch (erro) {
    // Uma falha nas notificações não deve impedir
    // a conclusão de tarefas.
    console.error(
      'Erro ao notificar amigos:',
      erro.message
    );
  }
}

module.exports = { notificarAmigosConclusao };
