import { apiFetch, escapeHtml } from './api.js';

let eixoAtivo = 'Todos';

function formatarMoeda(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function carregarRotina(turno = 'Tarde') {
  const container = document.getElementById('timeline-container');
  container.innerHTML = Array.from({ length: 4 }).map(() => `
    <div class="timeline-step-card skeleton-pulse" style="height: 110px;" aria-hidden="true"></div>
  `).join('');

  try {
    const blocos = await apiFetch(`/api/rotina?turno=${encodeURIComponent(turno)}`);
    container.innerHTML = blocos.map(b => `
      <article class="timeline-step-card">
        <span class="timeline-hour">⏰ ${escapeHtml(b.horario)}</span>
        <h3 style="font-size: 1.12rem; font-weight: 900; margin: 4px 0 6px;">${escapeHtml(b.atividade)}</h3>
        <p style="font-family: var(--font-serif); font-size: 0.88rem; color: var(--text-body);">
          ${escapeHtml(b.detalhe_nutricional_pedagogico)}
        </p>
      </article>
    `).join('');
  } catch (err) {
    container.innerHTML = `<p style="color: #B91C1C; font-weight: 700;">${escapeHtml(err.message)}</p>`;
  }
}

async function carregarOficinas() {
  const grid = document.getElementById('oficinas-grid');
  const contador = document.getElementById('contador-oficinas');
  grid.innerHTML = Array.from({ length: 4 }).map(() => `
    <div class="workshop-card skeleton-pulse" style="height: 220px;" aria-hidden="true"></div>
  `).join('');

  try {
    const params = new URLSearchParams();
    if (eixoAtivo !== 'Todos') params.set('eixo', eixoAtivo);
    const lista = await apiFetch(`/api/oficinas?${params.toString()}`);
    contador.textContent = `${lista.length} oficinas ativas`;

    if (lista.length === 0) {
      grid.innerHTML = `
        <div class="workshop-card">
          <h3 style="font-weight: 900;">Nenhuma oficina neste filtro</h3>
          <button type="button" id="btn-reset-oficinas" class="btn btn-teal" style="margin-top: 10px;">Ver Todas as Oficinas</button>
        </div>
      `;
      document.getElementById('btn-reset-oficinas')?.addEventListener('click', () => {
        eixoAtivo = 'Todos';
        carregarOficinas();
      });
      return;
    }

    grid.innerHTML = lista.map(o => `
      <article class="workshop-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="hero-badge" style="margin: 0; font-size: 0.76rem; padding: 3px 10px;">${escapeHtml(o.eixo_pedagogico)}</span>
          <span style="font-size: 0.8rem; font-weight: 800; color: var(--text-muted);">👶 ${escapeHtml(o.faixa_etaria)}</span>
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 900; margin-bottom: 8px;">${escapeHtml(o.nome)}</h3>
        <p style="font-family: var(--font-serif); font-size: 0.9rem; color: var(--text-body); margin-bottom: 12px;">
          ${escapeHtml(o.descricao)}
        </p>
        <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-warm); font-size: 0.82rem; color: var(--text-muted);">
          <strong style="color: var(--primary-teal); display: block;">🎯 Objetivo: ${escapeHtml(o.objetivo_desenvolvimento)}</strong>
          <span>Educador(a): ${escapeHtml(o.educador_responsavel)} • Ref: ${escapeHtml(o.horario_referencia)}</span>
        </div>
      </article>
    `).join('');
  } catch (err) {
    grid.innerHTML = `
      <div class="workshop-card">
        <p style="color: #B91C1C; font-weight: 700;">${escapeHtml(err.message)}</p>
        <button type="button" id="btn-retry-of" class="btn btn-teal" style="margin-top: 10px;">Tentar Novamente</button>
      </div>
    `;
    document.getElementById('btn-retry-of')?.addEventListener('click', carregarOficinas);
  }
}

async function atualizarSimuladorPlano() {
  const box = document.getElementById('box-plano-simulado');
  const frequencia_semanal = Number(document.getElementById('vis-freq')?.value || 5);
  const inclui_almoco = document.getElementById('vis-almoco')?.checked;
  const possui_irmao = document.getElementById('vis-irmao')?.checked;

  try {
    const sim = await apiFetch('/api/planos/simular', {
      method: 'POST',
      body: JSON.stringify({ frequencia_semanal, inclui_almoco, possui_irmao })
    });

    box.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span style="font-size: 0.84rem; font-weight: 800; color: var(--primary-teal);">
          Plano ${sim.frequencia_semanal}x/semana ${sim.inclui_almoco ? 'c/ Refeições' : 's/ Almoço'}
        </span>
        <strong style="font-family: var(--font-mono); font-size: 1.35rem; color: var(--cta-terracotta);">
          ${formatarMoeda(sim.mensalidade_estimada)}/mês
        </strong>
      </div>
      <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
        Base pedagógica: ${formatarMoeda(sim.valor_base_pedagogico)} + Nutrição: ${formatarMoeda(sim.adicional_nutricao)}
        ${sim.desconto_irmao > 0 ? ` • Desconto Irmão: -${formatarMoeda(sim.desconto_irmao)}` : ''}
      </div>
    `;
  } catch (err) {
    box.innerHTML = `<span style="color: #B91C1C;">${escapeHtml(err.message)}</span>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarRotina('Tarde');
  carregarOficinas();
  atualizarSimuladorPlano();

  document.querySelectorAll('.shift-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shift-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      carregarRotina(btn.getAttribute('data-turno'));
    });
  });

  document.querySelectorAll('.eixo-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.eixo-pill').forEach(b => {
        b.className = 'btn btn-outline eixo-pill';
        b.setAttribute('aria-pressed', 'false');
      });
      btn.className = 'btn btn-teal eixo-pill';
      btn.setAttribute('aria-pressed', 'true');
      eixoAtivo = btn.getAttribute('data-eixo');
      carregarOficinas();
    });
  });

  ['vis-freq', 'vis-almoco', 'vis-irmao'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', atualizarSimuladorPlano);
  });

  document.getElementById('form-visita-crescer')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fb = document.getElementById('vis-feedback');
    const btn = document.getElementById('btn-submit-visita');
    btn.disabled = true;

    try {
      const res = await apiFetch('/api/visitas', {
        method: 'POST',
        body: JSON.stringify({
          frequencia_semanal: Number(document.getElementById('vis-freq').value),
          turno_interesse: document.getElementById('vis-turno').value,
          inclui_almoco: document.getElementById('vis-almoco').checked,
          possui_irmao: document.getElementById('vis-irmao').checked,
          nome_responsavel: document.getElementById('vis-nome').value,
          telefone: document.getElementById('vis-telefone').value,
          faixa_etaria_crianca: document.getElementById('vis-idade').value,
          data_preferencia: document.getElementById('vis-data').value,
          consentimento_parental_lgpd: document.getElementById('vis-lgpd').checked,
          escola_website_honeypot: document.getElementById('escola_website_honeypot').value
        })
      });

      fb.innerHTML = `
        <div style="background: var(--bg-soft-teal); border: 1.5px solid var(--primary-teal); padding: 14px; border-radius: var(--radius-sm);">
          <strong style="color: var(--primary-teal); display: block;">✓ Visita Pré-Agendada! Protocolo: ${escapeHtml(res.protocolo)}</strong>
          <p style="font-size: 0.85rem; margin: 6px 0 10px;">Nossa coordenadora pedagógica já reservou seu atendimento.</p>
          <a href="${res.whatsapp_url}" target="_blank" rel="noopener noreferrer" class="btn btn-teal" style="width: 100%;">
            Confirmar Visita no WhatsApp da Coordenação
          </a>
        </div>
      `;
      btn.textContent = 'Visita Agendada com Sucesso ✓';
    } catch (err) {
      fb.innerHTML = `<div style="color: #B91C1C; font-weight: 800; font-size: 0.88rem;">${escapeHtml(err.message)}</div>`;
      btn.disabled = false;
    }
  });
});
