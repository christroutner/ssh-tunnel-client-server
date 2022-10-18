/*
  This Controller library is concerned with timer-based functions that are
  kicked off periodicially.
*/

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

    this.debugLevel = localConfig.debugLevel

    // Library state
    this.state = {
      exampleTime: 60000 * 2.5,
      queryAvaxTime: 60000 * 10
    }

    _this = this

    this.startTimers()
  }

  // Start all the time-based controllers.
  startTimers () {
    // this.state.exampleInterval = setInterval(this.exampleTimerController, this.state.exampleTime)
    setInterval(this.checkResetTimerController, this.state.exampleTime)
    setInterval(this.queryAvaxNode, this.state.queryAvaxTime)
  }

  // Called by a timer interval. Queries the AVAX node and resets the tunnels
  // if the node is not reachable.
  async queryAvaxNode () {
    try {
      const result = await _this.adapters.avalanche.queryNodeId()

      if (!result) {
        console.log('Connection status reported false. Closing and reopening all forwarded ports.')

        // Close all tunnels
        _this.adapters.sshTunnel.closeAllTunnels()

        await sleep(5000)

        // Reopen all tunnels
        _this.adapters.sshTunnel.openAllTunnels()
      }
    } catch (err) {
      console.error('Error in queryAvaxNode(): ', err)
      // This is a top-level function. Do not throw an error.
    }
  }

  async checkResetTimerController () {
    try {
      const status = await _this.adapters.sshTunnel.getStatus()

      console.log(`\ncheckResetTimerController() status: ${status}\n`)

      // If status comes back as false, then reset the SSH tunnels
      if (!status) {
        console.log('Connection status reported false. Closing and reopening all forwarded ports.')

        // Close all tunnels
        _this.adapters.sshTunnel.closeAllTunnels()

        await sleep(5000)

        // Reopen all tunnels
        _this.adapters.sshTunnel.openAllTunnels()
      }
    } catch (err) {
      console.error('Error in checkResetTimerController(): ', err)
      // This is a top-level function. Do not throw an error.
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

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = TimerControllers
