* zeromq for messaging between nodes
* horse + koa.js for server

`forever --minUptime 5000ms --spinSleepTime 5000ms forever-development.json`

### Ubuntu Notes

Since the tests use `inproc` to connect the master and slave(s), you have to make sure you are using the most recent version of ZeroMQ:

```
add-apt-repository ppa:chris-lea/libsodium
add-apt-repository ppa:chris-lea/zeromq
apt-get update
apt-get install -y libzmq5-dev
```
