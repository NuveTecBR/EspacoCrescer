import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get, query, run } from '../database/conexao.js';

export const crescerService = {
  autenticar({ email, senha }) {
    const u = get('SELECT id, nome, email, senha_hash, cargo, criado_em FROM usuarios WHERE email = ?', [email]);
    if (!u || !bcrypt.compareSync(senha, u.senha_hash)) {
      const err = new Error('Credenciais inválidas.');
      err.statusCode = 401;
      throw err;
    }
    const usuario = { id: u.id, nome: u.nome, email: u.email, cargo: u.cargo, criado_em: u.criado_em };
    const token = jwt.sign(usuario, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { token, usuario };
  },

  listarOficinas(filtros = {}) {
    let sql = 'SELECT * FROM oficinas WHERE 1=1';
    const params = [];

    if (filtros.eixo && filtros.eixo !== 'Todos') {
      sql += ' AND eixo_pedagogico = ?';
      params.push(String(filtros.eixo));
    }
    return query(sql, params);
  },

  listarRotina(turno = 'Tarde') {
    const t = ['Manhã', 'Tarde'].includes(turno) ? turno : 'Tarde';
    return query('SELECT * FROM rotina_horarios WHERE turno = ? ORDER BY id ASC', [t]);
  },

  calcularPlanoMensal({ frequencia_semanal, inclui_almoco, possui_irmao }) {
    const tabelaFrequencia = {
      2: 640.00,
      3: 860.00,
      5: 1090.00
    };

    const basePedagogica = tabelaFrequencia[frequencia_semanal] || 1090.00;
    const adicionalNutricao = inclui_almoco ? (frequencia_semanal * 40.00) : 0;
    const subtotal = basePedagogica + adicionalNutricao;
    const descontoIrmao = possui_irmao ? Number((subtotal * 0.12).toFixed(2)) : 0;
    const mensalidadeEstimada = Number((subtotal - descontoIrmao).toFixed(2));

    return {
      frequencia_semanal,
      inclui_almoco: Boolean(inclui_almoco),
      possui_irmao: Boolean(possui_irmao),
      valor_base_pedagogico: basePedagogica,
      adicional_nutricao: adicionalNutricao,
      desconto_irmao: descontoIrmao,
      mensalidade_estimada: mensalidadeEstimada
    };
  },

  agendarVisita(dados) {
    const calculo = this.calcularPlanoMensal({
      frequencia_semanal: dados.frequencia_semanal,
      inclui_almoco: dados.inclui_almoco,
      possui_irmao: dados.possui_irmao
    });

    const protocolo = `ECR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const res = run(
      `INSERT INTO visitas_agendadas (
        protocolo, nome_responsavel, parentesco, telefone, faixa_etaria_crianca,
        turno_interesse, frequencia_semanal, inclui_almoco, possui_irmao,
        mensalidade_estimada, data_preferencia, consentimento_parental_lgpd, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Visita Agendada')`,
      [
        protocolo,
        dados.nome_responsavel,
        dados.parentesco,
        dados.telefone,
        dados.faixa_etaria_crianca,
        dados.turno_interesse,
        dados.frequencia_semanal,
        dados.inclui_almoco,
        dados.possui_irmao,
        calculo.mensalidade_estimada,
        dados.data_preferencia,
        dados.consentimento_parental_lgpd
      ]
    );

    const textoWhats = encodeURIComponent(
      `🌱 *Agendamento de Visita Pedagógica Espaço Crescer — ${protocolo}*\n` +
      `• Responsável: ${dados.nome_responsavel} (${dados.parentesco})\n` +
      `• Faixa Etária: ${dados.faixa_etaria_crianca} | Turno: ${dados.turno_interesse}\n` +
      `• Plano Simulado: ${dados.frequencia_semanal}x/semana (R$ ${calculo.mensalidade_estimada.toLocaleString('pt-BR')}/mês)\n` +
      `• Melhor Dia/Horário: ${dados.data_preferencia}`
    );

    return {
      id: res.lastInsertRowid,
      protocolo,
      calculo,
      whatsapp_url: `https://wa.me/5511966664455?text=${textoWhats}`,
      mensagem: 'Visita pedagógica agendada com sucesso!'
    };
  },

  listarVisitasAdmin() {
    return query('SELECT * FROM visitas_agendadas ORDER BY id DESC');
  },

  atualizarStatusVisita(id, status) {
    if (!['Visita Agendada', 'Visita Realizada', 'Matrícula Efetivada'].includes(status)) {
      const err = new Error('Status inválido.');
      err.statusCode = 400;
      throw err;
    }
    const v = get('SELECT id FROM visitas_agendadas WHERE id = ?', [Number(id)]);
    if (!v) {
      const err = new Error('Registro de visita não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    run('UPDATE visitas_agendadas SET status = ? WHERE id = ?', [status, Number(id)]);
    return get('SELECT * FROM visitas_agendadas WHERE id = ?', [Number(id)]);
  },

  registrarLgpd(dados) {
    const protocolo = `LGPD-ECR-${Math.floor(10000 + Math.random() * 90000)}`;
    run(
      'INSERT INTO solicitacoes_lgpd (protocolo, nome_titular, email_titular, tipo_direito, detalhes) VALUES (?, ?, ?, ?, ?)',
      [protocolo, dados.nome_titular, dados.email_titular, dados.tipo_direito, dados.detalhes]
    );
    return {
      protocolo,
      status: 'Recebido pelo Encarregado de Proteção de Dados (DPO)',
      prazo_resposta: 'Até 15 dias conforme Art. 14 e 18 da LGPD.'
    };
  }
};
