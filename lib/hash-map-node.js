// Generated by CoffeeScript 1.7.1
(function() {
  var HashMapNode;

  module.exports = HashMapNode = (function() {
    function HashMapNode(table) {
      this.table = table;
    }

    HashMapNode.prototype.copy = function() {
      return new HashMapNode(this.table.slice());
    };

    return HashMapNode;

  })();

}).call(this);
