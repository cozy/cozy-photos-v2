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
  module.exports = {
    initialize: function() {
      var AlbumCollection, Router, e, locales;
      this.locale = window.locale;
      this.polyglot = new Polyglot();
      try {
        locales = require('locales/' + this.locale);
      } catch (_error) {
        e = _error;
        locales = require('locales/en');
      }
      this.polyglot.extend(locales);
      window.t = this.polyglot.t.bind(this.polyglot);
      AlbumCollection = require('collections/album');
      Router = require('router');
      this.albums = new AlbumCollection();
      this.router = new Router();
      this.mode = window.location.pathname.match(/public/) ? 'public' : 'owner';
      if (window.initalbums) {
        this.albums.reset(window.initalbums, {
          parse: true
        });
        delete window.initalbums;
        return Backbone.history.start();
      } else {
        return this.albums.fetch().done(function() {
          return Backbone.history.start();
        });
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

    PhotoCollection.prototype.comparator = function(model) {
      return model.get('title');
    };

    return PhotoCollection;

  })(Backbone.Collection);
  
});
window.require.register("helpers/client", function(exports, require, module) {
  exports.request = function(type, url, data, callbacks) {
    return $.ajax({
      type: type,
      url: url,
      data: data,
      success: callbacks.success,
      error: callbacks.error
    });
  };

  exports.get = function(url, callbacks) {
    return exports.request("GET", url, null, callbacks);
  };

  exports.post = function(url, data, callbacks) {
    return exports.request("POST", url, data, callbacks);
  };

  exports.put = function(url, data, callbacks) {
    return exports.request("PUT", url, data, callbacks);
  };

  exports.del = function(url, callbacks) {
    return exports.request("DELETE", url, null, callbacks);
  };
  
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
      this.render = __bind(this.render, this);
      _ref = BaseView.__super__.constructor.apply(this, arguments);
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
window.require.register("lib/clipboard", function(exports, require, module) {
  var Clipboard,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports = Clipboard = (function() {
    function Clipboard() {
      this.set = __bind(this.set, this);
      var _this = this;
      this.value = "";
      $(document).keydown(function(e) {
        var _ref, _ref1;
        if (!_this.value || !(e.ctrlKey || e.metaKey)) {
          return;
        }
        if (typeof window.getSelection === "function" ? (_ref = window.getSelection()) != null ? _ref.toString() : void 0 : void 0) {
          return;
        }
        if ((_ref1 = document.selection) != null ? _ref1.createRange().text : void 0) {
          return;
        }
        return _.defer(function() {
          var $clipboardContainer;
          $clipboardContainer = $("#clipboard-container");
          $clipboardContainer.empty().show();
          return $("<textarea id='clipboard'></textarea>").val(_this.value).appendTo($clipboardContainer).focus().select();
        });
      });
      $(document).keyup(function(e) {
        if ($(e.target).is("#clipboard")) {
          $("<textarea id='clipboard'></textarea>").val("");
          return $("#clipboard-container").empty().hide();
        }
      });
    }

    Clipboard.prototype.set = function(value) {
      return this.value = value;
    };

    return Clipboard;

  })();
  
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
      el.click(function() {
        if (el.text() === placeholder) {
          el.empty();
        }
        return module.exports.forceFocus(el);
      });
      el.focus(function() {
        if (el.text() === placeholder) {
          return el.empty();
        }
      });
      return el.blur(function() {
        if (!el.text()) {
          return el.text(placeholder);
        } else {
          return onChanged(el.html());
        }
      });
    },
    forceFocus: function(el) {
      var range, sel;
      range = document.createRange();
      range.selectNodeContents(el[0]);
      sel = document.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      return el.focus();
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
      this.removeItem = __bind(this.removeItem, this);
      this.addItem = __bind(this.addItem, this);
      _ref = ViewCollection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ViewCollection.prototype.views = {};

    ViewCollection.prototype.itemView = null;

    ViewCollection.prototype.itemViewOptions = function() {};

    ViewCollection.prototype.checkIfEmpty = function() {
      return this.$el.toggleClass('empty', _.size(this.views) === 0);
    };

    ViewCollection.prototype.appendView = function(view) {
      var className, index, selector, tagName;
      index = this.collection.indexOf(view.model);
      if (index === 0) {
        return this.$el.append(view.$el);
      } else {
        className = view.className != null ? "." + view.className : "";
        tagName = view.tagName || "";
        selector = "" + tagName + className + ":nth-of-type(" + index + ")";
        return this.$el.find(selector).after(view.$el);
      }
    };

    ViewCollection.prototype.initialize = function() {
      ViewCollection.__super__.initialize.apply(this, arguments);
      this.views = {};
      this.listenTo(this.collection, "reset", this.onReset);
      this.listenTo(this.collection, "add", this.addItem);
      this.listenTo(this.collection, "sort", this.render);
      this.listenTo(this.collection, "remove", this.removeItem);
      return this.onReset(this.collection);
    };

    ViewCollection.prototype.render = function() {
      var id, view, _ref1;
      _ref1 = this.views;
      for (id in _ref1) {
        view = _ref1[id];
        view.$el.detach();
      }
      return ViewCollection.__super__.render.apply(this, arguments);
    };

    ViewCollection.prototype.afterRender = function() {
      var i, _i, _ref1;
      if (this.collection.length > 0) {
        for (i = _i = 0, _ref1 = this.collection.length - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          this.appendView(this.views[this.collection.at(i).cid]);
        }
        return this.checkIfEmpty(this.views);
      }
    };

    ViewCollection.prototype.remove = function() {
      this.onReset([]);
      return ViewCollection.__super__.remove.apply(this, arguments);
    };

    ViewCollection.prototype.onReset = function(newcollection) {
      var id, view, _ref1;
      _ref1 = this.views;
      for (id in _ref1) {
        view = _ref1[id];
        view.remove();
      }
      return newcollection.forEach(this.addItem);
    };

    ViewCollection.prototype.addItem = function(model) {
      var options, view;
      options = _.extend({}, {
        model: model
      }, this.itemViewOptions(model));
      view = new this.itemView(options);
      this.views[model.cid] = view.render();
      this.appendView(view);
      return this.checkIfEmpty(this.views);
    };

    ViewCollection.prototype.removeItem = function(model) {
      this.views[model.cid].remove();
      delete this.views[model.cid];
      return this.checkIfEmpty(this.views);
    };

    return ViewCollection;

  })(BaseView);
  
});
window.require.register("locales/en", function(exports, require, module) {
  module.exports = {
    "Back": "Back",
    "Create a new album": "Create a new album",
    "Delete": "Delete",
    "Download": "Download",
    "Edit": "Edit",
    "It will appears on your homepage.": "It will appears on your homepage.",
    "Make it Hidden": "Make it Hidden",
    "Make it Private": "Make it Private",
    "Make it Public": "Make it Public",
    "New": "New",
    "private": "private",
    "public": "public",
    "hidden": "hidden",
    "There is no photos in this album": "There is no photos in this album",
    "There is no public albums.": "There is no public albums.",
    "This album is private": "This album is private",
    "This album is hidden": "This album is hidden",
    "This album is public": "This album is public",
    "Title ...": "Title ...",
    "View": "View",
    "Write some more ...": "Write some more ...",
    "Drag your photos here to upload them": "Drag your photos here to upload them\"",
    "hidden-description": "It will not appears on your homepage.\nBut you can share it with the following url :",
    "It cannot be accessed from the public side": "It cannot be accessed from the public side\""
  };
  
});
window.require.register("locales/fr", function(exports, require, module) {
  module.exports = {
    "Back": "Retour",
    "Create a new album": "Créer un nouvel album",
    "Delete": "Supprimer",
    "Download": "Télécharger",
    "Edit": "Modifier",
    "It will appears on your homepage.": "It apparaitra votre page d'accueil",
    "Make it Hidden": "Rendre Masqué",
    "Make it Private": "Rendre Privé",
    "Make it Public": "Rendre Public",
    "New": "Nouveau",
    "private": "privé",
    "public": "public",
    "hidden": "masqué",
    "There is no photos in this album": "Pas de photos dans cet album",
    "There is no public albums.": "Pas d'albums publics",
    "This album is private": "Cet album est Privé",
    "This album is hidden": "Cet album est Masqué",
    "This album is public": "Cet album est Public",
    "Title ...": "Titre ...",
    "Write some more ...": "Description ...",
    "View": "Voir",
    "Drag your photos here to upload them": "Droppez vos photos ici pour les uploader",
    "hidden-description": "Il n'apparaitra pas sur votre page d'accueil,\nMais vous pouvez partager cet url :",
    "It cannot be accessed from the public side": "Il ne peux pas être vu depuis le coté public"
  };
  
});
window.require.register("models/album", function(exports, require, module) {
  var Album, PhotoCollection, client,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  PhotoCollection = require('collections/photo');

  client = require("../helpers/client");

  module.exports = Album = (function(_super) {
    __extends(Album, _super);

    Album.prototype.urlRoot = 'albums';

    Album.prototype.defaults = function() {
      return {
        title: '',
        description: '',
        clearance: 'private',
        thumbsrc: 'img/nophotos.gif'
      };
    };

    function Album() {
      this.photos = new PhotoCollection();
      return Album.__super__.constructor.apply(this, arguments);
    }

    Album.prototype.parse = function(attrs) {
      var _ref;
      if (((_ref = attrs.photos) != null ? _ref.length : void 0) > 0) {
        this.photos.reset(attrs.photos, {
          parse: true
        });
      }
      delete attrs.photos;
      if (attrs.thumb) {
        attrs.thumbsrc = "photos/thumbs/" + attrs.thumb + ".jpg";
      }
      return attrs;
    };

    Album.prototype.sendMail = function(url, mails, callback) {
      var data;
      data = {
        url: url,
        mails: mails
      };
      return client.post("albums/share", data, callback);
    };

    return Album;

  })(Backbone.Model);
  
});
window.require.register("models/contact", function(exports, require, module) {
  var Contact, client, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  client = require("../helpers/client");

  module.exports = Contact = (function(_super) {
    __extends(Contact, _super);

    function Contact() {
      _ref = Contact.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Contact.prototype.list = function(callback) {
      return client.get("contacts", callback);
    };

    return Contact;

  })(Backbone.Model);
  
});
window.require.register("models/photo", function(exports, require, module) {
  var Photo, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Photo = (function(_super) {
    __extends(Photo, _super);

    function Photo() {
      _ref = Photo.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Photo.prototype.defaults = function() {
      return {
        thumbsrc: 'img/loading.gif',
        src: ''
      };
    };

    Photo.prototype.parse = function(attrs) {
      if (!attrs.id) {
        return attrs;
      } else {
        return _.extend(attrs, {
          thumbsrc: "photos/thumbs/" + attrs.id + ".jpg",
          src: "photos/" + attrs.id + ".jpg"
        });
      }
    };

    return Photo;

  })(Backbone.Model);
  
});
window.require.register("models/photoprocessor", function(exports, require, module) {
  var PhotoProcessor, blobify, makeScreenBlob, makeScreenDataURI, makeThumbBlob, makeThumbDataURI, makeThumbWorker, readFile, resize, upload, uploadWorker;

  readFile = function(photo, next) {
    var reader,
      _this = this;
    if (photo.file.size > 10 * 1024 * 1024) {
      return next(t('is too big (max 10Mo)'));
    }
    if (!photo.file.type.match(/image\/.*/)) {
      return next(t('is not an image'));
    }
    reader = new FileReader();
    photo.img = new Image();
    reader.readAsDataURL(photo.file);
    return reader.onloadend = function() {
      photo.img.src = reader.result;
      return photo.img.onload = function() {
        return next();
      };
    };
  };

  resize = function(photo, MAX_WIDTH, MAX_HEIGHT, fill) {
    var canvas, ctx, max, newdims, ratio, ratiodim;
    max = {
      width: MAX_WIDTH,
      height: MAX_HEIGHT
    };
    if ((photo.img.width > photo.img.height) === fill) {
      ratiodim = 'height';
    } else {
      ratiodim = 'width';
    }
    ratio = max[ratiodim] / photo.img[ratiodim];
    newdims = {
      height: ratio * photo.img.height,
      width: ratio * photo.img.width
    };
    canvas = document.createElement('canvas');
    canvas.width = fill ? MAX_WIDTH : newdims.width;
    canvas.height = fill ? MAX_HEIGHT : newdims.height;
    ctx = canvas.getContext('2d');
    ctx.drawImage(photo.img, 0, 0, newdims.width, newdims.height);
    return canvas.toDataURL(photo.file.type);
  };

  blobify = function(dataUrl, type) {
    var array, binary, i, _i, _ref;
    binary = atob(dataUrl.split(',')[1]);
    array = [];
    for (i = _i = 0, _ref = binary.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: type
    });
  };

  makeThumbDataURI = function(photo, next) {
    photo.thumb_du = resize(photo, 100, 100, true);
    return next();
  };

  makeScreenDataURI = function(photo, next) {
    photo.screen_du = resize(photo, 1200, 800, false);
    return next();
  };

  makeScreenBlob = function(photo, next) {
    photo.thumb = blobify(photo.thumb_du, photo.file.type);
    return next();
  };

  makeThumbBlob = function(photo, next) {
    photo.screen = blobify(photo.screen_du, photo.file.type);
    return next();
  };

  upload = function(photo, next) {
    var attr, formdata, _i, _len, _ref;
    formdata = new FormData();
    _ref = ['title', 'description', 'albumid'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      attr = _ref[_i];
      formdata.append(attr, photo.get(attr));
    }
    formdata.append('raw', photo.file);
    formdata.append('thumb', photo.thumb, "thumb_" + photo.file.name);
    formdata.append('screen', photo.screen, "screen_" + photo.file.name);
    return Backbone.sync('create', photo, {
      contentType: false,
      data: formdata,
      success: function(data) {
        photo.set(photo.parse(data));
        return next();
      },
      error: function() {
        return next(t(' : upload failled'));
      },
      xhr: function() {
        var progress, xhr;
        xhr = $.ajaxSettings.xhr();
        progress = function(e) {
          return photo.trigger('progress', e);
        };
        if (xhr instanceof window.XMLHttpRequest) {
          xhr.addEventListener('progress', progress, false);
        }
        if (xhr.upload) {
          xhr.upload.addEventListener('progress', progress, false);
        }
        return xhr;
      }
    });
  };

  makeThumbWorker = function(photo, done) {
    return async.waterfall([
      function(cb) {
        return readFile(photo, cb);
      }, function(cb) {
        return makeThumbDataURI(photo, cb);
      }, function(cb) {
        delete photo.img;
        return cb();
      }
    ], function(err) {
      if (err) {
        photo.trigger('upError', err);
      } else {
        photo.trigger('thumbed');
      }
      return done(err);
    });
  };

  uploadWorker = function(photo, done) {
    return async.waterfall([
      function(cb) {
        return readFile(photo, cb);
      }, function(cb) {
        return makeScreenDataURI(photo, cb);
      }, function(cb) {
        return makeScreenBlob(photo, cb);
      }, function(cb) {
        return makeThumbBlob(photo, cb);
      }, function(cb) {
        return upload(photo, cb);
      }, function(cb) {
        delete photo.file;
        delete photo.img;
        delete photo.thumb;
        delete photo.thumb_du;
        delete photo.scren;
        delete photo.screen_du;
        return cb();
      }
    ], function(err) {
      if (err) {
        photo.trigger('upError', err);
      } else {
        photo.trigger('uploadComplete');
      }
      return done(err);
    });
  };

  PhotoProcessor = (function() {
    function PhotoProcessor() {}

    PhotoProcessor.prototype.thumbsQueue = async.queue(makeThumbWorker, 3);

    PhotoProcessor.prototype.uploadQueue = async.queue(uploadWorker, 2);

    PhotoProcessor.prototype.process = function(photo) {
      var _this = this;
      return this.thumbsQueue.push(photo, function(err) {
        if (err) {
          return console.log(err);
        }
        return _this.uploadQueue.push(photo, function(err) {
          if (err) {
            return console.log(err);
          }
        });
      });
    };

    return PhotoProcessor;

  })();

  module.exports = new PhotoProcessor();
  
});
window.require.register("router", function(exports, require, module) {
  var Album, AlbumView, AlbumsListView, Router, app, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  AlbumsListView = require('views/albumslist');

  AlbumView = require('views/album');

  Album = require('models/album');

  module.exports = Router = (function(_super) {
    __extends(Router, _super);

    function Router() {
      this.displayView = __bind(this.displayView, this);
      _ref = Router.__super__.constructor.apply(this, arguments);
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

    Router.prototype.albumslist = function(editable) {
      if (editable == null) {
        editable = false;
      }
      return this.displayView(new AlbumsListView({
        collection: app.albums,
        editable: editable
      }));
    };

    Router.prototype.albumslistedit = function() {
      if (app.mode === 'public') {
        return this.navigate('albums', true);
      }
      return this.albumslist(true);
    };

    Router.prototype.album = function(id, editable) {
      var album,
        _this = this;
      if (editable == null) {
        editable = false;
      }
      album = app.albums.get(id) || new Album({
        id: id
      });
      return album.fetch().done(function() {
        return _this.displayView(new AlbumView({
          model: album,
          editable: editable,
          contacts: []
        }));
      }).fail(function() {
        alert(t('this album does not exist'));
        return _this.navigate('albums', true);
      });
    };

    Router.prototype.albumedit = function(id) {
      if (app.mode === 'public') {
        return this.navigate('albums', true);
      }
      return this.album(id, true);
    };

    Router.prototype.newalbum = function() {
      if (app.mode === 'public') {
        return this.navigate('albums', true);
      }
      return this.displayView(new AlbumView({
        model: new Album(),
        editable: true,
        contacts: []
      }));
    };

    Router.prototype.displayView = function(view) {
      var el;
      if (this.mainView) {
        this.mainView.remove();
      }
      this.mainView = view;
      el = this.mainView.render().$el;
      el.addClass("mode-" + app.mode);
      return $('body').append(el);
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
  buf.push('<div class="row-fluid"><div id="about" class="span4"><div id="links" class="clearfix"><a href="#albums" class="flatbtn back"><i class="icon-arrow-left icon-white"></i><span>');
  var __val__ = t("Back")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</span></a>');
  if ( 'undefined' != typeof id)
  {
  buf.push('<a');
  buf.push(attrs({ 'href':("#albums/" + (id) + "/edit"), "class": ('flatbtn') + ' ' + ('startediting') }, {"href":true}));
  buf.push('><i class="icon-edit icon-white"></i><span>');
  var __val__ = t("Edit")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</span></a>');
  if ( photosNumber != 0)
  {
  buf.push('<a');
  buf.push(attrs({ 'href':("albums/" + (id) + ".zip"), "class": ('flatbtn') + ' ' + ('download') }, {"href":true}));
  buf.push('><i class="icon-download-alt icon-white"></i><span>');
  var __val__ = t("Download")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</span></a>');
  }
  buf.push('<a');
  buf.push(attrs({ 'href':("#albums/" + (id) + ""), "class": ('flatbtn') + ' ' + ('stopediting') }, {"href":true}));
  buf.push('><i class="icon-eye-open icon-white"></i><span>');
  var __val__ = t("View")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</span></a><a class="flatbtn delete"><i class="icon-remove icon-white"></i><span>');
  var __val__ = t("Delete")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</span></a><a href="#clearance-modal" data-toggle="modal" class="flatbtn clearance"><i class="icon-upload icon-white"></i><span>');
  var __val__ = t(clearance)
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</span></a>');
  }
  buf.push('</div><h1 id="title">' + escape((interp = title) == null ? '' : interp) + '</h1><div id="description">');
  var __val__ = description
  buf.push(null == __val__ ? "" : __val__);
  buf.push('</div></div><div id="photos" class="span8"></div><div id="clipboard-container"><textarea id="clipboard"></textarea></div><div id="clearance-modal" class="modal hide"><div class="modal-header"><button type="button" data-dismiss="modal" class="close">&times;</button><h3>clearanceHelpers.title</h3></div><div class="modal-body">clearanceHelpers.content</div><div class="modal-footer">     <a id="changeprivate" class="btn changeclearance">');
  var __val__ = t("Make it Private")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</a><a id="changehidden" class="btn changeclearance">');
  var __val__ = t("Make it Hidden")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</a><a id="changepublic" class="btn changeclearance">');
  var __val__ = t("Make it Public")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</a><a href="#share-modal" data-toggle="modal" data-dismiss="modal" class="btn share"><span>');
  var __val__ = t("Share album by mail")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</span></a></div></div><div id="share-modal" class="modal hide"><div class="modal-header"><button type="button" data-dismiss="modal" class="close">&times;</button><h3>');
  var __val__ = t("Share album")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</h3></div><div class="modal-body"> <input type="text" value="" id="mails" placeholder="&lt;example@cozycloud.cc&gt;, &lt;other-example@cozycloud.cc&gt;" class="input-block-level"/></div><div class="modal-footer"> <a href="#add-contact-modal" data-dismiss="modal" class="btn addcontact"><span>');
  var __val__ = t("Add contact")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</span></a><a type="button" data-dismiss="modal" class="btn sendmail"><span>');
  var __val__ = t("Send mail")    
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</span></a></div></div><div id="add-contact-modal" class="modal hide"><div class="modal-header"><button type="button" data-dismiss="modal" class="close">&times;</button><h3>');
  var __val__ = t("Select your friends")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</h3></div><div class="modal-body"> <div id="contacts" class="input">');
  // iterate contacts
  ;(function(){
    if ('number' == typeof contacts.length) {

      for (var $index = 0, $$l = contacts.length; $index < $$l; $index++) {
        var contact = contacts[$index];

  buf.push('<input');
  buf.push(attrs({ 'type':("checkbox"), 'name':("" + (contact.fn) + ""), 'id':("" + (contact.fn) + ""), "class": ('checkbox') }, {"type":true,"name":true,"id":true}));
  buf.push('/><span>' + escape((interp = contact.fn) == null ? '' : interp) + '</span><br/>');
      }

    } else {
      var $$l = 0;
      for (var $index in contacts) {
        $$l++;      var contact = contacts[$index];

  buf.push('<input');
  buf.push(attrs({ 'type':("checkbox"), 'name':("" + (contact.fn) + ""), 'id':("" + (contact.fn) + ""), "class": ('checkbox') }, {"type":true,"name":true,"id":true}));
  buf.push('/><span>' + escape((interp = contact.fn) == null ? '' : interp) + '</span><br/>');
      }

    }
  }).call(this);

  buf.push('</div></div><div class="modal-footer">     <a href="#share-modal" data-toggle="modal" data-dismiss="modal" class="btn add"><span>');
  var __val__ = t("Add")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</span></a><a href="#share-modal" data-toggle="modal" data-dismiss="modal" class="btn cancel"><span>');
  var __val__ = t("Cancel")
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</span></a></div></div></div>');
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
  buf.push('<div class="albumitem create"><a href="#albums/new"><img src="img/create.gif"/></a><div><h4>');
  var __val__ = t('New')
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</h4><p>');
  var __val__ = t('Create a new album')
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</p></div></div><p class="help">');
  var __val__ = t('There is no public albums.')
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</p>');
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
  buf.push(attrs({ 'href':("#albums/" + (id) + "") }, {"href":true}));
  buf.push('><img');
  buf.push(attrs({ 'src':("" + (thumbsrc) + "") }, {"src":true}));
  buf.push('/></a><div class="text"><h4>' + escape((interp = title) == null ? '' : interp) + '</h4><p>');
  var __val__ = description
  buf.push(null == __val__ ? "" : __val__);
  buf.push('</p></div>');
  }
  return buf.join("");
  };
});
window.require.register("templates/gallery", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<p class="help">');
  var __val__ = t('There is no photos in this album')
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</p><div id="uploadblock" class="flatbtn"><input id="uploader" type="file" multiple="multiple"/>');
  var __val__ = t('Click Here or drag your photos below to upload')
  buf.push(escape(null == __val__ ? "" : __val__));
  buf.push('</div>');
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
  buf.push('/><div class="progressfill"></div></a><button class="delete flatbtn"><i class="icon-remove icon-white"></i></button>');
  }
  return buf.join("");
  };
});
window.require.register("views/album", function(exports, require, module) {
  var AlbumView, BaseView, Clipboard, Contact, Gallery, app, clipboard, contactModel, editable, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  BaseView = require('lib/base_view');

  Gallery = require('views/gallery');

  editable = require('lib/helpers').editable;

  Clipboard = require('lib/clipboard');

  contactModel = require('models/contact');

  Contact = new contactModel();

  clipboard = new Clipboard();

  module.exports = AlbumView = (function(_super) {
    __extends(AlbumView, _super);

    function AlbumView() {
      this.makeEditable = __bind(this.makeEditable, this);
      this.beforePhotoUpload = __bind(this.beforePhotoUpload, this);
      this.events = __bind(this.events, this);
      _ref = AlbumView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AlbumView.prototype.template = require('templates/album');

    AlbumView.prototype.id = 'album';

    AlbumView.prototype.className = 'container-fluid';

    AlbumView.prototype.events = function() {
      return {
        'click   a.delete': this.destroyModel,
        'click   a.changeclearance': this.changeClearance,
        'click   a.addcontact': this.addcontact,
        'click   a.sendmail': this.sendMail,
        'click   a.add': this.prepareContact
      };
    };

    AlbumView.prototype.getRenderData = function() {
      var clearanceHelpers;
      clearanceHelpers = this.clearanceHelpers(this.model.get('clearance'));
      return _.extend({
        clearanceHelpers: clearanceHelpers,
        photosNumber: this.model.photos.length
      }, this.model.attributes);
    };

    AlbumView.prototype.afterRender = function() {
      this.gallery = new Gallery({
        el: this.$('#photos'),
        editable: this.options.editable,
        collection: this.model.photos,
        beforeUpload: this.beforePhotoUpload
      });
      this.gallery.render();
      if (this.options.editable) {
        return this.makeEditable();
      }
    };

    AlbumView.prototype.beforePhotoUpload = function(callback) {
      var _this = this;
      return this.saveModel().then(function() {
        return callback({
          albumid: _this.model.id
        });
      });
    };

    AlbumView.prototype.makeEditable = function() {
      var _this = this;
      this.$el.addClass('editing');
      this.refreshPopOver(this.model.get('clearance'));
      editable(this.$('#title'), {
        placeholder: t('Title ...'),
        onChanged: function(text) {
          return _this.saveModel({
            title: text
          });
        }
      });
      return editable(this.$('#description'), {
        placeholder: t('Write some more ...'),
        onChanged: function(text) {
          return _this.saveModel({
            description: text
          });
        }
      });
    };

    AlbumView.prototype.destroyModel = function() {
      if (this.model.isNew()) {
        return app.router.navigate('albums', true);
      }
      if (confirm(t('Are you sure ?'))) {
        return this.model.destroy().then(function() {
          return app.router.navigate('albums', true);
        });
      }
    };

    AlbumView.prototype.changeClearance = function(event) {
      var newclearance,
        _this = this;
      newclearance = event.target.id.replace('change', '');
      return this.saveModel({
        clearance: newclearance
      }).then(function() {
        return _this.refreshPopOver(newclearance);
      });
    };

    AlbumView.prototype.refreshPopOver = function(clearance) {
      var help, modal;
      help = this.clearanceHelpers(clearance);
      modal = this.$('#clearance-modal');
      this.$('.clearance').find('span').text(clearance);
      modal.find('h3').text(help.title);
      modal.find('.modal-body').html(help.content);
      modal.find('.changeclearance').show();
      modal.find('#change' + clearance).hide();
      if (clearance === "hidden") {
        modal.find('.share').show();
        return clipboard.set(this.getPublicUrl());
      } else {
        modal.find('.share').hide();
        return clipboard.set("");
      }
    };

    AlbumView.prototype.addcontact = function() {
      var modal,
        _this = this;
      modal = this.$('#add-contact-modal');
      this.options.contacts = [];
      return Contact.list({
        success: function(body) {
          var contact, item, _i, _j, _len, _len1, _ref1;
          for (_i = 0, _len = body.length; _i < _len; _i++) {
            contact = body[_i];
            _ref1 = contact.datapoints;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              item = _ref1[_j];
              if (item.name === "email") {
                _this.options.contacts.push(contact);
                break;
              }
            }
          }
          _this.render(modal);
          return _this.$('#add-contact-modal').modal('show');
        },
        error: function(err) {
          return console.log(err);
        }
      });
    };

    AlbumView.prototype.prepareContact = function(event) {
      var contact, item, mails, modal, _i, _j, _len, _len1, _ref1, _ref2;
      modal = this.$('#add-contact-modal');
      mails = [];
      _ref1 = this.options.contacts;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        contact = _ref1[_i];
        if (this.$("#" + contact.fn).is(':checked')) {
          _ref2 = contact.datapoints;
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            item = _ref2[_j];
            if (item.name === "email") {
              mails.push(item.value);
            }
          }
        }
      }
      return this.$('#mails').val(mails);
    };

    AlbumView.prototype.sendMail = function() {
      return this.model.sendMail(this.getPublicUrl(), this.$('#mails').val(), {
        error: function(err) {
          return alert(JSON.stringify(err.responseText));
        }
      });
    };

    AlbumView.prototype.saveModel = function(hash) {
      var promise,
        _this = this;
      promise = this.model.save(hash);
      if (this.model.isNew()) {
        promise = promise.then(function() {
          app.albums.add(_this.model);
          return app.router.navigate("albums/" + _this.model.id + "/edit");
        });
      }
      return promise;
    };

    AlbumView.prototype.getPublicUrl = function() {
      var hash, origin, path;
      origin = window.location.origin;
      path = window.location.pathname.replace('apps', 'public');
      if (path === '/') {
        path = '/public/';
      }
      hash = window.location.hash.replace('/edit', '');
      return origin + path + hash;
    };

    AlbumView.prototype.clearanceHelpers = function(clearance) {
      if (clearance === 'public') {
        return {
          title: t('This album is public'),
          content: t('It will appears on your homepage.')
        };
      } else if (clearance === 'hidden') {
        return {
          title: t('This album is hidden'),
          content: t("hidden-description") + (" " + (this.getPublicUrl())) + "<p>If you want to copy url in your clipboard : just press Ctrl+C </p>"
        };
      } else if (clearance === 'private') {
        return {
          title: t('This album is private'),
          content: t('It cannot be accessed from the public side')
        };
      }
    };

    return AlbumView;

  })(BaseView);
  
});
window.require.register("views/albumslist", function(exports, require, module) {
  var AlbumsList, ViewCollection, app, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ViewCollection = require('lib/view_collection');

  app = require('application');

  module.exports = AlbumsList = (function(_super) {
    __extends(AlbumsList, _super);

    function AlbumsList() {
      this.checkIfEmpty = __bind(this.checkIfEmpty, this);
      _ref = AlbumsList.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AlbumsList.prototype.id = 'album-list';

    AlbumsList.prototype.itemView = require('views/albumslist_item');

    AlbumsList.prototype.template = require('templates/albumlist');

    AlbumsList.prototype.initialize = function() {
      return AlbumsList.__super__.initialize.apply(this, arguments);
    };

    AlbumsList.prototype.appendView = function(view) {
      return this.$el.prepend(view.el);
    };

    AlbumsList.prototype.checkIfEmpty = function() {
      return this.$('.help').toggle(_.size(this.views) === 0 && app.mode === 'public');
    };

    return AlbumsList;

  })(ViewCollection);
  
});
window.require.register("views/albumslist_item", function(exports, require, module) {
  var AlbumItem, BaseView, limitLength, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('lib/base_view');

  limitLength = require('lib/helpers').limitLength;

  module.exports = AlbumItem = (function(_super) {
    __extends(AlbumItem, _super);

    function AlbumItem() {
      _ref = AlbumItem.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AlbumItem.prototype.className = 'albumitem';

    AlbumItem.prototype.template = require('templates/albumlist_item');

    AlbumItem.prototype.initialize = function() {
      var _this = this;
      return this.listenTo(this.model, 'change', function() {
        return _this.render();
      });
    };

    AlbumItem.prototype.getRenderData = function() {
      var out;
      out = _.clone(this.model.attributes);
      out.description = limitLength(out.description, 250);
      return out;
    };

    return AlbumItem;

  })(BaseView);
  
});
window.require.register("views/gallery", function(exports, require, module) {
  var Gallery, Photo, PhotoView, ViewCollection, app, photoprocessor, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ViewCollection = require('lib/view_collection');

  PhotoView = require('views/photo');

  Photo = require('models/photo');

  photoprocessor = require('models/photoprocessor');

  app = require('application');

  module.exports = Gallery = (function(_super) {
    __extends(Gallery, _super);

    function Gallery() {
      this.onImageDisplayed = __bind(this.onImageDisplayed, this);
      this.onFilesChanged = __bind(this.onFilesChanged, this);
      this.checkIfEmpty = __bind(this.checkIfEmpty, this);
      _ref = Gallery.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Gallery.prototype.itemView = PhotoView;

    Gallery.prototype.template = require('templates/gallery');

    Gallery.prototype.afterRender = function() {
      Gallery.__super__.afterRender.apply(this, arguments);
      this.$el.photobox('a.server', {
        thumbs: true,
        history: false
      }, this.onImageDisplayed);
      this.downloadLink = $('#pbOverlay .pbCaptionText .download-link');
      if (!this.downloadLink.length) {
        this.downloadLink = $('<a class="download-link" download>Download</a>').appendTo('#pbOverlay .pbCaptionText');
      }
      return this.uploader = this.$('#uploader');
    };

    Gallery.prototype.checkIfEmpty = function() {
      return this.$('.help').toggle(_.size(this.views) === 0 && app.mode === 'public');
    };

    Gallery.prototype.events = function() {
      if (this.options.editable) {
        return {
          'drop': 'onFilesDropped',
          'dragover': 'onDragOver',
          'change #uploader': 'onFilesChanged'
        };
      }
    };

    Gallery.prototype.onFilesDropped = function(evt) {
      this.$el.removeClass('dragover');
      this.handleFiles(evt.dataTransfer.files);
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    };

    Gallery.prototype.onDragOver = function(evt) {
      this.$el.addClass('dragover');
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    };

    Gallery.prototype.onFilesChanged = function(evt) {
      var old;
      this.handleFiles(this.uploader[0].files);
      old = this.uploader;
      this.uploader = old.clone(true);
      return old.replaceWith(this.uploader);
    };

    Gallery.prototype.onImageDisplayed = function() {
      var url;
      url = $('.imageWrap img.zoomable').attr('src');
      url = url.replace('/photos/photos', '/photos/photos/raws');
      return this.downloadLink.attr('href', url);
    };

    Gallery.prototype.handleFiles = function(files) {
      var _this = this;
      return this.options.beforeUpload(function(photoAttributes) {
        var file, photo, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          photoAttributes.title = file.name;
          photo = new Photo(photoAttributes);
          photo.file = file;
          _this.collection.add(photo);
          _results.push(photoprocessor.process(photo));
        }
        return _results;
      });
    };

    return Gallery;

  })(ViewCollection);
  
});
window.require.register("views/photo", function(exports, require, module) {
  var BaseView, PhotoView, transitionendEvents, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseView = require('lib/base_view');

  transitionendEvents = ["transitionend", "webkitTransitionEnd", "oTransitionEnd", "MSTransitionEnd"].join(" ");

  module.exports = PhotoView = (function(_super) {
    __extends(PhotoView, _super);

    function PhotoView() {
      this.onClickListener = __bind(this.onClickListener, this);
      this.events = __bind(this.events, this);
      _ref = PhotoView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    PhotoView.prototype.template = require('templates/photo');

    PhotoView.prototype.className = 'photo';

    PhotoView.prototype.initialize = function(options) {
      PhotoView.__super__.initialize.apply(this, arguments);
      this.listenTo(this.model, 'progress', this.onProgress);
      this.listenTo(this.model, 'thumbed', this.onThumbed);
      this.listenTo(this.model, 'upError', this.onError);
      return this.listenTo(this.model, 'uploadComplete', this.onServer);
    };

    PhotoView.prototype.events = function() {
      return {
        'click': 'onClickListener',
        'click .delete': 'destroyModel'
      };
    };

    PhotoView.prototype.getRenderData = function() {
      return this.model.attributes;
    };

    PhotoView.prototype.afterRender = function() {
      this.link = this.$('a');
      this.image = this.$('img');
      this.progressbar = this.$('.progressfill');
      if (!this.model.isNew()) {
        return this.link.addClass('server');
      }
    };

    PhotoView.prototype.setProgress = function(percent) {
      return this.progressbar.css('height', percent + '%');
    };

    PhotoView.prototype.onProgress = function(event) {
      return this.setProgress(10 + 90 * event.loaded / event.total);
    };

    PhotoView.prototype.onThumbed = function() {
      this.setProgress(10);
      this.image.attr('src', this.model.thumb_du);
      return this.image.addClass('thumbed');
    };

    PhotoView.prototype.onServer = function() {
      var col;
      col = this.model.collection;
      col.remove(this.model);
      return col.add(this.model);
    };

    PhotoView.prototype.onError = function(err) {
      this.setProgress(0);
      this.error = this.model.get('title') + " " + err;
      this.link.attr('title', this.error);
      return this.image.attr('src', 'img/error.gif');
    };

    PhotoView.prototype.onClickListener = function(evt) {
      if (this.model.isNew()) {
        if (this.error) {
          alert(this.error);
        }
        evt.stopPropagation();
        evt.preventDefault();
        return false;
      }
    };

    PhotoView.prototype.destroyModel = function() {
      return this.model.destroy();
    };

    return PhotoView;

  })(BaseView);
  
});
