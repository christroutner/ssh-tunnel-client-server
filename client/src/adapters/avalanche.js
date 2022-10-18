/*
  Adapter library for querying the AVAX node
*/

// Global npm libraries
const { Avalanche } = require('avalanche')

class AvalancheAdapter {
  async queryNodeId () {
    try {
      // console.log('Avalanche: ', Avalanche)
      const avalanche = new Avalanche('avax.fullstackslp.nl', 9650, 'http', 1)
      // console.log('avalanche: ', avalanche)

      const info = avalanche.apis.info
      // console.log('info: ', info)

      const nodeId = await info.getNodeID()

      const now = new Date()

      console.log(`Success. Node ID: ${nodeId}, time: ${now.toLocaleString()}`)

      return true
    } catch (err) {
      console.error('Error in avalanche.js/queryNodeId(): ', err)
      return false
    }
  }
}

module.exports = AvalancheAdapter
