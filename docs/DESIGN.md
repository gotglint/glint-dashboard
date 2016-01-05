# Design

### Clustering

* node.js CLI
* --master (run as master)
* --force (clear out any existing master)
* --etcd <ip> (ip of etcd host)

* on connect, master checks to see if master already exists; bombs out if it does
* on connect, slaves check to see if master exists; if not, bomb out, if cannot talk, bomb out

### Master/Slave

### Remote API