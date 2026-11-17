import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'espacocrescer.sqlite');
const sqlPath = path.resolve(__dirname, '../../sql/espacocrescer.sql');

export const db = new DatabaseSync(dbPath);
db.exec(fs.readFileSync(sqlPath, 'utf-8'));

export function query(sql, params = []) {
  return db.prepare(sql).all(...params);
}

export function get(sql, params = []) {
  return db.prepare(sql).get(...params) || null;
}

export function run(sql, params = []) {
  const res = db.prepare(sql).run(...params);
  return {
    changes: Number(res.changes),
    lastInsertRowid: Number(res.lastInsertRowid)
  };
}

function inicializarSeeds() {
  const countU = get('SELECT COUNT(*) as total FROM usuarios');
  if (countU && countU.total === 0) {
    const hashCoord = bcrypt.hashSync('Crescer@2026', 10);
    const hashSec = bcrypt.hashSync('Secretaria@2026', 10);

    run(
      'INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)',
      ['Profa. Helena Meirelles (Coordenadora Pedagógica)', 'coordenacao@espacocrescer-demo.com.br', hashCoord, 'coordenacao']
    );
    run(
      'INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)',
      ['Beatriz Nogueira (Secretaria Escolar)', 'secretaria@espacocrescer-demo.com.br', hashSec, 'secretaria']
    );
  }

  const countOf = get('SELECT COUNT(*) as total FROM oficinas');
  if (countOf && countOf.total === 0) {
    const oficinas = [
      [
        'Apoio Escolar Individualizado & Hábito de Estudo', 'Apoio Escolar', '6 a 12 anos', 'Manhã e Tarde',
        '09h00 ou 14h30', 'Profa. Pedagoga Sofia L.',
        'Orientação diária nas tarefas de casa da escola regular, reforço de leitura, interpretação e organização da mochila sem estresse para a família à noite.',
        'Autonomia intelectual, foco, responsabilidade e redução de ansiedade escolar.'
      ],
      [
        'Oficina Maker, Robótica & Raciocínio Lógico', 'Robótica & Lógica', '5 a 12 anos', 'Manhã e Tarde',
        '10h15 ou 15h45', 'Prof. Gabriel T.',
        'Montagens mecânicas sustentáveis, desafios de xadrez, blocos lógicos e circuitos simples sem uso passivo de telas.',
        'Resolução criativa de problemas, trabalho em equipe e coordenação visomotora.'
      ],
      [
        'Horta Orgânica, Culinária Afetiva & Natureza', 'Natureza & Movimento', '4 a 11 anos', 'Manhã e Tarde',
        '08h15 ou 16h30', 'Nutricionista Dra. Clara & Educador Bruno',
        'Cultivo de temperos e hortaliças no quintal arborizado, colheita para o preparo de receitas saudáveis e educação ambiental prática.',
        'Educação alimentar sem seletividade, contato com a terra e respeito aos ciclos naturais.'
      ],
      [
        'Ateliê de Pintura, Argila & Expressão Musical', 'Artes & Expressão', '4 a 12 anos', 'Manhã e Tarde',
        '10h45 ou 16h00', 'Profa. Arte-Educadora Laura M.',
        'Experimentação com aquarela, modelagem em argila, instrumentos de percussão e contação de histórias dramatizadas.',
        'Expressão emocional saudável, sensibilidade estética e socialização.'
      ],
      [
        'Vivência Bilíngue Lúdica (Inglês por Imersão)', 'Bilinguismo', '4 a 12 anos', 'Manhã e Tarde',
        '09h45 ou 15h15', 'Teacher Amanda R.',
        'Jogos cooperativos, músicas, teatro e vocabulário do cotidiano em inglês através de dinâmicas naturais e divertidas.',
        'Familiaridade auditiva e conversação espontânea sem pressão de provas.'
      ],
      [
        'Psicomotricidade, Capoeira & Jogos de Quintal', 'Natureza & Movimento', '4 a 12 anos', 'Manhã e Tarde',
        '11h15 ou 17h15', 'Prof. Ed. Física Thiago V.',
        'Circuito motor no gramado seguro, brincadeiras tradicionais brasileiras (amarelinha, corda, queimada cooperativa) e alongamento.',
        'Gasto saudável de energia, equilíbrio corporal e empatia no esporte.'
      ]
    ];

    for (const o of oficinas) {
      run(
        `INSERT INTO oficinas (
          nome, eixo_pedagogico, faixa_etaria, turno_disponivel, horario_referencia,
          educador_responsavel, descricao, objetivo_desenvolvimento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        o
      );
    }

    const rotinas = [
      ['Manhã', '07h30 – 08h15', 'Acolhimento Afetivo & Roda da Manhã', 'Recepção tranquila, escuta ativa das crianças e desjejum complementar com frutas frescas.'],
      ['Manhã', '08h15 – 09h15', 'Horta Orgânica & Movimento no Quintal', 'Atividades ao ar livre aproveitando o sol suave da manhã e cuidado com o jardim.'],
      ['Manhã', '09h15 – 09h40', 'Lanche Saudável da Manhã (Nutricionista)', 'Suco natural integral, pão de batata caseiro sem conservantes e frutas da estação.'],
      ['Manhã', '09h40 – 10h45', 'Apoio Escolar & Lição de Casa Guiada', 'Salas climatizadas e silenciosas divididas por faixa etária com acompanhamento pedagógico.'],
      ['Manhã', '10h45 – 11h30', 'Oficina Criativa do Dia (Robótica / Artes / Inglês)', 'Projetos práticos mão na massa sem uso de celulares.'],
      ['Manhã', '11h30 – 12h15', 'Almoço Nutritivo Fresquinho & Preparação para a Escola', 'Cardápio balanceado assinado por nutricionista, escovação supervisionada e saída segura.'],
      ['Tarde', '12h30 – 13h45', 'Recepção Pós-Escola, Almoço & Descanso Guiado', 'Almoço caseiro balanceado, higiene bucal e momento de relaxamento/leitura pós-almoço.'],
      ['Tarde', '13h45 – 15h00', 'Apoio Escolar & Tarefas de Casa Concluídas', 'Seu filho vai para casa com todas as lições prontas e dúvidas esclarecidas por pedagogas.'],
      ['Tarde', '15h00 – 15h45', 'Oficina de Imersão (Robótica, Bilinguismo ou Ateliê)', 'Desenvolvimento de habilidades socioemocionais e cognitivas em grupos reduzidos.'],
      ['Tarde', '15h45 – 16h15', 'Lanche da Tarde & Culinária Afetiva', 'Bolo integral de cenoura, vitaminas naturais e frutas selecionadas.'],
      ['Tarde', '16h15 – 17h30', 'Quintal Livre, Jogos Cooperativos & Psicomotricidade', 'Brincadeiras ativas no pátio arborizado monitorado por câmeras e educadores.'],
      ['Tarde', '17h30 – 18h30', 'Roda de Encerramento & Entrega Segura aos Pais', 'Organização dos pertences, diário digital enviado aos pais e liberação mediante identificação.']
    ];

    for (const r of rotinas) {
      run('INSERT INTO rotina_horarios (turno, horario, atividade, detalhe_nutricional_pedagogico) VALUES (?, ?, ?, ?)', r);
    }

    run(
      `INSERT INTO visitas_agendadas (
        protocolo, nome_responsavel, parentesco, telefone, faixa_etaria_crianca,
        turno_interesse, frequencia_semanal, inclui_almoco, possui_irmao,
        mensalidade_estimada, data_preferencia, consentimento_parental_lgpd, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'ECR-2026-3041', 'Juliana Paes Mendonça (Fictício)', 'Mãe', '(11) 98222-3344',
        '7 a 9 anos (Ensino Fundamental I)', 'Tarde', 5, 1, 0, 1290.00,
        'Terça-feira às 14h30', 1, 'Visita Agendada'
      ]
    );
  }
}

inicializarSeeds();

export default { db, query, get, run };
