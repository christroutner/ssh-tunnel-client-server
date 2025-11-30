#!/bin/bash

# CLIENT
# This is an example startup script that sets the environment variables to
# customize the software.
# For information on these settings, check out client/config/env/common.js
#
# NOTE: When the server runs in Docker:
# - SERVER_IP should point to the host machine's IP address (not the container IP)
# - SERVER_SSH_PORT=2222 is the host port where the container's SSH daemon is exposed
# - The client connects to host-ip:2222, which routes to the container's sshd

# REST API port for this instance (client or server)
export PORT=4200

# Client specific settings
export SSH_KEY=~/.ssh/tunnel-client
export CLIENT_SSH_PORT=22
export CLIENT_ALIVE_PORT=4201

# Server specific settings
export SERVER_IP=5.161.134.113
export SERVER_SSH_PORT=2222
export SERVER_USER=safeuser  # Username on server (use 'safeuser' for Docker, or your username for direct setup)
export SERVER_RESET_CHECK_PORT=4200

# Customized specific for this application
#export CLIENT_ADD_PORTS=9650,9651
#export SERVER_ADD_PORTS=9650,9651

npm run client
