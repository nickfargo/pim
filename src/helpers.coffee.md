    _uid = 0

    uid = -> ++_uid|0

    hashOf = ( obj ) ->
      return 0 unless obj
      return 1 if obj is true
      switch typeof obj
        when 'number' then obj|0
        when 'string' then hashOfString obj
        else               hashOfObject obj

    hashOfString = ( str ) ->
      hash = 0; i = 0; while i < str.length
        hash = ( hash << 5 ) - hash + str.charCodeAt( i++ ) | 0
      hash

    hashOfObject = ( obj ) -> obj.hash?() ? obj.__hash__ ?= uid()

    populationOf = (x) ->
      x -=     x >> 0x01 & 0x55555555
      x =    ( x >> 0x02 & 0x33333333 ) + ( x & 0x33333333 )
      x =    ( x >> 0x04 ) + x & 0x0F0F0F0F
      x =    ( x >> 0x08 ) + x & 0x00FF00FF
      return ( x >> 0x10 ) + x & 0x0000FFFF

    rxType = /^\[object (\w+)\]$/

    typeOf = ( obj ) -> Object::toString.call( obj ).match( rxType )?[1]

    valueOf = ( obj ) ->
      if not obj?
        obj
      else if typeof obj is 'object' and obj.constructor.name
        "[#{typeOf obj} #{obj.constructor.name}]"
      else if typeof obj is 'object' or typeof obj is 'function'
        "[#{typeOf obj}]"
      else if typeof obj is 'string'
        "\"#{obj}\""
      else
        obj

    base32 = (n) -> ( n >>> 0 ).toString 32

    base32p = (n) -> ( '0000000' + base32 n ).slice -7

    bin32p = (n) ->
      '00000000000000000000000000000000'
        .concat ( n >>> 0 ).toString 2
        .slice -32
        .replace ///
          ([01]{2})([01]{5})([01]{5})([01]{5})([01]{5})([01]{5})([01]{5})
          ///, '$1-$2-$3-$4-$5-$6-$7'

    hex32p = (n) -> ( '00000000' + ( n >>> 0 ).toString 16 ).slice -8

    format = ( obj ) -> switch typeof obj
      when 'string'
        "\"#{obj}\""
      when 'object', 'function'
        str = Object::toString.call obj
        "[#{ str.match( rxType )[1] }]"
      else obj

    formatWithHashes = ( obj ) -> switch typeof obj
      when 'string'
        "[\"#{obj}\" ##{ hex32p hashOf obj }]"
      when 'object', 'function'
        str = Object::toString.call obj
        "[#{ str.match( rxType )[1] } ##{ hex32p hashOf obj }]"
      else obj

    formatWithHashesInBase32 = ( obj ) -> switch typeof obj
      when 'string'
        "[\"#{obj}\" ##{ base32 hashOf obj }]"
      when 'object', 'function'
        str = Object::toString.call obj
        "[#{ str.match( rxType )[1] } ##{ base32 hashOf obj }]"
      else
        "[#{obj} ##{ base32 hashOf obj }]"

    print = -> console.log.apply console, arguments



    module.exports = {
      uid
      hashOf
      populationOf
      typeOf
      valueOf
      bin32p
      hex32p
      base32
      base32p
      format
      formatWithHashes
      formatWithHashesInBase32
      print
    }
