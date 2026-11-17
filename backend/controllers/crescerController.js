import { crescerService } from '../services/crescerService.js';
import {
  validarLoginInput,
  validarSimulacaoPlanoInput,
  validarAgendamentoVisitaInput,
  validarLgpdInput
} from '../validators/schemas.js';

const idempotencyCache = new Map();

export const crescerController = {
  login(req, res, next) {
    try {
      const cred = validarLoginInput(req.body);
      const resultado = crescerService.autenticar(cred);
      res.cookie('espacocrescer_session', resultado.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },

  logout(_req, res) {
    res.clearCookie('espacocrescer_session', { path: '/' });
    res.json({ sucesso: true });
  },

  listarOficinas(req, res, next) {
    try {
      res.json(crescerService.listarOficinas(req.query));
    } catch (err) {
      next(err);
    }
  },

  listarRotina(req, res, next) {
    try {
      res.json(crescerService.listarRotina(req.query.turno));
    } catch (err) {
      next(err);
    }
  },

  simularPlano(req, res, next) {
    try {
      const validado = validarSimulacaoPlanoInput(req.body);
      if (validado.isBotHoneypot) return res.json({ bloqueadoSilenciosamente: true });
      res.json(crescerService.calcularPlanoMensal(validado));
    } catch (err) {
      next(err);
    }
  },

  criarVisita(req, res, next) {
    try {
      const idempKey = req.headers['idempotency-key'];
      if (idempKey && idempotencyCache.has(idempKey)) {
        return res.status(200).json(idempotencyCache.get(idempKey));
      }

      const validado = validarAgendamentoVisitaInput(req.body);
      if (validado.isBotHoneypot) {
        return res.status(201).json({ protocolo: 'ECR-BOT-0000', mensagem: 'Recebido.' });
      }
      const criado = crescerService.agendarVisita(validado);
      if (idempKey) idempotencyCache.set(idempKey, criado);
      res.status(201).json(criado);
    } catch (err) {
      next(err);
    }
  },

  listarVisitasAdmin(_req, res, next) {
    try {
      res.json(crescerService.listarVisitasAdmin());
    } catch (err) {
      next(err);
    }
  },

  atualizarStatusVisitaAdmin(req, res, next) {
    try {
      res.json(crescerService.atualizarStatusVisita(req.params.id, req.body?.status));
    } catch (err) {
      next(err);
    }
  },

  criarSolicitacaoLgpd(req, res, next) {
    try {
      const dados = validarLgpdInput(req.body);
      res.status(201).json(crescerService.registrarLgpd(dados));
    } catch (err) {
      next(err);
    }
  }
};
