
    __throw_iterator_finished__ = ->
      throw new Error "Iterator has already finished"

    __assert_unfinished__ = ( iteratorOutput ) ->
      do __throw_iterator_finished__ if iteratorOutput.done


    class IteratorOutput
      constructor: ( @value ) -> @done = no


#### ArrayIterator

    class ArrayIterator
      constructor: ( @array ) ->
        @index = 0
        @out = new IteratorOutput

      next: ->
        { array, index, out } = this
        __assert_unfinished__ out
        if index < array.length
          out.value = array[ index ]
        else
          out.value = undefined
          out.done = yes
        @index += 1
        out


#### PairwiseArrayIterator

    class PairwiseArrayIterator
      constructor: ( @array ) ->
        throw new Error "Odd number of elements" if array.length % 2
        @index = 0
        @out = new IteratorOutput []

      next: ->
        { array, index, out } = this
        __assert_unfinished__ out
        if index < array.length
          out.value[0] = array[ index ]
          out.value[1] = array[ index + 1 ]
        else
          out.value[0] = undefined
          out.value[1] = undefined
          out.done = yes
        @index += 2
        out




    module.exports = {
      ArrayIterator
      PairwiseArrayIterator
    }
