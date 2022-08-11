/*
  This adapter sets up an SSH tunnel between the client and server.
*/

// Global npm libraries
const spawn = require('child_process').spawn
const axios = require('axios')

// Local libraries
const config = require('../../config')

class SSHTunnel {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.axios = axios
    this.config = config
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
        'ServerAliveInterval=60',
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
