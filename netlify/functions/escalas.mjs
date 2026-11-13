/* Escalas da conta logada.
   GET                 → { escalas, config, atualizado }
   GET ?versoes=1      → { versoes: [{ t, n, nomes }] }   cópias automáticas anteriores
   GET ?versao=<t>     → { escalas, config, atualizado }  uma cópia anterior
   PUT { escalas, config, base } → grava; recusa (409) se outro aparelho salvou depois de `base`. */
import { resposta, corpo, usuario, lojas, chaveUsuario, vazio, falha } from '../lib/comum.mjs';

const MAX_COPIAS = 60;
const prefixo = (uid) => 'h/' + uid + '/';

async function listarCopias(store, uid) {
  const { blobs } = await store.list({ prefix: prefixo(uid) });
  return blobs.map((b) => +b.key.slice(prefixo(uid).length)).filter(Boolean).sort((a, b) => b - a);
}

export default async (req) => {
  try {
    const u = await usuario(req);
    if (!u) return resposta(401, { erro: 'Sua sessão expirou. Entre de novo.' });
    const { escalas } = lojas();
    const chave = chaveUsuario(u.id);
    const q = new URL(req.url).searchParams;

    if (req.method === 'GET') {
      if (q.get('versoes')) {
        const ts = (await listarCopias(escalas, u.id)).slice(0, MAX_COPIAS);
        const versoes = [];
        for (const t of ts) {
          const d = await escalas.get(prefixo(u.id) + t, { type: 'json' });
          if (d) versoes.push({ t, n: (d.escalas || []).length, nomes: (d.escalas || []).map((e) => e.nome).slice(0, 6) });
        }
        return resposta(200, { versoes });
      }
      if (q.get('versao')) {
        const d = await escalas.get(prefixo(u.id) + String(+q.get('versao')), { type: 'json' });
        if (!d) return resposta(404, { erro: 'Versão não encontrada.' });
        return resposta(200, { escalas: d.escalas || [], config: d.config || {}, atualizado: d.atualizado || null });
      }
      const dados = (await escalas.get(chave, { type: 'json' })) || vazio();
      return resposta(200, { escalas: dados.escalas || [], config: dados.config || {}, atualizado: dados.atualizado || null });
    }

    if (req.method === 'PUT') {
      const d = await corpo(req);
      if (!Array.isArray(d.escalas)) return resposta(400, { erro: 'Dados inválidos.' });
      const atual = await escalas.get(chave, { type: 'json' });
      // Outro aparelho (ou outra aba) salvou depois que este carregou: não sobrescreve.
      if (atual && atual.atualizado && d.base !== atual.atualizado) {
        return resposta(409, { erro: 'conflito', escalas: atual.escalas || [], config: atual.config || {}, atualizado: atual.atualizado });
      }
      // Guarda a versão anterior antes de gravar (cópia automática).
      if (atual && Array.isArray(atual.escalas) && atual.escalas.length) {
        await escalas.setJSON(prefixo(u.id) + (atual.atualizado || Date.now()), atual);
        const ts = await listarCopias(escalas, u.id);
        for (const t of ts.slice(MAX_COPIAS)) await escalas.delete(prefixo(u.id) + t);
      }
      const atualizado = Math.max(Date.now(), (atual && atual.atualizado ? atual.atualizado + 1 : 0));
      await escalas.setJSON(chave, { escalas: d.escalas, config: d.config || {}, atualizado, email: u.email });
      return resposta(200, { ok: true, atualizado });
    }
    return resposta(405, { erro: 'Método não permitido.' });
  } catch (e) {
    return falha(e, 'Não foi possível acessar as escalas agora.');
  }
};

export const config = { path: '/api/escalas' };
