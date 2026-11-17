function sanitizar(valor, maxLen = 400) {
  if (typeof valor !== 'string') return '';
  return valor.trim().replace(/[<>]/g, '').slice(0, maxLen);
}

export function validarLoginInput(body = {}) {
  const email = sanitizar(body.email, 120).toLowerCase();
  const senha = typeof body.senha === 'string' ? body.senha : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || senha.length < 6) {
    const err = new Error('Informe e-mail e senha válidos.');
    err.statusCode = 400;
    throw err;
  }
  return { email, senha };
}

export function validarSimulacaoPlanoInput(body = {}) {
  if (body.escola_website_honeypot && String(body.escola_website_honeypot).trim() !== '') {
    return { isBotHoneypot: true };
  }

  const frequencia_semanal = [2, 3, 5].includes(Number(body.frequencia_semanal))
    ? Number(body.frequencia_semanal)
    : 5;
  const inclui_almoco = body.inclui_almoco === false || body.inclui_almoco === 0 ? 0 : 1;
  const possui_irmao = body.possui_irmao === true || body.possui_irmao === 1 ? 1 : 0;

  return { frequencia_semanal, inclui_almoco, possui_irmao };
}

export function validarAgendamentoVisitaInput(body = {}) {
  if (body.escola_website_honeypot && String(body.escola_website_honeypot).trim() !== '') {
    return { isBotHoneypot: true };
  }

  const { frequencia_semanal, inclui_almoco, possui_irmao } = validarSimulacaoPlanoInput(body);
  const nome_responsavel = sanitizar(body.nome_responsavel, 100);
  const parentesco = ['Mãe / Pai', 'Avó / Avô', 'Responsável Legal'].includes(body.parentesco)
    ? body.parentesco
    : 'Mãe / Pai';
  const telefone = sanitizar(body.telefone, 30);
  const faixa_etaria_crianca = sanitizar(body.faixa_etaria_crianca || '6 a 8 anos', 60);
  const turno_interesse = ['Manhã', 'Tarde', 'Integral Flex'].includes(body.turno_interesse)
    ? body.turno_interesse
    : 'Tarde';
  const data_preferencia = sanitizar(body.data_preferencia || 'Esta semana à tarde', 80);
  const consentimento_parental_lgpd = body.consentimento_parental_lgpd === true || body.consentimento_parental_lgpd === 1;

  if (nome_responsavel.length < 3) {
    const err = new Error('Informe o nome completo do pai, mãe ou responsável legal.');
    err.statusCode = 400;
    throw err;
  }
  if (telefone.replace(/\D/g, '').length < 10) {
    const err = new Error('Informe um WhatsApp válido com DDD.');
    err.statusCode = 400;
    throw err;
  }
  if (!consentimento_parental_lgpd) {
    const err = new Error('Conforme o Art. 14 da LGPD, o consentimento parental específico é obrigatório.');
    err.statusCode = 400;
    throw err;
  }

  return {
    nome_responsavel,
    parentesco,
    telefone,
    faixa_etaria_crianca,
    turno_interesse,
    frequencia_semanal,
    inclui_almoco,
    possui_irmao,
    data_preferencia,
    consentimento_parental_lgpd: 1
  };
}

export function validarLgpdInput(body = {}) {
  const nome_titular = sanitizar(body.nome_titular, 100);
  const email_titular = sanitizar(body.email_titular, 120).toLowerCase();
  const tipo_direito = ['Confirmacao', 'Acesso', 'Correcao', 'Exclusao'].includes(body.tipo_direito)
    ? body.tipo_direito
    : 'Acesso';
  const detalhes = sanitizar(body.detalhes || '', 400);

  if (nome_titular.length < 3 || !email_titular.includes('@')) {
    const err = new Error('Informe nome completo do responsável e e-mail válido.');
    err.statusCode = 400;
    throw err;
  }
  return { nome_titular, email_titular, tipo_direito, detalhes };
}
