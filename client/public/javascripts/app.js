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

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
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

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
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
    this.router = new Router();
    this.albums = new AlbumCollection();
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

  AlbumCollection.prototype.url = 'albums';

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

  PhotoCollection.prototype.url = 'photos';

  PhotoCollection.prototype.comparator = function(model) {
    return model.get('title');
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
    $(document).keyup((function(_this) {
      return function(e) {
        if ($(e.target).is("#clipboard")) {
          $("<textarea id='clipboard'></textarea>").val("");
          return $("#clipboard-container").empty().hide();
        }
      };
    })(this));
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
  editable: function(el, options) {
    var onChanged, placeholder;
    placeholder = options.placeholder, onChanged = options.onChanged;
    el.prop('contenteditable', true);
    if (!el.text()) {
      el.text(placeholder);
    }
    el.click(function() {
      if (el.text() === placeholder) {
        return el.text(' ');
      }
    });
    el.focus(function() {
      if (el.text() === placeholder) {
        return el.text(' ');
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

;require.register("locales/en", function(exports, require, module) {
module.exports = {
  "Back": "Back",
  "Create a new album": "Create a new album",
  "Delete": "Delete",
  "Download": "Download",
  "Edit": "Edit",
  "It will appears on your homepage.": "It will appears on your homepage.",
  "Make it Hidden": "hidden",
  "Make it Private": "private",
  "Make it Public": "public",
  "New": "New",
  "private": "private",
  "public": "public",
  "hidden": "hidden",
  "There is no photos in this album": "There are no photos in this album",
  "There is no public albums.": "There are no albums.",
  "This album is private": "This album is private",
  "This album is hidden": "This album is hidden",
  "This album is public": "This album is public",
  "Title ...": "Title ...",
  "View": "View",
  "Write some more ...": "Write some more ...",
  "is too big (max 10Mo)": "is too big (max 10Mo)",
  "is not an image": "is not an image",
  "Share album by mail": "Share album by mail",
  "Upload your contacts ...": "Upload your contacts ...",
  "Share album": "Share album",
  "Add contact": "Add contact",
  "Send mail": "Send mail",
  "Select your friends": "Select your friends",
  "Add": "Add",
  "Cancel": "Cancel",
  'photo successfully set as cover': 'The picture has been successfully set as album cover',
  'problem occured while setting cover': 'A problem occured while setting picture as cover',
  "Click Here or drag your photos below to upload": "Click Here or drag your photos below to upload",
  "hidden-description": "It will not appears on your homepage.\nBut you can share it with the following url :",
  "It cannot be accessed from the public side": "It cannot be accessed from the public side\""
};

});

;require.register("locales/fr", function(exports, require, module) {
module.exports = {
  "Back": "Retour",
  "Create a new album": "Créer un nouvel album",
  "Delete": "Supprimer",
  "Download": "Télécharger",
  "Edit": "Modifier",
  "It will appears on your homepage.": "It apparaitra votre page d'accueil",
  "Make it Hidden": "masqué",
  "Make it Private": "privé",
  "Make it Public": "public",
  "New": "Nouveau",
  "private": "privé",
  "public": "public",
  "hidden": "masqué",
  "There is no photos in this album": "Pas de photos dans cet album",
  "There is no public albums.": "Il n'y a aucun album",
  "This album is private": "Cet album est Privé",
  "This album is hidden": "Cet album est Masqué",
  "This album is public": "Cet album est Public",
  "Title ...": "Titre ...",
  "Write some more ...": "Description ...",
  "View": "Voir",
  "is too big (max 10Mo)": "est trop grosse (max 10Mo)",
  "is not an image": "n'est pas une image",
  "Share album by mail": "Partagez par mail",
  "Upload your contacts ...": "Uploader vos contacts ...",
  "Share album": "Partagez l'album",
  "Add contact": "Ajouter contact",
  "Send mail": "Envoyez mail",
  "Select your friends": "Choisissez vos amis",
  "Add": "Ajouter",
  "Cancel": "Annuler",
  'photo successfully set as cover': 'L\'image est maintenant la couverture de l\'album.',
  'problem occured while setting cover': 'Un problème est survenu en positionnant l\'image comme couverture de\nl\'album.',
  "Click Here or drag your photos below to upload": "Cliquez ici pour ajouter des photos ou déposer vos fichiers",
  "hidden-description": "Il n'apparaitra pas sur votre page d'accueil,\nMais vous pouvez partager cet url :",
  "It cannot be accessed from the public side": "Il ne peut pas être vu depuis le coté public"
};

});

;require.register("models/album", function(exports, require, module) {
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
      clearance: 'private',
      thumbsrc: 'img/nophotos.gif',
      orientation: 1
    };
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
    if (attrs.coverPicture) {
      attrs.thumbsrc = "photos/thumbs/" + attrs.coverPicture + ".jpg";
      if (((_ref1 = this.photos.get(attrs.thumb)) != null ? (_ref2 = _ref1.attributes) != null ? _ref2.orientation : void 0 : void 0) != null) {
        attrs.orientation = this.photos._byId[attrs.thumb].attributes.orientation;
      }
    }
    return attrs;
  };

  Album.prototype.getThumbSrc = function() {
    return "photos/thumbs/" + (this.get('coverPicture')) + ".jpg";
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

;require.register("models/contact", function(exports, require, module) {
var Contact, client,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

client = require("../lib/client");

module.exports = Contact = (function(_super) {
  __extends(Contact, _super);

  function Contact() {
    return Contact.__super__.constructor.apply(this, arguments);
  }

  Contact.prototype.list = function(callback) {
    return client.get("contacts", callback);
  };

  return Contact;

})(Backbone.Model);

});

;require.register("models/photo", function(exports, require, module) {
var Photo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Photo = (function(_super) {
  __extends(Photo, _super);

  function Photo() {
    return Photo.__super__.constructor.apply(this, arguments);
  }

  Photo.prototype.defaults = function() {
    return {
      thumbsrc: 'img/loading.gif',
      src: '',
      orientation: 1
    };
  };

  Photo.prototype.parse = function(attrs) {
    if (!attrs.id) {
      return attrs;
    } else {
      return _.extend(attrs, {
        thumbsrc: "photos/thumbs/" + attrs.id + ".jpg",
        src: "photos/" + attrs.id + ".jpg",
        orientation: attrs.orientation
      });
    }
  };

  Photo.prototype.getPrevSrc = function() {
    return "photos/" + (this.get('id')) + ".jpg";
  };

  return Photo;

})(Backbone.Model);

});

;require.register("models/photoprocessor", function(exports, require, module) {
var PhotoProcessor, blobify, makeScreenBlob, makeScreenDataURI, makeThumbBlob, makeThumbDataURI, makeThumbWorker, readFile, resize, upload, uploadWorker;

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
  return reader.onloadend = (function(_this) {
    return function() {
      photo.img.src = reader.result;
      photo.img.orientation = photo.attributes.orientation;
      return photo.img.onload = function() {
        return next();
      };
    };
  })(this);
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
    return this.thumbsQueue.push(photo, (function(_this) {
      return function(err) {
        if (err) {
          return console.log(err);
        }
        return _this.uploadQueue.push(photo, function(err) {
          if (err) {
            return console.log(err);
          }
        });
      };
    })(this));
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
  return next();
};

makeThumbBlob = function(photo, next) {
  console.log(photo);
  photo.thumb = blobify(photo.thumb_du, photo.file.type);
  return next();
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
      return console.log(data);
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
    setTimeout(function() {
      return uploadWorker(photo, function(err) {
        if (err) {
          return console.log(err);
        }
      });
    });
    return 300;
  };

  return ThumbProcessor;

})();

module.exports = new ThumbProcessor();

});

;require.register("router", function(exports, require, module) {
var Album, AlbumView, AlbumsListView, Router, app,
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
    return Router.__super__.constructor.apply(this, arguments);
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
    var album;
    if (editable == null) {
      editable = false;
    }
    album = app.albums.get(id) || new Album({
      id: id
    });
    return album.fetch().done((function(_this) {
      return function() {
        return _this.displayView(new AlbumView({
          model: album,
          editable: editable,
          contacts: []
        }));
      };
    })(this)).fail((function(_this) {
      return function() {
        alert(t('this album does not exist'));
        return _this.navigate('albums', true);
      };
    })(this));
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

;require.register("templates/album", function(exports, require, module) {
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
buf.push('</div><h1 id="title">');
var __val__ = title
buf.push(null == __val__ ? "" : __val__);
buf.push('</h1><div id="description">');
var __val__ = description
buf.push(null == __val__ ? "" : __val__);
buf.push('</div></div><div id="photos" class="span8"></div><div id="rebuild-th"><a id="rebuild-th-btn">');
var __val__ = t("rebuild thumbnails")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</a></div><div id="clipboard-container"><textarea id="clipboard"></textarea></div><div id="clearance-modal" class="modal hide"><div class="modal-header"><button type="button" data-dismiss="modal" class="close">&times;</button><h3>clearanceHelpers.title</h3></div><div class="modal-body">clearanceHelpers.content</div><div class="modal-footer">     <a id="changeprivate" class="flatbtn changeclearance">');
var __val__ = t("Make it Private")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</a><a id="changehidden" class="flatbtn changeclearance">');
var __val__ = t("Make it Hidden")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</a><a id="changepublic" class="flatbtn changeclearance">');
var __val__ = t("Make it Public")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</a><a href="#share-modal" data-toggle="modal" data-dismiss="modal" class="flatbtn share"><span>');
var __val__ = t("Share album by mail")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</span></a></div></div><div id="share-modal" class="modal hide"><div class="modal-header"><button type="button" data-dismiss="modal" class="close">&times;</button><h3>');
var __val__ = t("Share album")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</h3></div><div class="modal-body"> <input type="text" value="" id="mails" placeholder="example@cozycloud.cc, other-example@cozycloud.cc" class="input-block-level"/></div><div class="modal-footer"> <a href="#add-contact-modal" data-toggle="modal" data-dismiss="modal" class="flatbtn addcontact"><span>');
var __val__ = t("Add contact")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</span></a><a type="button" data-dismiss="modal" class="flatbtn sendmail"><span>');
var __val__ = t("Send mail")    
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</span></a></div></div><div id="add-contact-modal" class="modal hide"><div class="modal-header"><button type="button" data-dismiss="modal" class="close">&times;</button><h3>');
var __val__ = t("Select your friends")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</h3></div><div class="modal-body"> <div id="contacts" class="input">');
if ( contacts.length === 0)
{
buf.push('<p>');
var __val__ = t("Upload your contacts ...")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</p>');
}
else if ( contacts === "No contacts found")
{
buf.push('<p>');
var __val__ = t("No contacts found")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</p>');
}
else
{
// iterate contacts
;(function(){
  if ('number' == typeof contacts.length) {

    for (var $index = 0, $$l = contacts.length; $index < $$l; $index++) {
      var contact = contacts[$index];

buf.push('<input');
buf.push(attrs({ 'type':("checkbox"), 'name':("" + (contact.index) + ""), 'id':("" + (contact.index) + ""), "class": ('checkbox') }, {"type":true,"name":true,"id":true}));
buf.push('/><span> ' + escape((interp = contact.fn) == null ? '' : interp) + '</span><br/>');
    }

  } else {
    var $$l = 0;
    for (var $index in contacts) {
      $$l++;      var contact = contacts[$index];

buf.push('<input');
buf.push(attrs({ 'type':("checkbox"), 'name':("" + (contact.index) + ""), 'id':("" + (contact.index) + ""), "class": ('checkbox') }, {"type":true,"name":true,"id":true}));
buf.push('/><span> ' + escape((interp = contact.fn) == null ? '' : interp) + '</span><br/>');
    }

  }
}).call(this);

}
buf.push('</div></div><div class="modal-footer">     <a href="#share-modal" data-toggle="modal" data-dismiss="modal" class="flatbtn add"><span>');
var __val__ = t("Add")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</span></a><a href="#share-modal" data-toggle="modal" data-dismiss="modal" class="flatbtn cancel"><span>');
var __val__ = t("Cancel")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</span></a></div></div></div>');
}
return buf.join("");
};
});

;require.register("templates/albumlist", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="albumitem create"><a href="#albums/new"><img src="img/new-galery.png"/><br/><span>');
var __val__ = t('Create a new album')
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</span></a></div><p class="help">');
var __val__ = t('There is no public albums.')
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</p>');
}
return buf.join("");
};
});

;require.register("templates/albumlist_item", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<a');
buf.push(attrs({ 'id':("" + (id) + ""), 'href':("#albums/" + (id) + ""), 'style':("background-image: url(" + (thumbsrc) + ")") }, {"id":true,"href":true,"style":true}));
buf.push('><span class="title">' + escape((interp = title) == null ? '' : interp) + '</span></a>');
}
return buf.join("");
};
});

;require.register("templates/galery", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<p class="help">');
var __val__ = t('There is no photos in this album')
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</p><div id="uploadblock" class="flatbtn photo"><input id="uploader" type="file" multiple="multiple"/>');
var __val__ = t('Click Here or drag your photos below to upload')
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</div>');
}
return buf.join("");
};
});

;require.register("templates/photo", function(exports, require, module) {
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

;require.register("views/album", function(exports, require, module) {
var AlbumView, BaseView, Clipboard, Contact, Galery, app, clipboard, contactModel, editable, thProcessor,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

app = require('application');

BaseView = require('lib/base_view');

Galery = require('views/galery');

Clipboard = require('lib/clipboard');

editable = require('lib/helpers').editable;

thProcessor = require('models/thumbprocessor');

contactModel = require('models/contact');

Contact = new contactModel();

clipboard = new Clipboard();

module.exports = AlbumView = (function(_super) {
  __extends(AlbumView, _super);

  function AlbumView() {
    this.makeEditable = __bind(this.makeEditable, this);
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
      'click a.changeclearance': this.changeClearance,
      'click a.addcontact': this.addcontact,
      'click a.sendmail': this.sendMail,
      'click a.add': this.prepareContact,
      'click a#rebuild-th-btn': this.rebuildThumbs,
      'keyup #mails': this.onKeyUpMails
    };
  };

  AlbumView.prototype.getRenderData = function() {
    var clearance, clearanceHelpers, res;
    clearance = this.model.get('clearance');
    if (clearance == null) {
      clearance = 'private';
    }
    clearanceHelpers = this.clearanceHelpers(clearance);
    res = _.extend({
      clearanceHelpers: clearanceHelpers,
      photosNumber: this.model.photos.length
    }, this.model.attributes);
    return res;
  };

  AlbumView.prototype.afterRender = function() {
    this.galery = new Galery({
      el: this.$('#photos'),
      editable: this.options.editable,
      collection: this.model.photos,
      beforeUpload: this.beforePhotoUpload
    });
    this.galery.album = this.model;
    this.galery.render();
    if (this.options.editable) {
      return this.makeEditable();
    }
  };

  AlbumView.prototype.beforePhotoUpload = function(callback) {
    return this.saveModel().then((function(_this) {
      return function() {
        return callback({
          albumid: _this.model.id
        });
      };
    })(this));
  };

  AlbumView.prototype.makeEditable = function() {
    this.$el.addClass('editing');
    this.refreshPopOver(this.model.get('clearance'));
    editable(this.$('#title'), {
      placeholder: t('Title ...'),
      onChanged: (function(_this) {
        return function(text) {
          return _this.saveModel({
            title: text.trim()
          });
        };
      })(this)
    });
    return editable(this.$('#description'), {
      placeholder: t('Write some more ...'),
      onChanged: (function(_this) {
        return function(text) {
          return _this.saveModel({
            description: text.trim()
          });
        };
      })(this)
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
    var id, newclearance;
    newclearance = event.target.id.replace('change', '');
    id = event.target.id;
    this.$("#" + id).spin('tiny');
    this.$("#" + id).css('color', 'transparent');
    return this.saveModel({
      clearance: newclearance
    }).then((function(_this) {
      return function() {
        _this.$("#" + id).spin();
        _this.$("#" + id).css('color', 'white');
        return _this.refreshPopOver(newclearance);
      };
    })(this));
  };

  AlbumView.prototype.refreshPopOver = function(clearance) {
    var help, modal;
    help = this.clearanceHelpers(clearance);
    modal = this.$('#clearance-modal');
    this.$('.clearance').find('span').text(clearance);
    modal.find('h3').text(help != null ? help.title : void 0);
    modal.find('.modal-body').html(help != null ? help.content : void 0);
    modal.find('.changeclearance').removeClass('active');
    modal.find('#change' + clearance).addClass('active');
    if (clearance === "hidden") {
      modal.find('.share').show();
      return clipboard.set(this.getPublicUrl());
    } else {
      modal.find('.share').hide();
      return clipboard.set("");
    }
  };

  AlbumView.prototype.addcontact = function() {
    var modal;
    modal = this.$('#add-contact-modal');
    this.options.contacts = [];
    return Contact.list({
      success: (function(_this) {
        return function(body) {
          var contact, item, n, _i, _j, _len, _len1, _ref;
          for (_i = 0, _len = body.length; _i < _len; _i++) {
            contact = body[_i];
            _ref = contact.datapoints;
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              item = _ref[_j];
              if (item.name === "email") {
                contact.index = contact.fn.split(' ').join('_');
                contact.index = contact.index.split("'").join('_');
                contact.index = contact.index.split("/").join('_');
                contact.index = contact.index.split("*").join('_');
                n = 0;
                while ((_this.options.contacts[n] != null) && _this.options.contacts[n].fn < contact.fn) {
                  n++;
                }
                _this.options.contacts.splice(n, 0, contact);
                break;
              }
            }
          }
          if (_this.options.contacts.length === 0) {
            _this.options.contacts = "No contacts found";
          }
          _this.$('#add-contact-modal').modal('hide');
          _this.render(modal);
          return _this.$('#add-contact-modal').modal('show');
        };
      })(this),
      error: function(err) {
        return console.log(err);
      }
    });
  };

  AlbumView.prototype.prepareContact = function(event) {
    var contact, item, mails, modal, _i, _j, _len, _len1, _ref, _ref1;
    modal = this.$('#add-contact-modal');
    mails = [];
    _ref = this.options.contacts;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      contact = _ref[_i];
      if (this.$("#" + contact.index).is(':checked')) {
        _ref1 = contact.datapoints;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          item = _ref1[_j];
          if (item.name === "email") {
            mails.push(' ' + item.value);
            break;
          }
        }
      }
    }
    return this.$('#mails').val(mails);
  };

  AlbumView.prototype.rebuildThumbs = function(event) {
    var model, _i, _len, _ref, _results;
    _ref = this.model.photos.models;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      model = _ref[_i];
      _results.push(thProcessor.process(model));
    }
    return _results;
  };

  AlbumView.prototype.onKeyUpMails = function(event) {
    if (event.which === 13 || event.keyCode === 13) {
      return this.sendMail();
    }
  };

  AlbumView.prototype.sendMail = function(event) {
    var mails;
    mails = this.$('#mails').val();
    if (mails.length === 0) {
      return alert("Please enter an email.");
    } else {
      this.$("a.sendmail").spin('tiny');
      this.$("a.sendmail").css('color', 'transparent');
      return this.model.sendMail(this.getPublicUrl(), mails, {
        success: (function(_this) {
          return function() {
            var mail, msg, _i, _len;
            _this.$("a.sendmail").spin();
            _this.$("a.sendmail").css('color', 'white');
            msg = "Mail was successfully sent to: \n";
            mails = mails.split(',');
            for (_i = 0, _len = mails.length; _i < _len; _i++) {
              mail = mails[_i];
              msg = msg + "\n" + mail;
            }
            return alert(msg);
          };
        })(this),
        error: (function(_this) {
          return function(err) {
            _this.$("a.sendmail").spin();
            _this.$("a.sendmail").css('color', 'white');
            return alert(JSON.parse(err.responseText).error);
          };
        })(this)
      });
    }
  };

  AlbumView.prototype.saveModel = function(hash) {
    var promise;
    promise = this.model.save(hash);
    if (this.model.isNew()) {
      promise = promise.then((function(_this) {
        return function() {
          app.albums.add(_this.model);
          return app.router.navigate("albums/" + _this.model.id + "/edit");
        };
      })(this));
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
        content: t("hidden-description") + (" " + (this.getPublicUrl())) + "<p>If you want to copy url in your clipboard: " + "just press Ctrl+C </p>"
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
    return out;
  };

  AlbumItem.prototype.afterRender = function() {
    this.image = this.$('img');
    this.image.attr('src', this.model.attributes.thumbsrc);
    return helpers.rotate(this.model.attributes.orientation, this.image);
  };

  return AlbumItem;

})(BaseView);

});

;require.register("views/galery", function(exports, require, module) {
var Galery, Photo, PhotoView, ViewCollection, app, helpers, photoprocessor,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ViewCollection = require('lib/view_collection');

helpers = require('lib/helpers');

PhotoView = require('views/photo');

Photo = require('models/photo');

photoprocessor = require('models/photoprocessor');

app = require('application');

module.exports = Galery = (function(_super) {
  __extends(Galery, _super);

  function Galery() {
    this.onImageDisplayed = __bind(this.onImageDisplayed, this);
    this.beforeImageDisplayed = __bind(this.beforeImageDisplayed, this);
    this.onFilesChanged = __bind(this.onFilesChanged, this);
    this.onCoverClicked = __bind(this.onCoverClicked, this);
    this.onTurnRight = __bind(this.onTurnRight, this);
    this.onTurnLeft = __bind(this.onTurnLeft, this);
    this.getIdPhoto = __bind(this.getIdPhoto, this);
    this.checkIfEmpty = __bind(this.checkIfEmpty, this);
    return Galery.__super__.constructor.apply(this, arguments);
  }

  Galery.prototype.itemView = PhotoView;

  Galery.prototype.template = require('templates/galery');

  Galery.prototype.afterRender = function() {
    var transform;
    Galery.__super__.afterRender.apply(this, arguments);
    this.$el.photobox('a.server', {
      thumbs: true,
      history: false,
      beforeShow: this.beforeImageDisplayed
    }, this.onImageDisplayed);
    if ($('#pbOverlay .pbCaptionText .btn-group').length === 0) {
      $('#pbOverlay .pbCaptionText').append('<div class="btn-group"></div>');
    }
    this.turnLeft = $('#pbOverlay .pbCaptionText .btn-group .left');
    this.turnLeft.unbind('click');
    this.turnLeft.remove();
    if (navigator.userAgent.search("Firefox") !== -1) {
      transform = "transform";
    } else {
      transform = "-webkit-transform";
    }
    this.turnLeft = $('<a id="left" class="btn left" type="button"> <i class="icon-share-alt" style="' + transform + ': scale(-1,1)"> </i> </a>').appendTo('#pbOverlay .pbCaptionText .btn-group');
    this.turnLeft.on('click', this.onTurnLeft);
    this.downloadLink = $('#pbOverlay .pbCaptionText  .btn-group .download-link');
    this.downloadLink.unbind('click');
    this.downloadLink.remove();
    if (!this.downloadLink.length) {
      this.downloadLink = $('<a class="btn download-link" download> <i class="icon-arrow-down"></i></a>').appendTo('#pbOverlay .pbCaptionText .btn-group');
    }
    this.uploader = this.$('#uploader');
    this.coverBtn = $('#pbOverlay .pbCaptionText .btn-group .cover-btn');
    this.coverBtn.unbind('click');
    this.coverBtn.remove();
    this.coverBtn = $('<a id="cover-btn" class="btn cover-btn"> <i class="icon-picture" </i> </a>').appendTo('#pbOverlay .pbCaptionText .btn-group');
    this.coverBtn.on('click', this.onCoverClicked);
    this.turnRight = $('#pbOverlay .pbCaptionText .btn-group .right');
    this.turnRight.unbind('click');
    this.turnRight.remove();
    this.turnRight = $('<a id="right" class="btn right"> <i class="icon-share-alt" </i> </a>').appendTo('#pbOverlay .pbCaptionText .btn-group');
    return this.turnRight.on('click', this.onTurnRight);
  };

  Galery.prototype.checkIfEmpty = function() {
    return this.$('.help').toggle(_.size(this.views) === 0 && app.mode === 'public');
  };

  Galery.prototype.events = function() {
    if (this.options.editable) {
      return {
        'drop': 'onFilesDropped',
        'dragover': 'onDragOver',
        'change #uploader': 'onFilesChanged'
      };
    }
  };

  Galery.prototype.onFilesDropped = function(evt) {
    this.$el.removeClass('dragover');
    this.handleFiles(evt.dataTransfer.files);
    evt.stopPropagation();
    evt.preventDefault();
    return false;
  };

  Galery.prototype.onDragOver = function(evt) {
    this.$el.addClass('dragover');
    evt.preventDefault();
    evt.stopPropagation();
    return false;
  };

  Galery.prototype.getIdPhoto = function(url) {
    var id, parts;
    if (url == null) {
      url = $('#pbOverlay .wrapper img.zoomable').attr('src');
    }
    parts = url.split('/');
    id = parts[parts.length - 1];
    id = id.split('.')[0];
    return id;
  };

  Galery.prototype.onTurnLeft = function() {
    var id, newOrientation, orientation, _ref, _ref1;
    id = this.getIdPhoto();
    orientation = (_ref = this.collection.get(id)) != null ? _ref.attributes.orientation : void 0;
    newOrientation = helpers.rotateLeft(orientation, $('.wrapper img.zoomable'));
    helpers.rotate(newOrientation, $('.wrapper img.zoomable'));
    return (_ref1 = this.collection.get(id)) != null ? _ref1.save({
      orientation: newOrientation
    }, {
      success: (function(_this) {
        return function() {
          return helpers.rotate(newOrientation, $('.pbThumbs .active img'));
        };
      })(this)
    }) : void 0;
  };

  Galery.prototype.onTurnRight = function() {
    var id, newOrientation, orientation, _ref, _ref1;
    id = this.getIdPhoto();
    orientation = (_ref = this.collection.get(id)) != null ? _ref.attributes.orientation : void 0;
    newOrientation = helpers.rotateRight(orientation, $('.wrapper img.zoomable'));
    helpers.rotate(newOrientation, $('.wrapper img.zoomable'));
    return (_ref1 = this.collection.get(id)) != null ? _ref1.save({
      orientation: newOrientation
    }, {
      success: (function(_this) {
        return function() {
          return helpers.rotate(newOrientation, $('.pbThumbs .active img'));
        };
      })(this)
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

  Galery.prototype.onFilesChanged = function(evt) {
    var old;
    this.handleFiles(this.uploader[0].files);
    old = this.uploader;
    this.uploader = old.clone(true);
    return old.replaceWith(this.uploader);
  };

  Galery.prototype.beforeImageDisplayed = function(link) {
    var id, orientation, _ref;
    id = this.getIdPhoto(link.href);
    orientation = (_ref = this.collection.get(id)) != null ? _ref.attributes.orientation : void 0;
    return $('#pbOverlay .wrapper img')[0].dataset.orientation = orientation;
  };

  Galery.prototype.onImageDisplayed = function(args) {
    var id, orientation, parts, thumb, thumbs, url, _i, _len, _ref, _results;
    url = $('.pbThumbs .active img').attr('src');
    id = this.getIdPhoto();
    this.downloadLink.attr('href', url.replace('thumbs', 'raws'));
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

  Galery.prototype.handleFiles = function(files) {
    return this.options.beforeUpload((function(_this) {
      return function(photoAttributes) {
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
      };
    })(this));
  };

  return Galery;

})(ViewCollection);

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
    this.events = __bind(this.events, this);
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
    this.image.attr('orientation', this.model.get('orientation'));
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
    this.$('.delete').spin();
    return this.model.destroy();
  };

  return PhotoView;

})(BaseView);

});

;
//# sourceMappingURL=app.js.map