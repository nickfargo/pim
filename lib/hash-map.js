// Generated by CoffeeScript 1.7.1
(function() {
  var Collision, HashMap, Iterator, Node, base32, base32p, bin32p, format, formatWithHashes, formatWithHashesInBase32, hashOf, hex32p, iteratorOf, pairwiseIteratorOf, populationOf, print, typeOf, uid, valueOf, _ref;

  Node = require('./hash-map-node');

  Collision = require('./hash-map-collision');

  Iterator = require('./hash-map-iterator');

  _ref = require('./helpers'), uid = _ref.uid, hashOf = _ref.hashOf, populationOf = _ref.populationOf, typeOf = _ref.typeOf, valueOf = _ref.valueOf, iteratorOf = _ref.iteratorOf, pairwiseIteratorOf = _ref.pairwiseIteratorOf, base32 = _ref.base32, base32p = _ref.base32p, bin32p = _ref.bin32p, hex32p = _ref.hex32p, format = _ref.format, formatWithHashes = _ref.formatWithHashes, formatWithHashesInBase32 = _ref.formatWithHashesInBase32, print = _ref.print;

  module.exports = HashMap = (function() {
    var ablate, accrete, insert, tableIndexFrom, __ablate_cached__sourcePath, __ablate_cached__targetIndices, __ablate_cached__targetPath, __ablate_inline__replicatePath;

    function HashMap(source) {
      this.__hash__ = uid();
      if ((source != null ? source.size : void 0) > 0) {
        this.size = source.size;
        this.bitmap = source.bitmap;
        this.root = new Node(source.root.table.slice());
      } else {
        this.size = 0;
        this.bitmap = 0;
        this.root = new Node([]);
      }
    }

    __ablate_cached__sourcePath = [];

    __ablate_cached__targetPath = [];

    __ablate_cached__targetIndices = [];

    __ablate_inline__replicatePath = function(target, path, indices, sourcePath) {
      var i, node, parentIndex, parentTable, sourceNode;
      node = target.root;
      i = 0;
      while (i < path.length) {
        parentTable = node.table;
        parentIndex = indices[i];
        node = path[i];
        sourceNode = sourcePath[i];
        if (node === sourceNode) {
          node = sourceNode.copy();
          parentTable[parentIndex + 1] = path[i] = node;
        }
        i++;
      }
      return node;
    };

    tableIndexFrom = function(index, bitmap) {
      var i;
      if (!(bitmap & 1 << index)) {
        return;
      }
      i = (populationOf(bitmap & -1 >>> (~index & 31))) - 1;
      return i + i;
    };

    insert = function(intoTable, position, key, value) {
      if (!(intoTable.length < 63)) {
        throw new Error("Table overflow");
      }
      intoTable.splice(position, 0, key, value);
    };

    accrete = function(source, iterable, target) {
      var bitshift, done, hash, hashSegment, iterator, key, pair, size, slotIndexBit, sourceBitmap, sourceIndex, sourceKey, sourceNode, sourceTable, sourceValue, targetBitmap, targetHash, targetIndex, targetKey, targetNode, targetParentIndex, targetParentTable, targetTable, targetValue, value, _ref1;
      if (target == null) {
        target = new HashMap(source);
      }
      size = target.size;
      if (!((source != null ? source.size : void 0) > 0)) {
        source = null;
      }
      iterator = pairwiseIteratorOf(iterable);
      while (true) {
        _ref1 = iterator.next(), done = _ref1.done, pair = _ref1.value;
        if (done) {
          break;
        }
        key = pair[0], value = pair[1];
        if (source != null) {
          sourceBitmap = source.bitmap;
          sourceNode = source.root;
        }
        targetBitmap = target.bitmap;
        targetNode = target.root;
        hash = hashOf(key);
        bitshift = 0;
        while (true) {
          if (bitshift > 30) {
            throw new Error("bitshift overflow");
          }
          targetParentTable = targetTable;
          targetParentIndex = targetIndex;
          targetTable = targetNode.table;
          hashSegment = hash >>> bitshift & 31;
          slotIndexBit = 1 << hashSegment;
          if ((targetBitmap & slotIndexBit) === 0) {
            targetBitmap |= slotIndexBit;
            if (bitshift === 0) {
              target.bitmap = targetBitmap;
            } else {
              targetParentTable[targetParentIndex] = targetBitmap;
            }
            targetIndex = tableIndexFrom(hashSegment, targetBitmap);
            insert(targetTable, targetIndex, key, value);
            size++;
            break;
          } else {
            targetIndex = tableIndexFrom(hashSegment, targetBitmap);
            targetKey = targetTable[targetIndex];
            targetValue = targetTable[targetIndex + 1];
            if (targetValue instanceof Node) {
              if (sourceNode != null) {
                sourceTable = sourceNode.table;
                sourceIndex = tableIndexFrom(hashSegment, sourceBitmap);
                sourceKey = sourceTable[sourceIndex];
                sourceValue = sourceTable[sourceIndex + 1];
                if (sourceValue === targetValue) {
                  targetValue = sourceValue.copy();
                  targetTable[targetIndex + 1] = targetValue;
                }
                sourceBitmap = sourceKey;
                sourceNode = sourceValue;
              }
              bitshift += 5;
              targetBitmap = targetKey;
              targetNode = targetValue;
            } else if (targetValue instanceof Collision) {
              if (sourceNode != null) {
                sourceTable = sourceNode.table;
                sourceIndex = tableIndexFrom(hashSegment, sourceBitmap);
                sourceKey = sourceTable[sourceIndex];
                sourceValue = sourceTable[sourceIndex + 1];
                if (sourceValue === targetValue) {
                  targetValue = sourceValue.copy();
                  targetTable[targetIndex + 1] = targetValue;
                }
              }
              if (targetKey === hash) {
                size += targetValue.add(key, value);
                break;
              } else {
                sourceNode = null;
                bitshift += 5;
                targetBitmap = 1 << (targetKey >>> bitshift);
                targetNode = new Node([targetKey, targetValue]);
                targetTable[targetIndex] = targetBitmap;
                targetTable[targetIndex + 1] = targetNode;
              }
            } else {
              if (key === targetKey) {
                targetTable[targetIndex + 1] = value;
                break;
              }
              targetHash = hashOf(targetKey);
              if (hash === targetHash) {
                targetTable[targetIndex] = hash;
                targetTable[targetIndex + 1] = new Collision([targetKey, targetValue, key, value]);
                size++;
                break;
              } else {
                sourceNode = null;
                bitshift += 5;
                targetBitmap = 1 << (targetHash >>> bitshift);
                targetNode = new Node([targetKey, targetValue]);
                targetTable[targetIndex] = targetBitmap;
                targetTable[targetIndex + 1] = targetNode;
              }
            }
          }
        }
      }
      target.size = size;
      return target;
    };

    ablate = function(source, iterable, target) {
      var bitshift, collision, collisionTable, done, hash, hashSegment, iterator, key, remainingIndex, remainingKey, remainingValue, size, slotIndexBit, sourceBitmap, sourceIndex, sourceKey, sourceNode, sourcePath, sourceTable, sourceValue, targetBitmap, targetIndex, targetIndices, targetKey, targetNode, targetNodeDepth, targetParentIndex, targetParentTable, targetPath, targetTable, targetValue, _ref1;
      if (target == null) {
        target = new HashMap(source);
      }
      if (!(source != null ? source.size : void 0)) {
        return target;
      }
      sourcePath = __ablate_cached__sourcePath;
      targetPath = __ablate_cached__targetPath;
      targetIndices = __ablate_cached__targetIndices;
      size = target.size;
      iterator = iteratorOf(iterable);
      while (true) {
        _ref1 = iterator.next(), done = _ref1.done, key = _ref1.value;
        if (done) {
          break;
        }
        sourcePath.length = 0;
        targetPath.length = 0;
        targetIndices.length = 0;
        sourceBitmap = source.bitmap;
        sourceNode = source.root;
        targetBitmap = target.bitmap;
        targetNode = target.root;
        targetTable = null;
        targetIndex = void 0;
        hash = hashOf(key);
        bitshift = 0;
        while (true) {
          if (bitshift > 30) {
            throw new Error("bitshift overflow");
          }
          hashSegment = hash >>> bitshift & 31;
          slotIndexBit = 1 << hashSegment;
          if ((targetBitmap & slotIndexBit) === 0) {
            break;
          }
          targetParentTable = targetTable;
          targetParentIndex = targetIndex;
          targetTable = targetNode.table;
          targetIndex = tableIndexFrom(hashSegment, targetBitmap);
          targetKey = targetTable[targetIndex];
          targetValue = targetTable[targetIndex + 1];
          targetIndices.push(targetIndex);
          if (targetValue instanceof Node) {
            if (sourceNode != null) {
              sourceTable = sourceNode.table;
              sourceIndex = tableIndexFrom(hashSegment, sourceBitmap);
              sourceKey = sourceTable[sourceIndex];
              sourceValue = sourceTable[sourceIndex + 1];
              if (sourceValue instanceof Node) {
                sourceBitmap = sourceKey;
                sourceNode = sourceValue;
                sourcePath.push(sourceNode);
              } else {
                sourceNode = null;
              }
            }
            bitshift += 5;
            targetBitmap = targetKey;
            targetNode = targetValue;
            targetPath.push(targetNode);
          } else if (targetValue instanceof Collision) {
            collision = targetValue;
            collisionTable = collision.table;
            targetNode = __ablate_inline__replicatePath(target, targetPath, targetIndices, sourcePath);
            targetParentTable = targetNode.table;
            targetParentIndex = targetIndices[targetPath.length];
            if (collisionTable.length === 4) {
              remainingIndex = collision.indexOf(key) ? 0 : 2;
              remainingKey = collisionTable[remainingIndex];
              remainingValue = collisionTable[remainingIndex + 1];
              targetParentTable[targetParentIndex] = remainingKey;
              targetParentTable[targetParentIndex + 1] = remainingValue;
              size--;
            } else {
              if (sourceNode != null) {
                sourceTable = sourceNode.table;
                sourceIndex = tableIndexFrom(hashSegment, sourceBitmap);
                sourceValue = sourceTable[sourceIndex + 1];
                if (sourceValue === collision) {
                  collision = collision.copy();
                  targetParentTable[targetParentIndex + 1] = collision;
                }
              }
              size -= collision.remove(key);
            }
            break;
          } else {
            if (targetTable.length % 2) {
              throw new Error("ablate: bad table: odd length");
            }
            if (bitshift > 0 && targetTable.length < 4) {
              throw new Error("ablate: bad table: superfluous node");
            }
            if (bitshift > 0 && targetTable.length === 4 && !(remainingIndex = targetIndex ? 0 : 2, remainingKey = targetTable[remainingIndex], remainingValue = targetTable[remainingIndex + 1], remainingValue instanceof Node)) {
              targetPath.pop();
              while (targetNode = targetPath.pop()) {
                if (targetNode.table.length !== 2) {
                  targetPath.push(targetNode);
                  break;
                }
              }
              targetNode = __ablate_inline__replicatePath(target, targetPath, targetIndices, sourcePath);
              targetNodeDepth = targetPath.length;
              targetParentTable = targetNodeDepth === 0 ? target.root.table : targetPath[targetNodeDepth - 1].table;
              targetParentIndex = targetIndices[targetNodeDepth];
              targetParentTable[targetParentIndex] = remainingKey;
              targetParentTable[targetParentIndex + 1] = remainingValue;
            } else {
              targetNode = __ablate_inline__replicatePath(target, targetPath, targetIndices, sourcePath);
              targetNodeDepth = targetPath.length;
              targetBitmap &= ~slotIndexBit;
              if (bitshift === 0) {
                target.bitmap = targetBitmap;
              } else {
                targetParentTable = bitshift === 5 ? target.root.table : targetPath[targetNodeDepth - 2].table;
                targetParentIndex = targetIndices[targetNodeDepth - 1];
                targetParentTable[targetParentIndex] = targetBitmap;
              }
              targetNode.table.splice(targetIndices[targetNodeDepth], 2);
              if (targetNode.table.length !== 2 * populationOf(targetBitmap)) {
                throw new Error("invalid bitmap: " + targetBitmap);
              }
            }
            size--;
            break;
          }
        }
      }
      target.size = size;
      return target;
    };

    HashMap.create = function() {
      return accrete(null, arguments);
    };

    HashMap.from = function(iterable) {
      return accrete(null, iterable);
    };

    HashMap.prototype.__iterator__ = function(mapFn) {
      return new Iterator(this, mapFn);
    };

    HashMap.prototype.retrieve = function(key, alternative) {
      var bitmap, hash, index, k, node, table, v;
      bitmap = this.bitmap;
      node = this.root;
      hash = hashOf(key);
      while (true) {
        index = tableIndexFrom(hash, bitmap);
        if (index == null) {
          return alternative;
        }
        table = node.table;
        k = table[index];
        v = table[index + 1];
        if (v instanceof Node) {
          bitmap = k;
          node = v;
          hash >>>= 5;
          continue;
        } else if (v instanceof Collision) {
          table = v.table;
          index = 0;
          while (index < table.length) {
            if (table[index] === key) {
              return table[index + 1];
            } else {
              index += 2;
            }
          }
          return alternative;
        } else {
          if (k === key) {
            return v;
          } else {
            return alternative;
          }
        }
      }
    };

    HashMap.prototype.get = HashMap.prototype.retrieve;

    HashMap.prototype.has = (function(alt) {
      return function(key) {
        return alt !== this.retrieve(key, alt);
      };
    })({});

    HashMap.prototype.associate = function(iterable) {
      if (arguments.length > 1) {
        return accrete(this, arguments);
      } else {
        return accrete(this, iterable);
      }
    };

    HashMap.prototype.dissociate = function(iterable) {
      if (arguments.length > 1) {
        return ablate(this, arguments);
      } else {
        return ablate(this, iterable);
      }
    };

    HashMap.prototype.equals = (function(alt) {
      return function(other) {
        var done, iterator, key, otherValue, value, _ref1, _ref2;
        if (other === this) {
          return true;
        }
        if (!((other != null ? other.size : void 0) === this.size && typeof other.retrieve === 'function')) {
          return false;
        }
        iterator = this.__iterator__();
        while (true) {
          _ref1 = iterator.next(), done = _ref1.done, (_ref2 = _ref1.value, key = _ref2[0], value = _ref2[1]);
          if (done) {
            return true;
          }
          otherValue = other.retrieve(key, alt);
          if (otherValue === alt) {
            return false;
          }
          if (!(otherValue === value || (value != null ? typeof value.equals === "function" ? value.equals(otherValue) : void 0 : void 0))) {
            return false;
          }
        }
      };
    })({});

    HashMap.prototype.toString = (function(pairs) {
      return function(options) {
        var done, formatFn, iterator, key, result, value, _ref1, _ref2;
        formatFn = (options != null ? options.hashes : void 0) ? (options != null ? options.base32 : void 0) ? formatWithHashesInBase32 : formatWithHashes : format;
        iterator = this.__iterator__();
        while (true) {
          _ref1 = iterator.next(), done = _ref1.done, (_ref2 = _ref1.value, key = _ref2[0], value = _ref2[1]);
          if (done) {
            break;
          }
          pairs.push("<" + (formatFn(key)) + ", " + (formatFn(value)) + ">");
        }
        result = "{ " + (pairs.join(' ')) + " }";
        pairs.length = 0;
        return result;
      };
    })([]);

    HashMap.prototype.keys = (function(fn) {
      return function() {
        return this.__iterator__(fn);
      };
    })(function(v, k) {
      return k;
    });

    HashMap.prototype.values = (function(fn) {
      return function() {
        return this.__iterator__(fn);
      };
    })(function(v) {
      return v;
    });

    HashMap.prototype.keysArray = function() {
      var done, iterator, pair, result, _ref1;
      result = [];
      iterator = this.__iterator__();
      while (true) {
        _ref1 = iterator.next(), done = _ref1.done, pair = _ref1.value;
        if (done) {
          break;
        }
        result.push(pair[0]);
      }
      return result;
    };

    HashMap.prototype.valuesArray = function() {
      var done, iterator, pair, result, _ref1;
      result = [];
      iterator = this.__iterator__();
      while (true) {
        _ref1 = iterator.next(), done = _ref1.done, pair = _ref1.value;
        if (done) {
          break;
        }
        result.push(pair[1]);
      }
      return result;
    };

    HashMap.prototype.count = function() {
      var count, iterator;
      count = 0;
      iterator = this.__iterator__();
      while (true) {
        if (iterator.next().done) {
          break;
        }
        count++;
      }
      return count;
    };

    HashMap.prototype.filter = function(predicate, context) {
      var done, iterator, key, pair, result, value, _ref1;
      result = new HashMap;
      iterator = this.__iterator__();
      while (true) {
        _ref1 = iterator.next(), done = _ref1.done, pair = _ref1.value;
        if (done) {
          break;
        }
        key = pair[0], value = pair[1];
        if (predicate.call(context, value, key, this)) {
          accrete(null, pair, result);
        }
      }
      return result;
    };

    HashMap.prototype.remove = function(predicate, context) {
      return this.filter((function() {
        return !predicate.apply(this, arguments);
      }), context);
    };

    HashMap.prototype.forEach = function(fn, context) {
      var done, iterator, key, value, _ref1, _ref2;
      iterator = this.__iterator__();
      while (true) {
        _ref1 = iterator.next(), done = _ref1.done, (_ref2 = _ref1.value, key = _ref2[0], value = _ref2[1]);
        if (done) {
          return;
        }
        fn.call(context, value, key, this);
      }
    };

    HashMap.prototype.map = function(fn, context) {
      var done, iterator, pair, result, _ref1;
      result = new HashMap;
      iterator = this.__iterator__();
      while (true) {
        _ref1 = iterator.next(), done = _ref1.done, pair = _ref1.value;
        if (done) {
          break;
        }
        if (pair = fn.call(context, pair.value, pair.key, this)) {
          accrete(null, pair, result);
        }
      }
      return result;
    };

    HashMap.prototype.reduce = function(fn, seed, context) {
      var done, iterator, key, result, value, _ref1, _ref2, _ref3, _ref4;
      iterator = this.__iterator__();
      if (seed != null) {
        result = seed;
      } else {
        _ref1 = iterator.next(), done = _ref1.done, (_ref2 = _ref1.value, key = _ref2[0], value = _ref2[1]);
        if (done) {
          return;
        }
        result = value;
      }
      while (true) {
        _ref3 = iterator.next(), done = _ref3.done, (_ref4 = _ref3.value, key = _ref4[0], value = _ref4[1]);
        if (done) {
          break;
        }
        result = fn.call(context, result, value, key, this);
      }
      return result;
    };

    HashMap.prototype.print = (function() {
      var indent, printCollision, printNode, printPair;
      indent = function(indentation, whitespace) {
        var i, out;
        if (indentation == null) {
          indentation = 0;
        }
        if (whitespace == null) {
          whitespace = '  ';
        }
        out = '';
        i = 0;
        while (i++ < indentation) {
          out += whitespace;
        }
        return out;
      };
      printNode = function(bitmap, node, indentation) {
        var index, key, out, slotIndex, table, value;
        if (indentation == null) {
          indentation = 0;
        }
        table = node.table;
        out = "Node (#" + (base32p(bitmap)) + ") (" + (bin32p(bitmap)) + ")\n";
        indentation += 1;
        slotIndex = 0;
        while (slotIndex < 32) {
          if ((index = tableIndexFrom(slotIndex, bitmap)) != null) {
            out += "" + (indent(indentation)) + "#" + (base32(slotIndex)) + " ";
            key = table[index];
            value = table[index + 1];
            if (value instanceof Node) {
              out += printNode(key, value, indentation + 1);
            } else if (value instanceof Collision) {
              out += printCollision(key, value);
            } else {
              out += printPair(key, value);
            }
          }
          slotIndex++;
        }
        return out;
      };
      printCollision = function(hash, collision) {
        var index, key, pairs, table, value;
        table = collision.table;
        pairs = (function() {
          var _i, _len, _results;
          _results = [];
          for (index = _i = 0, _len = table.length; _i < _len; index = _i += 2) {
            key = table[index];
            value = table[index + 1];
            _results.push("" + (valueOf(key)) + " " + (valueOf(value)));
          }
          return _results;
        })();
        return "Collision (#" + (base32p(hash)) + ") { " + (pairs.join(', ')) + " }\n";
      };
      printPair = function(key, value) {
        return "Pair (#" + (base32p(hashOf(key))) + ") <" + (valueOf(key)) + ", " + (valueOf(value)) + ">\n";
      };
      return function() {
        return printNode(this.bitmap, this.root);
      };
    })();

    HashMap.prototype.checkIntegrity = (function() {
      var checkIntegrity, checkNode;
      checkNode = function(out, bitmap, node, bitshift, address) {
        var hash, index, key, mask, slotAddress, slotIndex, table, value;
        if (bitshift == null) {
          bitshift = 0;
        }
        if (address == null) {
          address = 0;
        }
        table = node.table;
        mask = ~(-1 << 5 + bitshift);
        if (table.length % 2) {
          out.push({
            '': "Bad table",
            bitmap: bitmap,
            node: node,
            bitshift: bitshift
          });
        } else if (bitshift > 0 && table.length < 4 && !(key = table[0], value = table[1], value instanceof Node)) {
          out.push({
            '': "Bad node",
            bitmap: bitmap,
            node: node,
            bitshift: bitshift,
            key: key,
            value: value
          });
        }
        slotIndex = 0;
        while (slotIndex < 32) {
          if ((index = tableIndexFrom(slotIndex, bitmap)) != null) {
            key = table[index];
            value = table[index + 1];
            slotAddress = slotIndex << bitshift | address;
            if (value instanceof Node) {
              checkNode(out, key, value, bitshift + 5, slotAddress);
            } else {
              hash = value instanceof Collision ? key : hashOf(key);
              if (mask & (slotAddress ^ hash)) {
                out.push({
                  '': "Bad terminal",
                  bitshift: bitshift,
                  slotIndex: slotIndex,
                  slotAddress: "#" + (base32p(slotAddress)),
                  hash: "#" + (base32p(hash)),
                  key: "" + (valueOf(key)),
                  value: "" + (valueOf(value))
                });
              }
            }
          }
          slotIndex++;
        }
        return out;
      };
      return checkIntegrity = function() {
        return checkNode([], this.bitmap, this.root);
      };
    })();

    return HashMap;

  })();

}).call(this);
