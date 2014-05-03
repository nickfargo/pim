    { expect } = require 'chai'
    { HashMap } = require 'pim'




## [HashMap]()

    describe "HashMap", ->



### Class functions


#### [HashMap.create]()

      describe "static function `create`", ->

        it "exists", ->
          expect HashMap.create
            .to.be.a 'function'

        it "returns a HashMap", ->
          expect HashMap.create()
            .to.be.an.instanceof HashMap

        it "is variadic", ->
          hm = HashMap.create 0, 1, 2, 3, 4, 5
          expect( hm.get 0 ).to.equal 1
          expect( hm.get 2 ).to.equal 3
          expect( hm.get 4 ).to.equal 5

        it "can accept and distinguish falsey keys", ->
          hm = HashMap.create 0, 1, null, 2, undefined, 3, '', 4, false, 5
          expect( hm.get 0 ).to.equal 1
          expect( hm.get null ).to.equal 2
          expect( hm.get undefined ).to.equal 3
          expect( hm.get '' ).to.equal 4
          expect( hm.get false ).to.equal 5


#### [HashMap.from]()

      describe "static function `from`", ->

        it "exists", ->
          expect HashMap.from
            .to.be.a 'function'

        it "returns a HashMap", ->
          expect HashMap.from HashMap.create()
            .to.be.an.instanceof HashMap

        describe "parameter `iterable`", ->

          generator = try do new Function """
            return function* () {
              yield [0,1];
              yield [2,3];
              yield [4,5];
            };
          """
          if generator?
            it "accepts a generator", ->
              hm = HashMap.from generator
              expect( hm.get 0 ).to.equal 1
              expect( hm.get 2 ).to.equal 3
              expect( hm.get 4 ).to.equal 5

          it "accepts an object that conforms to the Iterator protocol", ->
            hm = HashMap.create 0, 1, 2, 3, 4, 5
            hm = HashMap.from hm
            expect( hm.get 0 ).to.equal 1
            expect( hm.get 2 ).to.equal 3
            expect( hm.get 4 ).to.equal 5

          it "accepts an iterator directly", ->
            hm = HashMap.create 0, 1, 2, 3, 4, 5
            hm = HashMap.from hm.__iterator__()
            expect( hm.get 0 ).to.equal 1
            expect( hm.get 2 ).to.equal 3
            expect( hm.get 4 ).to.equal 5

          it "accepts an array", ->
            array = [ 0, 1, 2, 3, 4, 5 ]
            hm = HashMap.from array
            expect( hm.get 0 ).to.equal 1
            expect( hm.get 2 ).to.equal 3
            expect( hm.get 4 ).to.equal 5



### Instance properties


#### [hashMap.size]()

      describe "instance property `size`", ->
        hm = HashMap.create(
          0, 1
          2, 3
          4, 5
        )

        it "exists", ->
          expect hm
            .to.have.property 'size'

        it "is accurate following `create`", ->
          expect hm.size
            .to.equal 3

        it "is accurate following `associate`", ->
          expect hm.associate( 4, 'five', 6, 'seven', 8, 'nine' ).size
            .to.equal 5



### Methods


#### [HashMap::retrieve]()

      describe "method `retrieve`", ->
        hm = HashMap.create 0, 1, 2, 3, 4, 5

        it "exists", ->
          expect HashMap::retrieve
            .to.be.a 'function'

        it "is aliased to method `get`", ->
          expect HashMap::retrieve
            .to.equal HashMap::get

        it "returns the value associated with the provided `key`", ->
          expect( hm.get 0 ).to.equal 1
          expect( hm.get 2 ).to.equal 3
          expect( hm.get 4 ).to.equal 5

        it "returns `undefined` if `key` is not found", ->
          expect( hm.get 6 ).to.equal undefined

        it "returns `alternative` second argument if `key` is not found", ->
          expect( hm.get 6, 7 ).to.equal 7
          expect( hm.get null, 7 ).to.equal 7
          expect( hm.get undefined, 7 ).to.equal 7


#### [HashMap::associate]()

      describe "method `associate`", ->
        hm = HashMap.create 0, 1, 2, 3

        it "exists", ->
          expect HashMap::associate
            .to.be.a 'function'

        it "throws with odd arity greater than 1", ->
          expect( -> hm.associate 7, 8, 9 ).to.throw
          expect( -> hm.associate 6, 7, 8, 9 ).not.to.throw
          expect( -> hm.associate 5, 6, 7, 8, 9 ).to.throw

        describe "as variadic when arity >= 2", ->

          it "adds new pairs", ->
            hm0 = hm.associate 4, 5, 6, 7
            expect( hm0.get 0 ).to.equal 1
            expect( hm0.get 2 ).to.equal 3
            expect( hm0.get 4 ).to.equal 5
            expect( hm0.get 6 ).to.equal 7

          it "overwrites existing keys", ->
            hm0 = hm.associate 2, 'three', 4, 5
            expect( hm0.get 0 ).to.equal 1
            expect( hm0.get 2 ).to.equal 'three'
            expect( hm0.get 4 ).to.equal 5

        describe "parameter `iterable` when arity == 1", ->

          generator = try do new Function """
            return function* () {
              yield [undefined, null];
              yield [2,'three'];
              yield [4,5];
            };
          """
          if generator?
            it "accepts a generator", ->
              hm0 = hm.associate generator
              expect( hm0.get 0 ).to.equal 1
              expect( hm0.get 2 ).to.equal 'three'
              expect( hm0.get 4 ).to.equal 5
              expect( hm0.get undefined ).to.equal null

          it "accepts an object that conforms to the Iterator protocol", ->
            hm0 = hm.associate HashMap.create undefined, null, 2, 'three', 4, 5
            expect( hm0.get 0 ).to.equal 1
            expect( hm0.get 2 ).to.equal 'three'
            expect( hm0.get 4 ).to.equal 5
            expect( hm0.get undefined ).to.equal null

          it "accepts an iterator directly", ->
            hm1 = HashMap.create undefined, null, 2, 'three', 4, 5
            hm0 = hm.associate hm1.__iterator__()
            expect( hm0.get 0 ).to.equal 1
            expect( hm0.get 2 ).to.equal 'three'
            expect( hm0.get 4 ).to.equal 5
            expect( hm0.get undefined ).to.equal null

          it "accepts an array", ->
            hm0 = hm.associate [ undefined, null, 2, 'three', 4, 5 ]
            expect( hm0.get 0 ).to.equal 1
            expect( hm0.get 2 ).to.equal 'three'
            expect( hm0.get 4 ).to.equal 5
            expect( hm0.get undefined ).to.equal null


#### [equals]()

      describe "method `equals`", ->
        M = HashMap.create

        it "exists", ->
          expect HashMap::equals
            .to.be.a 'function'

        it "affirms deep value equality when structure is immutable", ->
          hm1 = M( 0, 1,
                   2, M( 3, 4,
                         5, M( 6, 7,
                               8, 9 )))
          hm2 = M( 0, 1,
                   2, M( 3, 4,
                         5, M( 6, 7,
                               8, 9 )))
          expect hm1.equals hm2
            .to.equal true

        it "affirms inequality of non-identical mutable plain objects", ->
          hm1 = M( 0, 1, 2, { 'three': M( 4, 5 ) } )
          hm2 = M( 0, 1, 2, { 'three': M( 4, 5 ) } )
          expect hm1.equals hm2
            .to.equal false


#### [filter]()

      describe "method `filter`", ->
        hm = HashMap.create 0, 1, 2, 3, 4, 5

        it "exists", ->
          expect HashMap::filter
            .to.be.a 'function'

        it "returns a `HashMap`", ->
          filtered = hm.filter ->
          expect filtered
            .to.be.an.instanceof HashMap

        it "returns a smaller hashmap when predicate rejects", ->
          filtered = hm.filter ( value, key ) -> key < 3

          expect filtered.size
            .to.equal 2

          expect( filtered.get 0 ).to.equal 1
          expect( filtered.get 2 ).to.equal 3

          expect filtered.has 4
            .to.equal false

        it "returns an equal hashmap when predicate passes all pairs", ->
          filtered = hm.filter ( value, key ) ->
            key % 2 is 0 and value % 2 is 1

          expect filtered.size
            .to.equal 3

          expect filtered.equals hm
            .to.equal true


#### [map]()

      describe "method `map`", ->
        hm = HashMap.create 0, 1, 2, 3, 4, 5

        it "exists", ->
          expect HashMap::map
            .to.be.a 'function'

        it "returns a `HashMap`", ->
          mapped = hm.map -> []