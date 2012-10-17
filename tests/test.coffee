assert = require 'assert'
should = require 'should'
connect = require 'connect'

singleLogon = require '../'

respond = (req, res) -> res.end()

describe 'Single logon', ->
  describe 'initialization', ->
    describe 'without any options', ->
      it 'should raise an error', ->
        (-> singleLogon()).should.throw 'uniqueUser parameter is required'

    describe 'with missing uniqueUser function', ->
      it 'should raise an error', ->
        (-> singleLogon({})).should.throw 'uniqueUser parameter is required'

    describe 'with uniqueUser function and no flush function', ->
      it 'should not raise any errors', ->
        (-> singleLogon({
          uniqueUser: -> 1
        })).should.not.throw()

    describe 'with userKey and flush function', ->
      it 'should not raise any errors', ->
        (-> singleLogon({
          uniqueUser: -> 1,
          flushSession: ->
        })).should.not.throw()

