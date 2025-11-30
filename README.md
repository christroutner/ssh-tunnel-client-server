# ssh-tunnel-server-client
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![Coverage Status](https://coveralls.io/repos/github/christroutner/babel-free-koa2-api-boilerplate/badge.svg?branch=unstable)](https://coveralls.io/github/christroutner/babel-free-koa2-api-boilerplate?branch=unstable) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Greenkeeper badge](https://badges.greenkeeper.io/christroutner/koa-api-boilerplate.svg)](https://greenkeeper.io/)

This repository is forked from [koa-api-boilerplate](https://github.com/christroutner/koa-api-boilerplate).

This repository is a bit of a mono-repo:
 - The [client](./client) directory contains a REST API that sets up two or more SSH tunnels with the server. These tunnels are maintained through communication between the Client and the Server.
 - The [server](./server) directory also contains a REST API. This is expected to be run on a 'server' with a fixed IP4 address.

By default these are the features:
- The client forwards ports 22 and 4201 to the server.
- The server presents the forwarded ports at 2222 and 4201.
- The server polls port 4201 every 2 minutes to ensure the client is still alive and responsive.
- The client polls port 4200 on the server, to see if in needs to reset its SSH tunnel.

The bi-directional information between Client and Server ensure that the tunnels are renewed whenever it gets disconnected. Additional ports can be forwarded, it's not limited to just the two illustrated above.

## Security Architecture

When the server runs in Docker (recommended), the SSH daemon runs inside the container. This ensures that:
- Client SSH connections are jailed inside the Docker container
- Clients cannot access the server host system
- Admin access to the host remains separate (via host's SSH on port 22)
- Client access is restricted to the container environment (via container's SSH on port 2222)

## Requirements

### Server
* Docker and Docker Compose (for containerized deployment)
* OR Node.js ^14+ and npm ^8+ (for direct deployment)
* Ubuntu Linux (recommended)

### Client
* Node.js ^14+
* npm ^8+
* SSH client
* Ubuntu Linux (recommended)

## SSH Key Generation

### On the Client Machine

1. Generate an SSH key pair for the tunnel connection:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/tunnel-client -N ""
```

Or if you prefer RSA:

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/tunnel-client -N ""
```

2. This creates two files:
   - `~/.ssh/tunnel-client` - Private key (keep this secure, never share)
   - `~/.ssh/tunnel-client.pub` - Public key (this will be added to the server)

3. Copy the public key to the server. You can display it with:

```bash
cat ~/.ssh/tunnel-client.pub
```

### On the Server Machine (For Server-to-Client Access)

To enable the server to SSH into the client through the tunnel, you need to set up a server-to-client SSH key pair:

1. **On the server**, generate an SSH key pair:

```bash
cd server
./generate-server-key.sh
```

This creates:
   - `~/.ssh/server-to-client` - Private key (keep this secure)
   - `~/.ssh/server-to-client.pub` - Public key (this will be added to the client)

2. **Copy the public key to the client**. Display the public key with this command. Then paste it to the client in a file called ~/server-to-client.pub:
   - `cat ~/.ssh/server-to-client.pub`

3. **On the client**, add the server's public key to authorized_keys:

```bash
cd client
./add-server-key.sh ~/server-to-client.pub
```

4. Finally, you can delete the file on the client
- `rm ~/server-to-client.pub`


## Server Setup (Docker - Recommended)

### Prerequisites

1. Install Docker and Docker Compose on the server
  - `curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh`
  - `sudo usermod -aG docker ${USER}`
2. Clone this repository on the server
3. Ensure the server has a fixed IP address

### Initial Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Create the SSH keys directory in the same directory as the `docker compose.yml` file:

```bash
mkdir -p ssh-keys
chmod 700 ssh-keys
```

3. Add the client's public key to authorized_keys:

```bash
# Option 1: Use the helper script
./add-client-key.sh ~/path/to/tunnel-client.pub

# Option 2: Manually
echo "ssh-ed25519 AAAA..." >> ssh-keys/authorized_keys
chmod 600 ssh-keys/authorized_keys
```

4. Create necessary directories in the same directory as the `docker compose.yml` file:

```bash
mkdir -p keys logs
```

5. Configure environment variables by copying and customizing the example `.env` file:

```bash
# Copy the example .env file
cp .env.example .env

# Edit the .env file to customize settings
nano .env  # or use your preferred editor
```

The `.env` file allows you to customize:
- **CONTAINER_NAME**: Set a custom name for the Docker container (useful when running multiple instances on the same server)
  - Example: `CONTAINER_NAME=ssh-tunnel-server-1`
  - Default: `ssh-tunnel-server`
- **PORT**: Server REST API port (default: 4200)
- **SERVER_IP**: Your server's IP address
- **SERVER_SSH_PORT**: Host port where container SSH is exposed (default: 2222)
- **CLIENT_SSH_PORT**: Client SSH port (default: 22)
- **CLIENT_ALIVE_PORT**: Client liveness check port (default: 4201)
- **CLIENT_ADD_PORTS** / **SERVER_ADD_PORTS**: Additional ports to forward (comma-separated, optional)

Example `.env` file:

```bash
# Container name - change this to run multiple instances
CONTAINER_NAME=ssh-tunnel-server

# Application Ports
PORT=4200
CLIENT_SSH_PORT=22
CLIENT_ALIVE_PORT=4201
SERVER_SSH_PORT=2222
SERVER_RESET_CHECK_PORT=4200

# Server Configuration
SERVER_IP=5.161.134.113

# Additional Port Forwarding (optional)
# CLIENT_ADD_PORTS=9650,9651
# SERVER_ADD_PORTS=9650,9651
```

**Note:** The `.env` file is automatically loaded by Docker Compose. You can also set these variables as environment variables before running `docker compose` commands.

6. Build and start the container:

```bash
docker compose up -d --build
```

7. Verify the container is running:

```bash
docker compose ps
docker compose logs -f
```

**Note:** If you customized the `CONTAINER_NAME` in your `.env` file, replace `ssh-tunnel-server` with your custom container name in the commands below.

8. Check that sshd is running inside the container:

```bash
docker compose exec ssh-tunnel-server ps aux | grep sshd
```

Or if using a custom container name:

```bash
docker compose exec <your-container-name> ps aux | grep sshd
```

### Testing the Server Setup

1. Test SSH connection from the client machine:

```bash
ssh -p 2222 -i ~/.ssh/tunnel-client safeuser@<server-ip>
```

You should get a shell inside the Docker container (not the host).

2. Verify you're in the container:

```bash
# Inside the SSH session
hostname
# Should show the container hostname, not the server hostname
```

3. Test the REST API:

```bash
curl http://<server-ip>:4200/tunnel
```

### Managing SSH Keys

To add additional client keys:

```bash
cd server
./add-client-key.sh <path-to-public-key>
docker compose restart
```

Or use the interactive setup script:

```bash
cd server/production/docker/amd64
./setup-ssh-keys.sh
```

## Server Setup (Direct - Non-Docker)

If you prefer to run the server directly without Docker:

1. Install Node.js and npm
2. Install and configure OpenSSH server on the host
3. Configure `/etc/ssh/sshd_config`:

```
GatewayPorts yes
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowTcpForwarding yes
```

4. Add the client's public key to `~/.ssh/authorized_keys` for the tunnel user
5. Restart sshd: `sudo systemctl restart sshd`
6. Configure environment variables in `server/example_start.sh`
7. Start the server: `npm run server`

**Note:** Running directly on the host means clients will have access to the host system if they gain SSH access. Docker is recommended for security.

## Client Setup

### Prerequisites

1. Node.js ^14+ and npm ^8+ installed
2. SSH key pair generated (see SSH Key Generation section above)
3. Network access to the server
4. **Server-to-client SSH key set up** (see "On the Server Machine" section above) - This allows the server to SSH into the client through the tunnel

### Setup Steps

1. Navigate to the client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `example_start.sh`:

```bash
# REST API port for this instance
export PORT=4200

# Client specific settings
export SSH_KEY=~/.ssh/tunnel-client  # Path to your private key
export CLIENT_SSH_PORT=22
export CLIENT_ALIVE_PORT=4201

# Server specific settings
export SERVER_IP=5.161.134.113  # Replace with your server's IP
export SERVER_SSH_PORT=2222     # Host port where container SSH is exposed
export SERVER_USER=safeuser     # Username on server (use 'safeuser' for Docker setup, or your username for direct/non-Docker setup)
export SERVER_RESET_CHECK_PORT=4200

# Additional ports to forward (optional)
export CLIENT_ADD_PORTS=9650,9651
export SERVER_ADD_PORTS=9650,9651
```

4. Make the start script executable:

```bash
chmod +x example_start.sh
```

5. Start the client:

```bash
./example_start.sh
```

Or directly:

```bash
source example_start.sh
npm run client
```

### Verifying Client Connection

1. Check the client logs for successful tunnel establishment:

```
SSH tunnel opened between client and server.
Port 22 on this client has been forwarded to port 2222 on the server.
Liveness port 4201 has been port forwarded to server.
```

2. Test the tunnel by connecting to the client from the server:

```bash
# On the server, SSH to the client through the tunnel
ssh -i ~/.ssh/server-to-client -p 2222 <client-username>@localhost
# This should connect you to the client machine
```

**Note:** Replace `<client-username>` with the actual username on the client machine (e.g., `trout`).

**Optional:** Add an SSH config entry on the server for convenience:

```bash
# On the server, edit ~/.ssh/config
cat >> ~/.ssh/config << EOF
Host client-tunnel
    HostName localhost
    Port 2222
    User <client-username>
    IdentityFile ~/.ssh/server-to-client
    StrictHostKeyChecking no
EOF
```

Then you can simply use:
```bash
ssh client-tunnel
```

3. Verify the liveness check is working (server should poll port 4201)

## Port Configuration

### Default Ports

- **Port 22 (client)**: Client's SSH port, forwarded to server
- **Port 2222 (server host)**: Container's SSH daemon (client connects here)
- **Port 4200 (server)**: Server REST API
- **Port 4201 (client)**: Client liveness/health check endpoint

### Additional Ports

You can forward additional ports by setting:

```bash
export CLIENT_ADD_PORTS=9650,9651,8080
export SERVER_ADD_PORTS=9650,9651,8080
```

Each client port will be forwarded to the corresponding server port.

## Security Considerations

### Docker Deployment (Recommended)

- **Client Isolation**: Clients connecting via SSH are jailed inside the Docker container
- **Host Protection**: The server host remains protected from client access
- **Admin Access**: Server administrators can still SSH to the host on port 22 (separate from container)
- **Key-Based Auth**: Only SSH key authentication is allowed (no passwords)

### Network Security

- Ensure firewall rules allow:
  - Port 2222 (SSH for clients)
  - Port 4200 (REST API)
  - Ports for forwarded services (2222, 4201, etc.)
- Consider using a VPN or restricting access by IP
- Regularly rotate SSH keys
- Monitor SSH access logs

### Best Practices

1. Use strong SSH keys (ed25519 or RSA 4096-bit)
2. Keep private keys secure (600 permissions)
3. Regularly update Docker images and system packages
4. Monitor container logs for suspicious activity
5. Use read-only mounts for SSH keys when possible
6. Implement key rotation policies

## Troubleshooting

### Server Issues

#### Container won't start

```bash
# Check logs
docker compose logs

# Check if ports are already in use
sudo netstat -tulpn | grep -E ':(22|2222|4200|4201)'
```

#### sshd not running in container

```bash
# Check if sshd process exists
# Replace 'ssh-tunnel-server' with your container name if you customized it
docker compose exec ssh-tunnel-server ps aux | grep sshd

# Check sshd logs
docker compose exec ssh-tunnel-server sudo tail -f /var/log/auth.log

# Restart the container
docker compose restart
```

#### Client can't connect via SSH

1. Verify the public key is in `ssh-keys/authorized_keys`
2. Check key permissions (should be 600)
3. Verify the container is exposing port 2222:

```bash
docker compose ps
# Should show 0.0.0.0:2222->22/tcp
```

4. Test SSH connection with verbose output:

```bash
ssh -v -p 2222 -i ~/.ssh/tunnel-client safeuser@<server-ip>
```

5. Check firewall rules on the server

#### Port forwarding not working

1. Verify `GatewayPorts yes` is set in container's sshd_config:

```bash
docker compose exec ssh-tunnel-server sudo grep GatewayPorts /etc/ssh/sshd_config
```

2. Check if the forwarded port is listening:

```bash
# Inside the container
docker compose exec ssh-tunnel-server sudo netstat -tulpn | grep LISTEN
```

3. Verify the reverse tunnel is established (check client logs)

### Client Issues

#### Tunnel connection fails

1. Verify SSH key path is correct in `example_start.sh`
2. Check key permissions (should be 600):

```bash
chmod 600 ~/.ssh/tunnel-client
```

3. Test SSH connection manually:

```bash
ssh -p 2222 -i ~/.ssh/tunnel-client safeuser@<server-ip>
```

4. Check server IP and port are correct
5. Verify network connectivity:

```bash
telnet <server-ip> 2222
```

#### Liveness check failing

1. Verify the client REST API is running on port 4201
2. Check if the liveness endpoint is accessible locally:

```bash
curl http://localhost:4201/liveness
```

3. Verify the port forwarding is working (check server logs)

#### Tunnel keeps disconnecting

1. Check network stability
2. Verify `ServerAliveInterval` is set in SSH config
3. Check server and client logs for errors
4. Verify the renewal mechanism is working

#### Cannot SSH from server to client through tunnel

If you get "Permission denied (publickey)" when trying to SSH from server to client:

1. **Verify the server's public key is in the client's authorized_keys:**
   ```bash
   # On the client
   cat ~/.ssh/authorized_keys | grep server-to-client
   ```

2. **Check key permissions on the client:**
   ```bash
   # On the client
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **Verify you're using the correct private key on the server:**
   ```bash
   # On the server
   ssh -i ~/.ssh/server-to-client -p 2222 <client-username>@localhost
   ```

4. **Check the client's SSH daemon is running and configured correctly:**
   ```bash
   # On the client
   sudo systemctl status ssh
   # Ensure PubkeyAuthentication yes in /etc/ssh/sshd_config
   ```

5. **Test with verbose SSH output to see what's happening:**
   ```bash
   # On the server
   ssh -v -i ~/.ssh/server-to-client -p 2222 <client-username>@localhost
   ```

### General Debugging

#### View server logs

```bash
# Docker (replace 'ssh-tunnel-server' with your container name if customized)
docker compose logs -f ssh-tunnel-server

# Direct
tail -f server/logs/*.log
```

#### View client logs

```bash
tail -f client/logs/*.log
```

#### Test REST API endpoints

```bash
# Server tunnel status
curl http://<server-ip>:4200/tunnel

# Client liveness (from server, via forwarded port)
curl http://localhost:4201/liveness
```

#### Check port status

```bash
# On server
sudo netstat -tulpn | grep LISTEN

# Inside container
docker compose exec ssh-tunnel-server sudo netstat -tulpn | grep LISTEN
```

## Architecture Details

### How It Works

1. **Client establishes reverse SSH tunnel**: Client connects to server's SSH daemon and creates reverse port forwards
2. **Server monitors liveness**: Server polls the forwarded liveness port to ensure client is alive
3. **Client monitors reset signal**: Client polls server's REST API to check if tunnel needs reset
4. **Automatic reconnection**: If either side detects a problem, the client automatically re-establishes tunnels

### Port Forwarding Flow

```
Client Machine                    Server Host                    Docker Container
-----------                      -----------                    ----------------
Port 22 (SSH)  ────────────────>  Port 2222  ────────────────>  Port 22 (sshd)
     │                                                               │
     │                                                               │
     └──[Reverse Tunnel]────────────────────────────────────────────┘
         Port 22 forwarded to Server:2222
```

When someone connects to `server-ip:2222`, they're forwarded through the tunnel to `client-ip:22`.

## License

MIT
