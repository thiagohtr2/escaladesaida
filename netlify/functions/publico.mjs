/* GET ?id=nome-da-escala-abcd: devolve a versão mais nova da escala para o link público (sem login). */
import { resposta, lojas, chaveUsuario, falha } from '../lib/comum.mjs';

export default async (req) => {
  try {
    if (req.method !== 'GET') return resposta(405, { erro: 'Método não permitido.' });
    const id = String(new URL(req.url).searchParams.get('id') || '').toLowerCase();
    if (!/^[a-z0-9-]{3,48}$/.test(id)) return resposta(404, { erro: 'Link não encontrado.' });
    const { escalas, links } = lojas();
    const p = await links.get(id, { type: 'json' });
    if (!p) return resposta(404, { erro: 'Link não encontrado.' });
    const dados = await escalas.get(chaveUsuario(p.uid), { type: 'json' });
    const e = dados && (dados.escalas || []).find((x) => x.id === p.escalaId);
    if (!e) return resposta(404, { erro: 'Esta escala não existe mais.' });
    return resposta(200, { e, s: (dados.config && dados.config.servico) || '', g: dados.atualizado || null }, 'public, max-age=15');
  } catch (e) {
    return falha(e, 'Não foi possível abrir a escala agora.');
  }
};

export const config = { path: '/api/publico' };
