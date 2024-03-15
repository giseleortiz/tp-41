const express = require('express');
const { list,recomended ,detail, create, update, destroy } = require('../../controllers/api/actorsController');
const router = express.Router();


router.get('/api/actors',list);
router.get('/api/actors/recommended',recomended);
router.get('/api/actors/:id',detail);
//Rutas exigidas para la creación del CRUD
router.post('/api/actors', create);
router.put('/api/actors/:id', update);
router.delete('/api/actors/:id', destroy);

module.exports = router;