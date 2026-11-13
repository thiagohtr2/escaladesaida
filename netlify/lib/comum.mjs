import { connectLambda, getStore } from '@netlify/blobs';

export const resposta = (status, dados) => ({
  statusCode: status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  body: JSON.stringify(dados),
});

export function corpo(event) {
  const bruto = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');
  if (bruto.length > 2_000_000) throw Object.assign(new Error('Dados grandes demais.'), { status: 413 });
  try { return JSON.parse(bruto || '{}'); } catch { throw Object.assign(new Error('Dados inválidos.'), { status: 400 }); }
}

/* Usuário logado: o Netlify confere o token do Identity e entrega os dados em clientContext.user. */
export function usuario(context) {
  const u = context && context.clientContext && context.clientContext.user;
  return u && u.sub ? { id: u.sub, email: u.email || '' } : null;
}

export function lojas(event) {
  connectLambda(event);
  return {
    escalas: getStore({ name: 'escalas', consistency: 'strong' }),
    links: getStore({ name: 'links', consistency: 'strong' }),
  };
}

export const chaveUsuario = (id) => 'u/' + id;
export const vazio = () => ({ escalas: [], config: {} });
