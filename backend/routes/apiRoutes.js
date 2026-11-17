import { Router } from 'express';
import { crescerController } from '../controllers/crescerController.js';
import { exigirAutenticacao, exigirCargo } from '../middlewares/authMiddleware.js';
import { authRateLimiter, apiPublicLimiter, formSubmitLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

router.post('/auth/login', authRateLimiter, crescerController.login);
router.post('/auth/logout', crescerController.logout);

router.get('/oficinas', apiPublicLimiter, crescerController.listarOficinas);
router.get('/rotina', apiPublicLimiter, crescerController.listarRotina);
router.post('/planos/simular', apiPublicLimiter, crescerController.simularPlano);
router.post('/visitas', formSubmitLimiter, crescerController.criarVisita);
router.post('/lgpd', formSubmitLimiter, crescerController.criarSolicitacaoLgpd);

router.get('/visitas', exigirAutenticacao, exigirCargo('coordenacao', 'secretaria'), crescerController.listarVisitasAdmin);
router.patch('/visitas/:id/status', exigirAutenticacao, exigirCargo('coordenacao', 'secretaria'), crescerController.atualizarStatusVisitaAdmin);

export default router;
