-- ============================================================================
-- ESPAÇO CRESCER CONTRATURNO ESCOLAR — DDL & SEEDS (SQLite / Método ENDS)
-- Aviso: Dados 100% fictícios para demonstração de portfólio Nuvetec
-- ============================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  cargo TEXT NOT NULL DEFAULT 'coordenacao' CHECK (cargo IN ('coordenacao', 'secretaria')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS oficinas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  eixo_pedagogico TEXT NOT NULL CHECK (eixo_pedagogico IN ('Apoio Escolar', 'Robótica & Lógica', 'Artes & Expressão', 'Natureza & Movimento', 'Bilinguismo')),
  faixa_etaria TEXT NOT NULL,
  turno_disponivel TEXT NOT NULL CHECK (turno_disponivel IN ('Manhã e Tarde', 'Manhã', 'Tarde')),
  horario_referencia TEXT NOT NULL,
  educador_responsavel TEXT NOT NULL,
  descricao TEXT NOT NULL,
  objetivo_desenvolvimento TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rotina_horarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  turno TEXT NOT NULL CHECK (turno IN ('Manhã', 'Tarde')),
  horario TEXT NOT NULL,
  atividade TEXT NOT NULL,
  detalhe_nutricional_pedagogico TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS visitas_agendadas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT NOT NULL UNIQUE,
  nome_responsavel TEXT NOT NULL,
  parentesco TEXT NOT NULL DEFAULT 'Mãe / Pai',
  telefone TEXT NOT NULL,
  faixa_etaria_crianca TEXT NOT NULL,
  turno_interesse TEXT NOT NULL,
  frequencia_semanal INTEGER NOT NULL CHECK (frequencia_semanal IN (2, 3, 5)),
  inclui_almoco INTEGER NOT NULL DEFAULT 1,
  possui_irmao INTEGER NOT NULL DEFAULT 0,
  mensalidade_estimada REAL NOT NULL,
  data_preferencia TEXT NOT NULL,
  consentimento_parental_lgpd INTEGER NOT NULL CHECK (consentimento_parental_lgpd = 1),
  status TEXT NOT NULL DEFAULT 'Visita Agendada' CHECK (status IN ('Visita Agendada', 'Visita Realizada', 'Matrícula Efetivada')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS solicitacoes_lgpd (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT NOT NULL UNIQUE,
  nome_titular TEXT NOT NULL,
  email_titular TEXT NOT NULL,
  tipo_direito TEXT NOT NULL CHECK (tipo_direito IN ('Confirmacao', 'Acesso', 'Correcao', 'Exclusao')),
  detalhes TEXT,
  status TEXT NOT NULL DEFAULT 'Recebido',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_oficinas_eixo ON oficinas(eixo_pedagogico);
CREATE INDEX IF NOT EXISTS idx_rotina_turno ON rotina_horarios(turno);
CREATE INDEX IF NOT EXISTS idx_visitas_protocolo ON visitas_agendadas(protocolo);
