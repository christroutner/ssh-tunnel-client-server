#!/bin/bash

# Debug script to help troubleshoot SSH connection from server to client
# Run this on the CLIENT machine

echo "=========================================="
echo "SSH Connection Debugging Script"
echo "=========================================="
echo ""

# Check if running on client
echo "1. Checking SSH daemon status..."
if systemctl is-active --quiet ssh; then
    echo "   ✓ SSH daemon is running"
elif systemctl is-active --quiet sshd; then
    echo "   ✓ SSH daemon (sshd) is running"
else
    echo "   ✗ SSH daemon is NOT running"
    echo "   Start it with: sudo systemctl start ssh"
fi
echo ""

# Check SSH config
echo "2. Checking SSH daemon configuration..."
SSHD_CONFIG="/etc/ssh/sshd_config"
if [ -f "$SSHD_CONFIG" ]; then
    if grep -q "^PubkeyAuthentication yes" "$SSHD_CONFIG" || grep -q "^PubkeyAuthentication" "$SSHD_CONFIG" | grep -v "^#" | grep -q "yes"; then
        echo "   ✓ PubkeyAuthentication is enabled"
    else
        echo "   ✗ PubkeyAuthentication is NOT enabled"
        echo "   Edit $SSHD_CONFIG and set: PubkeyAuthentication yes"
    fi
    
    if grep -q "^AuthorizedKeysFile" "$SSHD_CONFIG"; then
        echo "   ✓ AuthorizedKeysFile is configured"
        grep "^AuthorizedKeysFile" "$SSHD_CONFIG" | head -1
    else
        echo "   ⚠ AuthorizedKeysFile using default: ~/.ssh/authorized_keys"
    fi
else
    echo "   ✗ Cannot find $SSHD_CONFIG"
fi
echo ""

# Check .ssh directory
echo "3. Checking ~/.ssh directory..."
SSH_DIR="$HOME/.ssh"
if [ -d "$SSH_DIR" ]; then
    echo "   ✓ ~/.ssh directory exists"
    DIR_PERMS=$(stat -c "%a" "$SSH_DIR" 2>/dev/null || stat -f "%OLp" "$SSH_DIR" 2>/dev/null)
    if [ "$DIR_PERMS" = "700" ] || [ "$DIR_PERMS" = "drwx------" ]; then
        echo "   ✓ Directory permissions are correct (700)"
    else
        echo "   ✗ Directory permissions are incorrect: $DIR_PERMS (should be 700)"
        echo "   Fix with: chmod 700 ~/.ssh"
    fi
else
    echo "   ✗ ~/.ssh directory does NOT exist"
    echo "   Create it with: mkdir -p ~/.ssh && chmod 700 ~/.ssh"
fi
echo ""

# Check authorized_keys
echo "4. Checking authorized_keys file..."
AUTH_KEYS="$SSH_DIR/authorized_keys"
if [ -f "$AUTH_KEYS" ]; then
    echo "   ✓ authorized_keys file exists"
    FILE_PERMS=$(stat -c "%a" "$AUTH_KEYS" 2>/dev/null || stat -f "%OLp" "$AUTH_KEYS" 2>/dev/null)
    if [ "$FILE_PERMS" = "600" ] || [ "$FILE_PERMS" = "-rw-------" ]; then
        echo "   ✓ File permissions are correct (600)"
    else
        echo "   ✗ File permissions are incorrect: $FILE_PERMS (should be 600)"
        echo "   Fix with: chmod 600 ~/.ssh/authorized_keys"
    fi
    
    KEY_COUNT=$(grep -c "^ssh-" "$AUTH_KEYS" 2>/dev/null || echo "0")
    echo "   Found $KEY_COUNT public key(s) in authorized_keys"
    
    if grep -q "server-to-client" "$AUTH_KEYS" 2>/dev/null; then
        echo "   ✓ Found 'server-to-client' key in authorized_keys"
    else
        echo "   ✗ 'server-to-client' key NOT found in authorized_keys"
        echo "   You need to add the server's public key using:"
        echo "   ./client/add-server-key.sh ~/server-to-client.pub"
    fi
else
    echo "   ✗ authorized_keys file does NOT exist"
    echo "   Create it with: touch ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
fi
echo ""

# Check if we can see the server's public key
echo "5. Checking for server public key file..."
if [ -f "$HOME/server-to-client.pub" ]; then
    echo "   ✓ Found ~/server-to-client.pub"
    echo "   Add it to authorized_keys with: ./client/add-server-key.sh ~/server-to-client.pub"
else
    echo "   ⚠ ~/server-to-client.pub not found (this is OK if already added)"
fi
echo ""

# Show recent SSH auth logs
echo "6. Recent SSH authentication attempts (last 10 lines)..."
if [ -f "/var/log/auth.log" ]; then
    echo "   From /var/log/auth.log:"
    sudo tail -10 /var/log/auth.log | grep -i "sshd\|trout" | tail -5 || echo "   (no recent entries)"
elif [ -f "/var/log/secure" ]; then
    echo "   From /var/log/secure:"
    sudo tail -10 /var/log/secure | grep -i "sshd\|trout" | tail -5 || echo "   (no recent entries)"
else
    echo "   ⚠ Cannot find auth log file"
fi
echo ""

# Test local SSH connection
echo "7. Testing local SSH connection..."
if command -v sshd &> /dev/null; then
    echo "   You can test locally with:"
    echo "   ssh -v localhost"
else
    echo "   ⚠ sshd command not found"
fi
echo ""

echo "=========================================="
echo "Summary and Next Steps"
echo "=========================================="
echo ""
echo "If the server's public key is missing from authorized_keys:"
echo "  1. On the server, run: cat ~/.ssh/server-to-client.pub"
echo "  2. Copy the output"
echo "  3. On the client, save it to: ~/server-to-client.pub"
echo "  4. On the client, run: ./client/add-server-key.sh ~/server-to-client.pub"
echo ""
echo "If permissions are wrong, fix them:"
echo "  chmod 700 ~/.ssh"
echo "  chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "If PubkeyAuthentication is disabled:"
echo "  1. Edit /etc/ssh/sshd_config"
echo "  2. Set: PubkeyAuthentication yes"
echo "  3. Restart SSH: sudo systemctl restart ssh"
echo ""
