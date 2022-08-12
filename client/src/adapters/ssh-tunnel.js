/*
  This adapter sets up an SSH tunnel between the client and server.
*/

// Global npm libraries
const spawn = require('child_process').spawn
const axios = require('axios')

// Local libraries
const config = require('../../config')

let _this

class SSHTunnel {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.axios = axios
    this.config = config

    _this = this
  }

  // This is the only function in this library that should be modified depending
  // on the particular needs for the client.
  async startSshTunnel () {
    try {
      let cp = this.openTunnel(this.config.privKey, this.config.clientSSHPort, this.config.serverIp, 'trout', this.config.serverSSHPort)
      console.log('SSH tunnel opened between client and server.')
      console.log(`Port ${this.config.clientSSHPort} on this client has been forwarded to port ${this.config.serverSSHPort} on the server.`)
      // console.log("cp: ", cp);

      this.reportRenewalTime()

      setInterval(async function () {
        const resetNeeded = await _this.getStatus()

        if (resetNeeded) {
          _this.closeTunnel(cp)

          console.log('Renewing tunnel')
          _this.reportRenewalTime()

          cp = _this.openTunnel(this.config.privKey, this.config.clientSSHPort, this.config.serverIp, 'trout', this.config.serverSSHPort)
        }
      }, this.config.renewalPeriod)

      await this.getStatus()
    } catch (err) {
      console.error(err)
    }
  }

  reportRenewalTime () {
    try {
      const now = new Date()

      let futureTime = now.getTime() + this.config.renewalPeriod
      futureTime = new Date(futureTime)

      console.log(
        `Time now: ${now.toLocaleString()}. Tunnel renewal will be at ${futureTime.toLocaleString()}\n`
      )
    } catch (err) {
      console.error('Error in reportRenewalTime(): ', err)
      // Exit silently.
    }
  }

  // Open a tunnel on the 'remoteIp' system. Create a tunnel from the 'localPort'
  // to the 'remotePort'.
  openTunnel (sshKey, localPort, remoteIp, username, remotePort) {
    try {
      // Set up a tunnel for SSH access to the Dell machine.
      const cp = spawn('ssh', [
        '-i',
        `${sshKey}`,
        '-R',
        `${remotePort}:localhost:${localPort}`,
        '-o',
        'ServerAliveInterval=30',
        `${username}@${remoteIp}`
      ])

      console.log(
        `SSH tunnel established. Local port ${localPort} forwarded to remote machine: ${remoteIp}:${remotePort}`
      )

      return cp
    } catch (err) {
      console.error('Error in openTunnel()')
      throw err
    }
  }

  closeTunnel (cp) {
    try {
      console.log('Sending kill signal...')
      cp.kill()
    } catch (err) {
      console.error('Error in closeTunnel()')
      throw err
    }
  }

  // Get the status from the API, to determine if this tunnel should be reset.
  // Returns true or false.
  async getStatus () {
    try {
      const statusUrl = `http://${this.config.serverIp}:${this.config.serverRestAPI}/tunnel`
      const result = await this.axios.get(statusUrl)
      console.log(`Reset needed? ${result.data.reset}`)

      const retVal = result.data.reset

      return retVal
    } catch (err) {
      console.error('Error in getStatus(): ', err)
      return false
    }
  }
}

module.exports = SSHTunnel
