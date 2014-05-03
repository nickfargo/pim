// Generated by CoffeeScript 1.7.1
(function() {
  var HashMap, expect;

  expect = require('chai').expect;

  HashMap = require('pim').HashMap;

  describe("HashMap", function() {
    describe("static function `create`", function() {
      it("exists", function() {
        return expect(HashMap.create).to.be.a('function');
      });
      it("returns a HashMap", function() {
        return expect(HashMap.create()).to.be.an["instanceof"](HashMap);
      });
      it("is variadic", function() {
        var hm;
        hm = HashMap.create(0, 1, 2, 3, 4, 5);
        expect(hm.get(0)).to.equal(1);
        expect(hm.get(2)).to.equal(3);
        return expect(hm.get(4)).to.equal(5);
      });
      return it("can accept and distinguish falsey keys", function() {
        var hm;
        hm = HashMap.create(0, 1, null, 2, void 0, 3, '', 4, false, 5);
        expect(hm.get(0)).to.equal(1);
        expect(hm.get(null)).to.equal(2);
        expect(hm.get(void 0)).to.equal(3);
        expect(hm.get('')).to.equal(4);
        return expect(hm.get(false)).to.equal(5);
      });
    });
    describe("static function `from`", function() {
      it("exists", function() {
        return expect(HashMap.from).to.be.a('function');
      });
      it("returns a HashMap", function() {
        return expect(HashMap.from(HashMap.create())).to.be.an["instanceof"](HashMap);
      });
      return describe("parameter `iterable`", function() {
        var generator;
        generator = (function() {
          try {
            return new Function("return function* () {\n  yield [0,1];\n  yield [2,3];\n  yield [4,5];\n};")();
          } catch (_error) {}
        })();
        if (generator != null) {
          it("accepts a generator", function() {
            var hm;
            hm = HashMap.from(generator);
            expect(hm.get(0)).to.equal(1);
            expect(hm.get(2)).to.equal(3);
            return expect(hm.get(4)).to.equal(5);
          });
        }
        it("accepts an object that conforms to the Iterator protocol", function() {
          var hm;
          hm = HashMap.create(0, 1, 2, 3, 4, 5);
          hm = HashMap.from(hm);
          expect(hm.get(0)).to.equal(1);
          expect(hm.get(2)).to.equal(3);
          return expect(hm.get(4)).to.equal(5);
        });
        it("accepts an iterator directly", function() {
          var hm;
          hm = HashMap.create(0, 1, 2, 3, 4, 5);
          hm = HashMap.from(hm.__iterator__());
          expect(hm.get(0)).to.equal(1);
          expect(hm.get(2)).to.equal(3);
          return expect(hm.get(4)).to.equal(5);
        });
        return it("accepts an array", function() {
          var array, hm;
          array = [0, 1, 2, 3, 4, 5];
          hm = HashMap.from(array);
          expect(hm.get(0)).to.equal(1);
          expect(hm.get(2)).to.equal(3);
          return expect(hm.get(4)).to.equal(5);
        });
      });
    });
    describe("instance property `size`", function() {
      var hm;
      hm = HashMap.create(0, 1, 2, 3, 4, 5);
      it("exists", function() {
        return expect(hm).to.have.property('size');
      });
      it("is accurate following `create`", function() {
        return expect(hm.size).to.equal(3);
      });
      return it("is accurate following `associate`", function() {
        return expect(hm.associate(4, 'five', 6, 'seven', 8, 'nine').size).to.equal(5);
      });
    });
    describe("method `retrieve`", function() {
      var hm;
      hm = HashMap.create(0, 1, 2, 3, 4, 5);
      it("exists", function() {
        return expect(HashMap.prototype.retrieve).to.be.a('function');
      });
      it("is aliased to method `get`", function() {
        return expect(HashMap.prototype.retrieve).to.equal(HashMap.prototype.get);
      });
      it("returns the value associated with the provided `key`", function() {
        expect(hm.get(0)).to.equal(1);
        expect(hm.get(2)).to.equal(3);
        return expect(hm.get(4)).to.equal(5);
      });
      it("returns `undefined` if `key` is not found", function() {
        return expect(hm.get(6)).to.equal(void 0);
      });
      return it("returns `alternative` second argument if `key` is not found", function() {
        expect(hm.get(6, 7)).to.equal(7);
        expect(hm.get(null, 7)).to.equal(7);
        return expect(hm.get(void 0, 7)).to.equal(7);
      });
    });
    describe("method `associate`", function() {
      var hm;
      hm = HashMap.create(0, 1, 2, 3);
      it("exists", function() {
        return expect(HashMap.prototype.associate).to.be.a('function');
      });
      it("throws with odd arity greater than 1", function() {
        expect(function() {
          return hm.associate(7, 8, 9);
        }).to["throw"];
        expect(function() {
          return hm.associate(6, 7, 8, 9);
        }).not.to["throw"];
        return expect(function() {
          return hm.associate(5, 6, 7, 8, 9);
        }).to["throw"];
      });
      describe("as variadic when arity >= 2", function() {
        it("adds new pairs", function() {
          var hm0;
          hm0 = hm.associate(4, 5, 6, 7);
          expect(hm0.get(0)).to.equal(1);
          expect(hm0.get(2)).to.equal(3);
          expect(hm0.get(4)).to.equal(5);
          return expect(hm0.get(6)).to.equal(7);
        });
        return it("overwrites existing keys", function() {
          var hm0;
          hm0 = hm.associate(2, 'three', 4, 5);
          expect(hm0.get(0)).to.equal(1);
          expect(hm0.get(2)).to.equal('three');
          return expect(hm0.get(4)).to.equal(5);
        });
      });
      return describe("parameter `iterable` when arity == 1", function() {
        var generator;
        generator = (function() {
          try {
            return new Function("return function* () {\n  yield [undefined, null];\n  yield [2,'three'];\n  yield [4,5];\n};")();
          } catch (_error) {}
        })();
        if (generator != null) {
          it("accepts a generator", function() {
            var hm0;
            hm0 = hm.associate(generator);
            expect(hm0.get(0)).to.equal(1);
            expect(hm0.get(2)).to.equal('three');
            expect(hm0.get(4)).to.equal(5);
            return expect(hm0.get(void 0)).to.equal(null);
          });
        }
        it("accepts an object that conforms to the Iterator protocol", function() {
          var hm0;
          hm0 = hm.associate(HashMap.create(void 0, null, 2, 'three', 4, 5));
          expect(hm0.get(0)).to.equal(1);
          expect(hm0.get(2)).to.equal('three');
          expect(hm0.get(4)).to.equal(5);
          return expect(hm0.get(void 0)).to.equal(null);
        });
        it("accepts an iterator directly", function() {
          var hm0, hm1;
          hm1 = HashMap.create(void 0, null, 2, 'three', 4, 5);
          hm0 = hm.associate(hm1.__iterator__());
          expect(hm0.get(0)).to.equal(1);
          expect(hm0.get(2)).to.equal('three');
          expect(hm0.get(4)).to.equal(5);
          return expect(hm0.get(void 0)).to.equal(null);
        });
        return it("accepts an array", function() {
          var hm0;
          hm0 = hm.associate([void 0, null, 2, 'three', 4, 5]);
          expect(hm0.get(0)).to.equal(1);
          expect(hm0.get(2)).to.equal('three');
          expect(hm0.get(4)).to.equal(5);
          return expect(hm0.get(void 0)).to.equal(null);
        });
      });
    });
    describe("method `equals`", function() {
      var M;
      M = HashMap.create;
      it("exists", function() {
        return expect(HashMap.prototype.equals).to.be.a('function');
      });
      it("affirms deep value equality when structure is immutable", function() {
        var hm1, hm2;
        hm1 = M(0, 1, 2, M(3, 4, 5, M(6, 7, 8, 9)));
        hm2 = M(0, 1, 2, M(3, 4, 5, M(6, 7, 8, 9)));
        return expect(hm1.equals(hm2)).to.equal(true);
      });
      return it("affirms inequality of non-identical mutable plain objects", function() {
        var hm1, hm2;
        hm1 = M(0, 1, 2, {
          'three': M(4, 5)
        });
        hm2 = M(0, 1, 2, {
          'three': M(4, 5)
        });
        return expect(hm1.equals(hm2)).to.equal(false);
      });
    });
    describe("method `filter`", function() {
      var hm;
      hm = HashMap.create(0, 1, 2, 3, 4, 5);
      it("exists", function() {
        return expect(HashMap.prototype.filter).to.be.a('function');
      });
      it("returns a `HashMap`", function() {
        var filtered;
        filtered = hm.filter(function() {});
        return expect(filtered).to.be.an["instanceof"](HashMap);
      });
      it("returns a smaller hashmap when predicate rejects", function() {
        var filtered;
        filtered = hm.filter(function(value, key) {
          return key < 3;
        });
        expect(filtered.size).to.equal(2);
        expect(filtered.get(0)).to.equal(1);
        expect(filtered.get(2)).to.equal(3);
        return expect(filtered.has(4)).to.equal(false);
      });
      return it("returns an equal hashmap when predicate passes all pairs", function() {
        var filtered;
        filtered = hm.filter(function(value, key) {
          return key % 2 === 0 && value % 2 === 1;
        });
        expect(filtered.size).to.equal(3);
        return expect(filtered.equals(hm)).to.equal(true);
      });
    });
    return describe("method `map`", function() {
      var hm;
      hm = HashMap.create(0, 1, 2, 3, 4, 5);
      it("exists", function() {
        return expect(HashMap.prototype.map).to.be.a('function');
      });
      return it("returns a `HashMap`", function() {
        var mapped;
        return mapped = hm.map(function() {
          return [];
        });
      });
    });
  });

}).call(this);