(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.brunch = true;
})();

var createSinonServer;

createSinonServer = function() {
  var createAutoResponse, server;

  this.server = server = sinon.fakeServer.create();
  createAutoResponse = function(method, url, code, JSONResponder) {
    return server.respondWith(method, url, function(req) {
      var body, headers, res;

      body = JSON.parse(req.requestBody);
      res = JSONResponder(req, body);
      headers = {
        'Content-Type': 'application/json'
      };
      return req.respond(code, headers, JSON.stringify(res));
    });
  };
  this.server.checkLastRequestIs = function(method, url) {
    var req;

    req = server.requests[server.requests.length - 1];
    expect(req.url).to.equal(url);
    return expect(req.method).to.equal(method);
  };
  createAutoResponse('POST', 'albums', 200, function(req, body) {
    return {
      id: 'a1',
      title: body.title,
      description: body.description
    };
  });
  createAutoResponse('GET', 'albums/a1', 200, function(req) {
    return {
      id: 'a1',
      title: 'title',
      description: 'description'
    };
  });
  createAutoResponse('PUT', 'albums/a1', 200, function(req, body) {
    return {
      id: body.id,
      title: body.title,
      description: body.description
    };
  });
  createAutoResponse('DELETE', 'albums/a1', 200, function(req, body) {
    return {
      success: 'album deleted'
    };
  });
  return this.server;
};
;
describe('Models/Album', function() {
  var Album, PhotoCollection;

  Album = require('models/album');
  PhotoCollection = require('collections/photo');
  before(function() {
    return this.model = new Album();
  });
  before(createSinonServer);
  after(function() {
    return this.server.restore();
  });
  it('should have a photos field, of type PhotoCollection', function() {
    return expect(this.model.photos).to.be["instanceof"](PhotoCollection);
  });
  it('should post /albums on save', function() {
    var callback;

    callback = sinon.spy();
    this.model.save({
      title: 'test-title'
    }).then(callback);
    this.server.checkLastRequestIs('POST', 'albums');
    this.server.respond();
    return expect(callback.calledOnce).to.be.ok;
  });
  it('should then have id from the server', function() {
    return expect(this.model.id).to.equal('a1');
  });
  it('should put /albums/a1 on save', function() {
    var callback;

    callback = sinon.spy();
    this.model.save({
      description: 'test-desc'
    }).then(callback);
    this.server.checkLastRequestIs('PUT', 'albums/a1');
    this.server.respond();
    return expect(callback.calledOnce).to.be.ok;
  });
  it('should get /albums/a1 on fetch', function() {
    var callback;

    callback = sinon.spy();
    this.model.fetch().then(callback);
    this.server.checkLastRequestIs('GET', 'albums/a1');
    this.server.respond();
    return expect(callback.calledOnce).to.be.ok;
  });
  return it('should del /albums/a1 on destroy', function() {
    var callback;

    callback = sinon.spy();
    this.model.destroy().then(callback);
    this.server.checkLastRequestIs('DELETE', 'albums/a1');
    this.server.respond();
    return expect(callback.calledOnce).to.be.ok;
  });
});
;
describe('BaseView', function() {});
;
describe('helpers', function() {
  var helpers;

  helpers = require('lib/helpers');
  return describe('.limitLength', function() {
    var longString, shortString;

    shortString = "test";
    longString = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\naaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    it('should not change a short string', function() {
      var output;

      output = helpers.limitLength(shortString, 50);
      return expect(output).to.equal(shortString);
    });
    return it('should shorten a long string and finish by ...', function() {
      var output;

      output = helpers.limitLength(longString, 50);
      console.log(output.length);
      expect(output).to.have.length(53);
      return expect(output.substring(50)).to.equal('...');
    });
  });
});
;
describe('ViewCollection', function() {});
;
