    HashMapNode       = require './hash-map-node'
    HashMapCollision  = require './hash-map-collision'



    module.exports =




## HashMapIterator

    class HashMapIterator


### Constructor

* `hashMap` : `HashMap` — The collection over which to iterate.

* `mapFn`*<sub>opt</sub>* : function — A mapping function to be applied lazily
  to the iterator’s output `value` on each call to `next`.

      constructor: ( @hashMap, @mapFn ) ->
        @node        = hashMap.root
        @index       = 0
        @nodeStack   = []
        @indexStack  = []
        @pair        = []
        @out         = value: @pair, done: no



### Methods


#### next

      next: ->
        { hashMap, mapFn, node, index, nodeStack, indexStack, pair, out } =
          this

        throw new Error "Iteration has already finished" unless node?

        loop
          { table } = node
          if index < table.length
            k = table[ index ]
            v = table[ index + 1 ]
            if v instanceof HashMapNode or v instanceof HashMapCollision
              nodeStack.push node
              indexStack.push index + 2
              node = v
              index = 0
            else
              if mapFn?
                out.value = mapFn v, k, hashMap
              else
                pair[0] = k
                pair[1] = v
              index += 2
              break
          else
            if node = nodeStack.pop()
              index = indexStack.pop()
            else
              pair[0] = undefined
              pair[1] = undefined
              out.value = pair
              out.done = yes
              break

        @node = node
        @index = index
        out


#### reset

Cancels any pending iteration.

      reset: ( @hashMap ) ->
        @node               = hashMap.root
        @index              = 0
        @nodeStack.length   = 0
        @indexStack.length  = 0
        @pair.length        = 0
        @out.value.length   = 0
        @out.done           = no
        this
