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
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

describe('lib/base_view', function() {
  var BaseView, options, spyRenderData, spyTemplate, testView, _ref;
  BaseView = require('lib/base_view');
  testView = (function(_super) {
    __extends(testView, _super);

    function testView() {
      _ref = testView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    testView.prototype.template = function() {
      return '<div id="test"></div>';
    };

    testView.prototype.getRenderData = function() {
      return {
        key: 'value'
      };
    };

    return testView;

  })(BaseView);
  options = {
    optkey: 'optvalue'
  };
  spyTemplate = sinon.spy(testView.prototype, 'template');
  spyRenderData = sinon.spy(testView.prototype, 'getRenderData');
  it('should not call anything on creation', function() {
    this.view = new testView(options);
    expect(spyTemplate.called).to.be["false"];
    return expect(spyRenderData.called).to.be["false"];
  });
  it('should not throw on render', function() {
    return this.view.render();
  });
  it('should have called getRenderData', function() {
    return expect(spyRenderData.calledOnce).to.be["true"];
  });
  it('should have called template with renderData and options', function() {
    var arg;
    expect(spyTemplate.calledOnce).to.be["true"];
    arg = spyTemplate.firstCall.args[0];
    expect(arg).to.have.property('key', 'value');
    return expect(arg).to.have.property('optkey', 'optvalue');
  });
  return it('should contains the template', function() {
    return expect(this.view.$el.find('#test')).to.have.length(1);
  });
});
;
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

describe('lib/base_view', function() {
  var BaseView, options, spyRenderData, spyTemplate, testView, _ref;
  BaseView = require('lib/base_view');
  testView = (function(_super) {
    __extends(testView, _super);

    function testView() {
      _ref = testView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    testView.prototype.template = function() {
      return '<div id="test"></div>';
    };

    testView.prototype.getRenderData = function() {
      return {
        key: 'value'
      };
    };

    return testView;

  })(BaseView);
  options = {
    optkey: 'optvalue'
  };
  spyTemplate = sinon.spy(testView.prototype, 'template');
  spyRenderData = sinon.spy(testView.prototype, 'getRenderData');
  it('should not call anything on creation', function() {
    this.view = new testView(options);
    expect(spyTemplate.called).to.be["false"];
    return expect(spyRenderData.called).to.be["false"];
  });
  it('should not throw on render', function() {
    return this.view.render();
  });
  it('should have called getRenderData', function() {
    return expect(spyRenderData.calledOnce).to.be["true"];
  });
  it('should have called template with renderData and options', function() {
    var arg;
    expect(spyTemplate.calledOnce).to.be["true"];
    arg = spyTemplate.firstCall.args[0];
    expect(arg).to.have.property('key', 'value');
    return expect(arg).to.have.property('optkey', 'optvalue');
  });
  return it('should contains the template', function() {
    return expect(this.view.$el.find('#test')).to.have.length(1);
  });
});
;
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

describe('lib/view_collection', function() {
  var BaseView, ViewCollection, myCollection, myCollectionView, myModel, myView, options, spyItemRemove, spyItemRender, spyItemTemplate, spyRender, spyTemplate, _ref, _ref1, _ref2, _ref3;
  BaseView = require('lib/base_view');
  ViewCollection = require('lib/view_collection');
  myModel = (function(_super) {
    __extends(myModel, _super);

    function myModel() {
      _ref = myModel.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return myModel;

  })(Backbone.Model);
  myCollection = (function(_super) {
    __extends(myCollection, _super);

    function myCollection() {
      _ref1 = myCollection.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    myCollection.prototype.model = myModel;

    return myCollection;

  })(Backbone.Collection);
  myView = (function(_super) {
    __extends(myView, _super);

    function myView() {
      _ref2 = myView.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    myView.prototype.className = 'item';

    myView.prototype.template = function() {
      return 'item content';
    };

    myView.prototype.getRenderData = function() {
      return this.model.attributes;
    };

    return myView;

  })(BaseView);
  myCollectionView = (function(_super) {
    __extends(myCollectionView, _super);

    function myCollectionView() {
      _ref3 = myCollectionView.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    myCollectionView.prototype.itemView = myView;

    myCollectionView.prototype.template = function() {
      return '<div id="test"></div>';
    };

    myCollectionView.prototype.itemViewOptions = function() {
      return {
        optkey: 'optvalue'
      };
    };

    return myCollectionView;

  })(ViewCollection);
  options = {
    optkey: 'optvalue'
  };
  spyRender = sinon.spy(myCollectionView.prototype, 'render');
  spyTemplate = sinon.spy(myCollectionView.prototype, 'template');
  spyItemRender = sinon.spy(myView.prototype, 'render');
  spyItemRemove = sinon.spy(myView.prototype, 'remove');
  spyItemTemplate = sinon.spy(myView.prototype, 'template');
  it('should not call anything on creation', function() {
    this.collection = new myCollection();
    this.view = new myCollectionView({
      collection: this.collection
    });
    expect(spyTemplate.called).to.be["false"];
    return expect(spyRender.called).to.be["false"];
  });
  it('should render a subview when I add a model to the collection', function() {
    var arg;
    this.model = new myModel({
      attribute1: 'value1'
    });
    this.collection.add(this.model);
    expect(spyItemRender.calledOnce).to.be["true"];
    expect(spyItemTemplate.calledOnce).to.be["true"];
    arg = spyItemTemplate.firstCall.args[0];
    expect(arg).to.have.property('attribute1', 'value1');
    expect(arg).to.have.property('optkey', 'optvalue');
    return expect(this.view.$el.find('.item')).to.have.length(1);
  });
  it('should not touch subviews on render', function() {
    var i, _i;
    for (i = _i = 1; _i <= 100; i = ++_i) {
      this.view.render();
    }
    expect(spyItemRender.calledOnce).to.be["true"];
    expect(spyItemTemplate.calledOnce).to.be["true"];
    return expect(this.view.$el.find('#test')).to.have.length(1);
  });
  it('should remove the subview when I remove the model', function() {
    this.collection.remove(this.model);
    return expect(this.view.$el.find('.item')).to.have.length(0);
  });
  return it('should not keep a reference to the view', function() {
    expect(_.size(this.view.views)).to.equal(0);
    return expect(spyItemRemove.calledOnce).to.be["true"];
  });
});
;
describe('models/album', function() {
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
  return it('should have a photos field, of type PhotoCollection', function() {
    return expect(this.model.photos).to.be["instanceof"](PhotoCollection);
  });
});
;
describe('view/helpers', function() {
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
