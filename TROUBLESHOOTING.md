# Troubleshooting: Permission Denied (publickey)

## Problem
When trying to SSH from the server to the client through the tunnel, you get:
```
Permission denied (publickey).
```

## Root Cause Analysis

Based on your verbose SSH output, the connection **is working** - the key exchange completes successfully. The issue is **authentication failure**, which means:

1. ✅ The reverse tunnel is established correctly
2. ✅ The connection reaches the client
3. ❌ The server's public key is not authorized on the client

## Most Likely Solution

The server's public key (`server-to-client.pub`) is **not in the client's `~/.ssh/authorized_keys` file**.

### Step 1: Verify on the Client

Run the debug script:
```bash
# On the client machine
./debug-ssh-connection.sh
```

Or manually check:
```bash
# On the client
cat ~/.ssh/authorized_keys | grep server-to-client
```

If this returns nothing, the key is missing.

### Step 2: Add the Server's Public Key to the Client

**On the server:**
```bash
# Display the public key
cat ~/.ssh/server-to-client.pub
```

Copy the entire output (it should look like):
```
ssh-ed25519 AAAA... server-to-client-20250130
```

**On the client:**
```bash
# Save the public key to a file
nano ~/server-to-client.pub
# Paste the key content, save and exit

# Add it to authorized_keys
./client/add-server-key.sh ~/server-to-client.pub

# Clean up
rm ~/server-to-client.pub
```

### Step 3: Verify Permissions

```bash
# On the client
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Step 4: Test the Connection

**On the server:**
```bash
ssh -i ~/.ssh/server-to-client -p 2222 trout@localhost
```

## Other Common Issues

### Issue: SSH Daemon Not Configured for Key Authentication

**Check:**
```bash
# On the client
sudo grep "^PubkeyAuthentication" /etc/ssh/sshd_config
```

**Fix if needed:**
```bash
# On the client
sudo nano /etc/ssh/sshd_config
# Set: PubkeyAuthentication yes
sudo systemctl restart ssh
```

### Issue: Wrong Username

Make sure you're using the **client machine's username** (e.g., `trout`), not the server's username (`safeuser`).

```bash
# On the server
ssh -i ~/.ssh/server-to-client -p 2222 trout@localhost
#                                    ^^^^^ Use client username
```

### Issue: Reverse Tunnel Not Established

Check if the client's tunnel is running:
```bash
# On the client, check the logs
# You should see: "SSH tunnel established. Local port 22 forwarded to remote machine: 5.78.102.63:2222"
```

If the tunnel isn't established, restart the client:
```bash
# On the client
./example_start.sh
```

## Understanding the Architecture

```
Client Machine                    Server Host                    Docker Container
-----------                      -----------                    ----------------
Port 22 (SSH)  ────────────────>  Port 2222  ────────────────>  Port 22 (sshd)
     │                                                               │
     │                                                               │
     └──[Reverse Tunnel]────────────────────────────────────────────┘
         Port 22 forwarded to Server:2222
```

When you connect from the server to `localhost:2222`:
1. Connection goes to the Docker container
2. Container forwards it through the reverse tunnel to the client
3. Client's SSH daemon receives the connection
4. Client checks `~/.ssh/authorized_keys` for the server's public key
5. If found, authentication succeeds; if not, you get "Permission denied"

## Still Having Issues?

1. Check SSH logs on the client:
   ```bash
   # On the client
   sudo tail -f /var/log/auth.log | grep sshd
   ```

2. Try connecting with maximum verbosity:
   ```bash
   # On the server
   ssh -vvv -i ~/.ssh/server-to-client -p 2222 trout@localhost
   ```

3. Verify the key fingerprint matches:
   ```bash
   # On the server
   ssh-keygen -lf ~/.ssh/server-to-client.pub
   
   # On the client
   ssh-keygen -lf ~/.ssh/authorized_keys | grep "server-to-client"
   ```
   
   The fingerprints should match.
