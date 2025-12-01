#!/bin/bash

# SERVER
# This is an example startup script that sets the environment variables to
# customize the software.
# For information on these settings, check out client/config/env/common.js
#
# NOTE: This script is for running the server directly (not in Docker).
# For Docker usage, see server/docker-compose.yml and set environment variables there.
# When using Docker, SERVER_SSH_PORT=2222 refers to the host port where the
# container's SSH daemon is exposed (container's port 22 -> host port 2222).

# REST API port for this instance (client or server)
export PORT=4200

# Client specific settings
export SSH_KEY=~/.ssh/fullstack
export CLIENT_SSH_PORT=22
export CLIENT_ALIVE_PORT=4201

# Server specific settings
export SERVER_IP=5.161.134.113
export SERVER_SSH_PORT=2222
export SERVER_RESET_CHECK_PORT=4200

# Customized specific for this application
export CLIENT_ADD_PORTS=9650,9651
export SERVER_ADD_PORTS=9650,9651

npm run server
