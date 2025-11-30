#!/bin/bash

# Add server's public key to client's authorized_keys
# This allows the server to SSH into the client through the tunnel
# Usage: ./add-server-key.sh <path-to-public-key-file> [client-username]

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-public-key-file> [client-username]"
    echo ""
    echo "Example: $0 ~/server-to-client.pub"
    echo "Example: $0 ~/server-to-client.pub trout"
    exit 1
fi

KEYFILE="$1"
CLIENT_USER="${2:-$USER}"
SSH_DIR="$HOME/.ssh"
AUTHORIZED_KEYS="$SSH_DIR/authorized_keys"

# Validate key file exists
if [ ! -f "$KEYFILE" ]; then
    echo "Error: Key file not found: $KEYFILE"
    exit 1
fi

# Validate key format
if ! grep -qE "^(ssh-rsa|ssh-ed25519|ecdsa-sha2)" "$KEYFILE"; then
    echo "Error: File does not appear to be a valid SSH public key"
    echo "Expected formats: ssh-rsa, ssh-ed25519, or ecdsa-sha2"
    exit 1
fi

# Create SSH directory if needed
if [ ! -d "$SSH_DIR" ]; then
    echo "Creating SSH directory: $SSH_DIR"
    mkdir -p "$SSH_DIR"
    chmod 700 "$SSH_DIR"
fi

# Create authorized_keys if needed
if [ ! -f "$AUTHORIZED_KEYS" ]; then
    echo "Creating authorized_keys file"
    touch "$AUTHORIZED_KEYS"
    chmod 600 "$AUTHORIZED_KEYS"
fi

# Check if key already exists
KEY_CONTENT=$(cat "$KEYFILE")
if grep -qF "$KEY_CONTENT" "$AUTHORIZED_KEYS" 2>/dev/null; then
    echo "Warning: This key already exists in authorized_keys"
    read -p "Add it anyway? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Aborted"
        exit 0
    fi
fi

# Add key
echo "" >> "$AUTHORIZED_KEYS"
echo "# Server-to-client key added $(date) from $KEYFILE" >> "$AUTHORIZED_KEYS"
cat "$KEYFILE" >> "$AUTHORIZED_KEYS"

# Ensure correct permissions
chmod 600 "$AUTHORIZED_KEYS"

echo "Key added successfully to $AUTHORIZED_KEYS"
echo ""
echo "Next steps:"
echo "1. Ensure the client tunnel is running"
echo "2. Test connection from server:"
echo "   ssh -i <server-private-key> -p 2222 $CLIENT_USER@localhost"
echo ""
