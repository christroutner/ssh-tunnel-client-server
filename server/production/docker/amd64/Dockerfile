# Dockerfile for SSH Tunnel Server
# This container runs both the Node.js REST API and sshd to jail client connections

FROM ubuntu:20.04
MAINTAINER Chris Troutner <chris.troutner@gmail.com>

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update the OS and install packages
RUN apt-get update && \
    apt-get install -y sudo git curl nano gnupg wget openssh-server && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x
RUN curl -sL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh && \
    bash nodesource_setup.sh && \
    apt-get install -y nodejs build-essential && \
    rm nodesource_setup.sh && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create the user 'safeuser' and add them to the sudo group
RUN useradd -ms /bin/bash safeuser && \
    adduser safeuser sudo && \
    echo 'safeuser:abcd8765' | chpasswd

# Create SSH directory structure for safeuser
RUN mkdir -p /home/safeuser/.ssh && \
    chmod 700 /home/safeuser/.ssh && \
    chown -R safeuser:safeuser /home/safeuser/.ssh

# Configure sshd (run as root to generate host keys)
RUN mkdir -p /var/run/sshd && \
    ssh-keygen -A && \
    chmod 755 /var/run/sshd

# Configure sshd_config for reverse port forwarding
RUN sed -i 's/#GatewayPorts no/GatewayPorts yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config && \
    sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config && \
    sed -i 's/#AllowTcpForwarding yes/AllowTcpForwarding yes/' /etc/ssh/sshd_config && \
    echo "PermitTunnel no" >> /etc/ssh/sshd_config && \
    echo "StrictModes yes" >> /etc/ssh/sshd_config

# Set working directory
WORKDIR /home/safeuser

# Copy the entire repository (build context should be set to repo root)
# The build context in docker-compose should be set to the repository root
COPY --chown=safeuser:safeuser . ./ssh-tunnel-server

# Set working directory to server root
WORKDIR /home/safeuser/ssh-tunnel-server/server

# Install Node.js dependencies
RUN npm install

# Generate API docs (if the script exists)
RUN npm run docs 2>/dev/null || true

# Create keys directory
RUN mkdir -p /home/safeuser/keys && \
    chown -R safeuser:safeuser /home/safeuser/keys

# Configure sudo to allow safeuser to run sshd without password
RUN echo "safeuser ALL=(ALL) NOPASSWD: /usr/sbin/sshd" >> /etc/sudoers && \
    echo "safeuser ALL=(ALL) NOPASSWD: /usr/bin/ssh-keygen" >> /etc/sudoers && \
    echo "safeuser ALL=(ALL) NOPASSWD: /bin/kill" >> /etc/sudoers

# Switch to safeuser
USER safeuser

# Create volume for SSH keys (authorized_keys will be mounted here)
VOLUME /home/safeuser/.ssh

# Create volume for application keys
VOLUME /home/safeuser/keys

# Expose ports:
# 22 - SSH daemon (will be mapped to 2222 on host)
# 4200 - REST API (configurable via PORT env var)
# 2222, 4201 - Forwarded ports from client
EXPOSE 22 4200 2222 4201

# Copy startup script (build context is repo root, so path is relative to that)
COPY --chown=safeuser:safeuser server/production/docker/amd64/start-production.sh ./start-production.sh
RUN chmod +x ./start-production.sh

# Start the application (which will also start sshd)
CMD ["./start-production.sh"]
