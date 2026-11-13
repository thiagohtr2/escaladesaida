import { getStore } from '@netlify/blobs';

export const resposta = (status, dados, cache) => new Response(JSON.stringify(dados), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache || 'no-store' },
});

export async function corpo(req) {
  const bruto = await req.text();
  if (bruto.length > 2_000_000) throw Object.assign(new Error('Dados grandes demais.'), { status: 413 });
  try { return JSON.parse(bruto || '{}'); } catch { throw Object.assign(new Error('Dados inválidos.'), { status: 400 }); }
}

/* Usuário logado: confere o token direto no Netlify Identity do próprio site. */
export async function usuario(req) {
  const auth = req.headers.get('authorization') || '';
  if (!/^Bearer\s+\S+/i.test(auth)) return null;
  try {
    const r = await fetch(new URL('/.netlify/identity/user', req.url), { headers: { authorization: auth } });
    if (!r.ok) return null;
    const u = await r.json();
    return u && u.id ? { id: u.id, email: u.email || '' } : null;
  } catch { return null; }
}

export const lojas = () => ({
  escalas: getStore({ name: 'escalas', consistency: 'strong' }),
  links: getStore({ name: 'links', consistency: 'strong' }),
});

export const chaveUsuario = (id) => 'u/' + id;
export const vazio = () => ({ escalas: [], config: {} });
export const falha = (e, msg) => {
  console.error(e);
  return resposta(e && e.status ? e.status : 500, { erro: e && e.status ? e.message : msg });
};
