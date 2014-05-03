    { HashMap } = require './'
    { writeSnapshot } = require 'heapdump'
    { HeapDiff, gc } = memwatch = require 'memwatch'


    justL = (s) -> ( s + '                ' ).slice 0, 16
    justR = (s) -> ( '                ' + s ).slice -16
    justD = (n) ->
      return unless match = /(\-?\d+)(?:\.(\d+))?/.exec "#{n}"
      [ _, num, frac ] = match
      "#{justR num}.#{justL frac or 0}"

    print = -> console.log.apply console, arguments

    report = ( n, title, duration, speed = n * 1000 / duration ) ->
      print justL(title), justR(duration), justD( ( speed|0 ) / 1000 )




    0 and
    do ->
      debugger

      0 and
      do ->
        hm = HashMap.create 'a', 1, 'b', 2, 'abc', 3, 97, 4
        throw new Error unless hm.retrieve('abc') is 3
        throw new Error unless hm.retrieve(97) is 4
        # print hm.toString hashes: yes, base32: yes

      0 and
      do ->
        hm = HashMap.create 1121, 5
        throw new Error unless hm.retrieve(1121) is 5

      hm = HashMap.create 'a', 1, 'b', 2, 'a', 3, 'c', 4, 97, 5, {}, 6, (->), 7
      print hm.retrieve('a'), hm.root.table
      throw new Error unless hm.retrieve('a') is 3


      hm = HashMap.create 0.1, 1, 0.2, 2, 3, 3, {}, 4, [], 5, (->), 6, hm, 7

      hmf = hm.filter ( v, k ) -> typeof k is 'number'
      # print hmf.toString()

      hmm = hm.map ( v, k ) -> [ "mk_#{k}", "mv_#{v}" ]
      # print hmm.toString()

      hmr = hm.reduce ( p, v, k ) -> p + v
      throw new Error unless hmr is 28
      # print hmr.toString()

      hmmm = hm.associate hmm
      print hmmm.toString()
      print hm.size, hmm.size, hmmm.size
      f = ( v, k ) -> throw "XXX" unless v is hmmm.get k
      hm.forEach f
      hmm.forEach f

      0 and
      do ->
        HashMap::invert = do ->
          array = Array 2
          fn = ( value, key ) -> array[0] = value; array[1] = key; array
          -> @map fn

        hm = HashMap.create a = {}, b = {}, b, c = {}, c, a, d = {}, a
        hmi = hm.invert()
        # print hm.toString hashes: yes, base32: yes
        # print hmi.toString hashes: yes, base32: yes



perf!

    perform = ( fn ) ->
      1 and fn 5000, 1

      0 and for i in [4..15]
        fn 1 << i, 1 << 19 - i

      0 and for i in [2..6]
        fn Math.pow( 6, i ), Math.pow( 6, 8 - i )

      0 and for i in [1..5]
        fn Math.pow( 10, i ), Math.pow( 10, 6 - i )

    1 and
    do ->
      _ = require 'underscore'
      { get, hash_map, assoc, into } = mori = require 'mori'

      print '\n'
      print justL('struct'), justR('duration (ms)'), '    '+justR('ops (kHz)')
      print '————————————————', '————————————————', '————————————————————'

      0 and
      do ->
        n = 100000

        do ->
          i = 0; t = Date.now(); while i++ < n
            hm = a: 1, b: 2, abc: 3, '97': 4, '1121': 5
            # hm['1121']
          report n, "Object (native)", Date.now() - t

        if Map? then do ->
          i = 0; t = Date.now(); while i++ < n
            m = new Map
            m.set 'a', 1
            m.set 'b', 2
            m.set 'abc', 3
            m.set 97, 4
            m.set 1121, 5
            # m.get 1121
          report n, "Map (ES6)", Date.now() - t

        pairs = [ 'a', 1, 'b', 2, 'abc', 3, 97, 4, 1121, 5 ]

        do ->
          i = 0; t = Date.now(); while i++ < n
            debugger
            hm = HashMap.from pairs
            # hm.retrieve 1121
          report n, "HashMap", Date.now() - t

        do ->
          i = 0; t = Date.now(); while i++ < n
            mhm = hash_map.apply null, pairs
            # get hm, 1121
          report n, "mori.hash_map", Date.now() - t


      0 and perform ( m, n ) ->
        print "Creation (#{m} pairs, #{n} iterations)"

        pairs = ( {} for i in [0...2*m] )
        results = []

        do -> try
          i = 0; t = Date.now(); while i++ < n
            hm = HashMap.from pairs
          report n, "HashMap", results[0] = Date.now() - t

        do -> try
          i = 0; t = Date.now(); while i++ < n
            mhm = hash_map.apply null, pairs
          report n, "mori.hash_map", results[1] = Date.now() - t

        print "perf ratio: #{ results[1] / results[0] }\n"


      0 and perform ( m, n ) ->
        print "Retrieval (#{m} pairs, #{n} iterations)"

        pairs = ( {} for i in [0...2*m] )
        results = []

        do ->
          hm = HashMap.from pairs
          i = 0; t = Date.now(); while ++i < n
            j = 0; while j < pairs.length
              hm.retrieve pairs[j]
              j += 2
          report n * pairs.length, "HashMap", results[0] = Date.now() - t

        do ->
          mhm = hash_map.apply null, pairs
          i = 0; t = Date.now(); while ++i < n
            j = 0; while j < pairs.length
              get mhm, pairs[j]
              j += 2
          report n * pairs.length, "mori.hash_map", results[1] = Date.now() - t

        print "perf ratio: #{ results[1] / results[0] }\n"


      1 and perform ( m, n ) ->
        print "Association (#{m} pairs, #{n} iterations)"

        oldPairs = ( {} for i in [0...m] )
        newPairs = ( {} for i in [0...m] )
        allPairs = oldPairs.concat newPairs

        0 and
        do ->
          debugger
          hm0 = HashMap.from oldPairs
          hm00 = hm0.associate hm0
          throw new Error "Cardinality" unless hm0.count() is hm00.count()
          #print hm00.print()

          hm1 = HashMap.from newPairs
          hm2 = hm0.associate hm1

          do ->
            i = 0; while i < allPairs.length
              key    = allPairs[ i ]
              value  = allPairs[ i + 1 ]
              unless hm2.retrieve( key ) is value
                throw new Error "All pairs not accounted for"
              i += 2

          #print hm0.print()
          #print hm1.print()
          #print hm2.print()

          #print hm0.print()
          #print HashMap.EMPTY.associate(hm0).print()

          print hm2.reduce ( (n) -> n + 1 ), 0
          print "sizes: #{ hm0.size }, #{ hm1.size }, #{ hm2.size }"
          print "counts: #{ hm0.count() }, #{ hm1.count() }, #{ hm2.count() }"
          for hm in [ hm0, hm1, hm2 ]
            throw new Error "size != count" unless hm.size is hm.count()

          hm01k = _.uniq hm0.keysArray().concat hm1.keysArray()
          print hm01k.length, hm2.keysArray().length
          print _.difference( hm01k, hm2.keysArray() ).map (key) -> key.__hash__
          #print hm2.keysArray().map (key) -> key.__hash__

          f = ( v, k ) ->
            if v isnt hm2.get k
              debugger
              throw "XXX #{ k.__hash__.toString(2) }, #{v}, #{ hm2.has k }"
          hm0.forEach f
          hm1.forEach f

        1 and
        do ->
          debugger
          results = []
          do (new HeapDiff).end
          do gc

          # pim

          hm0 = HashMap.from oldPairs
          hm1 = HashMap.from newPairs
          heapdiff = new HeapDiff
          i = 0; t = Date.now(); while i++ < n
            hm2 = hm0.associate hm1
          report n, "pim assoc", results[1] = Date.now() - t

          # Verify
          fail = ( msg ) -> throw new Error "pim assoc: #{ msg }"
          i = 0; while i < allPairs.length
            if hm2.retrieve( allPairs[i] ) isnt allPairs[ i + 1 ]
              fail "verification failed"
            i += 2
          unless hm2.size is hm2.count() is allPairs.length / 2
            fail "count failed"
          debugger
          global.hm2 = hm2
          heapdiff = heapdiff.end()
          console.log heapdiff, '\n\n', heapdiff.change.details
          do gc

          # mori

          hm0m = hash_map.apply null, oldPairs
          hm1m = hash_map.apply null, newPairs
          heapdiff = new HeapDiff
          i = 0; t = Date.now(); while i++ < n
            hm2m = into hm0m, hm1m
          report n, "mori.into", results[0] = Date.now() - t

          # Verify
          i = 0; while i < allPairs.length
            if mori.get( hm2m, allPairs[i] ) isnt allPairs[ i + 1 ]
              throw new Error "mori: verification failed"
            i += 2
          debugger
          global.hm2m = hm2m
          heapdiff = heapdiff.end()
          console.log heapdiff, '\n\n', heapdiff.change.details
          do gc

          print "perf ratio: #{ results[0] / results[1] }\n"

          #writeSnapshot()





    0 and
    do ->
      print "splice vs insert"

      m         = 31
      n         = 10000
      position  = 0
      results   = []

      arrays = -> ( {} for j in [0..m] ) for i in [0..n]

      insert = ( array, insertAt, key, value ) ->
        index = array.length - 2; while insertAt < index
          array[ index + 2 ] = array[ index ]
          array[ index + 3 ] = array[ index + 1 ]
          index -= 2
        array[ insertAt ]      = key
        array[ insertAt + 1 ]  = value
        return

      t = Date.now()
      insert a, position, {}, {} for a in arrays()
      report n, "insert", results[0] = Date.now() - t

      t = Date.now()
      a.splice position, 0, {}, {} for a in arrays()
      report n, "splice", results[1] = Date.now() - t


    0 and
    do ->

      fill = ( sourceBitmap, sourceTable, targetBitmap, targetTable ) ->
        bitmap = sourceBitmap & ~targetBitmap
        argIndex = 3; while argIndex < arguments.length
          ;