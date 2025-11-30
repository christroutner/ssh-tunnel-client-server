#!/bin/bash

# Generate SSH key pair for server-to-client authentication
# This key allows the server to SSH into the client through the tunnel
# Usage: ./generate-server-key.sh [key-name]

set -e

KEY_NAME="${1:-server-to-client}"
SSH_DIR="$HOME/.ssh"
PRIVATE_KEY="$SSH_DIR/$KEY_NAME"
PUBLIC_KEY="$SSH_DIR/$KEY_NAME.pub"

echo "Generating SSH key pair for server-to-client authentication"
echo "=========================================================="
echo ""

# Create .ssh directory if it doesn't exist
if [ ! -d "$SSH_DIR" ]; then
    echo "Creating SSH directory: $SSH_DIR"
    mkdir -p "$SSH_DIR"
    chmod 700 "$SSH_DIR"
fi

# Check if key already exists
if [ -f "$PRIVATE_KEY" ]; then
    echo "Warning: Key $PRIVATE_KEY already exists"
    read -p "Overwrite? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Aborted"
        exit 0
    fi
    rm -f "$PRIVATE_KEY" "$PUBLIC_KEY"
fi

# Generate the key pair
echo "Generating ED25519 key pair..."
ssh-keygen -t ed25519 -f "$PRIVATE_KEY" -N "" -C "server-to-client-$(date +%Y%m%d)"

# Set correct permissions
chmod 600 "$PRIVATE_KEY"
chmod 644 "$PUBLIC_KEY"

echo ""
echo "Key pair generated successfully!"
echo ""
echo "Private key: $PRIVATE_KEY"
echo "Public key:  $PUBLIC_KEY"
echo ""
echo "Next steps:"
echo "1. Copy the public key to the client machine:"
echo "   cat $PUBLIC_KEY"
echo ""
echo "2. On the client, add it to authorized_keys using:"
echo "   ./add-server-key.sh <path-to-public-key>"
echo ""
echo "3. Test the connection from server:"
echo "   ssh -i $PRIVATE_KEY -p 2222 <client-user>@localhost"
echo ""
echo "Public key content:"
echo "---"
cat "$PUBLIC_KEY"
echo "---"
