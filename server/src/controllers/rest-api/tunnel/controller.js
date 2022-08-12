// const wlogger = require('../../lib/wlogger')

let _this
class TunnelRESTController {
  // constructor () {
  //   // Encapsulate dependencies
  //   // this.User = User
  //   // this.userLib = new UserLib()
  //   // _this = this
  // }

  constructor (localConfig = {}) {
    this.livenessState = localConfig.livenessState

    _this = this
  }

  // curl -H "Content-Type: application/json" -X GET localhost:4200/tunnel/
  // curl -H "Content-Type: application/json" -X GET http://157.90.20.129:4200/tunnel/
  async getClientStatus (ctx) {
    try {
      console.log('getClientStatus() fired')
      // const users = await _this.userLib.getAllUsers();

      console.log(`this.livenessState: ${_this.livenessState}`)

      ctx.body = { reset: _this.livenessState }
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
