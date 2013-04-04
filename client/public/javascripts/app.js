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

window.require.register("application", function(exports, require, module) {
  var Application;

  module.exports = Application = {
    initialize: function() {
      var AlbumCollection, Router;

      AlbumCollection = require('collections/album');
      Router = require('router');
      this.albums = new AlbumCollection();
      this.router = new Router();
      this.albums.fetch();
      this.albums.once('sync', function() {
        return Backbone.history.start();
      });
      if (typeof Object.freeze === 'function') {
        return Object.freeze(this);
      }
    }
  };
  
});
window.require.register("collections/album", function(exports, require, module) {
  var AlbumCollection, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = AlbumCollection = (function(_super) {
    __extends(AlbumCollection, _super);

    function AlbumCollection() {
      _ref = AlbumCollection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AlbumCollection.prototype.model = require('models/album');

    AlbumCollection.prototype.url = 'albums';

    return AlbumCollection;

  })(Backbone.Collection);
  
});
window.require.register("collections/photo", function(exports, require, module) {
  var PhotoCollection, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = PhotoCollection = (function(_super) {
    __extends(PhotoCollection, _super);

    function PhotoCollection() {
      _ref = PhotoCollection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    PhotoCollection.prototype.model = require('models/photo');

    PhotoCollection.prototype.url = 'photos';

    return PhotoCollection;

  })(Backbone.Collection);
  
});
window.require.register("initialize", function(exports, require, module) {
  var app;

  app = require('application');

  $(function() {
    jQuery.event.props.push('dataTransfer');
    return app.initialize();
  });
  
});
window.require.register("lib/base_view", function(exports, require, module) {
  var BaseView, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = BaseView = (function(_super) {
    __extends(BaseView, _super);

    function BaseView() {
      this.render = __bind(this.render, this);    _ref = BaseView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    BaseView.prototype.initialize = function(options) {
      return this.options = options;
    };

    BaseView.prototype.template = function() {};

    BaseView.prototype.getRenderData = function() {};

    BaseView.prototype.render = function() {
      var data;

      data = _.extend({}, this.options, this.getRenderData());
      this.$el.html(this.template(data));
      this.afterRender();
      return this;
    };

    BaseView.prototype.afterRender = function() {};

    return BaseView;

  })(Backbone.View);
  
});
window.require.register("lib/helpers", function(exports, require, module) {
  module.exports = {
    limitLength: function(string, length) {
      if ((string != null) && string.length > length) {
        return string.substring(0, length) + '...';
      } else {
        return string;
      }
    },
    editable: function(el, options) {
      var onChanged, placeholder;

      placeholder = options.placeholder, onChanged = options.onChanged;
      el.prop('contenteditable', true);
      if (!el.text()) {
        el.text(placeholder);
      }
      el.focus(function() {
        if (!el.text() === placeholder) {
          return el.empty();
        }
      });
      return el.blur(function() {
        if (!el.text()) {
          return el.text(placeholder);
        } else {
          return onChanged(el.text());
        }
      });
    }
  };
  
});
window.require.register("lib/view_collection", function(exports, require, module) {
  var BaseView, ViewCollection, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('lib/base_view');

  module.exports = ViewCollection = (function(_super) {
    __extends(ViewCollection, _super);

    function ViewCollection() {
      this.afterRender = __bind(this.afterRender, this);
      this.onAdd = __bind(this.onAdd, this);    _ref = ViewCollection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ViewCollection.prototype.itemview = null;

    ViewCollection.prototype.views = {};

    ViewCollection.prototype.template = function() {
      return '';
    };

    ViewCollection.prototype.initialize = function(options) {
      ViewCollection.__super__.initialize.apply(this, arguments);
      this.collection.forEach(this.onAdd);
      this.listenTo(this.collection, "reset", this.onReset);
      this.listenTo(this.collection, "add", this.onAdd);
      return this.listenTo(this.collection, "remove", this.onRemove);
    };

    ViewCollection.prototype.onAdd = function(model) {
      var view;

      view = new this.itemview(_.extend({
        model: model
      }, this.options));
      view.render();
      this.views[model.id] = view;
      return this.appendView(view);
    };

    ViewCollection.prototype.appendView = function(view) {
      return this.$el.append(view.el);
    };

    ViewCollection.prototype.onRemove = function(model) {
      var id, view, _ref1, _results;

      _ref1 = this.views;
      _results = [];
      for (id in _ref1) {
        view = _ref1[id];
        if (view.model === model) {
          view.remove();
          _results.push(delete this.views[id]);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ViewCollection.prototype.onReset = function(newcollection) {
      var id, view, views, _ref1;

      _ref1 = this.views;
      for (id in _ref1) {
        view = _ref1[id];
        view.remove();
      }
      views = {};
      return newcollection.forEach(this.onAdd);
    };

    ViewCollection.prototype.afterRender = function() {
      return this.collection.forEach(this.onAdd);
    };

    return ViewCollection;

  })(BaseView);
  
});
window.require.register("models/album", function(exports, require, module) {
  var Album, PhotoCollection,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  PhotoCollection = require('collections/photo');

  module.exports = Album = (function(_super) {
    __extends(Album, _super);

    Album.prototype.urlRoot = 'albums';

    Album.prototype.defaults = {
      title: '',
      description: ''
    };

    function Album() {
      this.photos = new PhotoCollection();
      return Album.__super__.constructor.apply(this, arguments);
    }

    Album.prototype.parse = function(attrs) {
      this.photos.reset(attrs.photos);
      delete attrs.photos;
      return attrs;
    };

    return Album;

  })(Backbone.Model);
  
});
window.require.register("models/photo", function(exports, require, module) {
  var MAX_HEIGHT, MAX_WIDTH, Photo, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MAX_WIDTH = MAX_HEIGHT = 100;

  module.exports = Photo = (function(_super) {
    __extends(Photo, _super);

    function Photo() {
      this.makeThumbBlob = __bind(this.makeThumbBlob, this);
      this.makeThumbDataURI = __bind(this.makeThumbDataURI, this);
      this.readFile = __bind(this.readFile, this);
      this.setSources = __bind(this.setSources, this);    _ref = Photo.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Photo.prototype.defaults = function() {
      return {
        title: 'noname',
        src: '#',
        thumbsrc: 'http://placehold.it/150/&text=loading'
      };
    };

    Photo.prototype.sync = function(method, model, options) {
      var formdata;

      if (method === 'create') {
        formdata = new FormData();
        formdata.append('raw', this.file);
        formdata.append('thumb', this.thumb);
        formdata.append('title', this.get('title'));
        options.data = formdata;
        options.contentType = false;
      }
      return Photo.__super__.sync.call(this, method, model, options);
    };

    Photo.prototype.initialize = function() {
      if (this.isNew()) {
        return this.on('change:id', this.setSources);
      } else {
        return this.setSources();
      }
    };

    Photo.prototype.setSources = function() {
      this.set('src', "photos/" + this.id + ".jpg");
      return this.set('thumbsrc', "photos/thumbs/" + this.id + ".jpg");
    };

    Photo.prototype.readFile = function(next) {
      var reader,
        _this = this;

      reader = new FileReader();
      this.img = new Image();
      reader.readAsDataURL(this.file);
      return reader.onloadend = function() {
        _this.img.src = reader.result;
        return _this.img.onload = function() {
          return next();
        };
      };
    };

    Photo.prototype.makeThumbDataURI = function(next) {
      var canvas, ctx, height, newHeight, newWidth, width;

      width = this.img.width;
      height = this.img.height;
      if (width > height && height > MAX_HEIGHT) {
        newWidth = width * MAX_HEIGHT / height;
        newHeight = MAX_HEIGHT;
      } else if (width > MAX_WIDTH) {
        newWidth = MAX_WIDTH;
        newHeight = height * MAX_WIDTH / width;
      }
      canvas = document.createElement('canvas');
      canvas.width = MAX_WIDTH;
      canvas.height = MAX_HEIGHT;
      ctx = canvas.getContext('2d');
      ctx.drawImage(this.img, 0, 0, newWidth, newHeight);
      this.thumb_du = canvas.toDataURL('image/jpeg');
      this.img = null;
      return next();
    };

    Photo.prototype.makeThumbBlob = function(next) {
      var array, binary, i, _i, _ref1;

      binary = atob(this.thumb_du.split(',')[1]);
      array = [];
      for (i = _i = 0, _ref1 = binary.length; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        array.push(binary.charCodeAt(i));
      }
      this.thumb = new Blob([new Uint8Array(array)], {
        type: 'image/jpeg'
      });
      return next();
    };

    Photo.prototype.doUpload = function(file) {
      var _this = this;

      this.file = file;
      setTimeout(function() {
        return _this.readFile(function() {
          return _this.makeThumbDataURI(function() {
            _this.set('thumbsrc', _this.thumb_du);
            return _this.makeThumbBlob(function() {
              return _this.save({
                success: function() {
                  _this.file = null;
                  return _this.thumb = null;
                }
              });
            });
          });
        });
      }, 1);
      return this;
    };

    return Photo;

  })(Backbone.Model);
  
});
window.require.register("router", function(exports, require, module) {
  var Album, AlbumListView, AlbumView, Router, app, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  AlbumListView = require('views/albumslist');

  AlbumView = require('views/album');

  Album = require('models/album');

  module.exports = Router = (function(_super) {
    __extends(Router, _super);

    function Router() {
      this.displayView = __bind(this.displayView, this);    _ref = Router.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Router.prototype.routes = {
      '': 'albumslist',
      'albums': 'albumslist',
      'albums/edit': 'albumslistedit',
      'albums/new': 'newalbum',
      'albums/:albumid': 'album',
      'albums/:albumid/edit': 'albumedit'
    };

    Router.prototype.albumslist = function() {
      return this.displayView(new AlbumListView({
        collection: app.albums,
        editable: false
      }));
    };

    Router.prototype.albumslistedit = function() {
      return this.displayView(new AlbumListView({
        collection: app.albums,
        editable: true
      }));
    };

    Router.prototype.newalbum = function() {
      var album,
        _this = this;

      album = new Album();
      album.once('change:id', function(model, id) {
        return _this.navigate("albums/" + id);
      });
      return this.displayView(new AlbumView({
        model: album,
        editable: true
      }));
    };

    Router.prototype.album = function(id) {
      var album;

      album = app.albums.get(id);
      return this.displayView(new AlbumView({
        model: album,
        editable: false
      }));
    };

    Router.prototype.albumedit = function(id) {
      var album;

      album = app.albums.get(id);
      return this.displayView(new AlbumView({
        model: album,
        editable: true
      }));
    };

    Router.prototype.displayView = function(view) {
      if (this.mainView) {
        this.mainView.remove();
      }
      this.mainView = view;
      return $('body').append(view.render().el);
    };

    return Router;

  })(Backbone.Router);
  
});
window.require.register("templates/album", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div class="row-fluid"><div id="about" class="span4"><h1 id="path"><a href="#albums">&lt;</a>&nbsp;</h1><h1 id="title">' + escape((interp = title) == null ? '' : interp) + '</h1><div id="description">' + escape((interp = description) == null ? '' : interp) + '</div></div><div id="photos" class="span8"></div></div>');
  if ( 'undefined' != typeof id)
  {
  buf.push('<div class="btn-group editor">');
  if ( editable)
  {
  buf.push('<a');
  buf.push(attrs({ 'href':("#albums/" + (id) + ""), "class": ('btn') + ' ' + ('btn-inverse') }, {"href":true}));
  buf.push('><i class="icon-eye-open icon-white"></i></a>');
  }
  else
  {
  buf.push('<a');
  buf.push(attrs({ 'href':("#albums/" + (id) + "/edit"), "class": ('btn') + ' ' + ('btn-inverse') }, {"href":true}));
  buf.push('><i class="icon-edit icon-white"></i></a>');
  }
  buf.push('</div>');
  }
  }
  return buf.join("");
  };
});
window.require.register("templates/albumlist", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div class="btn-group editor"><a href="#albums/new" class="btn btn-inverse"><i class="icon-plus icon-white"></i></a>');
  if ( editable)
  {
  buf.push('<a href="#albums" class="btn btn-inverse"><i class="icon-eye-open icon-white"></i></a>');
  }
  else
  {
  buf.push('<a href="#albums/edit" class="btn btn-inverse"><i class="icon-edit icon-white"></i></a>');
  }
  buf.push('</div>');
  }
  return buf.join("");
  };
});
window.require.register("templates/albumlist_item", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<a');
  buf.push(attrs({ 'href':("#albums/" + (id) + ""), "class": ('pull-left') }, {"href":true}));
  buf.push('><img src="http://placehold.it/150/&amp;text=album" class="media-object"/></a><div class="media-body"><h4 class="media-heading">' + escape((interp = title) == null ? '' : interp) + '</h4><p>' + escape((interp = description) == null ? '' : interp) + '</p></div>');
  if ( editable)
  {
  buf.push('<btn class="btn delete btn-danger">X</btn>');
  }
  }
  return buf.join("");
  };
});
window.require.register("templates/photo", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<a');
  buf.push(attrs({ 'href':("" + (src) + ""), 'title':("" + (title) + "") }, {"href":true,"title":true}));
  buf.push('><img');
  buf.push(attrs({ 'src':("" + (thumbsrc) + ""), 'alt':("" + (title) + "") }, {"src":true,"alt":true}));
  buf.push('/></a>');
  if ( editable)
  {
  buf.push('<btn class="btn delete btn-danger">X</btn>');
  }
  }
  return buf.join("");
  };
});
window.require.register("views/album", function(exports, require, module) {
  var AlbumView, BaseView, Gallery, app, editable, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  BaseView = require('lib/base_view');

  Gallery = require('views/gallery');

  editable = require('lib/helpers').editable;

  module.exports = AlbumView = (function(_super) {
    __extends(AlbumView, _super);

    function AlbumView() {
      this.beforePhotoUpload = __bind(this.beforePhotoUpload, this);    _ref = AlbumView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AlbumView.prototype.template = require('templates/album');

    AlbumView.prototype.className = 'container-fluid';

    AlbumView.prototype.initialize = function(options) {
      AlbumView.__super__.initialize.apply(this, arguments);
      if (!this.model.isNew()) {
        return this.model.fetch();
      }
    };

    AlbumView.prototype.getRenderData = function() {
      return _.extend({
        editable: this.editable
      }, this.model.attributes);
    };

    AlbumView.prototype.afterRender = function() {
      var _this = this;

      this.about = this.$('#about');
      this.title = this.$('#title');
      this.gallerydiv = this.$('#photos');
      this.description = this.$('#description');
      this.gallery = new Gallery({
        el: this.gallerydiv,
        editable: this.editable,
        collection: this.model.photos,
        beforeUpload: this.beforePhotoUpload
      });
      if (this.options.editable) {
        editable(this.title, {
          placeholder: 'Title ...',
          onChanged: function(text) {
            return _this.saveModel({
              title: text
            });
          }
        });
        return editable(this.description, {
          placeholder: 'Write some more ...',
          onChanged: function(text) {
            return _this.saveModel({
              description: text
            });
          }
        });
      }
    };

    AlbumView.prototype.beforePhotoUpload = function(done) {
      var _this = this;

      if (this.model.isNew()) {
        return saveModel().then(function() {
          return done({
            albumid: _this.model.id
          });
        });
      } else {
        return done({
          albumid: this.model.id
        });
      }
    };

    AlbumView.prototype.saveModel = function(hash) {
      return this.model.save(hash).then(function() {
        return app.albums.add(this.model);
      });
    };

    return AlbumView;

  })(BaseView);
  
});
window.require.register("views/albumslist", function(exports, require, module) {
  var Album, AlbumItem, AlbumList, BaseView, ViewCollection, app, limitLength, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  BaseView = require('lib/base_view');

  ViewCollection = require('lib/view_collection');

  Album = require('models/album');

  limitLength = require('lib/helpers').limitLength;

  AlbumItem = (function(_super) {
    __extends(AlbumItem, _super);

    function AlbumItem() {
      this.events = __bind(this.events, this);    _ref = AlbumItem.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AlbumItem.prototype.className = 'albumitem media';

    AlbumItem.prototype.template = require('templates/albumlist_item');

    AlbumItem.prototype.events = function() {
      var _this = this;

      return {
        'click btn.delete': function() {
          return _this.model.destroy();
        }
      };
    };

    AlbumItem.prototype.getRenderData = function() {
      var out;

      out = this.model.attributes;
      out.description = limitLength(out.description, 250);
      return out;
    };

    return AlbumItem;

  })(BaseView);

  module.exports = AlbumList = (function(_super) {
    __extends(AlbumList, _super);

    function AlbumList() {
      _ref1 = AlbumList.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    AlbumList.prototype.id = 'album-list';

    AlbumList.prototype.itemview = AlbumItem;

    AlbumList.prototype.template = require('templates/albumlist');

    AlbumList.prototype.events = {
      'click #create-album': 'createAlbum'
    };

    AlbumList.prototype.createAlbum = function() {
      return app.router.navigate("albums/new", {
        trigger: true
      });
    };

    return AlbumList;

  })(ViewCollection);
  
});
window.require.register("views/gallery", function(exports, require, module) {
  var Gallery, Photo, PhotoView, ViewCollection, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ViewCollection = require('lib/view_collection');

  PhotoView = require('views/photo');

  Photo = require('models/photo');

  module.exports = Gallery = (function(_super) {
    __extends(Gallery, _super);

    function Gallery() {
      _ref = Gallery.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Gallery.prototype.itemview = PhotoView;

    Gallery.prototype.events = {
      'drop': 'onFilesDropped',
      'dragover': 'onDragOver'
    };

    Gallery.prototype.initialize = function(options) {
      Gallery.__super__.initialize.apply(this, arguments);
      return this.beforeUpload = options.beforeUpload;
    };

    Gallery.prototype.afterRender = function() {
      return this.$el.photobox('a', {
        thumbs: true
      }, function() {});
    };

    Gallery.prototype.onFilesDropped = function(evt) {
      var files;

      this.$el.removeClass('dragover');
      evt.stopPropagation();
      evt.preventDefault();
      files = evt.dataTransfer.files;
      this.handleFiles(files);
      return false;
    };

    Gallery.prototype.onDragOver = function(evt) {
      this.$el.addClass('dragover');
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    };

    Gallery.prototype.handleFiles = function(files) {
      var _this = this;

      return this.beforeUpload(function(options) {
        var file, photo, photoattrs, _i, _len, _results;

        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          photoattrs = {
            title: file.name
          };
          photo = new Photo(_.extend(photoattrs, options));
          photo.doUpload(file);
          _results.push(_this.collection.add(photo));
        }
        return _results;
      });
    };

    return Gallery;

  })(ViewCollection);
  
});
window.require.register("views/photo", function(exports, require, module) {
  var BaseView, PhotoView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('lib/base_view');

  module.exports = PhotoView = (function(_super) {
    __extends(PhotoView, _super);

    function PhotoView() {
      _ref = PhotoView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    PhotoView.prototype.template = require('templates/photo');

    PhotoView.prototype.className = 'photo';

    PhotoView.prototype.events = {
      'click   btn.delete': 'deletePhoto'
    };

    PhotoView.prototype.getRenderData = function() {
      return this.model.attributes;
    };

    PhotoView.prototype.initialize = function() {
      return this.listenTo(this.model, 'change', this.render);
    };

    PhotoView.prototype.deletePhoto = function() {
      return this.model.destroy();
    };

    return PhotoView;

  })(BaseView);
  
});
