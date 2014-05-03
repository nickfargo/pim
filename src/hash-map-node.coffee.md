    module.exports =




## HashMapNode

Internal `HashMap` trie node. A node contains 32 **slots**, each of which may
be empty or occupied, where slots are represented as adjacent pairs of elements
in the `table` array. The `table` array is densely packed so as to allocate
space only for slots that are occupied. An occupied slot may hold either:

  * a child `HashMapNode`, paired with its associated **bitmap**
  * a terminal `HashMapCollision` list, paired with its **common hash**
  * a terminal key-value **pair**

Each `HashMapNode` is associated with a 32-bit integer bitmap, which encodes
the slot indices relative to their packed index order in `table`. The bitmap
and its corresponding `HashMapNode` together occupy a slot in the node’s parent
`HashMapNode`, as adjacent elements in the parent’s `table` array.

    class HashMapNode
      constructor: ( @table ) ->

      copy: -> new HashMapNode @table.slice()
