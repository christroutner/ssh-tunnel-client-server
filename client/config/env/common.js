/*
  This file is used to store unsecure, application-specific data common to all
  environments.
*/

const config = {
  port: process.env.PORT || 4201,
  logPass: 'test',
  emailServer: process.env.EMAILSERVER ? process.env.EMAILSERVER : 'mail.someserver.com',
  emailUser: process.env.EMAILUSER ? process.env.EMAILUSER : 'noreply@someserver.com',
  emailPassword: process.env.EMAILPASS ? process.env.EMAILPASS : 'emailpassword',

  // Enable or Disable the usage of Mongo DB.
  noMongo: true,

  // Tunnel config settings for both client and server.
  privKey: process.env.SSH_KEY ? process.env.SSH_KEY : '~/.ssh/fullstack',
  renewalPeriod: 60000 * 2,

  // CLIENT SPECIFIC SETTINGS
  clientSSHPort: process.env.CLIENT_SSH_PORT ? process.env.CLIENT_SSH_PORT : 22,
  // server polls this port to ensure the SSH tunnel is still alive.
  clientAlivenessPort: process.env.CLIENT_ALIVE_PORT ? process.env.CLIENT_ALIVE_PORT : 4201,
  // Set up additional port forwarding between client and server.
  clientAddPorts: [],

  // SERVER SPECIFIC SETTINGS
  serverIp: process.env.SERVER_IP ? process.env.SERVER_IP : '5.161.134.113',
  serverUser: process.env.SERVER_USER ? process.env.SERVER_USER : 'trout',
  // clientSSHPort gets forwarded to this port.
  serverSSHPort: process.env.SERVER_SSH_PORT ? process.env.SERVER_SSH_PORT : 2222,
  // client polls this port to see if needs to renew the SSH tunnel.
  serverRestAPI: process.env.SERVER_RESET_CHECK_PORT ? process.env.SERVER_RESET_CHECK_PORT : 4200,
  serverAddPorts: []
}

// If additional ports are specified, set up an SSH tunnel for each port.
if (process.env.CLIENT_ADD_PORTS) {
  const addClientPorts = process.env.CLIENT_ADD_PORTS
  const addClientPortsAry = addClientPorts.split(',')
  console.log('addClientPortsAry: ', addClientPortsAry)

  const addServerPorts = process.env.SERVER_ADD_PORTS
  const addServerPortsAry = addServerPorts.split(',')

  if (addClientPortsAry.length > 0) {
    config.clientAddPorts = addClientPortsAry
    config.serverAddPorts = addServerPortsAry
  }
}

module.exports = config
