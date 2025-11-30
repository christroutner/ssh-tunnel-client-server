#!/bin/bash

# Quick script to add a server's public key to authorized_keys
# Usage: ./add-server-key.sh <path-to-public-key-file>

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-public-key-file>"
    echo ""
    echo "Example: $0 ~/server-to-client.pub"
    exit 1
fi

KEYFILE="$1"
SSH_DIR="./ssh-keys"
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
    echo "Creating SSH keys directory: $SSH_DIR"
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
if grep -qF "$(cat "$KEYFILE")" "$AUTHORIZED_KEYS" 2>/dev/null; then
    echo "Warning: This key already exists in authorized_keys"
    read -p "Add it anyway? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Aborted"
        exit 0
    fi
fi

# Add key
echo "" >> "$AUTHORIZED_KEYS"
echo "# Added $(date) from $KEYFILE" >> "$AUTHORIZED_KEYS"
cat "$KEYFILE" >> "$AUTHORIZED_KEYS"

echo "Key added successfully to $AUTHORIZED_KEYS"
echo ""
echo "Next steps:"
echo "1. Restart the Docker container if it's running"
echo "2. Test connection: ssh -p 2222 -i <private-key> safeuser@<client-ip>"
