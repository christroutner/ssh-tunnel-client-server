/*
  This Controller library is concerned with timer-based functions that are
  kicked off periodicially.
*/

// Global npm libraries
const axios = require('axios')

// Used to retain scope of 'this', when the scope is lost.
let _this

class TimerControllers {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Timer Controller libraries.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Timer Controller libraries.'
      )
    }

    // Encapsulate dependencies
    // this.livenessState = localConfig.livenessState
    this.axios = axios

    this.debugLevel = localConfig.debugLevel

    // Library state
    this.state = {
      exampleTime: 60000 * 0.25
    }

    _this = this

    this.startTimers()
  }

  // Start all the time-based controllers.
  startTimers () {
    // this.state.exampleInterval = setInterval(this.exampleTimerController, this.state.exampleTime)
    this.state.livenessInterval = setInterval(this.checkClientLiveness, this.state.exampleTime)
  }

  // Queries the liveness REST API endpoint on the client. If the client fails
  // to respond, the reset flag is set which instructs the client to renew its
  // ssh tunnels.
  async checkClientLiveness () {
    try {
      const result = await _this.axios.get('http://localhost:4201/liveness')
      console.log('result.data: ', result.data)

      if (result.data.success) {
        console.log('Client SSH tunnel is alive. Doing nothing.')
        // this.livenessState = true

        _this.adapters.liveness.setLiveness(true)
      }
    } catch (err) {
      console.error('Error in checkClientLiveness(): ', err)

      console.log('Client SSH tunnel is down. Flagging reset.')

      console.log('Timer controller is marking liveness state as false.')
      // this.livenessState = false
      _this.adapters.liveness.setLiveness(false)
    }
  }

  // Poll the apps wallet address to see if new trades have come in.
  async exampleTimerController () {
    try {
      // Disable the timer interval while processing.
      // Note: This should be the second command.
      clearInterval(_this.state.exampleInterval)

      const now = new Date()
      console.log(`Example Timer Controller has fired at ${now.toLocaleString()}`)

      // Enable timer interval after processing.
      _this.state.exampleInterval = setInterval(_this.exampleTimerController, _this.state.exampleTime)

      return true
    } catch (err) {
      // Enable timer interval after processing.
      _this.state.exampleInterval = setInterval(_this.exampleTimerController, _this.state.exampleTime)

      // Do not throw an error. This is a top-level function.
      console.error('Error in timer-controllers.js/exampleTimerController(): ', err)

      return false
    }
  }
}

module.exports = TimerControllers
