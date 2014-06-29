    module.exports =




## HashMapCollision

A `HashMapCollision` is a terminal node in a `HashMap` that represents a
**collision list** of alternating `... key, value, ...` pairs, where all of the
keys contained therein share a single  **common hash**.

The containing parent `HashMapNode` slot stores the integer value of the common
hash and the `HashMapCollision` together as a pair of adjacent elements in the
parent `HashMapNode`’s `table`.

Operations over the collision list are linear-time.

    class HashMapCollision

      constructor: ( @table ) ->

      copy: -> new HashMapCollision @table.slice()

      indexOf: ( key ) ->
        return unless table = @table
        i = 0; while i < table.length
          return i if table[i] is key
          i += 2
        return

      add: ( key, value ) ->
        table = @table ?= []
        if ( i = @indexOf key )?
          table[ i + 1 ] = value
          0
        else
          table.push key, value
          1

      remove: ( key ) ->
        table = @table
        length = table.length

        # never allow a collision to contain fewer than two pairs
        throw new RangeError if length < 6

        if ( index = @indexOf key )?
          lastIndex           = length - 2
          table[ index ]      = table[ lastIndex ]
          table[ index + 1 ]  = table[ lastIndex + 1 ]
          table.length        = lastIndex
          1
        else
          0
