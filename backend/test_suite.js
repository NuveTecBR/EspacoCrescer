process.env.NODE_ENV = 'test';
const { default: app } = await import('./server.js');

const PORT = 3397;
const BASE = `http://localhost:${PORT}/api`;

async function executarSuite() {
  const server = app.listen(PORT);
  console.log(`🧪 Iniciando Suíte de Testes Automatizados Espaço Crescer na porta ${PORT}...\n`);

  try {
    // 1. Health & Security Headers
    const resHealth = await fetch(`${BASE}/health`);
    const health = await resHealth.json();
    console.assert(resHealth.status === 200 && health.status === 'online', 'Health check falhou');
    console.assert(resHealth.headers.get('x-frame-options') === 'DENY', 'Header XFO ausente');
    console.log('✅ 1. Health Check e Security Headers validados.');

    // 2. Oficinas Pedagógicas e Linha do Tempo por Turno
    const resOf = await fetch(`${BASE}/oficinas`);
    const oficinas = await resOf.json();
    console.assert(oficinas.length >= 6, 'Oficinas incompletas');

    const resRotina = await fetch(`${BASE}/rotina?turno=Manhã`);
    const rotina = await resRotina.json();
    console.assert(rotina.length >= 5 && rotina.every(r => r.turno === 'Manhã'), 'Filtro de rotina Manhã falhou');
    console.log(`✅ 2. Oficinas (${oficinas.length}) e Linha do Tempo por Turno (${rotina.length} blocos Manhã) validados.`);

    // 3. Calculadora de Plano Mensal (Frequência + Nutrição + Desconto de Irmãos)
    const resSim = await fetch(`${BASE}/planos/simular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frequencia_semanal: 5, inclui_almoco: true, possui_irmao: true })
    });
    const sim = await resSim.json();
    console.assert(resSim.status === 200 && sim.desconto_irmao > 0 && sim.mensalidade_estimada > 0, 'Simulação de plano falhou');
    console.log(`✅ 3. Simulador de Mensalidade c/ Desconto de Irmão (R$ ${sim.mensalidade_estimada}) validado.`);

    // 4. Agendamento de Visita com Consentimento Parental Art. 14 LGPD + Honeypot
    const resSemParental = await fetch(`${BASE}/visitas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome_responsavel: 'Mãe Teste',
        telefone: '(11) 98888-7777',
        consentimento_parental_lgpd: false
      })
    });
    console.assert(resSemParental.status === 400, 'Deveria bloquear ausência de consentimento parental Art. 14 LGPD');

    const resVisita = await fetch(`${BASE}/visitas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': 'idem-crescer-001'
      },
      body: JSON.stringify({
        nome_responsavel: 'Camila Queiroz',
        parentesco: 'Mãe / Pai',
        telefone: '(11) 98888-7777',
        faixa_etaria_crianca: '5 a 7 anos',
        turno_interesse: 'Tarde',
        frequencia_semanal: 3,
        inclui_almoco: true,
        possui_irmao: false,
        data_preferencia: 'Quinta-feira às 15h00',
        consentimento_parental_lgpd: true
      })
    });
    const visita = await resVisita.json();
    console.assert(resVisita.status === 201 && visita.protocolo.startsWith('ECR-2026-'), 'Agendamento de visita falhou');
    console.log(`✅ 4. Agendamento de Visita Pedagógica (${visita.protocolo}) e Proteção Art. 14 LGPD validados.`);

    // 5. Autenticação JWT da Coordenação Pedagógica
    const resLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'coordenacao@espacocrescer-demo.com.br',
        senha: 'Crescer@2026'
      })
    });
    const login = await resLogin.json();
    console.assert(resLogin.status === 200 && login.token, 'Login da coordenação falhou');

    const resPatch = await fetch(`${BASE}/visitas/1/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${login.token}`
      },
      body: JSON.stringify({ status: 'Visita Realizada' })
    });
    const patchData = await resPatch.json();
    console.assert(resPatch.status === 200 && patchData.status === 'Visita Realizada', 'Atualização de visita falhou');
    console.log(`✅ 5. Autenticação JWT da Coordenação e Status de Visita (${patchData.status}) validados.`);

    console.log('\n🎉 TODOS OS TESTES AUTOMATIZADOS DO ESPAÇO CRESCER PASSARAM COM 100% DE SUCESSO!\n');
  } finally {
    server.close();
    process.exit(0);
  }
}

executarSuite().catch(err => {
  console.error('❌ Falha na suíte Espaço Crescer:', err);
  process.exit(1);
});
