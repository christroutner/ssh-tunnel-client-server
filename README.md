# ssh-tunnel-server-client
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![Coverage Status](https://coveralls.io/repos/github/christroutner/babel-free-koa2-api-boilerplate/badge.svg?branch=unstable)](https://coveralls.io/github/christroutner/babel-free-koa2-api-boilerplate?branch=unstable) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Greenkeeper badge](https://badges.greenkeeper.io/christroutner/koa-api-boilerplate.svg)](https://greenkeeper.io/)

This repository is forked from [koa-api-boilerplate](https://github.com/christroutner/koa-api-boilerplate).

This repository is a bit of a mono-repo:
 - The [client](./client) directory contains a REST API that sets up two or more SSH tunnels with the server. These tunnels are maintained through communication between the Client and the Server.
 - The [server](./server) directory also contains a REST API. This is expected to be run on a 'server' with a fixed IP4 address.

## Requirements
* node __^14+__
* npm __^8+__


## License
MIT
