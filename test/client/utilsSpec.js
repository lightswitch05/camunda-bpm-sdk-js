'use strict';
var expect = require('chai').expect;

describe('The SDK utilities', function() {
  var sdkUtils;

  it('does not blow when loading', function() {
    expect(function() {
      sdkUtils = require('./../../lib/utils');
    }).not.to.throw();
  });

  describe('HAL tools', function() {
    describe('solveHALEmbedded()', function() {
      var HALResponse = {
        _embedded: {
          objA: [
            {
              id: 'obj-a-id-1',
              title: 'Obj A'
            },
            {
              id: 'obj-a-id-2',
              title: 'Obj B'
            },
            {
              id: 'obj-a-id-3',
              title: 'Obj C'
            }
          ],
          objB: [
            {objAId: 'obj-a-id-1', _embedded: null},
            {objAId: 'obj-a-id-2', objCId: 'obviously-not-present'},
            {objAId: 'obj-a-id-3'}
          ]
        }
      };


      it('remap the response object', function() {
        var remapped;

        expect(function() {
          remapped = sdkUtils.solveHALEmbedded(HALResponse);
        }).not.to.throw();

        expect(remapped._embedded.objB[0]._embedded.objA[0].id)
          .to.eql(remapped._embedded.objB[0].objAId);

        expect(remapped._embedded.objB[1]._embedded.objA[0].id)
          .to.eql(remapped._embedded.objB[1].objAId);

        expect(remapped._embedded.objB[2]._embedded.objA[0].id)
          .to.eql(remapped._embedded.objB[2].objAId);
      });
    });
  });

  describe('control flow', function() {
    describe('series()', function() {
      it('is a function', function() {
        expect(typeof sdkUtils.series).to.eql('function');
      });


      it('runs a array of functions', function(done) {
        sdkUtils.series([
          function(cb) { setTimeout(function() { cb(null, 1); }, 1); },
          function(cb) { setTimeout(function() { cb(null, 2); }, 1); },
          function(cb) { setTimeout(function() { cb(null, 3); }, 1); }
        ], function(err, result) {

          expect(err).to.be.undefined;

          expect(result).to.not.be.undefined;

          expect(result[0]).to.eql(1);

          expect(result[1]).to.eql(2);

          expect(result[2]).to.eql(3);

          done();
        });
      });



      it('runs an object of functions', function(done) {
        sdkUtils.series({
          a: function(cb) { setTimeout(function() { cb(null, 1); }, 1); },
          b: function(cb) { setTimeout(function() { cb(null, 2); }, 1); },
          c: function(cb) { setTimeout(function() { cb(null, 3); }, 1); }
        }, function(err, result) {

          expect(err).to.be.undefined;

          expect(result).to.not.be.undefined;

          expect(result.a).to.eql(1);

          expect(result.b).to.eql(2);

          expect(result.c).to.eql(3);

          done();
        });
      });



      it('stops the serie at the first error', function(done) {
        sdkUtils.series({
          a: function(cb) { setTimeout(function() { cb(null, 1); }, 1); },
          b: function(cb) { setTimeout(function() { cb(new Error('Bang!')); }, 1); },
          c: function(cb) { setTimeout(function() { cb(null, 3); }, 1); }
        }, function(err, result) {

          expect(err).to.not.be.undefined;

          expect(result).to.not.be.undefined;

          expect(result.a).to.eql(1);

          expect(result.b).to.be.undefined;

          done();
        });
      });
    });
  });
});
