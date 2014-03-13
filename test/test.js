process.argv = ['node', 'thing.js', '--config', './test/test-config.json'];
var assert = require('assert');
var hammond = require('../');
var http = require('http');
var domain = require('domain');
describe('George Hammond', function() {
  it('should read a config file', function(done) {
    var config = require('../')('service')(function(config) {
      assert(config.serverSetting);
      done()
    });
  });
  it('should throw if the config is missing required keys', function(done) {
    var d = domain.create();
    var didError = false;
    d.on('error', function() {
      didError = true;
      done();
    });
    d.run(function() {
      hammond('service', ['someCrazyNewThing'])(function(){
        assert(didError);
      });
    });
  });
  it('should inherit values', function(done) {
    hammond('service')(function(config) {
      assert(config.globalSetting);
      done()
    });
  });
  it('should get other services', function(done) {
    hammond('service')(function(config) {
      assert(config.otherService == 'http://localhost:1234');
      done()
    });
  });
  it('should use env overrides', function(done) {
    process.env.GH_CONFIG_OVERRIDE = JSON.stringify({ service: { port: 8010 } })
    hammond()(function(config) {
      assert(config.service.port  == 8010);
      delete process.env.GH_CONFIG_OVERRIDE;
      done()
    });
  });
  it('should retrieve a config from an arbitrary location', function(done) {
    var server = http.createServer(function(req,res) {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      var confstream = require('fs').createReadStream('./test/test-config.json');
      confstream.pipe(res);
    }).listen(62853);
    process.argv = ['node', 'thing.js', '--config', 'http://localhost:62853'];
    hammond('service')(function(config) {
      assert(config.globalSetting);
      done();
    });
  });
});
