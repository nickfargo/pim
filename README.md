## pim.js

Fast persistent immutable data structures.


#### Installation

Get it via **[npm](https://www.npmjs.org/)**:

```sh
$ npm install pim
```

and use it in **Node** or any other CommonJS environment:

```js
var pim = require('pim');
var HashMap = pim.HashMap;
```

Or clone the repository, install its `devDependencies`, and run the test suite:

```sh
$ git clone git@github.com:nickfargo/pim.git
$ cd pim
$ npm install
$ npm test
```

Optionally create standalone `pim.js` and `pim.min.js` files for use in the browser:

```sh
$ npm run build
$ ls bundles
```


### Features


#### HashMap

Bagwellian **hash array-mapped trie**, with:

  * Persistence via implicit path-copying / reference-sharing, à la **Clojure**
  * Lazy sequential operations via standard ES6 `Iterator` protocol
  * Deep value-equality checking via `equals`
  * Unrestricted key types
  * Near constant time **O(log<sub>32</sub>*n*)** `retrieve` and `accrete` operations
  * Familiar higher-order functions, e.g. `filter`, `map`, `reduce`



### History


#### v0.0.0

Preliminary benchmarks indicate performance gains of **2–7X** for `accrete`-based operations (e.g. `create`, `associate`) compared to equivalent ClojureScript operations (via **[mori.js][]**).

Preliminary V8 heap profiling indicates space efficiency gains for `HashMap` over a range of approximately **0.5–8.0X**, depending on collection size and hash distribution, compared to an identical hash map in cljs/mori.

  * `HashMap`

Compared to cljs/mori, heap allocation efficiency for `HashMap` may be expected to regress by some factor less than **2X** for certain generational cases, namely those yielded over the course of many `assoc`iation/`dissoc`iation operations.

  * The regressive effect described is due to the exclusive definition of a single `HashMapNode` type which bears a pairwise array of maximum length 64, as opposed to the definition of two distinct classes, `BitmapIndexedNode` for internal nodes, which bears a max-32 array of nodes, and `ArrayNode` for terminal nodes, which bears a pairwise max-64 array of key-value pairs.

  * From this distinction it follows that replication of any given `HashMapNode` then redundantly duplicates the bitmap integers associated with any child nodes. As density increases, node replication may thus incur up to twice the memory cost compared to cljs/mori.

  * It is possible that such regression may be mitigated overall, in part or in whole, as a consequence of the generally shorter trie height that results from storing pairs directly within `HashMapNode`.

  * This regressive effect is expected, but as yet neither confirmed nor tested.

##### Likely features for next release

  * Removal / `dissociate`
  * Derivative structures `Vector`, `Set`






* * *

### &#x1f44b;




[mori.js]: http://swannodette.github.io/mori/
