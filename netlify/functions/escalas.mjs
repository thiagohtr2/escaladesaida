/* GET: escalas da conta logada. PUT: salva as escalas da conta logada. */
import { resposta, corpo, usuario, lojas, chaveUsuario, vazio, falha } from '../lib/comum.mjs';

export default async (req) => {
  try {
    const u = await usuario(req);
    if (!u) return resposta(401, { erro: 'Sua sessão expirou. Entre de novo.' });
    const { escalas } = lojas();
    const chave = chaveUsuario(u.id);
    if (req.method === 'GET') {
      const dados = (await escalas.get(chave, { type: 'json' })) || vazio();
      return resposta(200, { escalas: dados.escalas || [], config: dados.config || {}, atualizado: dados.atualizado || null });
    }
    if (req.method === 'PUT') {
      const d = await corpo(req);
      if (!Array.isArray(d.escalas)) return resposta(400, { erro: 'Dados inválidos.' });
      const atualizado = Date.now();
      await escalas.setJSON(chave, { escalas: d.escalas, config: d.config || {}, atualizado, email: u.email });
      return resposta(200, { ok: true, atualizado });
    }
    return resposta(405, { erro: 'Método não permitido.' });
  } catch (e) {
    return falha(e, 'Não foi possível acessar as escalas agora.');
  }
};

export const config = { path: '/api/escalas' };
