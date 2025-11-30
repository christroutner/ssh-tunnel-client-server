#!/bin/bash

# SSH Key Setup Script for SSH Tunnel Server
# This script helps set up authorized_keys for the tunnel user

set -e

SSH_DIR="./ssh-keys"
AUTHORIZED_KEYS="$SSH_DIR/authorized_keys"

echo "SSH Key Setup for SSH Tunnel Server"
echo "===================================="
echo ""

# Create SSH directory if it doesn't exist
if [ ! -d "$SSH_DIR" ]; then
    echo "Creating SSH keys directory: $SSH_DIR"
    mkdir -p "$SSH_DIR"
    chmod 700 "$SSH_DIR"
fi

# Create authorized_keys file if it doesn't exist
if [ ! -f "$AUTHORIZED_KEYS" ]; then
    echo "Creating authorized_keys file"
    touch "$AUTHORIZED_KEYS"
    chmod 600 "$AUTHORIZED_KEYS"
fi

echo ""
echo "Current authorized keys:"
if [ -s "$AUTHORIZED_KEYS" ]; then
    echo "---"
    cat "$AUTHORIZED_KEYS"
    echo "---"
else
    echo "(no keys configured)"
fi

echo ""
echo "Options:"
echo "1. Add a new public key from a file"
echo "2. Add a new public key by pasting"
echo "3. View current keys"
echo "4. Exit"
echo ""
read -p "Select an option (1-4): " choice

case $choice in
    1)
        read -p "Enter path to public key file: " keyfile
        if [ ! -f "$keyfile" ]; then
            echo "Error: File not found: $keyfile"
            exit 1
        fi
        
        # Validate key format (basic check)
        if ! grep -qE "^(ssh-rsa|ssh-ed25519|ecdsa-sha2)" "$keyfile"; then
            echo "Error: File does not appear to be a valid SSH public key"
            exit 1
        fi
        
        # Add key to authorized_keys
        echo "" >> "$AUTHORIZED_KEYS"
        echo "# Added $(date)" >> "$AUTHORIZED_KEYS"
        cat "$keyfile" >> "$AUTHORIZED_KEYS"
        echo "Key added successfully!"
        ;;
    2)
        echo "Paste the public key (press Enter, then Ctrl+D when done):"
        key_content=$(cat)
        
        # Validate key format
        if ! echo "$key_content" | grep -qE "^(ssh-rsa|ssh-ed25519|ecdsa-sha2)"; then
            echo "Error: Input does not appear to be a valid SSH public key"
            exit 1
        fi
        
        # Add key to authorized_keys
        echo "" >> "$AUTHORIZED_KEYS"
        echo "# Added $(date)" >> "$AUTHORIZED_KEYS"
        echo "$key_content" >> "$AUTHORIZED_KEYS"
        echo "Key added successfully!"
        ;;
    3)
        if [ -s "$AUTHORIZED_KEYS" ]; then
            echo "Authorized keys:"
            cat "$AUTHORIZED_KEYS"
        else
            echo "No keys configured"
        fi
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Ensure the authorized_keys file is mounted in the Docker container"
echo "2. Restart the container if it's already running"
echo "3. Test SSH connection from client: ssh -p 2222 -i <private-key> safeuser@<server-ip>"

