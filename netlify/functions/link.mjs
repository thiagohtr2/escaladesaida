/* POST { escalaId, nome, atual }: cria (ou devolve) o link público curto e fixo de uma escala da conta logada. */
import { resposta, corpo, usuario, lojas, chaveUsuario, falha } from '../lib/comum.mjs';

const slug = (t) => String(t || 'escala').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'escala';
const sufixo = () => Array.from({ length: 4 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 31)]).join('');

export default async (req) => {
  try {
    const u = await usuario(req);
    if (!u) return resposta(401, { erro: 'Sua sessão expirou. Entre de novo.' });
    if (req.method !== 'POST') return resposta(405, { erro: 'Método não permitido.' });
    const { escalaId, nome, atual } = await corpo(req);
    if (!escalaId) return resposta(400, { erro: 'Escala não informada.' });
    const { escalas, links } = lojas();
    const dados = await escalas.get(chaveUsuario(u.id), { type: 'json' });
    const e = dados && (dados.escalas || []).find((x) => x.id === escalaId);
    if (!e) return resposta(404, { erro: 'Salve a escala antes de gerar o link.' });
    if (atual) {
      const p = await links.get(atual, { type: 'json' });
      if (p && p.uid === u.id && p.escalaId === escalaId) return resposta(200, { id: atual });
    }
    let id = '';
    for (let i = 0; i < 6; i++) {
      const tent = slug(nome || e.nome) + '-' + sufixo();
      if (!(await links.get(tent, { type: 'json' }))) { id = tent; break; }
    }
    if (!id) return resposta(500, { erro: 'Não foi possível criar o link. Tente de novo.' });
    await links.setJSON(id, { uid: u.id, escalaId, criado: Date.now() });
    return resposta(200, { id });
  } catch (e) {
    return falha(e, 'Não foi possível criar o link agora.');
  }
};

export const config = { path: '/api/link' };
