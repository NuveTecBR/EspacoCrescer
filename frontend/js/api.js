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

async function staticDemoFetch(endpoint, options = {}) {
  const { DEMO_DATA } = await import('./demo-data.js');
  const url = new URL(endpoint, 'https://demo.local');
  const path = url.pathname;
  const body = options.body ? JSON.parse(options.body) : {};

  if (path === '/api/rotina') {
    const turno = url.searchParams.get('turno');
    return turno ? DEMO_DATA.rotina.filter(r => r.turno === turno) : [...DEMO_DATA.rotina];
  }

  if (path === '/api/oficinas') {
    const eixo = url.searchParams.get('eixo');
    return eixo ? DEMO_DATA.oficinas.filter(o => o.eixo_pedagogico === eixo) : [...DEMO_DATA.oficinas];
  }

  if (path === '/api/planos/simular') {
    const freq = Number(body.frequencia_semanal || 5);
    const bases = { 2: 680, 3: 890, 5: 1180 };
    const base = bases[freq] || 1180;
    const nutricao = body.inclui_almoco ? 240 : 0;
    const subtotal = base + nutricao;
    const desc = body.possui_irmao ? Number((subtotal * 0.15).toFixed(2)) : 0;
    return {
      frequencia_semanal: freq,
      inclui_almoco: Boolean(body.inclui_almoco),
      valor_base_pedagogico: base,
      adicional_nutricao: nutricao,
      desconto_irmao: desc,
      mensalidade_estimada: Number((subtotal - desc).toFixed(2))
    };
  }

  if (path === '/api/visitas') {
    const protocolo = `ECR-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      protocolo,
      whatsapp_url: `https://wa.me/5551999990000?text=${encodeURIComponent(`Olá! Visita Espaço Crescer (${protocolo})`)}`
    };
  }

  return {};
}

export async function apiFetch(endpoint, options = {}) {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return staticDemoFetch(endpoint, options);
  }

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
        Utilizamos apenas cookies técnicos essenciais. Não realizamos rastreamento publicitário infantil. Veja nossos <a href="./termos.html" style="color: #C2410C; font-weight: 800;">Termos, ECA e Direitos LGPD</a>.
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
