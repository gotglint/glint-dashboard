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


### How Reduce Works

Given a start of 0, and an array of [1 .. 4], and a reduction function of (x, y) => { return x + y; }, the reduce would do as follows:

var a (1) = return 0 + 1;
var b (3) = return a (1) + 2;
var c (6) = return b (3) + 3;
var d (10) = return c (6) + 4;
return d (10);

Distributed, just do:

```
for (var i = 0; i < that.options.maxWorkers && i < Math.floor(that.data.length / 2) ; ++i) {
  ++runningWorkers;
  that._spawnReduceWorker([that.data[i * 2], that.data[i * 2 + 1]], cb, done, env);
}
```

### Job Distribution

Split the job up across operations where you can run all operations up to a reduction, wait for all operations to complete to get the full set of data for the reduction, then submit the reduction across the network.

Thus, if the job was:

map
filter
reduce
sum

The nodes could run the first two jobs in parallel, collect the results, feed the results into a reduction, then run the sum in parallel again.
