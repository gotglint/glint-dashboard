# Design

### Clustering

* node.js CLI
* --master (run as master)
* --force (clear out any existing master)
* --etcd <ip> (ip of etcd host)

* on connect, master checks to see if master already exists; bombs out if it does
* on connect, slaves check to see if master exists; if not, bomb out, if cannot talk, bomb out

### Master/Slave

* protocol
* heuristics

* slave comes online, tells master about itself (cores/memory available)
* job comes in
* master looks at list of slaves, slices job up into pieces
  * pieces = job size / slaves / something to get a small subset
* master sends pieces to slaves for operations, receives back processed information
 along with information about how much memory was used
* master recaculates how much to send to the slaves based on memory available - memory used
* master sends slaves next batch to process

### Remote API