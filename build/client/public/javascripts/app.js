(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
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
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
require.register("application", function(exports, require, module) {
var SocketListener;

SocketListener = require('./lib/socket_listener');

module.exports = {
  initialize: function() {
    var AlbumCollection, Router, e, key, locales, param, value, _i, _len, _ref, _ref1;
    window.app = this;
    this.locale = window.locale;
    this.polyglot = new Polyglot({
      locale: this.locale
    });
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
    this.router = new Router();
    $(window).on("hashchange", this.router.hashChange);
    $(window).on("beforeunload", this.router.beforeUnload);
    this.albums = new AlbumCollection();
    this.urlKey = "";
    if (window.location.search) {
      _ref = window.location.search.substring(1).split('&');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        _ref1 = param.split('='), key = _ref1[0], value = _ref1[1];
        if (key === 'key') {
          this.urlKey = "?key=" + value;
        }
      }
    }
    this.mode = window.location.pathname.match(/public/) ? 'public' : 'owner';
    if (this.mode !== 'public') {
      this.socketListener = new SocketListener();
    }
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

;require.register("collections/album", function(exports, require, module) {
var AlbumCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = AlbumCollection = (function(_super) {
  __extends(AlbumCollection, _super);

  function AlbumCollection() {
    return AlbumCollection.__super__.constructor.apply(this, arguments);
  }

  AlbumCollection.prototype.model = require('models/album');

  AlbumCollection.prototype.url = 'albums' + app.urlKey;

  AlbumCollection.prototype.comparator = function(model) {
    return model.get('title');
  };

  return AlbumCollection;

})(Backbone.Collection);
});

;require.register("collections/photo", function(exports, require, module) {
var PhotoCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = PhotoCollection = (function(_super) {
  __extends(PhotoCollection, _super);

  function PhotoCollection() {
    return PhotoCollection.__super__.constructor.apply(this, arguments);
  }

  PhotoCollection.prototype.model = require('models/photo');

  PhotoCollection.prototype.url = function() {
    return 'photos' + app.urlKey;
  };

  PhotoCollection.prototype.comparator = function(model) {
    return model.get('title');
  };

  PhotoCollection.prototype.hasGPS = function() {
    return new PhotoCollection(this.filter(function(photo) {
      return photo.get("gps").lat != null;
    }));
  };

  PhotoCollection.prototype.hasNotGPS = function() {
    return new PhotoCollection(this.filter(function(photo) {
      return photo.get("gps").lat == null;
    }));
  };

  return PhotoCollection;

})(Backbone.Collection);
});

;require.register("initialize", function(exports, require, module) {
var app;

app = require('application');

$(function() {
  jQuery.event.props.push('dataTransfer');
  app.initialize();
  return $.fn.spin = function(opts, color) {
    var presets;
    presets = {
      tiny: {
        lines: 8,
        length: 2,
        width: 2,
        radius: 3
      },
      small: {
        lines: 8,
        length: 1,
        width: 2,
        radius: 5
      },
      large: {
        lines: 10,
        length: 8,
        width: 4,
        radius: 8
      }
    };
    if (Spinner) {
      return this.each(function() {
        var $this, spinner;
        $this = $(this);
        spinner = $this.data("spinner");
        if (spinner != null) {
          spinner.stop();
          return $this.data("spinner", null);
        } else if (opts !== false) {
          if (typeof opts === "string") {
            if (opts in presets) {
              opts = presets[opts];
            } else {
              opts = {};
            }
            if (color) {
              opts.color = color;
            }
          }
          spinner = new Spinner($.extend({
            color: $this.css("color")
          }, opts));
          spinner.spin(this);
          return $this.data("spinner", spinner);
        }
      });
    } else {
      console.log("Spinner class not available.");
      return null;
    }
  };
});
});

;require.register("lib/base_view", function(exports, require, module) {
var BaseView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BaseView = (function(_super) {
  __extends(BaseView, _super);

  function BaseView() {
    this.render = __bind(this.render, this);
    return BaseView.__super__.constructor.apply(this, arguments);
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

;require.register("lib/client", function(exports, require, module) {
exports.request = function(type, url, data, callbacks) {
  var error, success;
  success = callbacks.success || function(res) {
    return callbacks(null, res);
  };
  error = callbacks.error || function(err) {
    return callbacks(err);
  };
  return $.ajax({
    type: type,
    url: url,
    data: data,
    success: success,
    error: error
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

;require.register("lib/clipboard", function(exports, require, module) {
var Clipboard,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = Clipboard = (function() {
  function Clipboard() {
    this.set = __bind(this.set, this);
    this.value = "";
    $(document).keydown((function(_this) {
      return function(e) {
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
      };
    })(this));
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

;require.register("lib/helpers", function(exports, require, module) {
module.exports = {
  limitLength: function(string, length) {
    if ((string != null) && string.length > length) {
      return string.substring(0, length) + '...';
    } else {
      return string;
    }
  },
  forceFocus: function(el) {
    var range, sel;
    range = document.createRange();
    range.selectNodeContents(el[0]);
    sel = document.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return el.focus();
  },
  rotate: function(orientation, image) {
    var transform;
    if (navigator.userAgent.search("Firefox") !== -1) {
      transform = "transform";
    } else {
      transform = "-webkit-transform";
    }
    if (orientation === void 0 || orientation === 1) {
      image.css(transform, "rotate(" + 0 + "deg)");
    } else if (orientation === 2) {
      return image.css(transform, "scale(-1, 1)");
    } else if (orientation === 3) {
      return image.css(transform, "rotate(" + 180 + "deg)");
    } else if (orientation === 4) {
      return image.css(transform, "scale(1, -1)");
    } else if (orientation === 5) {
      return image.css(transform, "rotate(" + -90 + "deg) scale(-1, 1) ");
    } else if (orientation === 6) {
      return image.css(transform, "rotate(" + 90 + "deg)");
    } else if (orientation === 7) {
      return image.css(transform, "rotate(" + 90 + "deg) scale(-1, 1)");
    } else if (orientation === 8) {
      return image.css(transform, "rotate(" + -90 + "deg)");
    }
  },
  getRotate: function(orientation, image) {
    var transform;
    if (navigator.userAgent.search("Firefox") !== -1) {
      transform = "transform";
    } else {
      transform = "-webkit-transform";
    }
    if (orientation === void 0 || orientation === 1) {
      return transform + ": rotate(" + 0 + "deg)";
    } else if (orientation === 2) {
      return transform + ": scale(-1, 1)";
    } else if (orientation === 3) {
      return transform + ": rotate(" + 180 + "deg)";
    } else if (orientation === 4) {
      return transform + ": scale(1, -1)";
    } else if (orientation === 5) {
      return transform + ": rotate(" + -90 + "deg) scale(-1, 1) ";
    } else if (orientation === 6) {
      return transform + ": rotate(" + 90 + "deg)";
    } else if (orientation === 7) {
      return transform + ": rotate(" + 90 + "deg) scale(-1, 1)";
    } else if (orientation === 8) {
      return transform + ": rotate(" + -90 + "deg)";
    }
  },
  rotateLeft: function(orientation, image) {
    if (orientation === void 0 || orientation === 1) {
      return 8;
    } else if (orientation === 2) {
      return 5;
    } else if (orientation === 3) {
      return 6;
    } else if (orientation === 4) {
      return 7;
    } else if (orientation === 5) {
      return 4;
    } else if (orientation === 6) {
      return 1;
    } else if (orientation === 7) {
      return 2;
    } else if (orientation === 8) {
      return 3;
    }
  },
  rotateRight: function(orientation, image) {
    if (orientation === void 0 || orientation === 1) {
      return 6;
    } else if (orientation === 2) {
      return 7;
    } else if (orientation === 3) {
      return 8;
    } else if (orientation === 4) {
      return 5;
    } else if (orientation === 5) {
      return 2;
    } else if (orientation === 6) {
      return 3;
    } else if (orientation === 7) {
      return 4;
    } else if (orientation === 8) {
      return 1;
    }
  }
};
});

;require.register("lib/map_providers", function(exports, require, module) {

/*
    This file permit to add lots of map background, you can copy-paste
    code from 'http://leaflet-extras.github.io/leaflet-providers/preview/'
    and add a nex entry in this array, the default background is the first
    indice.
 */
module.exports = {
  'Water color': L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
    attribution: 'Map by <a href="http://stamen.com">Stamen Design</a>',
    subdomains: 'abcd',
    ext: 'png',
    maxZoom: 12
  }),
  'Open street map hot': L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: 'Map by <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }),
  'Esri world imagery': L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Map by Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
  }),
  'Acetate all': L.tileLayer('http://a{s}.acetate.geoiq.com/tiles/acetate-hillshading/{z}/{x}/{y}.png', {
    attribution: 'map by Esri & Stamen',
    subdomains: '0123'
  })
};
});

;require.register("lib/modal", function(exports, require, module) {
var BaseView, ModalView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = ModalView = (function(_super) {
  __extends(ModalView, _super);

  ModalView.prototype.id = "dialog-modal";

  ModalView.prototype.className = "modal fade";

  ModalView.prototype.attributes = {
    'tab-index': -1
  };

  ModalView.prototype.template = require('./templates/modal');

  ModalView.prototype.value = 0;

  ModalView.prototype.events = function() {
    return {
      "click #modal-dialog-no": "onNo",
      "click #modal-dialog-yes": "onYes"
    };
  };

  function ModalView(title, msg, yes, no, cb, hideOnYes) {
    this.title = title;
    this.msg = msg;
    this.yes = yes;
    this.no = no;
    this.cb = cb;
    this.hideOnYes = hideOnYes;
    ModalView.__super__.constructor.call(this);
    if (this.hideOnYes == null) {
      this.hideOnYes = true;
    }
  }

  ModalView.prototype.initialize = function() {
    this.$el.on('hidden.bs.modal', (function(_this) {
      return function() {
        return _this.close();
      };
    })(this));
    this.render();
    return this.show();
  };

  ModalView.prototype.onYes = function() {
    if (this.cb) {
      this.cb(true);
    }
    return this.hide();
  };

  ModalView.prototype.onNo = function() {
    if (this.cb) {
      this.cb(false);
    }
    if (this.hideOnYes) {
      return this.hide();
    }
  };

  ModalView.prototype.onShow = function() {};

  ModalView.prototype.close = function() {
    return setTimeout(((function(_this) {
      return function() {
        return _this.destroy();
      };
    })(this)), 500);
  };

  ModalView.prototype.show = function() {
    this.$el.modal('show');
    return this.$el.trigger('show');
  };

  ModalView.prototype.hide = function() {
    this.$el.modal('hide');
    return this.$el.trigger('hide');
  };

  ModalView.prototype.render = function() {
    this.$el.append(this.template({
      title: this.title,
      msg: this.msg,
      yes: this.yes,
      no: this.no
    }));
    $("body").append(this.$el);
    this.afterRender();
    return this;
  };

  return ModalView;

})(BaseView);

module.exports.error = function(code, cb) {
  return new ModalView(t("modal error"), code, t("modal ok"), false, cb);
};
});

;require.register("lib/socket_listener", function(exports, require, module) {
var ContactListener, contactCollection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

contactCollection = require('cozy-clearance/contact_collection');

module.exports = ContactListener = (function(_super) {
  __extends(ContactListener, _super);

  function ContactListener() {
    return ContactListener.__super__.constructor.apply(this, arguments);
  }

  ContactListener.prototype.events = ['contact.create', 'contact.update', 'contact.delete'];

  ContactListener.prototype.process = function(event) {
    if (event.doctype === 'contact') {
      return contactCollection.handleRealtimeContactEvent(event);
    }
  };

  return ContactListener;

})(CozySocketListener);
});

;require.register("lib/view_collection", function(exports, require, module) {
var BaseView, ViewCollection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

module.exports = ViewCollection = (function(_super) {
  __extends(ViewCollection, _super);

  function ViewCollection() {
    this.removeItem = __bind(this.removeItem, this);
    this.addItem = __bind(this.addItem, this);
    return ViewCollection.__super__.constructor.apply(this, arguments);
  }

  ViewCollection.prototype.views = {};

  ViewCollection.prototype.itemView = null;

  ViewCollection.prototype.itemViewOptions = function() {};

  ViewCollection.prototype.checkIfEmpty = function() {
    return this.$el.toggleClass('empty', _.size(this.views) === 0);
  };

  ViewCollection.prototype.appendView = function(view) {
    var index;
    index = this.collection.indexOf(view.model);
    return this.$el.append(view.$el);
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
    var id, view, _ref;
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
      view.$el.detach();
    }
    return ViewCollection.__super__.render.apply(this, arguments);
  };

  ViewCollection.prototype.afterRender = function() {
    var i, _i, _ref;
    if (this.collection.length > 0) {
      for (i = _i = 0, _ref = this.collection.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
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
    var id, view, _ref;
    _ref = this.views;
    for (id in _ref) {
      view = _ref[id];
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

;require.register("locales/de", function(exports, require, module) {
module.exports = {
    "or": "oder",
    "Back": "Zurück",
    "Create a new album": "Neues Album erstellen",
    "Delete": "Löschen",
    "Download": "Herunterladen",
    "Edit": "Bearbeiten",
    "Stop editing": "Änderungen speichern",
    "It will appear on your homepage.": "Es wird auf dem Album Seite angezeigt.",
    "Make it Hidden": "Verborgen",
    "Make it Private": "Privat",
    "Make it Public": "Öffentlich",
    "New": "New",
    "private": "Privat",
    "public": "Öffentlich",
    "hidden": "Verborgen",
    "There is no photos in this album": "Es ist kein Foto in diesem Album. Klicken Sie Bearbeiten um neue hinzuzufügen.",
    "There is no public albums.": "Es existiert kein Album.",
    "This album is private": "Dieses Album ist privat",
    "This album is hidden": "Dieses Album ist verborgen",
    "This album is public": "Dieses Album is öffentlich",
    "title placeholder": "Vergeben Sie einen Tittel für dieses Album…",
    "View": "Ansicht",
    "description placeholder": "Schreiben Sie eine Beschreibung…",
    "is too big (max 10Mo)": "ist zu groß (max. 10Mo)",
    "is not an image": "ist kein Bild",
    "Share album by mail": "Album via E-Mail teilen",
    "Upload your contacts...": "Ihre Kontakte hochladen…",
    "Share album": "Album teilen",
    "Add contact": "Kontact hinzufügen",
    "Send mail": "E-Mail senden",
    "Select your friends": "Ihre Freunde auswählen",
    "Add": "Hinzufügen",
    "Cancel": "Abbrechen",
    "photo successfully set as cover": "Diese Bild ist erfolgreich als Album Cover vergeben",
    "problem occured while setting cover": "Ein Problem ist aufgetreten während der Vergabe dieses Bild als Album Cover",
    "pick from computer": "Klicken Sie hier oder ziehen Sie Ihre Bilder um Sie zu diesem Album hinzu zufügen.",
    "pick from files": "Klicken Sie hier um Bilder von der Files app zu übernehmen.",
    "hidden-description": "It will not appear on your homepage.\nBut you can share it with the following url:",
    "It cannot be accessed from the public side": "It is not a public resource.",
    "rebuild thumbnails": "Neuaufbau Thumbnails",
    "01": "Januar",
    "02": "Februar",
    "03": "März",
    "04": "April",
    "05": "Mai",
    "06": "Juni",
    "07": "Juli",
    "08": "August",
    "09": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Dezember",
    "cancel": "Abbrechen",
    "copy paste link": "Um Ihrem Kontakt Zugriff zu gewähren senden Sie Ihr/Ihm den Linnk unten:",
    "details": "Details",
    "inherited from": "geerbt von",
    "modal question album shareable": "Wählen Sie Teilen Modus für diese Album",
    "modal shared album custom msg": "E-Mail Adresse eingeben und Enter drücken",
    "modal shared album link msg": "Senden Sie diesen Link um Leuten Zugriff zu diesem Album zu gewähren",
    "modal shared public link msg": "Senden Sie diesen Link um Leuten Zugriff zu diesm Ordner zu gewähren:",
    "modal shared with people msg": "Invite a selection of contacts to access it. Type\nemail in the field and press enter (An email will be sent to them):",
    "modal send mails": "Eine Mitteilung versenden",
    "modal next": "Nächste",
    "modal prev": "Vorherige",
    "modal ok": "Ok",
    "modal cancel": "Abbrechen",
    "modal error": "Fehler",
    "only you can see": "Nur Sie und die aufgelsiteten Leutehaben Zugriff auf diese Ressource",
    "shared": "Geteilt",
    "share": "Teilen",
    "save": "Speichern",
    "see link": "Siehe Link",
    "send mails question": "Eine Mitteilungs E-Mail versenden an:",
    "sharing": "Teilen",
    "revoke": "Absagen",
    "confirm": "Bestätigen",
    "share forgot add": "Scheint so als ob Sie vergessen haben die Schaltfläche Hinzufügen zu drücken",
    "share confirm save": "Die Änderungen die Sie an den Rechten vorgenommen haben, werden nicht gespeichert. Möchten Sie fortfahren?",
    "yes forgot": "Zurück",
    "no forgot": "es ist ok",
    "perm": "can",
    "perm r album": "Diese Album durchblättern",
    "perm rw album": "Fotos durchblättern und hochladen",
    "mail not send": "E-Mail nicht gesendet",
    "server error occured": "Fehler auf Server Seite aufgetreten, bitte später noch einmal probieren",
    "change notif": "Diesen Kasten anwählen um benachrichtigt zu werden, wenn eine Kontakt\nein Bild zu diesem Album hinzufügt.",
    "send email hint": "Mitteilungs E-Mails werden einmalig beim Speichern gesendet",
    "yes": "Ja",
    "no": "Nein",
    "picture": "Bild |||| Bilder",
    "delete empty album": "Dieses Album ist leer, möchten Sie es löschen?",
    "are you sure you want to delete this album": "Sind Sie sicher diese Album zu löschen?",
    "photos search": "Laden ...",
    "no photos found": "Keine Bilder gefunden",
    "thumb creation": "Applikation erstellt Thumbs für Dateien.",
    "progress": "Fortschritt",
    "Navigate before upload": "Hochladen noch aktiv, möchten Sie wirklich diese Seite verlassen?",
    "application title": "Cozy - Fotos"
};
});

require.register("locales/en", function(exports, require, module) {
module.exports = {
  "or": "or",
  "Back": "Back",
  "Create a new album": "Create a new album",
  "Delete": "Delete",
  "Download": "Download",
  "Edit": "Edit",
  "Stop editing": "Save Changes",
  "It will appear on your homepage.": "It will be displayed on the album page.",
  "Make it Hidden": "hidden",
  "Make it Private": "private",
  "Make it Public": "public",
  "New": "New",
  "private": "private",
  "public": "public",
  "hidden": "hidden",
  "There is no photos in this album": "There is no photo in this album. Click on Edit button to add new ones.",
  "There is no public albums.": "There are no albums.",
  "This album is private": "This album is private",
  "This album is hidden": "This album is hidden",
  "This album is public": "This album is public",
  "title placeholder": "Set a title for this album…",
  "View": "View",
  "description placeholder": "Write a description…",
  "is too big (max 10Mo)": "is too big (max 10Mo)",
  "is not an image": "is not an image",
  "Share album by mail": "Share album by mail",
  "Upload your contacts...": "Upload your contacts…",
  "Share album": "Share album",
  "Add contact": "Add contact",
  "Send mail": "Send mail",
  "Select your friends": "Select your friends",
  "Add": "Add",
  "Cancel": "Cancel",
  "photo successfully set as cover": "The picture has been successfully set as album cover",
  "problem occured while setting cover": "A problem occured while setting picture as cover",
  "pick from computer": "Click here or drag your photos below to add them to the album.",
  "pick from files": "Click here to pick pictures from the Files app.",
  "hidden-description": "It will not appear on your homepage.\nBut you can share it with the following url:",
  "It cannot be accessed from the public side": "It is not a public resource.",
  "rebuild thumbnails": "Rebuild thumbnails",
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December",
  "cancel": "Cancel",
  "copy paste link": "To give access to your contact send him/her the link below:",
  "details": "Details",
  "inherited from": "inherited from",
  "modal question album shareable": "Select share mode for this album",
  "modal shared album custom msg": "Enter email and press enter",
  "modal shared album link msg": "Send this link to let people access this album",
  "modal shared public link msg": "Send this link to let people access this folder:",
  "modal shared with people msg": "Invite a selection of contacts to access it. Type\nemail in the field and press enter (An email will be sent to them):",
  "modal send mails": "Send a notification",
  "modal next": "Next",
  "modal prev": "Previous",
  "modal ok": "Ok",
  "modal cancel": "Cancel",
  "modal error": "Error",
  "only you can see": "Only you and the people listed below can access this resource",
  "public": "Public",
  "private": "Private",
  "shared": "Shared",
  "share": "Share",
  "save": "Save",
  "see link": "See link",
  "send mails question": "Send a notification email to:",
  "sharing": "Sharing",
  "revoke": "Revoke",
  "confirm": "Confirm",
  "share forgot add": "Looks like you forgot to click the Add button",
  "share confirm save": "The changes you made to the permissions will not be saved. Do you want to continue?",
  "yes forgot": "Back",
  "no forgot": "It's ok",
  "perm": "can ",
  "perm r album": "browse this album",
  "perm rw album": "browse and upload photos",
  "mail not send": "Mail not sent",
  "server error occured": "Error occured on server side, please try again later",
  "change notif": "Check this box to be notified when a contact\nwill add a photo to this album.",
  "send email hint": "Notification emails will be sent one time on save",
  "yes": "Yes",
  "no": "No",
  "picture": "picture |||| pictures",
  "delete empty album": "This album is empty, do you want to delete it?",
  "are you sure you want to delete this album": "Are you sure you want to delete this album?",
  "photos search": "Loading ...",
  "no photos found": "No photos found",
  "thumb creation": "Application creates thumbs for files.",
  "progress": "Progression",
  "Navigate before upload": "Some upload are in progress, do you really want to leave this page?",
  "application title": "Cozy - photos",
  "r": "read only",
  "photo delete confirm": "Are you sure you want to delete this photo?"
}
;
});

require.register("locales/es", function(exports, require, module) {
module.exports = {
    "or": "o",
    "Back": "Atrás",
    "Create a new album": "Crear un album",
    "Delete": "Suprimir",
    "Download": "Descargar",
    "Edit": "Modificar",
    "Stop editing": "Guardar los cambios",
    "It will appear on your homepage.": "Aparecerá en su página de Inicio.",
    "Make it Hidden": "oculto",
    "Make it Private": "privado",
    "Make it Public": "público",
    "New": "Nuevo",
    "private": "Privado",
    "public": "Público",
    "hidden": "oculto",
    "There is no photos in this album": "No hay fotos en este album.",
    "There is no public albums.": "No hay ningún album.",
    "This album is private": "Este album es privado",
    "This album is hidden": "Este album es oculto",
    "This album is public": "Este album es público",
    "title placeholder": "Título…",
    "View": "Ver",
    "description placeholder": "Descripción…",
    "is too big (max 10Mo)": "es demasiado grande (max 10Mo)",
    "is not an image": "no es una imagen",
    "Share album by mail": "Compartir por correo electrónico",
    "Upload your contacts...": "Cargar sus contactos…",
    "Share album": "Compartir el album",
    "Add contact": "Añadir un contacto",
    "Send mail": "Enviar un mensaje",
    "Select your friends": "Escoger a sus amigos",
    "Add": "Añadir",
    "Cancel": "Anular",
    "photo successfully set as cover": "Se ha fijado exitosamente la imagen como  portada del album",
    "problem occured while setting cover": "Ocurrió un problema al fijar la imagen como portada del album.",
    "pick from computer": "Para añadir imágenes, haga clic aquí o arrastre y pegue sus fotos.",
    "pick from files": "Hacer clic aquí para importar imágenes desde la aplicación Archivos.",
    "hidden-description": "No aparecerá en su página Escritorio.\nPero usted puede compartirlo en esta url:",
    "It cannot be accessed from the public side": "No es un recurso público.",
    "rebuild thumbnails": "Regenerar las miniaturas",
    "01": "Enero",
    "02": "Febrero",
    "03": "Marzo",
    "04": "Abril",
    "05": "Mayo",
    "06": "Junio",
    "07": "Julio",
    "08": "Agosto",
    "09": "Septiembre",
    "10": "Octubre",
    "11": "Noviembre",
    "12": "Diciembre",
    "cancel": "Anular",
    "copy paste link": "Para que su contacto pueda acceder, enviar este enlace:",
    "details": "Detalles",
    "inherited from": "heredado de",
    "modal question album shareable": "Escoger la manera de compartir este album",
    "modal shared album custom msg": "Insertar un correo electrónico y pulsar en Enter",
    "modal shared album link msg": "Enviar este enlace para compartir este album",
    "modal shared public link msg": "Enviar este enlace para compartir esta carpeta.",
    "modal shared with people msg": "Invite a unos contactos seleccionados a acceder a él. Escriba\nlos email en el campo y presione la tecla Enter (se les enviará un email):",
    "modal send mails": "Enviar un aviso",
    "modal next": "Siguiente",
    "modal prev": "Precedente",
    "modal ok": "Ok",
    "modal cancel": "Anular",
    "modal error": "Error",
    "only you can see": "Sólo usted y las personas que aparecen en la lista siguiente pueden acceder al recurso",
    "shared": "Compartido",
    "share": "Compartir",
    "save": "Guardar",
    "see link": "Ver el enlace",
    "send mails question": "Avisar por correo electrónico a:",
    "sharing": "Compartiendo",
    "revoke": "Revocar el permiso",
    "confirm": "Confirmar",
    "share forgot add": "Parece que a usted se le ha olvidado pulsar el botón Añadir",
    "share confirm save": "Los cambios efectuados en los permisos no se tendrán en cuenta.¿Lo confirma?.",
    "yes forgot": "Atrás",
    "no forgot": "Ok",
    "perm": "Usted puede",
    "perm r album": "navegar en este album",
    "perm rw album": "navegar en este album y cargar fotos",
    "mail not send": "El mensaje no ha sido enviado",
    "server error occured": "Ocurrió un error en el servidor, intentar de nuevo",
    "change notif": "Marque esta casilla para recibir un aviso cozy cuando un contacto\nañada una foto a este album.",
    "send email hint": "Se avisa por correo electrónico cuando se guarda por primera vez",
    "yes": "Si",
    "no": "No",
    "picture": "foto |||| fotos",
    "delete empty album": "El album está vacío, ¿quiere suprimirlo?",
    "are you sure you want to delete this album": "¿Esta seguro(a) que quiere borrar este album?",
    "photos search": "Cargando ...",
    "no photos found": "No se ha encontrado ninguna foto",
    "thumb creation": "La aplicación está creando miniaturas para mejorar la navegación.",
    "progress": "Avance",
    "Navigate before upload": "Algunas páginas todavía no se han enviado al servidor, ¿desea realmente salir de esta página?",
    "application title": "Cozy - fotos"
};
});

require.register("locales/fr", function(exports, require, module) {
module.exports = {
    "or": "ou",
    "Back": "Retour",
    "Create a new album": "Créer un nouvel album",
    "Delete": "Supprimer",
    "Download": "Télécharger",
    "Edit": "Modifier",
    "Stop editing": "Enregistrer",
    "It will appear on your homepage.": "Il sera affiché sur la page de l'album.",
    "Make it Hidden": "masqué",
    "Make it Private": "privé",
    "Make it Public": "public",
    "New": "Nouveau",
    "private": "Privé",
    "public": "Public",
    "hidden": "masqué",
    "There is no photos in this album": "Pas de photos dans cet album",
    "There is no public albums.": "Il n'y a aucun album",
    "This album is private": "Cet album est privé",
    "This album is hidden": "Cet album est masqué",
    "This album is public": "Cet album est public",
    "title placeholder": "Titre...",
    "View": "Voir",
    "description placeholder": "Description...",
    "is too big (max 10Mo)": "est trop grosse (max 10Mo)",
    "is not an image": "n'est pas une image",
    "Share album by mail": "Partagez par mail",
    "Upload your contacts...": "Envoi de vos contacts",
    "Share album": "Partagez l'album",
    "Add contact": "Ajoutez un contact",
    "Send mail": "Envoyez mail",
    "Select your friends": "Choisissez vos amis",
    "Add": "Ajouter",
    "Cancel": "Annuler",
    "photo successfully set as cover": "L'image est maintenant la couverture de l'album.",
    "problem occured while setting cover": "Un problème est survenu en positionnant l'image comme couverture de\nl'album.",
    "pick from computer": "Cliquez ici ou glissez-déposez vos photos pour ajouter des images",
    "pick from files": "Cliquez ici pour importer des images de l'application Files",
    "hidden-description": "Il n'apparaîtra pas sur votre page d'accueil,\nMais vous pouvez partager cette URL :",
    "It cannot be accessed from the public side": "Ce n'est pas visible en public",
    "rebuild thumbnails": "Regénérer les vignettes",
    "01": "Janvier",
    "02": "Février",
    "03": "Mars",
    "04": "Avril",
    "05": "Mai",
    "06": "Juin",
    "07": "Juillet",
    "08": "Août",
    "09": "Septembre",
    "10": "Octobre",
    "11": "Novembre",
    "12": "Décembre",
    "cancel": "Annuler",
    "copy paste link": "Pour donner accès à votre contact envoyez-lui ce lien :",
    "details": "Détails",
    "inherited from": "hérité de",
    "modal question album shareable": "Choisissez le mode de partage pour cet album",
    "modal shared album custom msg": "Entrez un email et appuyez sur Entrée",
    "modal shared album link msg": "Envoyez ce lien pour permettre aux personnes d'accéder à l'album",
    "modal shared public link msg": "Envoyez ce lien pour partager cet album",
    "modal shared with people msg": "Invitez des personnes parmi vos contacts à y accéder. Saisissez\nleur adresse mail dans le champ et appuyez sur Entrée (un mail leur sera envoyé)&nbsp;:",
    "modal send mails": "Envoyer une notification",
    "modal next": "Suivant",
    "modal prev": "Précédent",
    "modal ok": "Ok",
    "modal cancel": "Annuler",
    "modal error": "Erreur",
    "only you can see": "Seuls vous et les personnes ci-dessous peuvent accéder à cette ressource.",
    "shared": "Partagé",
    "share": "Partager",
    "save": "Sauvegarder",
    "see link": "Voir le lien",
    "send mails question": "Envoyer un email de notification à :",
    "sharing": "Partage",
    "revoke": "Révoquer la permission",
    "confirm": "Confirmer",
    "share forgot add": "Il semble que vous ayez oublié d'appuyer sur le bouton Ajouter",
    "share confirm save": "Les changements effectués sur les permissions ne seront pas sauvegardés. Vous confirmez ?",
    "yes forgot": "Retour",
    "no forgot": "Ok",
    "perm": "peut",
    "perm r album": "parcourir cet album",
    "perm rw album": "parcourir cet album et ajouter des photos",
    "mail not send": "Le message n'a pas pu être envoyé",
    "server error occured": "Une erreur est survenue sur le serveur, veuillez réessayer",
    "change notif": "Cocher cette case pour recevoir une notification cozy quand un contact\n ajoute une photo à cet album.",
    "send email hint": "Des emails de notification seront envoyés lors de la première sauvegarde.",
    "yes": "Oui",
    "no": "Non",
    "picture": "photo |||| photos",
    "delete empty album": "L'album est vide, voulez-vous le supprimer?",
    "are you sure you want to delete this album": "Voulez-vous vraiment effacer cet album ?",
    "photos search": "Recherche des photos...",
    "no photos found": "Aucune photo trouvée...",
    "thumb creation": "L'application est en train de créer des miniatures pour vos photos afin d'améliorer votre navigation.",
    "progress": "Progression",
    "Navigate before upload": "Certaines photos n'ont pas encore été envoyées au serveur, voulez-vous vraiment quitter cette page ?",
    "application title": "Cozy - photos",
    "photo delete confirm": "Voulez-vous vraiment supprimer cette photo ?"
}
;
});

require.register("models/album", function(exports, require, module) {
var Album, PhotoCollection, client,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PhotoCollection = require('collections/photo');

client = require("../lib/client");

module.exports = Album = (function(_super) {
  __extends(Album, _super);

  Album.prototype.urlRoot = 'albums';

  Album.prototype.defaults = function() {
    return {
      title: '',
      description: '',
      clearance: [],
      thumbsrc: 'img/nophotos.gif',
      orientation: 1,
      updated: null
    };
  };

  Album.prototype.url = function() {
    return Album.__super__.url.apply(this, arguments) + app.urlKey;
  };

  function Album() {
    this.photos = new PhotoCollection();
    return Album.__super__.constructor.apply(this, arguments);
  }

  Album.prototype.parse = function(attrs) {
    var _ref, _ref1, _ref2;
    if (((_ref = attrs.photos) != null ? _ref.length : void 0) > 0) {
      this.photos.reset(attrs.photos, {
        parse: true
      });
    }
    delete attrs.photos;
    if (attrs.coverPicture && attrs.coverPicture !== 'null') {
      attrs.thumb = attrs.coverPicture;
      attrs.thumbsrc = "photos/thumbs/" + attrs.coverPicture + ".jpg";
      if (((_ref1 = this.photos.get(attrs.coverPicture)) != null ? (_ref2 = _ref1.attributes) != null ? _ref2.orientation : void 0 : void 0) != null) {
        attrs.orientation = this.photos._byId[attrs.coverPicture].attributes.orientation;
      }
    }
    if (attrs.clearance === 'hidden') {
      attrs.clearance = 'public';
    }
    if (attrs.clearance === 'private') {
      attrs.clearance = [];
    }
    return attrs;
  };

  Album.prototype.getThumbSrc = function() {
    var coverPicture, thumbSrc;
    coverPicture = this.get('coverPicture');
    if (coverPicture != null) {
      thumbSrc = "photos/thumbs/" + (this.get('coverPicture')) + ".jpg";
    } else {
      thumbSrc = "img/nophotos.gif";
    }
    return thumbSrc + app.urlKey;
  };

  Album.prototype.getPublicURL = function(key) {
    var urlKey;
    urlKey = key ? "?key=" + key : "";
    return "" + window.location.origin + "/public/photos/" + urlKey + "#albums/" + this.id;
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

;require.register("models/photo", function(exports, require, module) {
var Photo, client,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

client = require('../lib/client');

module.exports = Photo = (function(_super) {
  __extends(Photo, _super);

  function Photo() {
    return Photo.__super__.constructor.apply(this, arguments);
  }

  Photo.prototype.defaults = function() {
    return {
      thumbsrc: 'img/loading.gif',
      src: '',
      orientation: 1,
      gps: {}
    };
  };

  Photo.prototype.url = function() {
    return Photo.__super__.url.apply(this, arguments) + app.urlKey;
  };

  Photo.prototype.parse = function(attrs) {
    if (!attrs.id) {
      return attrs;
    } else {
      return _.extend(attrs, {
        thumbsrc: ("photos/thumbs/" + attrs.id + ".jpg") + app.urlKey,
        src: ("photos/" + attrs.id + ".jpg") + app.urlKey,
        orientation: attrs.orientation
      });
    }
  };

  Photo.prototype.getPrevSrc = function() {
    return "photos/" + (this.get('id')) + ".jpg";
  };

  return Photo;

})(Backbone.Model);

Photo.listFromFiles = function(page, callback) {
  return client.get("files/" + page, callback);
};

Photo.makeFromFile = function(fileid, attr, callback) {
  return client.post("files/" + fileid + "/toPhoto", attr, callback);
};
});

;require.register("models/photoprocessor", function(exports, require, module) {
var PhotoProcessor, blobify, makeScreenBlob, makeScreenDataURI, makeThumbBlob, makeThumbDataURI, readFile, resize, upload, uploadWorker;

readFile = function(photo, next) {
  var reader;
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
    photo.img.orientation = photo.attributes.orientation;
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
  photo.thumb_du = resize(photo, 300, 300, true);
  photo.trigger('thumbed');
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
  _ref = ['title', 'description', 'albumid', 'orientation'];
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
      photo.set(photo.parse(data), {
        silent: true
      });
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

uploadWorker = function(photo, done) {
  return async.waterfall([
    function(cb) {
      return readFile(photo, cb);
    }, function(cb) {
      return makeThumbDataURI(photo, cb);
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
      return setTimeout(cb, 200);
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

  PhotoProcessor.prototype.uploadQueue = async.queue(uploadWorker, 2);

  PhotoProcessor.prototype.process = function(photo) {
    return this.uploadQueue.push(photo, function(err) {
      if (err) {
        return console.log(err);
      }
    });
  };

  return PhotoProcessor;

})();

module.exports = new PhotoProcessor();
});

;require.register("models/thumbprocessor", function(exports, require, module) {
var ThumbProcessor, blobify, makeThumbBlob, makeThumbDataURI, readFile, resize, upload, uploadWorker;

readFile = function(photo, next) {
  photo.img = new Image();
  photo.img.onload = function() {
    return next();
  };
  return photo.img.src = photo.url;
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
  photo.thumb_du = resize(photo, 300, 300, true);
  return setTimeout(next, 1);
};

makeThumbBlob = function(photo, next) {
  photo.thumb = blobify(photo.thumb_du, photo.file.type);
  return setTimeout(next, 1);
};

upload = function(photo, next) {
  var formdata;
  formdata = new FormData();
  formdata.append('thumb', photo.thumb, "thumb_" + photo.file.name);
  return $.ajax({
    url: "photos/thumbs/" + photo.id + ".jpg",
    data: formdata,
    cache: false,
    contentType: false,
    processData: false,
    type: 'PUT',
    success: function(data) {
      return $("#rebuild-th").append("<p>" + photo.file.name + " photo updated.</p>");
    }
  });
};

uploadWorker = function(photo, done) {
  return async.waterfall([
    function(cb) {
      return readFile(photo, cb);
    }, function(cb) {
      return makeThumbDataURI(photo, cb);
    }, function(cb) {
      return makeThumbBlob(photo, cb);
    }, function(cb) {
      return upload(photo, cb);
    }, function(cb) {
      delete photo.img;
      delete photo.thumb;
      delete photo.thumb_du;
      return cb();
    }
  ], function(err) {
    return done(err);
  });
};

ThumbProcessor = (function() {
  function ThumbProcessor() {}

  ThumbProcessor.prototype.uploadQueue = async.queue(uploadWorker, 2);

  ThumbProcessor.prototype.process = function(model) {
    var photo;
    photo = {
      url: model.getPrevSrc(),
      id: model.get('id'),
      file: {
        type: 'image/jpeg',
        name: model.get('title')
      }
    };
    return uploadWorker(photo, function(err) {
      if (err) {
        return console.log(err);
      }
    });
  };

  return ThumbProcessor;

})();

module.exports = new ThumbProcessor();
});

;require.register("router", function(exports, require, module) {
var Album, AlbumCollection, AlbumView, AlbumsListView, MapView, PhotoCollection, Router, app,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app = require('application');

AlbumsListView = require('views/albumslist');

AlbumView = require('views/album');

MapView = require('views/map');

Album = require('models/album');

PhotoCollection = require('collections/photo');

AlbumCollection = require('collections/album');

module.exports = Router = (function(_super) {
  __extends(Router, _super);

  function Router() {
    this.beforeUnload = __bind(this.beforeUnload, this);
    this.hashChange = __bind(this.hashChange, this);
    this.displayView = __bind(this.displayView, this);
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    '': 'albumslist',
    'albums': 'albumslist',
    'albums/edit': 'albumslistedit',
    'albums/new': 'newalbum',
    'albums/:albumid': 'album',
    'albums/:albumid/edit': 'albumedit',
    'albums/:albumid/photo/:photoid': 'photo',
    'albums/:albumid/edit/photo/:photoid': 'photoedit',
    'map': 'showmap'
  };

  Router.prototype.showmap = function() {
    var allphotos;
    allphotos = new PhotoCollection;
    allphotos.fetch({
      reset: true
    });
    return this.displayView(new MapView({
      collection: allphotos
    }));
  };

  Router.prototype.albumslist = function(editable) {
    if (editable == null) {
      editable = false;
    }
    return this.displayView(new AlbumsListView({
      collection: app.albums.sort(),
      editable: editable
    }));
  };

  Router.prototype.albumslistedit = function() {
    if (app.mode === 'public') {
      return this.navigate('albums', true);
    }
    return this.albumslist(true);
  };

  Router.prototype.album = function(id, editable, callback) {
    var album, _ref, _ref1;
    if (editable == null) {
      editable = false;
    }
    if (((_ref = this.mainView) != null ? (_ref1 = _ref.model) != null ? _ref1.get('id') : void 0 : void 0) === id) {
      if (editable) {
        this.mainView.makeEditable();
      } else {
        this.mainView.makeNonEditable();
      }
      if (callback) {
        return callback();
      } else {
        return this.mainView.closeGallery();
      }
    } else {
      album = app.albums.get(id) || new Album({
        id: id
      });
      return album.fetch().done((function(_this) {
        return function() {
          _this.displayView(new AlbumView({
            model: album,
            editable: editable
          }));
          if (callback) {
            return callback();
          } else {
            return _this.mainView.closeGallery();
          }
        };
      })(this)).fail((function(_this) {
        return function() {
          alert(t('this album does not exist'));
          return _this.navigate('albums', true);
        };
      })(this));
    }
  };

  Router.prototype.photo = function(albumid, photoid) {
    return this.album(albumid, false, (function(_this) {
      return function() {
        return _this.mainView.showPhoto(photoid);
      };
    })(this));
  };

  Router.prototype.photoedit = function(albumid, photoid) {
    return this.album(albumid, true, (function(_this) {
      return function() {
        return _this.mainView.showPhoto(photoid);
      };
    })(this));
  };

  Router.prototype.albumedit = function(id) {
    if (app.mode === 'public') {
      return this.navigate('albums', true);
    }
    this.album(id, true);
    return setTimeout(function() {
      return $('#title').focus();
    }, 200);
  };

  Router.prototype.newalbum = function() {
    if (app.mode === 'public') {
      return this.navigate('albums', true);
    }
    return window.app.albums.create({}, {
      success: (function(_this) {
        return function(model) {
          return _this.navigate("albums/" + model.id + "/edit", true);
        };
      })(this),
      error: (function(_this) {
        return function() {
          return _this.navigate("albums", true);
        };
      })(this)
    });
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

  Router.prototype.hashChange = function(event) {
    if (this.cancelNavigate) {
      event.stopImmediatePropagation();
      return this.cancelNavigate = false;
    } else {
      document.title = t('application title');
      if (this.mainView && this.mainView.dirty) {
        if (!(window.confirm(t("Navigate before upload")))) {
          event.stopImmediatePropagation();
          this.cancelNavigate = true;
          return window.location.href = event.originalEvent.oldURL;
        } else {
          return this.mainView.dirty = false;
        }
      }
    }
  };

  Router.prototype.beforeUnload = function(event) {
    var confirm;
    if (this.mainView && this.mainView.dirty) {
      confirm = t("Navigate before upload");
    } else {
      confirm = void 0;
    }
    event.returnValue = confirm;
    return confirm;
  };

  return Router;

})(Backbone.Router);
});

;require.register("templates/album", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),id = locals_.id,downloadPath = locals_.downloadPath,photosNumber = locals_.photosNumber,clearance = locals_.clearance,title = locals_.title,description = locals_.description;
buf.push("<div id=\"about\"><div class=\"clearfix\"><div id=\"links\" class=\"clearfix\"><p class=\"back\"><a href=\"#albums\" class=\"flatbtn\"><span class=\"fa fa-arrow-left icon-white\"></span><span>" + (jade.escape(null == (jade_interp = t("Back")) ? "" : jade_interp)) + "</span></a></p><p class=\"startediting\"><a" + (jade.attr("href", "#albums/" + (id) + "/edit", true, false)) + " class=\"flatbtn\"><span class=\"fa fa-edit icon-white\"></span><span>" + (jade.escape(null == (jade_interp = t("Edit")) ? "" : jade_interp)) + "</span></a></p><p class=\"stopediting\"><a" + (jade.attr("href", "#albums/" + (id) + "", true, false)) + " class=\"flatbtn stopediting\"><span class=\"fa fa-save icon-white\"></span><span>" + (jade.escape(null == (jade_interp = t("Stop editing")) ? "" : jade_interp)) + "</span></a></p><p class=\"download\"><a" + (jade.attr("href", "" + (downloadPath) + "", true, false)) + " class=\"flatbtn\"><span class=\"fa fa-download icon-white\"></span><span>" + (jade.escape(null == (jade_interp = t("Download")) ? "" : jade_interp)) + "</span></a></p><p class=\"delete\"><a class=\"flatbtn delete\"><span class=\"fa fa-trash icon-white\"></span><span>" + (jade.escape(null == (jade_interp = t("Delete")) ? "" : jade_interp)) + "</span></a></p><p class=\"clearance\"><a class=\"flatbtn clearance\"><span class=\"fa fa-share-alt icon-white\"></span><span>" + (jade.escape(null == (jade_interp = t("share")) ? "" : jade_interp)) + "</span></a></p></div><div id=\"album-text\"><div id=\"album-text-background\"><div class=\"right\"><p><span class=\"photo-number\">" + (jade.escape(null == (jade_interp = photosNumber) ? "" : jade_interp)) + "</span><br/><span class=\"photo-count\">" + (jade.escape(null == (jade_interp = t("picture", {smart_count: photosNumber})) ? "" : jade_interp)) + "</span></p></div><form class=\"left\"><div><span class=\"clearance-state\">");
if ( clearance == 'public')
{
buf.push("<span class=\"fa fa-globe\"></span>&nbsp;\n" + (jade.escape((jade_interp = t('shared')) == null ? '' : jade_interp)) + "");
}
else if ( clearance && clearance.length > 0)
{
buf.push("<span class=\"fa fa-share-alt\"></span>&nbsp;\n" + (jade.escape((jade_interp = t('shared')) == null ? '' : jade_interp)) + "");
if ( clearance.length)
{
buf.push("<span>&nbsp;(" + (jade.escape((jade_interp = clearance.length) == null ? '' : jade_interp)) + ")</span>");
}
}
buf.push("</span></div><input id=\"title\" type=\"text\"" + (jade.attr("placeholder", "" + (t('title placeholder')) + "", true, false)) + (jade.attr("value", title, true, false)) + "/><textarea id=\"description\"" + (jade.attr("placeholder", "" + (t('description placeholder')) + "", true, false)) + ">" + (null == (jade_interp = description) ? "" : jade_interp) + "</textarea><div id=\"publicDesc\">" + (jade.escape(null == (jade_interp = description) ? "" : jade_interp)) + "</div></form></div></div></div></div><div id=\"photos\" class=\"clearfix\"></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/albumlist", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<a id=\"create-album-link\" href=\"#albums/new\" class=\"create\"><span>" + (jade.escape(null == (jade_interp = t('Create a new album')) ? "" : jade_interp)) + "</span></a><a href=\"#map\" class=\"create map-link\"><i class=\"fa fa-globe\"></i></a><p class=\"help\">" + (jade.escape(null == (jade_interp = t('There is no public albums.')) ? "" : jade_interp)) + "</p>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/albumlist_item", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),id = locals_.id,isRecent = locals_.isRecent,thumbsrc = locals_.thumbsrc,folderid = locals_.folderid,title = locals_.title;
buf.push("<a" + (jade.attr("id", "" + (id) + "", true, false)) + (jade.attr("href", "#albums/" + (id) + "", true, false)) + (jade.cls([isRecent], [true])) + "><img" + (jade.attr("src", "" + (thumbsrc) + "", true, false)) + "/><span class=\"title\">");
if ( folderid == "all")
{
buf.push(jade.escape(null == (jade_interp = title) ? "" : jade_interp));
}
else
{
buf.push("<b>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</b>");
}
buf.push("</span></a>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/browser", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),dates = locals_.dates,hasPrev = locals_.hasPrev,hasNext = locals_.hasNext,photos = locals_.photos;
buf.push("<div class=\"files\">");
if ( dates.length === 0)
{
buf.push("<p>" + (jade.escape(null == (jade_interp = t("photos search")) ? "" : jade_interp)) + "</p>");
}
else if ( dates === "No photos found")
{
buf.push("<p>" + (jade.escape(null == (jade_interp = t("no photos found")) ? "" : jade_interp)) + "</p>");
}
else
{
buf.push("<nav><ul>");
if ( hasPrev)
{
buf.push("<li><a class=\"btn btn-cozy prev\"><i class=\"fa fa-angle-left\"></i><span>" + (jade.escape((jade_interp = t('modal prev')) == null ? '' : jade_interp)) + "</span></a></li>");
}
if ( hasNext)
{
buf.push("<li><a class=\"btn btn-cozy next\"><span>" + (jade.escape((jade_interp = t('modal next')) == null ? '' : jade_interp)) + "</span><i class=\"fa fa-angle-right\"></i></a></li>");
}
buf.push("</ul></nav><dl>");
// iterate dates
;(function(){
  var $$obj = dates;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var date = $$obj[$index];

buf.push("<dt>" + (jade.escape((jade_interp = t(date.split('-')[1])) == null ? '' : jade_interp)) + " " + (jade.escape((jade_interp = date.split('-')[0]) == null ? '' : jade_interp)) + "</dt><dd><ul class=\"thumbs\">");
// iterate photos[date]
;(function(){
  var $$obj = photos[date];
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var photo = $$obj[$index];

buf.push("<li><img" + (jade.attr("src", "files/thumbs/" + (photo.id) + ".jpg", true, false)) + (jade.attr("id", "" + (photo.id) + "", true, false)) + "/></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var photo = $$obj[$index];

buf.push("<li><img" + (jade.attr("src", "files/thumbs/" + (photo.id) + ".jpg", true, false)) + (jade.attr("id", "" + (photo.id) + "", true, false)) + "/></li>");
    }

  }
}).call(this);

buf.push("</ul></dd>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var date = $$obj[$index];

buf.push("<dt>" + (jade.escape((jade_interp = t(date.split('-')[1])) == null ? '' : jade_interp)) + " " + (jade.escape((jade_interp = date.split('-')[0]) == null ? '' : jade_interp)) + "</dt><dd><ul class=\"thumbs\">");
// iterate photos[date]
;(function(){
  var $$obj = photos[date];
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var photo = $$obj[$index];

buf.push("<li><img" + (jade.attr("src", "files/thumbs/" + (photo.id) + ".jpg", true, false)) + (jade.attr("id", "" + (photo.id) + "", true, false)) + "/></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var photo = $$obj[$index];

buf.push("<li><img" + (jade.attr("src", "files/thumbs/" + (photo.id) + ".jpg", true, false)) + (jade.attr("id", "" + (photo.id) + "", true, false)) + "/></li>");
    }

  }
}).call(this);

buf.push("</ul></dd>");
    }

  }
}).call(this);

buf.push("</dl><nav><ul>");
if ( hasPrev)
{
buf.push("<li><a class=\"btn btn-cozy prev\"><i class=\"fa fa-angle-left\"></i><span>" + (jade.escape((jade_interp = t('modal prev')) == null ? '' : jade_interp)) + "</span></a></li>");
}
if ( hasNext)
{
buf.push("<li><a class=\"btn btn-cozy next\"><span>" + (jade.escape((jade_interp = t('modal next')) == null ? '' : jade_interp)) + "</span><i class=\"fa fa-angle-right\"></i></a></li>");
}
buf.push("</ul></nav>");
}
buf.push("</div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/galery", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<p class=\"help\">" + (jade.escape(null == (jade_interp = t('There is no photos in this album')) ? "" : jade_interp)) + "</p><div id=\"upload-actions\"><div id=\"upload-block\" class=\"flatbtn\"><input id=\"uploader\" type=\"file\" multiple=\"multiple\"/><div class=\"pa2\">" + (jade.escape(null == (jade_interp = t('pick from computer')) ? "" : jade_interp)) + "</div></div><div id=\"browse-files\" class=\"flatbtn\"><div class=\"pa2\">" + (jade.escape(null == (jade_interp = t('pick from files')) ? "" : jade_interp)) + "</div></div></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/map", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div style=\"position: fixed; height:100%; width: 100%;\"><div id=\"links\" style=\"margin-bottom:0;\"><a href=\"#\" class=\"flatbtn\"><span class=\"fa fa-arrow-left icon-white\"></span><span>" + (jade.escape(null == (jade_interp = t("Back")) ? "" : jade_interp)) + "</span></a></div><div id=\"map\" style=\"height: 95%;\"></div></div><form style=\"position: fixed; bottom: 0; width: 100%; height:0; background-color: white; transisiton: all 0.5 linear\" class=\"choice-box\"><div id=\"map-galery\" style=\"overflow-x: scroll; padding: 0; white-space: nowrap;\" class=\"col-sm-10\"></div><div style=\"padding: 0;\" class=\"map-setter col-sm-2\"><div class=\"clearfix\"><div id=\"links\" class=\"clearfix\"><p class=\"back\"><button id=\"validate\" class=\"flatbtn\"><span>" + (jade.escape(null == (jade_interp = t("Apply")) ? "" : jade_interp)) + "</span></button></p></div></div></div></form><img hidden src=\"images/spinner.svg\" width=\"100%\", height=\"100%\" title=\"waiting...\" />");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("templates/photo", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
var locals_ = (locals || {}),src = locals_.src,title = locals_.title,thumbsrc = locals_.thumbsrc;
buf.push("<a" + (jade.attr("href", "" + (src) + "", true, false)) + (jade.attr("title", "" + (title) + "", true, false)) + "><img" + (jade.attr("data-src", "" + (thumbsrc) + "", true, false)) + (jade.attr("alt", "" + (title) + "", true, false)) + "/><div class=\"progressfill\"></div></a><button class=\"delete flatbtn\"><i class=\"fa fa-times icon-white\"></i></button>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/album", function(exports, require, module) {
var AlbumView, BaseView, Clipboard, CozyClearanceModal, Galery, ShareModal, TAB_KEY_CODE, app, clipboard, thProcessor,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

app = require('application');

BaseView = require('lib/base_view');

Galery = require('views/galery');

Clipboard = require('lib/clipboard');

thProcessor = require('models/thumbprocessor');

clipboard = new Clipboard();

TAB_KEY_CODE = 9;

if (!window.location.pathname.match(/public/)) {
  CozyClearanceModal = require('cozy-clearance/modal_share_view');
  ShareModal = (function(_super) {
    __extends(ShareModal, _super);

    function ShareModal() {
      return ShareModal.__super__.constructor.apply(this, arguments);
    }

    ShareModal.prototype.initialize = function() {
      ShareModal.__super__.initialize.apply(this, arguments);
      return this.refresh();
    };

    ShareModal.prototype.makeURL = function(key) {
      return this.model.getPublicURL(key);
    };

    return ShareModal;

  })(CozyClearanceModal);
}

module.exports = AlbumView = (function(_super) {
  __extends(AlbumView, _super);

  function AlbumView() {
    this.onPhotoCollectionChange = __bind(this.onPhotoCollectionChange, this);
    this.changeClearance = __bind(this.changeClearance, this);
    this.checkNew = __bind(this.checkNew, this);
    this.onFieldClicked = __bind(this.onFieldClicked, this);
    this.makeNonEditable = __bind(this.makeNonEditable, this);
    this.makeEditable = __bind(this.makeEditable, this);
    this.onDescriptionChanged = __bind(this.onDescriptionChanged, this);
    this.onTitleChanged = __bind(this.onTitleChanged, this);
    this.beforePhotoUpload = __bind(this.beforePhotoUpload, this);
    this.events = __bind(this.events, this);
    return AlbumView.__super__.constructor.apply(this, arguments);
  }

  AlbumView.prototype.template = require('templates/album');

  AlbumView.prototype.id = 'album';

  AlbumView.prototype.className = 'container-fluid';

  AlbumView.prototype.events = function() {
    return {
      'click a.delete': this.destroyModel,
      'click a.clearance': this.changeClearance,
      'click a.sendmail': this.sendMail,
      'click a#rebuild-th-btn': this.rebuildThumbs,
      'click a.stopediting': this.checkNew,
      'blur #title': this.onTitleChanged,
      'blur #description': this.onDescriptionChanged,
      'click #title': this.onFieldClicked,
      'click #description': this.onFieldClicked,
      'mousedown #title': this.onFieldClicked,
      'mousedown #description': this.onFieldClicked,
      'mouseup #title': this.onFieldClicked,
      'mouseup #description': this.onFieldClicked,
      'keydown #description': this.onDescriptionKeyUp
    };
  };

  AlbumView.prototype.initialize = function(options) {
    var onPhotoCollectionChange;
    AlbumView.__super__.initialize.call(this, options);
    onPhotoCollectionChange = _.debounce(this.onPhotoCollectionChange, 50);
    this.listenTo(this.model.photos, 'add remove', onPhotoCollectionChange);
    return this.listenTo(this.model, 'change:clearance', this.render);
  };

  AlbumView.prototype.getRenderData = function() {
    var downloadPath, key, res;
    key = $.url().param('key');
    downloadPath = "albums/" + (this.model.get('id')) + ".zip";
    if (key != null) {
      downloadPath += "?key=" + key;
    }
    res = _.extend({
      downloadPath: downloadPath,
      photosNumber: this.model.photos.length
    }, this.model.attributes);
    return res;
  };

  AlbumView.prototype.afterRender = function() {
    document.title = "" + (t('application title')) + " - " + (this.model.get('title'));
    this.title = this.$('#title');
    this.description = this.$('#description');
    this.publicDesc = this.$('#publicDesc');
    this.galery = new Galery({
      el: this.$('#photos'),
      editable: this.options.editable,
      collection: this.model.photos,
      beforeUpload: this.beforePhotoUpload
    });
    this.galery.album = this.model;
    this.galery.render();
    if (this.options.editable) {
      this.makeEditable();
      return this.publicDesc.hide();
    } else {
      this.title.addClass('disabled');
      this.description.hide();
      return this.publicDesc.show();
    }
  };

  AlbumView.prototype.beforePhotoUpload = function(callback) {
    return callback({
      albumid: this.model.id
    });
  };

  AlbumView.prototype.onTitleChanged = function() {
    return this.saveModel({
      title: this.title.val().trim()
    });
  };

  AlbumView.prototype.onDescriptionChanged = function() {
    return this.saveModel({
      description: this.description.val().trim()
    });
  };

  AlbumView.prototype.makeEditable = function() {
    document.title = "" + (t('application title')) + " - " + (this.model.get('title'));
    this.$el.addClass('editing');
    this.options.editable = true;
    this.galery.options.editable = true;
    this.description.show();
    return this.publicDesc.hide();
  };

  AlbumView.prototype.makeNonEditable = function() {
    document.title = "" + (t('application title')) + " - " + (this.model.get('title'));
    this.$el.removeClass('editing');
    this.options.editable = false;
    this.galery.options.editable = false;
    this.description.hide();
    return this.publicDesc.show();
  };

  AlbumView.prototype.onFieldClicked = function(event) {
    if (!this.options.editable) {
      event.preventDefault();
      return false;
    }
  };

  AlbumView.prototype.destroyModel = function() {
    if (confirm(t("are you sure you want to delete this album"))) {
      return this.model.destroy().then(function() {
        return app.router.navigate('albums', true);
      });
    }
  };

  AlbumView.prototype.checkNew = function(event) {
    if (this.model.get('title') === '' && this.model.get('description') === '' && this.model.photos.length === 0) {
      if (confirm(t('delete empty album'))) {
        event.preventDefault();
        this.model.destroy().then(function() {
          return app.router.navigate('albums', true);
        });
      }
    }
    return true;
  };

  AlbumView.prototype.changeClearance = function(event) {
    if (this.model.get('clearance') == null) {
      this.model.set('clearance', []);
    }
    this.model.set('type', 'album');
    return new ShareModal({
      model: this.model
    });
  };

  AlbumView.prototype.rebuildThumbs = function(event) {
    var models, recFunc;
    $("#rebuild-th p").remove();
    models = this.model.photos.models;
    recFunc = function() {
      var model;
      if (models.length > -1) {
        model = models.pop();
        return setTimeout(function() {
          thProcessor.process(model);
          return recFunc();
        }, 500);
      }
    };
    return recFunc();
  };

  AlbumView.prototype.onDescriptionKeyUp = function(event) {
    if (TAB_KEY_CODE === event.keyCode || TAB_KEY_CODE === event.which) {
      return $('.stopediting').focus();
    }
  };

  AlbumView.prototype.saveModel = function(data) {
    data.updated = Date.now();
    return this.model.save(data);
  };

  AlbumView.prototype.onPhotoCollectionChange = function() {
    this.model.save({
      updated: Date.now()
    });
    this.$('.photo-number').html(this.model.photos.length);
    return this.$('.photo-count').html(t("picture", {
      smart_count: this.model.photos.length
    }));
  };

  AlbumView.prototype.showPhoto = function(photoid) {
    return this.galery.showPhoto(photoid);
  };

  AlbumView.prototype.closeGallery = function() {
    return this.galery.closePhotobox();
  };

  return AlbumView;

})(BaseView);
});

;require.register("views/albumslist", function(exports, require, module) {
var AlbumsList, ViewCollection, app,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ViewCollection = require('lib/view_collection');

app = require('application');

module.exports = AlbumsList = (function(_super) {
  __extends(AlbumsList, _super);

  function AlbumsList() {
    this.checkIfEmpty = __bind(this.checkIfEmpty, this);
    return AlbumsList.__super__.constructor.apply(this, arguments);
  }

  AlbumsList.prototype.id = 'album-list';

  AlbumsList.prototype.itemView = require('views/albumslist_item');

  AlbumsList.prototype.template = require('templates/albumlist');

  AlbumsList.prototype.initialize = function() {
    return AlbumsList.__super__.initialize.apply(this, arguments);
  };

  AlbumsList.prototype.checkIfEmpty = function() {
    return this.$('.help').toggle(_.size(this.views) === 0 && app.mode === 'public');
  };

  AlbumsList.prototype.afterRender = function() {
    return AlbumsList.__super__.afterRender.apply(this, arguments);
  };

  return AlbumsList;

})(ViewCollection);
});

;require.register("views/albumslist_item", function(exports, require, module) {
var AlbumItem, BaseView, helpers, limitLength,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

limitLength = require('lib/helpers').limitLength;

helpers = require('lib/helpers');

module.exports = AlbumItem = (function(_super) {
  __extends(AlbumItem, _super);

  function AlbumItem() {
    return AlbumItem.__super__.constructor.apply(this, arguments);
  }

  AlbumItem.prototype.className = 'albumitem';

  AlbumItem.prototype.template = require('templates/albumlist_item');

  AlbumItem.prototype.initialize = function() {
    return this.listenTo(this.model, 'change', (function(_this) {
      return function() {
        return _this.render();
      };
    })(this));
  };

  AlbumItem.prototype.getRenderData = function() {
    var out;
    out = _.clone(this.model.attributes);
    out.description = limitLength(out.description, 250);
    out.thumbsrc = this.model.getThumbSrc();
    out.isRecent = (out.updated != null) && out.updated - Date.now() < 60000 ? 'recent' : '';
    return out;
  };

  AlbumItem.prototype.afterRender = function() {
    this.image = this.$('img');
    this.image.attr('src', this.model.getThumbSrc());
    helpers.rotate(this.model.attributes.orientation, this.image);
    if (this.image.get(0).complete) {
      return this.onImageLoaded();
    } else {
      return this.image.on('load', (function(_this) {
        return function() {
          return _this.onImageLoaded();
        };
      })(this));
    }
  };

  AlbumItem.prototype.onImageLoaded = function() {
    return this.image.addClass('loaded');
  };

  return AlbumItem;

})(BaseView);
});

;require.register("views/browser", function(exports, require, module) {
var FilesBrowser, Modal, Photo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Modal = require('cozy-clearance/modal');

Photo = require('../models/photo');

module.exports = FilesBrowser = (function(_super) {
  __extends(FilesBrowser, _super);

  function FilesBrowser() {
    return FilesBrowser.__super__.constructor.apply(this, arguments);
  }

  FilesBrowser.prototype.id = 'files-browser-modal';

  FilesBrowser.prototype.template_content = require('../templates/browser');

  FilesBrowser.prototype.title = t('pick from files');

  FilesBrowser.prototype.content = '<p>Loading ...</p>';

  FilesBrowser.prototype.events = function() {
    return _.extend(FilesBrowser.__super__.events.apply(this, arguments), {
      'click img': 'toggleSelected',
      'click a.next': 'displayNextPage',
      'click a.prev': 'displayPrevPage'
    });
  };

  FilesBrowser.prototype.toggleSelected = function(e) {
    var $el, first, index, last;
    $el = $(e.target);
    index = $el.parent().index();
    if ((this.lastSelectedIndex != null) && e.shiftKey) {
      if (index > this.lastSelectedIndex) {
        first = this.lastSelectedIndex;
        last = index;
      } else if (index < this.lastSelectedIndex) {
        first = index;
        last = this.lastSelectedIndex;
      }
      this.$('.thumbs li').filter(function(index) {
        return (first <= index && index <= last);
      }).find('img').addClass('selected');
    } else {
      $el.toggleClass('selected');
    }
    return this.lastSelectedIndex = index;
  };

  FilesBrowser.prototype.getRenderData = function() {
    return this.options;
  };

  FilesBrowser.prototype.initialize = function(options) {
    this.yes = t('modal ok');
    this.no = t('modal cancel');
    this.lastSelectedIndex = null;
    if (options.page == null) {
      FilesBrowser.__super__.initialize.call(this, {});
    }
    if (options.page == null) {
      options.page = 0;
    }
    if (options.selected == null) {
      this.options.selected = [];
    }
    this.options.page = options.page;
    return Photo.listFromFiles(options.page, (function(_this) {
      return function(err, body) {
        var dates, img, _i, _len, _ref, _results;
        if ((body != null ? body.files : void 0) != null) {
          dates = body.files;
        }
        if (err) {
          return console.log(err);
        } else if ((dates != null) && Object.keys(dates).length === 0) {
          _this.options.dates = "No photos found";
        } else {
          if ((body != null ? body.hasNext : void 0) != null) {
            _this.options.hasNext = body.hasNext;
          }
          _this.options.hasPrev = options.page !== 0;
          _this.options.dates = Object.keys(dates);
          _this.options.dates.sort(function(a, b) {
            return -1 * a.localeCompare(b);
          });
          _this.options.photos = dates;
        }
        _this.$('.modal-body').html(_this.template_content(_this.getRenderData()));
        _this.$('.modal-body').scrollTop(0);
        if (_this.options.selected[_this.options.page] != null) {
          _ref = _this.options.selected[_this.options.page];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            img = _ref[_i];
            _results.push(_this.$("#" + img.id).toggleClass('selected'));
          }
          return _results;
        }
      };
    })(this));
  };

  FilesBrowser.prototype.cb = function(confirmed) {
    if (!confirmed) {
      return;
    }
    return this.options.beforeUpload((function(_this) {
      return function(attrs) {
        var addImageToCollection, img, sel;
        _this.options.selected[_this.options.page] = _this.$('.selected');
        sel = [].concat.apply([], _this.options.selected.map(function(jq) {
          return jq.get();
        }));
        addImageToCollection = function(img) {
          var photo;
          attrs.title = img.name;
          photo = new Photo(attrs);
          photo.file = img;
          Photo.makeFromFile(img.id, attrs, function(err, attributes) {
            if (err) {
              return console.error(err);
            } else {
              return photo.save(attributes);
            }
          });
          return photo;
        };
        return _this.collection.add((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = sel.length; _i < _len; _i++) {
            img = sel[_i];
            _results.push(addImageToCollection(img));
          }
          return _results;
        })());
      };
    })(this));
  };

  FilesBrowser.prototype.displayNextPage = function() {
    var options;
    this.options.selected[this.options.page] = this.$('.selected');
    options = {
      page: this.options.page + 1,
      selected: this.options.selected
    };
    return this.initialize(options);
  };

  FilesBrowser.prototype.displayPrevPage = function() {
    var options;
    this.options.selected[this.options.page] = this.$('.selected');
    options = {
      page: this.options.page - 1,
      selected: this.options.selected
    };
    return this.initialize(options);
  };

  return FilesBrowser;

})(Modal);
});

;require.register("views/galery", function(exports, require, module) {
var FilesBrowser, Galery, Photo, PhotoView, ViewCollection, app, helpers, photoprocessor,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ViewCollection = require('lib/view_collection');

helpers = require('lib/helpers');

FilesBrowser = require('./browser');

PhotoView = require('views/photo');

Photo = require('models/photo');

photoprocessor = require('models/photoprocessor');

app = require('application');

module.exports = Galery = (function(_super) {
  __extends(Galery, _super);

  function Galery() {
    this.setCoverPicture = __bind(this.setCoverPicture, this);
    this.addPhoto = __bind(this.addPhoto, this);
    this.onAfterClosed = __bind(this.onAfterClosed, this);
    this.onImageDisplayed = __bind(this.onImageDisplayed, this);
    this.beforeImageDisplayed = __bind(this.beforeImageDisplayed, this);
    this.onTrashClicked = __bind(this.onTrashClicked, this);
    this.onFilesChanged = __bind(this.onFilesChanged, this);
    this.onPictureDestroyed = __bind(this.onPictureDestroyed, this);
    this.onCoverClicked = __bind(this.onCoverClicked, this);
    this.onTurnRight = __bind(this.onTurnRight, this);
    this.onTurnLeft = __bind(this.onTurnLeft, this);
    this.checkIfEmpty = __bind(this.checkIfEmpty, this);
    this.addItem = __bind(this.addItem, this);
    return Galery.__super__.constructor.apply(this, arguments);
  }

  Galery.prototype.itemView = PhotoView;

  Galery.prototype.template = require('templates/galery');

  Galery.prototype.events = function() {
    return {
      'drop': 'onFilesDropped',
      'dragover': 'onDragOver',
      'dragleave': 'onDragLeave',
      'click #uploader': 'onFilesClick',
      'click #browse-files': 'displayBrowser'
    };
  };

  Galery.prototype.initialize = function() {
    this.photoCount = 0;
    Galery.__super__.initialize.apply(this, arguments);
    return this.listenTo(this.collection, 'destroy', this.onPictureDestroyed);
  };

  Galery.prototype.afterRender = function() {
    var key, view, _ref, _results;
    Galery.__super__.afterRender.apply(this, arguments);
    this.$el.photobox('a.server', {
      thumbs: false,
      history: false,
      zoomable: false,
      beforeShow: this.beforeImageDisplayed,
      afterClose: this.onAfterClosed
    }, this.onImageDisplayed);
    if ($('#pbOverlay .pbCaptionText .btn-group').length === 0) {
      $('#pbOverlay .pbCaptionText').append('<div class="btn-group"></div>');
    }
    if (app.mode !== 'public') {
      this.turnLeft = $('#pbOverlay .pbCaptionText .btn-group .left');
      this.turnLeft.unbind('click');
      this.turnLeft.remove();
      this.turnLeft = $('<a id="left" class="btn left" type="button"> <i class="fa fa-undo"> </i> </a>').appendTo('#pbOverlay .pbCaptionText .btn-group');
      this.turnLeft.on('click', this.onTurnLeft);
      this.turnRight = $('#pbOverlay .pbCaptionText .btn-group .right');
      this.turnRight.unbind('click');
      this.turnRight.remove();
      this.turnRight = $('<a id="right" class="btn right"> <i class="fa fa-repeat" </i> </a>').appendTo('#pbOverlay .pbCaptionText .btn-group');
      this.turnRight.on('click', this.onTurnRight);
      this.coverBtn = $('#pbOverlay .pbCaptionText .btn-group .cover-btn');
      this.coverBtn.unbind('click');
      this.coverBtn.remove();
      this.coverBtn = $('<a id="cover-btn" class="btn cover-btn"> <i class="fa fa-star" </i> </a>').appendTo('#pbOverlay .pbCaptionText .btn-group');
      this.coverBtn.on('click', this.onCoverClicked);
      this.trashBtn = $('#pbOverlay .pbCaptionText .btn-group .trash-btn');
      this.trashBtn.unbind('click');
      this.trashBtn.remove();
      this.trashBtn = $('<a id="trash-btn" class="btn trash-btn"> <i class="fa fa-trash" </i> </a>').appendTo('#pbOverlay .pbCaptionText .btn-group');
      this.trashBtn.on('click', this.onTrashClicked);
    }
    this.downloadLink = $('#pbOverlay .pbCaptionText .btn-group .download-link');
    this.downloadLink.unbind('click');
    this.downloadLink.remove();
    if (!this.downloadLink.length) {
      this.downloadLink = $('<a class="btn download-link" download> <i class="fa fa-download"></i></a>').appendTo('#pbOverlay .pbCaptionText .btn-group');
    }
    this.uploader = this.$('#uploader');
    if (app.mode !== 'public') {
      _ref = this.views;
      _results = [];
      for (key in _ref) {
        view = _ref[key];
        _results.push(view.collection = this.collection);
      }
      return _results;
    }
  };

  Galery.prototype.addItem = function(model) {
    var options, view;
    options = _.extend({}, {
      model: model
    }, this.itemViewOptions(model));
    view = new this.itemView(options);
    this.views[model.cid] = view.render();
    if (this.photoCount < 50) {
      view.setSource();
    }
    this.photoCount++;
    this.appendView(view);
    return this.checkIfEmpty(this.views);
  };

  Galery.prototype.checkIfEmpty = function() {
    return this.$('.help').toggle(_.size(this.views) === 0 && app.mode === 'public');
  };

  Galery.prototype.onFilesDropped = function(evt) {
    if (this.options.editable) {
      this.$el.removeClass('dragover');
      this.handleFiles(evt.dataTransfer.files);
      evt.stopPropagation();
      evt.preventDefault();
    }
    return false;
  };

  Galery.prototype.onDragOver = function(evt) {
    if (this.options.editable) {
      this.$el.addClass('dragover');
      evt.preventDefault();
      evt.stopPropagation();
    }
    return false;
  };

  Galery.prototype.onDragLeave = function(evt) {
    if (this.options.editable) {
      this.$el.removeClass('dragover');
      evt.preventDefault();
      evt.stopPropagation();
    }
    return false;
  };

  Galery.prototype.getIdPhoto = function(url) {
    var id, parts, photo;
    if (url == null) {
      url = $('#pbOverlay .wrapper img').attr('src');
    }
    parts = url.split('/');
    id = parts[parts.length - 1];
    id = id.split('.')[0];
    if (this.collection.get(id) == null) {
      photo = this.collection.find(function(e) {
        return e.attributes.src.split('/').pop().split('.')[0] === id;
      });
      if (photo != null) {
        id = photo.cid;
      }
    }
    return id;
  };

  Galery.prototype.onTurnLeft = function() {
    var id, newOrientation, orientation, _ref, _ref1;
    id = this.getIdPhoto();
    orientation = (_ref = this.collection.get(id)) != null ? _ref.attributes.orientation : void 0;
    if (orientation == null) {
      orientation = 1;
    }
    newOrientation = helpers.rotateLeft(orientation, $('.wrapper img'));
    helpers.rotate(newOrientation, $('.wrapper img'));
    return (_ref1 = this.collection.get(id)) != null ? _ref1.save({
      orientation: newOrientation
    }, {
      success: function() {
        return helpers.rotate(newOrientation, $('.pbThumbs .active img'));
      }
    }) : void 0;
  };

  Galery.prototype.onTurnRight = function() {
    var id, newOrientation, orientation, _ref, _ref1;
    id = this.getIdPhoto();
    orientation = (_ref = this.collection.get(id)) != null ? _ref.attributes.orientation : void 0;
    newOrientation = helpers.rotateRight(orientation, $('.wrapper img'));
    helpers.rotate(newOrientation, $('.wrapper img'));
    return (_ref1 = this.collection.get(id)) != null ? _ref1.save({
      orientation: newOrientation
    }, {
      success: function() {
        return helpers.rotate(newOrientation, $('.pbThumbs .active img'));
      }
    }) : void 0;
  };

  Galery.prototype.onCoverClicked = function() {
    var photoId;
    this.coverBtn.addClass('disabled');
    photoId = this.getIdPhoto();
    this.album.set('coverPicture', photoId);
    this.album.set('thumb', photoId);
    this.album.set('thumbsrc', this.album.getThumbSrc());
    return this.album.save(null, {
      success: (function(_this) {
        return function() {
          _this.coverBtn.removeClass('disabled');
          return alert(t('photo successfully set as cover'));
        };
      })(this),
      error: (function(_this) {
        return function() {
          _this.coverBtn.removeClass('disabled');
          return alert(t('problem occured while setting cover'));
        };
      })(this)
    });
  };

  Galery.prototype.onPictureDestroyed = function(destroyed) {
    if (destroyed.id === this.album.get('coverPicture')) {
      return this.album.save({
        coverPicture: null
      });
    }
  };

  Galery.prototype.onFilesChanged = function(evt) {
    var old;
    this.handleFiles(this.uploader[0].files);
    old = this.uploader;
    this.uploader = old.clone(true);
    return old.replaceWith(this.uploader);
  };

  Galery.prototype.onFilesClick = function(evt) {
    var element;
    element = document.getElementById('uploader');
    return element.addEventListener('change', this.onFilesChanged);
  };

  Galery.prototype.onTrashClicked = function() {
    var photo;
    if (confirm(t('photo delete confirm'))) {
      photo = this.collection.get(this.getIdPhoto());
      return photo.destroy();
    }
  };

  Galery.prototype.beforeImageDisplayed = function(link) {
    var id, orientation, _ref;
    id = this.getIdPhoto(link.href);
    orientation = (_ref = this.collection.get(id)) != null ? _ref.attributes.orientation : void 0;
    return $('#pbOverlay .wrapper img')[0].dataset.orientation = orientation;
  };

  Galery.prototype.onImageDisplayed = function() {
    var id, orientation, parts, thumb, thumbs, url, _i, _len, _ref, _results;
    this.isViewing = true;
    id = this.getIdPhoto();
    if (this.options.editable) {
      app.router.navigate("albums/" + this.album.id + "/edit/photo/" + id, false);
    } else {
      app.router.navigate("albums/" + this.album.id + "/photo/" + id, false);
    }
    url = "photos/raws/" + id + ".jpg";
    this.downloadLink.attr('href', url);
    thumbs = $('#pbOverlay .pbThumbs img');
    _results = [];
    for (_i = 0, _len = thumbs.length; _i < _len; _i++) {
      thumb = thumbs[_i];
      url = thumb.src;
      parts = url.split('/');
      id = parts[parts.length - 1];
      id = id.split('.')[0];
      orientation = (_ref = this.collection.get(id)) != null ? _ref.attributes.orientation : void 0;
      _results.push(helpers.rotate(orientation, $(thumb)));
    }
    return _results;
  };

  Galery.prototype.onAfterClosed = function() {
    this.isViewing = false;
    if (this.options.editable) {
      return app.router.navigate("albums/" + this.album.id + "/edit", true);
    } else {
      return app.router.navigate("albums/" + this.album.id, true);
    }
  };

  Galery.prototype.handleFiles = function(files) {
    app.router.mainView.dirty = true;
    return this.options.beforeUpload((function(_this) {
      return function(photoAttributes) {
        var addPhotoAndBreath;
        _this.uploadCounter = 0;
        addPhotoAndBreath = function(file, callback) {
          var photo;
          photo = _this.addPhoto(file, photoAttributes);
          if (_this.uploadCounter === 0) {
            photo.on('uploadComplete', function() {
              return _this.setCoverPicture(photo);
            });
          }
          if (_this.uploadCounter > 20) {
            return setTimeout(callback, 10);
          } else {
            _this.uploadCounter++;
            return callback();
          }
        };
        return async.eachSeries(files, addPhotoAndBreath, function() {
          var key, view, _ref;
          _ref = _this.views;
          for (key in _ref) {
            view = _ref[key];
            view.collection = _this.collection;
          }
          return app.router.mainView.dirty = false;
        });
      };
    })(this));
  };

  Galery.prototype.addPhoto = function(file, photoAttributes) {
    var photo;
    photoAttributes.title = file.name;
    photo = new Photo(photoAttributes);
    photo.file = file;
    this.collection.add(photo);
    photoprocessor.process(photo);
    return photo;
  };

  Galery.prototype.setCoverPicture = function(photo) {
    if (this.album.get('coverPicture') == null) {
      return this.album.save({
        coverPicture: photo.get('id')
      });
    }
  };

  Galery.prototype.displayBrowser = function() {
    return new FilesBrowser({
      model: this.album,
      collection: this.collection,
      beforeUpload: this.options.beforeUpload
    });
  };

  Galery.prototype.showPhoto = function(photoid) {
    var url;
    url = "photos/" + photoid + ".jpg";
    $('a[href="' + url + '"]').trigger('click.photobox');
    return setTimeout(this.onImageDisplayed, 10);
  };

  Galery.prototype.closePhotobox = function() {
    if (this.isViewing) {
      return $('#pbCloseBtn').click();
    }
  };

  return Galery;

})(ViewCollection);
});

;require.register("views/map", function(exports, require, module) {
var BaseView, MapView, baseLayers, helpers,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

helpers = require('../lib/helpers');

baseLayers = require('../lib/map_providers');

module.exports = MapView = (function(_super) {
  __extends(MapView, _super);

  function MapView() {
    return MapView.__super__.constructor.apply(this, arguments);
  }

  MapView.prototype.template = require('templates/map');

  MapView.prototype.className = 'masterClass';

  MapView.prototype.initialize = function(options) {
    MapView.__super__.initialize.apply(this, arguments);
    this.listenTo(this.collection, 'reset change', this.addAllMarkers);
    return this.markers = new L.MarkerClusterGroup({
      disableClusteringAtZoom: 17,
      removeOutsideVisibleBounds: false,
      animateAddingMarkers: true
    });
  };

  MapView.prototype.events = function() {
    return {
      'click #validate': 'validateChange'
    };
  };

  MapView.prototype.afterRender = function() {
    var attribution, layerControl, layerUrl, overlays;
    L.Icon.Default.imagePath = 'leaflet-images';
    this.standbyLatlng = new L.latLng(null);
    this.standbyMarker = L.marker(null, {
      draggable: true,
      icon: L.divIcon({
        className: 'leaflet-marker-div',
        iconSize: L.point(39, 45),
        html: "<i class=\"fa fa-crosshairs\" style=\"font-size:3.8em\"></i>"
      })
    });
    this.map = L.map(this.$('#map')[0], {
      center: [46.8451, 2.4938],
      zoom: 6,
      maxZoom: 17,
      minZoom: 2,
      layers: baseLayers["Water color"],
      maxBounds: L.latLngBounds([84.26, -170], [-59.888, 192.30])
    });
    this.map.on('contextmenu', (function(_this) {
      return function(e) {
        _this.standbyMarker.setLatLng(e.latlng);
        _this.standbyMarker.addTo(_this.map);
        _this.standbyLatlng = e.latlng;
        _this.standbyMarker.bindPopup(_this.standbyLatlng.toString());
        _this.dispChoiceBox();
        return _this.standbyMarker.on('move', function(e) {
          _this.standbyMarker.closePopup();
          return _this.standbyLatlng = e.latlng;
        });
      };
    })(this));
    this.map.on('click', (function(_this) {
      return function() {
        return _this.hide();
      };
    })(this));
    layerUrl = "http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}";
    attribution = "Tiles by <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>";
    overlays = {
      "Photos": this.markers,
      "Villes": L.tileLayer(layerUrl, {
        type: 'hyb',
        ext: 'png',
        attribution: attribution,
        subdomains: '1234',
        opacity: 0.9
      })
    };
    layerControl = L.control.layers(baseLayers, overlays, {
      position: 'bottomright'
    }).addTo(this.map);
    return this.map.addControl(new L.Control.Search({
      url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
      jsonpParam: 'json_callback',
      propertyName: 'display_name',
      propertyLoc: ['lat', 'lon'],
      markerLocation: true
    }));
  };

  MapView.prototype.addAllMarkers = function() {
    this.collection.hasGPS().each((function(_this) {
      return function(photo) {
        var button, gps, imgPath, position, tempMarker, text;
        gps = photo.attributes.gps;
        position = new L.LatLng(gps.lat, gps.long);
        imgPath = "photos/thumbs/" + (photo.get('id')) + ".jpg";
        text = '<img src="images/spinner.svg" width="150" height="150"/>';
        button = "<button data-key=\"" + (photo.get('id')) + "\"\nclass=\"btn btn-block\">\n<span class=\"glyphicon gliphicon-move\"></span>\nRelocaliser</button>";
        tempMarker = L.marker(position, {
          title: photo.get('title')
        }).bindPopup(text);
        tempMarker.cached = false;
        tempMarker.on('popupopen', function() {
          var description, element, img;
          if (!tempMarker.cached) {
            img = $('<img src="' + imgPath + '" title="photo"/>');
            element = $("<div><p>" + (photo.get('title')) + "</p></div>");
            description = photo.get('description');
            element.append(img);
            element.append(button);
            if (photo.get('description') == null) {
              element.append($("<quote>" + description + "</quote>"));
            }
            img[0].onload = function() {
              setTimeout(function() {
                return tempMarker.getPopup().setContent(element[0]);
              }, 500);
              return tempMarker.cached = true;
            };
            return helpers.rotate(photo.get('orientation'), img);
          }
        });
        _this.markers.addLayer(tempMarker);
        return _this.showAll();
      };
    })(this));
    return this.refresh();
  };

  MapView.prototype.showAll = function() {
    return this.map.addLayer(this.markers);
  };

  MapView.prototype.dispChoiceBox = function() {
    var mapGalery;
    $('.choice-box').height('auto');
    mapGalery = this.$('#map-galery');
    mapGalery.children().remove();
    return this.collection.hasNotGPS().each(function(photo) {
      var imgPath;
      imgPath = "photos/thumbs/" + (photo.get('id')) + ".jpg";
      return mapGalery.append('<img class="map-setter" src="' + imgPath + '" data-key="' + photo.get('id') + '"' + '" style="height: 130px; display: inline"/>');
    });
  };

  $(document).on("click", ".map-setter", function() {
    return $(this).toggleClass('map-photo-checked');
  });

  MapView.prototype.validateChange = function(e) {
    var that;
    console.log(e);
    that = this;
    $(".map-photo-checked").each(function() {
      var el, photo;
      el = $(this);
      photo = that.collection.get(el.attr('data-key'));
      that.standbyLatlng.lng += 0.0001;
      return photo != null ? photo.save({
        gps: {
          lat: that.standbyLatlng.lat,
          long: that.standbyLatlng.lng,
          alt: 0
        },
        success: function(e) {
          return e.preventDefault();
        },
        error: function(e) {
          return e.preventDefault();
        }
      }) : void 0;
    });
    return that.hide();
  };

  MapView.prototype.hide = function() {
    $('.choice-box').height(0);
    return this.map.removeLayer(this.standbyMarker);
  };

  MapView.prototype.refresh = function() {
    return this.map.invalidateSize();
  };

  return MapView;

})(BaseView);
});

;require.register("views/photo", function(exports, require, module) {
var BaseView, PhotoView, helpers, transitionendEvents,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

helpers = require('lib/helpers');

transitionendEvents = ["transitionend", "webkitTransitionEnd", "oTransitionEnd", "MSTransitionEnd"].join(" ");

module.exports = PhotoView = (function(_super) {
  __extends(PhotoView, _super);

  function PhotoView() {
    this.onClickListener = __bind(this.onClickListener, this);
    return PhotoView.__super__.constructor.apply(this, arguments);
  }

  PhotoView.prototype.template = require('templates/photo');

  PhotoView.prototype.className = 'photo';

  PhotoView.prototype.initialize = function(options) {
    PhotoView.__super__.initialize.apply(this, arguments);
    this.listenTo(this.model, 'progress', this.onProgress);
    this.listenTo(this.model, 'thumbed', this.onThumbed);
    this.listenTo(this.model, 'upError', this.onError);
    this.listenTo(this.model, 'uploadComplete', this.onServer);
    return this.listenTo(this.model, 'change', (function(_this) {
      return function() {
        return _this.render();
      };
    })(this));
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
    helpers.rotate(this.model.get('orientation'), this.image);
    if (!this.model.isNew()) {
      this.link.addClass('server');
    }
    this.image.unveil();
    if (this.image.get(0).complete) {
      return this.onImageLoaded();
    } else {
      return this.image.on('load', (function(_this) {
        return function() {
          return _this.onImageLoaded();
        };
      })(this));
    }
  };

  PhotoView.prototype.setSource = function() {
    var source;
    source = this.$("img").attr("data-src");
    return this.$("img").attr("src", source);
  };

  PhotoView.prototype.setProgress = function(percent) {
    return this.progressbar.css('width', percent + '%');
  };

  PhotoView.prototype.onProgress = function(event) {
    return this.setProgress(10 + 90 * event.loaded / event.total);
  };

  PhotoView.prototype.onThumbed = function() {
    this.setProgress(10);
    this.image.attr('src', this.model.thumb_du);
    this.image.attr('orientation', this.model.get('orientation'));
    return this.image.addClass('thumbed');
  };

  PhotoView.prototype.onServer = function() {
    var preload;
    preload = new Image();
    preload.onerror = preload.onload = (function(_this) {
      return function() {
        return _this.render();
      };
    })(this);
    preload.src = "photos/thumbs/" + this.model.id + ".jpg";
    return app.router.mainView.dirty = false;
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
    this.$('.delete').html('&nbsp;&nbsp;&nbsp;&nbsp;');
    this.$('.delete').spin('small');
    return this.$el.fadeOut((function(_this) {
      return function() {
        return _this.model.destroy({
          success: function() {
            _this.collection.remove(_this.model);
            return _this.remove();
          }
        });
      };
    })(this));
  };

  PhotoView.prototype.onImageLoaded = function() {
    return this.image.addClass('loaded');
  };

  return PhotoView;

})(BaseView);
});

;
//# sourceMappingURL=app.js.map