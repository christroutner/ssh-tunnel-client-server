/*
  Controller or the /contact REST API endpoints.
*/

// let _this

class LivenessController {
  // constructor () {
  //   // _this = this
  // }

  // This function simply returns 'true', in order to signal that the tunnel
  // is still alive.
  // curl -H "Content-Type: application/json" -X GET localhost:4201/liveness/
  async handleLivenessQuery (ctx) {
    try {
      console.log('handleLivenessQuery() fired')
      // const users = await _this.userLib.getAllUsers();

      ctx.body = { success: true }
    } catch (err) {
      console.error('Error in controller.js/handleLivenessQuery(): '.err)
      ctx.throw(422, err.message)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    // If an HTTP status is specified by the buisiness logic, use that.
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status)
      }
    } else {
      // By default use a 422 error if the HTTP status is not specified.
      ctx.throw(422, err.message)
    }
  }
}
module.exports = LivenessController
