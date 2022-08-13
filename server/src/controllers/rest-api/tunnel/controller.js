// const wlogger = require('../../lib/wlogger')

let _this
class TunnelRESTController {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Tunnel REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Tunnel REST Controller.'
      )
    }

    // Encapsulate dependencies
    // this.User = User
    // this.userLib = new UserLib()
    _this = this
  }

  // constructor (localConfig = {}) {
  //   this.livenessState = false || localConfig.livenessState
  //   // this.livenessState = false
  //
  //   _this = this
  // }

  // curl -H "Content-Type: application/json" -X GET localhost:4200/tunnel/
  // curl -H "Content-Type: application/json" -X GET http://157.90.20.129:4200/tunnel/
  async getClientStatus (ctx) {
    try {
      console.log('getClientStatus() fired')
      // const users = await _this.userLib.getAllUsers();

      const livenessState = _this.adapters.liveness.getLiveness()

      console.log(`this.livenessState: ${livenessState}`)

      ctx.body = { reset: livenessState }
    } catch (err) {
      console.error('Error in controller.js/getClientStatus(): '.err)
      ctx.throw(422, err.message)
    }
  }

  // async checkOptiE(ctx) {
  //   try {
  //     // const users = await _this.userLib.getAllUsers();
  //
  //     ctx.body = { reset: false };
  //   } catch (err) {
  //     console.error("Error in controllerjs/checkOptiE(): ".err);
  //     ctx.throw(422, err.message);
  //   }
  // }

  // async checkElitedesk01(ctx) {
  //   try {
  //     // const users = await _this.userLib.getAllUsers();
  //
  //     ctx.body = { reset: false };
  //   } catch (err) {
  //     console.error("Error in controllerjs/checkElitedesk01(): ".err);
  //     ctx.throw(422, err.message);
  //   }
  // }
}

module.exports = TunnelRESTController
