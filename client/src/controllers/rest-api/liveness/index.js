/*
  REST API library for /liveness route.
  This endpoint is polled by the server, to ensure the tunnel between the server
  and the client is working properly.
*/

// Public npm libraries.
const Router = require('koa-router')

// Local libraries.
const LivenessRESTControllerLib = require('./controller')

class LivenessRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Liveness REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Liveness REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.livenessRESTController = new LivenessRESTControllerLib(dependencies)

    // Instantiate the router and set the base route.
    const baseUrl = '/liveness'
    this.router = new Router({ prefix: baseUrl })
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attaching REST API controllers.'
      )
    }

    // Define the routes and attach the controller.
    this.router.get('/', this.livenessRESTController.handleLivenessQuery)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }
}

module.exports = LivenessRouter
