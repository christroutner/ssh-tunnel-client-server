/*
  This file is used to store unsecure, application-specific data common to all
  environments.
*/

module.exports = {
  port: process.env.PORT || 4201,
  logPass: 'test',
  emailServer: process.env.EMAILSERVER ? process.env.EMAILSERVER : 'mail.someserver.com',
  emailUser: process.env.EMAILUSER ? process.env.EMAILUSER : 'noreply@someserver.com',
  emailPassword: process.env.EMAILPASS ? process.env.EMAILPASS : 'emailpassword',

  // Tunnel config settings for both client and server.
  privKey: '~/.ssh/fullstack',
  renewalPeriod: 60000 * 2,

  // Client specific settings.
  clientSSHPort: 22,
  clientAlivenessPort: 4201, // server polls this port to ensure the SSH tunnel is still alive.

  // Server specific settings.
  serverIp: '5.161.134.113',
  serverSSHPort: 2222, // clientSSHPort gets forwarded to this port.
  serverRestAPI: 4200 // client polls this port to see if needs to renew the SSH tunnel.
}
