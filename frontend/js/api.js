const TOKEN_KEY = 'espacocrescer_jwt_token';
const USER_KEY = 'espacocrescer_user_data';
const COOKIE_KEY = 'espacocrescer_lgpd_cookies_v1';

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function salvarSessao(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function obterToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function obterUsuarioLogado() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function apiFetch(endpoint, options = {}) {
  const token = obterToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(endpoint, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.erro || `Falha HTTP ${res.status}`);
  }
  return data;
}

export function inicializarCookiesLgpd() {
  if (localStorage.getItem(COOKIE_KEY)) return;
  const bar = document.createElement('aside');
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Consentimento de Cookies e Proteção de Dados');
  bar.style.cssText = 'position: fixed; bottom: 18px; left: 18px; right: 18px; max-width: 860px; margin: 0 auto; background: #FFFFFF; color: #0F172A; border: 2px solid #0F766E; border-radius: 18px; padding: 18px 22px; z-index: 950; box-shadow: 0 20px 40px rgba(15,23,42,0.18);';
  bar.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
      <div style="font-size: 0.88rem; max-width: 62ch;">
        <strong style="color: #0F766E; display: block;">🍪 Privacidade e Proteção Infantil (Art. 14 LGPD):</strong>
        Utilizamos apenas cookies técnicos essenciais. Não realizamos rastreamento publicitário infantil. Veja nossos <a href="/termos.html" style="color: #C2410C; font-weight: 800;">Termos, ECA e Direitos LGPD</a>.
      </div>
      <button type="button" id="btnCookieCrescer" class="btn btn-teal" style="min-height: 40px; padding: 8px 18px;">Compreendi e Aceito</button>
    </div>
  `;
  document.body.appendChild(bar);
  document.getElementById('btnCookieCrescer')?.addEventListener('click', () => {
    localStorage.setItem(COOKIE_KEY, 'aceito');
    bar.remove();
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarCookiesLgpd);
  } else {
    inicializarCookiesLgpd();
  }
}
