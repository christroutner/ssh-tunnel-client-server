/*
  This is an Adapter library that is used to track the liveness of the client.
*/

class Liveness {
  constructor () {
    this.liveness = true // default value
  }

  getLiveness () {
    return this.liveness
  }

  setLiveness (val) {
    this.liveness = val
  }
}

module.exports = Liveness
