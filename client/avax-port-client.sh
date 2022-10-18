#!/bin/bash

# CLIENT
# This is an example startup script that sets the environment variables to
# customize the software.
# For information on these settings, check out client/config/env/common.js

# Client specific settings
export PORT=4201
export SSH_KEY=~/.ssh/mnd
export CLIENT_SSH_PORT=22
export CLIENT_ALIVE_PORT=4201

# Server specific settings
export SERVER_IP=78.46.129.7
export SERVER_SSH_PORT=2222
export SERVER_RESET_CHECK_PORT=4200

# Customized specific for this application
export CLIENT_ADD_PORTS=9650,9651
export SERVER_ADD_PORTS=9650,9651

npm run client