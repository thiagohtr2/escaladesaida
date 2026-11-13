/* GET: escalas da conta logada. PUT: salva as escalas da conta logada. */
import { resposta, corpo, usuario, lojas, chaveUsuario, vazio } from '../lib/comum.mjs';

export const handler = async (event, context) => {
  const u = usuario(context);
  if (!u) return resposta(401, { erro: 'Sua sessão expirou. Entre de novo.' });
  const { escalas } = lojas(event);
  const chave = chaveUsuario(u.id);
  try {
    if (event.httpMethod === 'GET') {
      const dados = (await escalas.get(chave, { type: 'json' })) || vazio();
      return resposta(200, { escalas: dados.escalas || [], config: dados.config || {}, atualizado: dados.atualizado || null });
    }
    if (event.httpMethod === 'PUT') {
      const d = corpo(event);
      if (!Array.isArray(d.escalas)) return resposta(400, { erro: 'Dados inválidos.' });
      const atualizado = Date.now();
      await escalas.setJSON(chave, { escalas: d.escalas, config: d.config || {}, atualizado, email: u.email });
      return resposta(200, { ok: true, atualizado });
    }
    return resposta(405, { erro: 'Método não permitido.' });
  } catch (e) {
    return resposta(e.status || 500, { erro: e.status ? e.message : 'Não foi possível acessar as escalas agora.' });
  }
};
