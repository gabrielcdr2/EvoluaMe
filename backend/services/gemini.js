const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Valida a submissão de uma tarefa usando o Gemini 2.5 Flash.
 *
 * @param {string} temaJornada O título/tema da jornada (contexto).
 * @param {string} tituloTarefa O que é exigido pela tarefa.
 * @param {string} descricaoTarefa Descrição adicional da tarefa (opcional).
 * @param {string} descricaoUsuario O texto enviado pelo usuário.
 * @param {string} [base64Imagem] Imagem opcional em base64 (jpeg, png, etc).
 * @returns {Promise<Object>} JSON parseado com o resultado do Evo.
 */
async function validarEGerarFeedback(temaJornada, tituloTarefa, descricaoTarefa, descricaoUsuario, base64Imagem = null) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY não configurada no servidor.");
  }

  const prompt = `
Você é o "Evo", um mentor rigoroso em um aplicativo de autodesenvolvimento chamado EvoluaMe.
Sua missão é avaliar a submissão de uma tarefa do usuário, garantir que não é trapaça e dar um feedback curto, como um treinador.

Contexto da Jornada: "${temaJornada}"
Tarefa exigida: "${tituloTarefa}"
Descrição da tarefa (regras): "${descricaoTarefa || 'Nenhuma regra extra.'}"
O que o usuário enviou/escreveu: "${descricaoUsuario}"

Regras da avaliação:
1. Seja criterioso. Se a descrição (e a imagem, se houver) não tiverem NADA a ver com a tarefa ou parecerem respostas genéricas (ex: 'feito', 'ok'), reprove.
2. Dê um feedback curto (máximo 2 frases) de incentivo ou correção técnica.
3. Sugira XP extra de 0 a 10 apenas se o esforço demonstrado nas provas for muito além do básico esperado. Na dúvida, retorne 0.

Responda EXATAMENTE E APENAS neste formato JSON:
{
  "aprovado": true | false,
  "motivo_reprovacao": "Explique brevemente por que falhou (ou deixe vazio se aprovado)",
  "mensagem_mentor": "Seu feedback motivacional ou dica técnica curtos",
  "sugestao_xp_extra": 0
}
`;

  let parts = [{ text: prompt }];

  if (base64Imagem) {
    // Tenta detectar mime type se base64 iniciar com data:image/...
    let mimeType = 'image/jpeg';
    let data = base64Imagem;
    
    if (base64Imagem.startsWith('data:image/')) {
      const match = base64Imagem.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        data = match[2];
      }
    }

    parts.push({
      inlineData: { mimeType: mimeType, data: data },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: parts,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let textoResposta = response.text;
    console.log('--- Resposta Bruta do Gemini ---');
    console.log(textoResposta);
    console.log('--------------------------------');

    // Remove formatação markdown se a API ignorar o responseMimeType
    textoResposta = textoResposta.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(textoResposta);
  } catch (error) {
    console.error('Erro na chamada ao Gemini:', error.message || error);
    throw new Error('Falha ao processar análise do Evo: ' + (error.message || 'Erro na leitura do JSON'));
  }
}

module.exports = {
  validarEGerarFeedback,
};
