#!/bin/bash

# Production startup script for SSH Tunnel Server
# This script starts both sshd and the Node.js application

set -e

# Set production environment
export KOA_ENV=production

# Store PIDs for cleanup
SSHD_PID=""
NODE_PID=""

# Function to handle shutdown signals
cleanup() {
    echo "Shutting down services..."
    # Stop sshd
    if [ ! -z "$SSHD_PID" ] && ps -p $SSHD_PID > /dev/null 2>&1; then
        echo "Stopping SSH daemon (PID: $SSHD_PID)..."
        sudo kill $SSHD_PID 2>/dev/null || true
    fi
    # Stop Node.js
    if [ ! -z "$NODE_PID" ] && ps -p $NODE_PID > /dev/null 2>&1; then
        echo "Stopping Node.js application (PID: $NODE_PID)..."
        kill $NODE_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Ensure SSH directory exists and has correct permissions
mkdir -p /home/safeuser/.ssh
chmod 700 /home/safeuser/.ssh
if [ -f /home/safeuser/.ssh/authorized_keys ]; then
    chmod 600 /home/safeuser/.ssh/authorized_keys
    chown safeuser:safeuser /home/safeuser/.ssh/authorized_keys
fi

# Generate SSH host keys if they don't exist (requires root)
if [ ! -f /etc/ssh/ssh_host_rsa_key ]; then
    echo "Generating SSH host keys..."
    sudo ssh-keygen -A
fi

# Start sshd in the background (requires root)
echo "Starting SSH daemon..."
sudo /usr/sbin/sshd -D &
SSHD_PID=$!

# Wait a moment for sshd to start
sleep 2

# Verify sshd is running
sleep 1
if ! ps -p $SSHD_PID > /dev/null 2>&1; then
    echo "ERROR: sshd failed to start. Checking logs..."
    sudo tail -20 /var/log/auth.log 2>/dev/null || sudo journalctl -u ssh -n 20 2>/dev/null || echo "Could not read logs"
    exit 1
fi

echo "SSH daemon started (PID: $SSHD_PID)"
echo "SSH daemon is listening on port 22 inside the container"

# Start the Node.js application in the background so we can handle signals
echo "Starting Node.js application..."
npm start &
NODE_PID=$!

# Wait for Node.js to start
sleep 2

# Verify Node.js is running
if ! ps -p $NODE_PID > /dev/null 2>&1; then
    echo "ERROR: Node.js application failed to start"
    cleanup
    exit 1
fi

echo "Node.js application started (PID: $NODE_PID)"

# Wait for either process to exit
wait
