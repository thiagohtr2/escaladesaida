/* GET ?id=nome-da-escala-abcd: devolve a versão mais nova da escala para o link público (sem login). */
import { resposta, lojas, chaveUsuario } from '../lib/comum.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return resposta(405, { erro: 'Método não permitido.' });
  const id = String((event.queryStringParameters || {}).id || '').toLowerCase();
  if (!/^[a-z0-9-]{3,48}$/.test(id)) return resposta(404, { erro: 'Link não encontrado.' });
  try {
    const { escalas, links } = lojas(event);
    const p = await links.get(id, { type: 'json' });
    if (!p) return resposta(404, { erro: 'Link não encontrado.' });
    const dados = await escalas.get(chaveUsuario(p.uid), { type: 'json' });
    const e = dados && (dados.escalas || []).find((x) => x.id === p.escalaId);
    if (!e) return resposta(404, { erro: 'Esta escala não existe mais.' });
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=15' },
      body: JSON.stringify({ e, s: (dados.config && dados.config.servico) || '', g: dados.atualizado || null }),
    };
  } catch {
    return resposta(500, { erro: 'Não foi possível abrir a escala agora.' });
  }
};
