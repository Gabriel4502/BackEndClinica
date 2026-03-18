const express = require('express');
const agendamentoController = require('../controllers/agendamentoController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();


router.use(authMiddleware);

router.post('/', agendamentoController.criar);
router.get('/', agendamentoController.listar);

module.exports = router;