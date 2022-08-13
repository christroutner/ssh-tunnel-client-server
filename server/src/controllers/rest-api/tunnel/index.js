// const CONTROLLER = require('./controller')
// const controller = new CONTROLLER()
//
// module.exports.baseUrl = '/tunnel'
//
// module.exports.routes = [
//   {
//     method: 'GET',
//     route: '/',
//     handlers: [controller.getClientStatus]
//   }
//   // {
//   //   method: "GET",
//   //   route: "/opti-e",
//   //   handlers: [controller.checkOptiE]
//   // },
//   // {
//   //   method: "GET",
//   //   route: "/elitedesk01",
//   //   handlers: [controller.checkElitedesk01]
//   // }
// ]

// Public npm libraries.
const Router = require('koa-router')

// Local libraries.
const TunnelRESTControllerLib = require('./controller')

class TunnelRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Logs REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Logs REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    this.tunnelRESTController = new TunnelRESTControllerLib(dependencies)

    // Instantiate the router and set the base route.
    const baseUrl = '/tunnel'
    this.router = new Router({ prefix: baseUrl })
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attaching REST API controllers.'
      )
    }
    // Define the routes and attach the controller.
    this.router.get('/', this.tunnelRESTController.getClientStatus)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }
}

module.exports = TunnelRouter
