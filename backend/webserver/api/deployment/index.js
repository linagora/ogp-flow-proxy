const express = require('express');
const controller = require('./controller');
const middleware = require('./middleware');

const router = express.Router();

router.post('/', middleware.canCreate, middleware.hasValidRequestData, controller.create);

router.post('/remove', controller.remove);

router.get('/:deploymentId/status', middleware.requireObjectId('deploymentId'), controller.getDeploymentStatus);

module.exports = router;
