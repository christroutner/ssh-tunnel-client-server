/*
  This file is used to store unsecure, application-specific data common to all
  environments.
*/

const config = {
  port: process.env.PORT || 4200,
  logPass: 'test',
  emailServer: process.env.EMAILSERVER ? process.env.EMAILSERVER : 'mail.someserver.com',
  emailUser: process.env.EMAILUSER ? process.env.EMAILUSER : 'noreply@someserver.com',
  emailPassword: process.env.EMAILPASS ? process.env.EMAILPASS : 'emailpassword',

  // Tunnel config settings for both client and server.
  renewalPeriod: 60000 * 2,

  // CLIENT SPECIFIC SETTINGS
  clientSSHPort: process.env.CLIENT_SSH_PORT ? process.env.CLIENT_SSH_PORT : 22,
  // server polls this port to ensure the SSH tunnel is still alive.
  clientAlivenessPort: process.env.CLIENT_ALIVE_PORT ? process.env.CLIENT_ALIVE_PORT : 4201,

  // SERVER SPECIFIC SETTINGS
  serverIp: process.env.SERVER_IP ? process.env.SERVER_IP : '5.161.134.113',
  // clientSSHPort gets forwarded to this port.
  serverSSHPort: process.env.SERVER_SSH_PORT ? process.env.SERVER_SSH_PORT : 2222,
  // client polls this port to see if needs to renew the SSH tunnel.
  serverRestAPI: process.env.SERVER_RESET_CHECK_PORT ? process.env.SERVER_RESET_CHECK_PORT : 4200
}

module.exports = config
