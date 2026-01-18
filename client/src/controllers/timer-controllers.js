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
      remoteAdminCheckTime: 60000 * 2 // 2 minutes
    }

    _this = this

    this.startTimers()
  }

  // Start all the time-based controllers.
  startTimers () {
    // this.state.exampleInterval = setInterval(this.exampleTimerController, this.state.exampleTime)
    setInterval(this.checkResetTimerController, this.state.exampleTime)
    setInterval(this.checkRemoteAdminTimerController, this.state.remoteAdminCheckTime)
  }

  async checkResetTimerController () {
    try {
      // First check if remote-admin is enabled - only reset tunnels if it's enabled
      const isRemoteAdminEnabled = await _this.adapters.sshTunnel.checkRemoteAdminEnabled()
      
      if (!isRemoteAdminEnabled) {
        // Remote-admin is disabled, don't reset tunnels
        // The checkRemoteAdminTimerController will handle closing them if needed
        return
      }

      const status = await _this.adapters.sshTunnel.getStatus()

      console.log(`\ncheckResetTimerController() status: ${status}\n`)

      // If status comes back as false, then reset the SSH tunnels
      // Only do this if remote-admin is enabled
      if (!status) {
        console.log('Connection status reported false. Closing and reopening all forwarded ports.')

        // Close all tunnels
        _this.adapters.sshTunnel.closeAllTunnels()

        await sleep(5000)

        // Double-check remote-admin is still enabled before reopening
        const stillEnabled = await _this.adapters.sshTunnel.checkRemoteAdminEnabled()
        if (!stillEnabled) {
          console.log('Remote-admin was disabled while resetting. Not reopening tunnels.')
          return
        }

        // Reopen all tunnels
        _this.adapters.sshTunnel.openAllTunnels()
      }
    } catch (err) {
      console.error('Error in checkResetTimerController(): ', err)
      // This is a top-level function. Do not throw an error.
    }
  }

  // Check remote-admin config and manage tunnels accordingly
  async checkRemoteAdminTimerController () {
    try {
      const isRemoteAdminEnabled = await _this.adapters.sshTunnel.checkRemoteAdminEnabled()
      const hasOpenTunnels = _this.adapters.sshTunnel.hasOpenTunnels()

      console.log(`\ncheckRemoteAdminTimerController() - Remote admin enabled: ${isRemoteAdminEnabled}, Tunnels open: ${hasOpenTunnels}\n`)

      if (isRemoteAdminEnabled) {
        // Config says enabled - ensure tunnels are open
        if (!hasOpenTunnels) {
          console.log('Remote administration is enabled. Opening tunnels.')
          await _this.adapters.sshTunnel.openAllTunnels()
        }
      } else {
        // Config says disabled - ensure tunnels are closed
        if (hasOpenTunnels) {
          console.log('Remote administration is disabled. Closing tunnels.')
          _this.adapters.sshTunnel.closeAllTunnels()
        }
      }
    } catch (err) {
      console.error('Error in checkRemoteAdminTimerController(): ', err)
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
