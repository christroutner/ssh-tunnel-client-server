# ssh-tunnel-server-client
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![Coverage Status](https://coveralls.io/repos/github/christroutner/babel-free-koa2-api-boilerplate/badge.svg?branch=unstable)](https://coveralls.io/github/christroutner/babel-free-koa2-api-boilerplate?branch=unstable) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Greenkeeper badge](https://badges.greenkeeper.io/christroutner/koa-api-boilerplate.svg)](https://greenkeeper.io/)

This repository is forked from [koa-api-boilerplate](https://github.com/christroutner/koa-api-boilerplate).

This repository is a bit of a mono-repo:
 - The [client](./client) directory contains a REST API that sets up two or more SSH tunnels with the server. These tunnels are maintained through communication between the Client and the Server.
 - The [server](./server) directory also contains a REST API. This is expected to be run on a 'server' with a fixed IP4 address.

This software is used for two reasons:
- To create an SSH tunnel between a Client and Server. This allows a server administrator to open an SSH terminal to the client, for the purpose of remote adminstration. This software can open this SSH tunnel without the (non-technical) owner of the client needing to do setup or configure any special networking. These kinds of SSH tunnels must be *initiated* by the client.
- To forward network ports from the Client to the Server. This allows the Client to offer *services* through the Server, without the Client having a fixed IP address.

By default these are the features and ports used:
- The client forwards ports 22 and 4201 to the server.
- The server presents the forwarded ports at 2222 and 4201.
- The server polls port 4201 every 2 minutes to ensure the client is still alive and responsive.
- The client polls port 4200 on the server, to see if in needs to reset its SSH tunnel.

The bi-directional information between Client and Server ensure that the tunnels are renewed whenever it gets disconnected. Additional ports can be forwarded, it's not limited to just the two illustrated above.

This allows the operator of the Server to enter the Docker container like this:
- `docker exec -it ssh-tunnel-server bash`

From there, they can open an SSH tunnel to the Client like this:
- `ssh <user>@localhost -p 2222`

## Security Architecture

When the server runs in Docker (recommended), the SSH daemon runs inside the container. This ensures that:
- Client SSH connections are jailed inside the Docker container
- Clients cannot access the server host system
- Admin access to the host remains separate (via host's SSH on port 22)
- Client access is restricted to the container environment (via container's SSH on port 2222)

## Requirements

### Server
* Docker and Docker Compose (for containerized deployment)
* OR Node.js ^20+ and npm ^10+
* Ubuntu Linux (recommended)

### Client
* Node.js ^20+
* npm ^10+
* SSH client
* Ubuntu Linux (recommended)

## SSH Key Generation

### On the Client Machine

1. Generate an SSH key pair for the tunnel connection:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/tunnel-client -N ""
```

2. This creates two files:
   - `~/.ssh/tunnel-client` - Private key (keep this secure, never share)
   - `~/.ssh/tunnel-client.pub` - Public key (this will be added to the server)

3. Copy the public key to the server.

```bash
scp ~/.ssh/tunnel-client.pub <user>@<server ip>:/home/<user>/
```

### On the Server Machine

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

## Server Setup

### Prerequisites

1. Install Docker and Docker Compose on the server
  - `curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh`
  - `sudo usermod -aG docker ${USER}`
2. Clone this repository on the server
3. Ensure the server has a fixed IP4 address

### Initial Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Create the SSH keys directory in the same directory as the `docker-compose.yml` file:

```bash
mkdir -p ssh-keys
chmod 700 ssh-keys
```

3. Add the client's public key to authorized_keys:

```bash
# Option 1: Use the helper script
# This uses the public key file copied in an earlier step.
./add-client-key.sh ~/tunnel-client.pub

# Option 2: Manually
echo "ssh-ed25519 AAAA..." >> ssh-keys/authorized_keys
chmod 600 ssh-keys/authorized_keys
```

4. Create necessary directories in the same directory as the `docker-compose.yml` file:

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

# Server Configuration - Replace the IP address with your own server
SERVER_IP=5.161.134.113

# Additional Port Forwarding (optional)
# CLIENT_ADD_PORTS=9650,9651
# SERVER_ADD_PORTS=9650,9651
```

**Note:** The `.env` file is automatically loaded by Docker Compose. You can also set these variables as environment variables before running `docker compose` commands.

6. Build and start the container:

```bash
docker compose build
docker compose up -d
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


## Client Setup

### Prerequisites

1. Node.js ^20+ and npm ^10+ installed
2. SSH key pair generated (see SSH Key Generation section above)
3. Network access to the server
4. **Server-to-client SSH key set up** (see "On the Server Machine" section above) - This allows the server to SSH into the client through the tunnel

#### SSHD Configuration

The Client requires its SSH daemon to have some non-default configuration changes.

1. First of all, the client needs SSH daemon installed. This can be found in the *openssh-server* package:
  - `sudo apt install openssh-server`

2. Edit the configuration:
  - `sudo nano /etc/ssh/sshd_config`

3. Ensure the sshd_config file has the following settings:
  - `PubkeyAuthentication yes`
  - `GatewayPorts yes`

4. Restart and configure SSH to start on reboot:
  - `sudo systemctl restart ssh` - Reload the config file
  - `sudo systemctl enable ssh` - Ensure SSH daemon starts after reboot


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
chmod +x example_client_start.sh
```

5. Start the client:

```bash
./example_client_start.sh
```

After verifying the SSH tunnel is established and being renewed reliably, the client software is usually managed by [PM2](https://www.npmjs.com/package/pm2) to ensure it is re-started after system reboots.


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


3. Verify the liveness check is working (server should poll port 4201)

## Port Configuration

### Default Ports

- **Port 22 (client)**: Client's SSH port, forwarded to server
- **Port 2222 (server host)**: Container's SSH daemon (client connects here)
- **Port 4200 (server)**: Server REST API
- **Port 4201 (client)**: Client liveness/health check endpoint

## Troubleshooting

### Check Server App Is Available

From a terminal on the client, run this command:

- `curl http://<server IP>:4200/tunnel`

If that does not return a result (true or false), then it means the Client is not able to connect to the Server. Either the Server is not running the software or the Client is experiencing a networking issue.

### Check if Client liveness port is forwarded

Enter the Docker container on the Server:

- `docker exec -it <container name> exec`

Check if the liveness endpoint on the Client has been successfully port forwarded to the Server:

- `curl http://localhost:4201/liveness`

If the endpoint does not return a result (true or false), then it means the Client is not able to forward its liveness port

### Check if Client can SSH into Server

From the Client terminal, try to connect to the Docker container on the Server:

- `ssh -p 2222 -i ~/.ssh/tunnel-client safeuser@<server IP>`

If you can not open a terminal, the SSH port was not successfully forwarded. This test will also alert you to issues with the SSH identities, which will change and cause a connection issue when the Docker container is rebuilt.



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
