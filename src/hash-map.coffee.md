    Node           = require './hash-map-node'
    Collision      = require './hash-map-collision'
    Iterator       = require './hash-map-iterator'


    {
      uid
      hashOf
      populationOf
      typeOf
      valueOf
      iteratorOf
      pairwiseIteratorOf
      base32
      base32p
      bin32p
      hex32p
      format
      formatWithHashes
      formatWithHashesInBase32
      print
    } =
      require './helpers'




    module.exports =



## HashMap

    class HashMap


### Constructor

      constructor: ( source ) ->
        @__hash__  = uid()

        if source?.size > 0
          @size    = source.size
          @bitmap  = source.bitmap
          @root    = new Node source.root.table.slice()
        else
          @size    = 0
          @bitmap  = 0
          @root    = new Node []



### Private functions


#### tableIndexFrom

Returns the condensed actual index of a `HashMapNode` `table`, given a sparse
logical `index` and the node’s associated `bitmap` integer.

      tableIndexFrom = ( index, bitmap ) ->
        return unless bitmap & 1 << index
        i = ( populationOf bitmap & -1 >>> ( ~index & 31 ) ) - 1
        i + i


#### insert

Bounds-checking wrap of `splice`. A `HashMapNode` `table` must never contain
more than 32 pairs of elements.

      insert = ( intoTable, position, key, value ) ->
        unless intoTable.length < 63
          throw new Error "Table overflow"
        intoTable.splice position, 0, key, value
        return


#### accrete

Returns a new or provided `target` `HashMap` that stores the key-value pairs of
`source`, plus any additional or overwritten `key`-`value` pairs, provided as
an `iterable` sequence, where `iterable` may take any form from among:

  * a **generator** or other function that returns an **iterator**
  * a `HashMap` or other object that conforms to the standard Iterator protocol
  * an already instantiated iterator
  * an array or array-like object of alternating `... key, value ...` elements

The returned `target` retains all of the data it shares with `source`, but with
minimal duplication, and with no retained reference to `source` itself. The
original `source` may therefore be released and GC’d anytime later, as will be
any of its internal data structures no longer in use, while `target`, and any
other `HashMap` previously `associate`d with `source`, lives on independently.

      accrete = ( source, iterable, target = new HashMap source ) ->
        size      = target.size
        source    = null unless source?.size > 0
        iterator  = pairwiseIteratorOf iterable

The outer **iterator loop** processes each of the iterant key-value pairs to be
associated with `this` `HashMap`.

        loop
          { done, value:pair } = iterator.next()
          break if done

          [ key, value ] = pair

          if source?
            sourceBitmap  = source.bitmap
            sourceNode    = source.root

          targetBitmap  = target.bitmap
          targetNode    = target.root
          hash          = hashOf key
          bitshift      = 0

The inner **descent loop** situates the iterant pair into the `target` trie,
using successive five-bit `hashSegment`s from the `hash` of the iterant `key`
to guide the descent.

          loop
            throw new Error "bitshift overflow" if bitshift > 30

            targetParentTable  = targetTable
            targetParentIndex  = targetIndex
            targetTable        = targetNode.table
            hashSegment        = hash >>> bitshift & 31
            slotIndexBit       = 1 << hashSegment

Examine the **slot** of the current `targetNode` into which the iterant pair
will be inserted. This slot will contain either nothing, a `HashMapNode`, a
`HashMapCollision`, or a key-value pair.

* **Empty** — Insert the iterant pair directly.

            if ( targetBitmap & slotIndexBit ) is 0
              targetBitmap |= slotIndexBit

              if bitshift is 0
              then target.bitmap = targetBitmap
              else targetParentTable[ targetParentIndex ] = targetBitmap

              targetIndex = tableIndexFrom hashSegment, targetBitmap
              insert targetTable, targetIndex, key, value
              size++
              break

> For remaining cases, the examined slot will be occupied. Identify its
> contents before proceeding further.

            else
              targetIndex  = tableIndexFrom hashSegment, targetBitmap
              targetKey    = targetTable[ targetIndex ]
              targetValue  = targetTable[ targetIndex + 1 ]

* **Node** — If the source and target slots are identical, then replace the
`Node` with a shallow replication of the `Node`. (If the slots are not
identical, then the target slot `Node` must be a previously created replication
of the source slot `Node`.) Descend via the newly or already replicated `Node`.

              if targetValue instanceof Node
                if sourceNode?
                  sourceTable  = sourceNode.table
                  sourceIndex  = tableIndexFrom hashSegment, sourceBitmap
                  sourceKey    = sourceTable[ sourceIndex ]
                  sourceValue  = sourceTable[ sourceIndex + 1 ]

                  if sourceValue is targetValue
                    targetValue = sourceValue.copy()
                    targetTable[ targetIndex + 1 ] = targetValue

                  sourceBitmap  = sourceKey
                  sourceNode    = sourceValue

                bitshift     += 5
                targetBitmap  = targetKey
                targetNode    = targetValue

* **Collision** — If the source and target slots are identical, then replace
the target `Collision` with a new `Collision` whose `table` is a whole-`slice`
copy of the original `Collision`’s `table`. If the `Collision` hash and iterant
key hash are identical, then add the iterant pair to the target `Collision`;
otherwise overwrite the slot with a new `Node` containing the `Collision`, and
descend via that `Node`.

              else if targetValue instanceof Collision
                if sourceNode?
                  sourceTable  = sourceNode.table
                  sourceIndex  = tableIndexFrom hashSegment, sourceBitmap
                  sourceKey    = sourceTable[ sourceIndex ]
                  sourceValue  = sourceTable[ sourceIndex + 1 ]

                  if sourceValue is targetValue
                    targetValue = sourceValue.copy()
                    targetTable[ targetIndex + 1 ] = targetValue

                if targetKey is hash
                  size += targetValue.add key, value
                  break

                else
                  sourceNode    = null
                  bitshift     += 5
                  targetBitmap  = 1 << ( targetKey >>> bitshift )
                  targetNode    = new Node [ targetKey, targetValue ]

                  targetTable[ targetIndex ]      = targetBitmap
                  targetTable[ targetIndex + 1 ]  = targetNode

* **Pair** — If the resident key and iterant key are identical, then overwrite
the slot with the iterant value. Otherwise if the resident key hash and iterant
key hash are identical, then overwrite the slot with a new `Collision`
containing both the resident and iterant pairs. Otherwise overwrite the slot
with a new `Node` containing the resident pair, and descend via that `Node`.

              else
                if key is targetKey
                  targetTable[ targetIndex + 1 ] = value
                  break

                targetHash = hashOf targetKey

                if hash is targetHash
                  targetTable[ targetIndex ]      = hash
                  targetTable[ targetIndex + 1 ]  = \
                    new Collision [ targetKey, targetValue, key, value ]
                  size++
                  break

                else
                  sourceNode    = null
                  bitshift     += 5
                  targetBitmap  = 1 << ( targetHash >>> bitshift )
                  targetNode    = new Node [ targetKey, targetValue ]

                  targetTable[ targetIndex ]      = targetBitmap
                  targetTable[ targetIndex + 1 ]  = targetNode

Finished.

        target.size = size
        target



### Class functions


#### create

      @create = -> accrete null, arguments


#### from

      @from = ( iterable ) -> accrete null, iterable



### Methods


#### __iterator__

      __iterator__: ( mapFn ) -> new Iterator this, mapFn


#### retrieve

      retrieve: ( key, alternative ) ->
        bitmap = @bitmap
        node = @root
        hash = hashOf key

Use `hash` to descend the tree. If this leads to an empty slot then `this` hash
map does not contain `key`, so return the `alternative`.

        loop
          index = tableIndexFrom hash, bitmap
          return alternative unless index?

          table = node.table
          k = table[ index ]
          v = table[ index + 1 ]

A `Node` exists here. Continue descending.

          if v instanceof Node
            bitmap = k
            node = v
            hash >>>= 5
            continue

A `Collision` list exists here. Search it and return.

          else if v instanceof Collision
            table = v.table
            index = 0
            while index < table.length
              if table[ index ] is key
              then return table[ index + 1 ]
              else index += 2
            return alternative

A single key-value pair exists here. Match and return.

          else
            return if k is key then v else alternative


#### get

      get: @::retrieve


#### has

      has: do ( alt = {} ) -> ( key ) -> alt isnt @retrieve key, alt


#### associate

Returns a new `HashMap` that contains the key-value pairs of `this`, plus any
key-value pairs to be added or overwritten. Pairs may be provided either as an
`iterable`, such as another `HashMap`, a generator function, or anything else
that conforms to the standard Iterator protocol, which yields in its `value`
field successive `[ key, value ]` pairs as a two-element array; or as an array,
array-like, or argument list whose elements are alternating keys and values.

      associate: ( iterable ) ->
        if arguments.length > 1
          accrete this, arguments
        else
          accrete this, iterable


#### equals

      equals: do ( alt = {} ) -> ( other ) ->
        return yes if other is this
        return no unless other?.size is @size and
          typeof other.retrieve is 'function'
        iterator = @__iterator__(); loop
          { done, value:[ key, value ] } = iterator.next()
          return yes if done
          otherValue = other.retrieve key, alt
          return no if otherValue is alt
          return no unless otherValue is value or value?.equals? otherValue


#### toString

      toString: do ( pairs = [] ) -> ( options ) ->
        formatFn =
          if options?.hashes
            if options?.base32
            then formatWithHashesInBase32
            else formatWithHashes
          else format
        iterator = @__iterator__(); loop
          { done, value:[ key, value ] } = iterator.next()
          break if done
          pairs.push "<#{ formatFn key }, #{ formatFn value }>"
        result = "{ #{ pairs.join ' ' } }"
        pairs.length = 0
        result


#### keys

Returns an iterator over the keys of `this`.

      keys: do ( fn = ( v, k ) -> k ) -> -> @__iterator__ fn


#### values

Returns an iterator over the values of `this`.

      values: do ( fn = ( v ) -> v ) -> -> @__iterator__ fn


#### keysArray

Returns an array containing the keys of `this`.

      keysArray: ->
        result = []; iterator = @__iterator__(); loop
          { done, value:[ key ] } = iterator.next()
          break if done
          result.push key
        result


#### valuesArray

Returns an array containing the values of `this`.

      valuesArray: ->
        result = []; iterator = @__iterator__(); loop
          { done, value:[ value ] } = iterator.next()
          break if done
          result.push value
        result


#### count

Iteratively counts the number of key-value pairs in the hash map. This result
should be invariant with the value of `this.size`.

      count: ->
        count = 0; iterator = @__iterator__(); loop
          break if iterator.next().done
          count++
        count


#### filter

      filter: ( predicate, context ) ->
        result = new HashMap
        iterator = @__iterator__(); loop
          { done, value:pair } = iterator.next()
          break if done
          [ key, value ] = pair
          if predicate.call context, value, key, this
            accrete null, pair, result
        result


#### remove

      remove: ( predicate, context ) ->
        @filter ( -> not predicate.apply this, arguments ), context


#### forEach

      forEach: ( fn, context ) ->
        iterator = @__iterator__(); loop
          { done, value:[ key, value ] } = iterator.next()
          return if done
          fn.call context, value, key, this


#### map

      map: ( fn, context ) ->
        result = new HashMap
        iterator = @__iterator__(); loop
          { done, value:pair } = iterator.next()
          break if done
          if pair = fn.call context, pair.value, pair.key, this
            accrete null, pair, result
        result


#### reduce

      reduce: ( fn, seed, context ) ->
        iterator = @__iterator__()
        if seed?
          result = seed
        else
          { done, value:[ key, value ] } = iterator.next()
          return if done
          result = value
        loop
          { done, value:[ key, value ] } = iterator.next()
          break if done
          result = fn.call context, result, value, key, this
        result



### Diagnostics


#### print

      print: do ->
        indent = ( indentation = 0, whitespace = '  ' ) ->
          out = ''; i = 0; out += whitespace while i++ < indentation
          out

        printNode = ( bitmap, node, indentation = 0 ) ->
          { table } = node
          out = "Node (##{ base32p bitmap }) (#{ bin32p bitmap })\n"
          indentation += 1; slotIndex = 0; while slotIndex < 32
            if ( index = tableIndexFrom slotIndex, bitmap )?
              out += "#{ indent indentation }##{ base32 slotIndex } "
              key    = table[ index ]
              value  = table[ index + 1 ]
              if value instanceof Node
                out += printNode key, value, indentation + 1
              else if value instanceof Collision
                out += printCollision key, value
              else
                out += printPair key, value
            slotIndex++
          out

        printCollision = ( hash, collision ) ->
          { table } = collision
          pairs = for key, index in table by 2
            value = table[ index + 1 ]
            "#{ valueOf key } #{ valueOf value }"
          "Collision (##{ base32p hash }) { #{ pairs.join ', ' } }\n"

        printPair = ( key, value ) ->
          "Pair (##{ base32p key.__hash__ }) <#{ valueOf key }, #{ valueOf value }>\n"

        -> printNode @bitmap, @root
