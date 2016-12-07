const express = require('express');
const controller = require('./controller');
const middleware = require('./middleware');

const router = express.Router();

router.post('/', middleware.canCreate, middleware.hasValidRequestData, middleware.requireUniqueRequestId, middleware.requireUniqueDomain, controller.create);

router.delete('/:requestId', controller.remove);

router.get('/:requestId/status', controller.getDeploymentStatus);

router.get('/', controller.listDeployments);

router.get('/:requestId', controller.getDeployment);

module.exports = router;
