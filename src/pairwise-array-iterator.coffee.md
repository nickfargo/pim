    module.exports =




## PairwiseArrayIterator

    class PairwiseArrayIterator

      constructor: ( @array ) ->
        throw new Error "Odd number of elements" if array.length % 2
        @index  = 0
        @out    = value: [], done: no

      next: ->
        { array, index, out } = this
        throw new Error "Iterator has already finished" if out.done
        if index < array.length
          out.value[0] = array[ index ]
          out.value[1] = array[ index + 1 ]
        else
          out.done = yes
          out.value[0] = undefined
          out.value[1] = undefined
        @index += 2
        out
