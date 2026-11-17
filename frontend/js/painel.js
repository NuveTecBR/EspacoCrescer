import { apiFetch, escapeHtml, salvarSessao, obterUsuarioLogado, limparSessao } from './api.js';

const secLogin = document.getElementById('sec-login-crescer');
const secPainel = document.getElementById('sec-painel-crescer');

async function verificarPainel() {
  const u = obterUsuarioLogado();
  if (!u) {
    secLogin.style.display = 'block';
    secPainel.style.display = 'none';
    return;
  }
  secLogin.style.display = 'none';
  secPainel.style.display = 'block';
  document.getElementById('cr-user-info').textContent = `Profissional Autenticada: ${u.nome}`;
  await carregarVisitas();
}

async function carregarVisitas() {
  try {
    const visitas = await apiFetch('/api/visitas');
    const container = document.getElementById('lista-visitas-admin');
    container.innerHTML = visitas.map(v => `
      <div class="workshop-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <span class="hero-badge" style="margin-bottom: 6px;">${escapeHtml(v.protocolo)} • Turno: ${escapeHtml(v.turno_interesse)} (${v.frequencia_semanal}x/sem)</span>
            <div style="font-size: 1.15rem; font-weight: 900;">Responsável: ${escapeHtml(v.nome_responsavel)} (${escapeHtml(v.telefone)})</div>
            <div style="font-size: 0.9rem; color: var(--text-body);">
              Faixa Etária da Criança: ${escapeHtml(v.faixa_etaria_crianca)} • Preferência: ${escapeHtml(v.data_preferencia)} • Mensalidade Simulada: R$ ${Number(v.mensalidade_estimada).toLocaleString('pt-BR')}
            </div>
          </div>
          <div>
            <label for="st-vis-${v.id}" class="form-label">Status:</label>
            <select id="st-vis-${v.id}" class="form-select sel-status-visita" data-id="${v.id}" style="width: auto; min-height: 38px;">
              ${['Visita Agendada', 'Visita Realizada', 'Matrícula Efetivada'].map(st => `
                <option value="${st}" ${v.status === st ? 'selected' : ''}>${st}</option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.sel-status-visita').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const status = e.currentTarget.value;
        await apiFetch(`/api/visitas/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
        await carregarVisitas();
      });
    });
  } catch {
    limparSessao();
    verificarPainel();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  verificarPainel();

  document.getElementById('btn-demo-coord')?.addEventListener('click', () => {
    document.getElementById('cr-email').value = 'coordenacao@espacocrescer-demo.com.br';
    document.getElementById('cr-senha').value = 'Crescer@2026';
  });

  document.getElementById('btn-demo-sec')?.addEventListener('click', () => {
    document.getElementById('cr-email').value = 'secretaria@espacocrescer-demo.com.br';
    document.getElementById('cr-senha').value = 'Secretaria@2026';
  });

  document.getElementById('form-login-crescer')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fb = document.getElementById('cr-login-fb');
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('cr-email').value,
          senha: document.getElementById('cr-senha').value
        })
      });
      salvarSessao(res.token, res.usuario);
      await verificarPainel();
    } catch (err) {
      fb.innerHTML = `<span style="color: #B91C1C; font-weight: 800;">${escapeHtml(err.message)}</span>`;
    }
  });

  document.getElementById('btn-sair-crescer')?.addEventListener('click', async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    limparSessao();
    verificarPainel();
  });
});
