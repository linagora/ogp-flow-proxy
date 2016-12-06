const express = require('express');
const controller = require('./controller');
const middleware = require('./middleware');

const router = express.Router();

router.post('/', middleware.canCreate, middleware.hasValidRequestData, controller.create);

router.post('/remove', controller.remove);

router.get('/:requestId/status', controller.getDeploymentStatus);

module.exports = router;
