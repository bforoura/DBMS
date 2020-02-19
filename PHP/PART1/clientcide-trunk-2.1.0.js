/*
Script: Core.js
	MooTools - My Object Oriented JavaScript Tools.

License:
	MIT-style license.

Copyright:
	Copyright (c) 2006-2008 [Valerio Proietti](http://mad4milk.net/).

Code & Documentation:
	[The MooTools production team](http://mootools.net/developers/).

Inspiration:
	- Class implementation inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
	- Some functionality inspired by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)
*/

var MooTools = {
	'version': '1.2.3',
	'build': '4980aa0fb74d2f6eb80bcd9f5b8e1fd6fbb8f607'
};

var Native = function(options){
	options = options || {};
	var name = options.name;
	var legacy = options.legacy;
	var protect = options.protect;
	var methods = options.implement;
	var generics = options.generics;
	var initialize = options.initialize;
	var afterImplement = options.afterImplement || function(){};
	var object = initialize || legacy;
	generics = generics !== false;

	object.constructor = Native;
	object.$family = {name: 'native'};
	if (legacy && initialize) object.prototype = legacy.prototype;
	object.prototype.constructor = object;

	if (name){
		var family = name.toLowerCase();
		object.prototype.$family = {name: family};
		Native.typize(object, family);
	}

	var add = function(obj, name, method, force){
		if (!protect || force || !obj.prototype[name]) obj.prototype[name] = method;
		if (generics) Native.genericize(obj, name, protect);
		afterImplement.call(obj, name, method);
		return obj;
	};

	object.alias = function(a1, a2, a3){
		if (typeof a1 == 'string'){
			var pa1 = this.prototype[a1];
			if ((a1 = pa1)) return add(this, a2, a1, a3);
		}
		for (var a in a1) this.alias(a, a1[a], a2);
		return this;
	};

	object.implement = function(a1, a2, a3){
		if (typeof a1 == 'string') return add(this, a1, a2, a3);
		for (var p in a1) add(this, p, a1[p], a2);
		return this;
	};

	if (methods) object.implement(methods);

	return object;
};

Native.genericize = function(object, property, check){
	if ((!check || !object[property]) && typeof object.prototype[property] == 'function') object[property] = function(){
		var args = Array.prototype.slice.call(arguments);
		return object.prototype[property].apply(args.shift(), args);
	};
};

Native.implement = function(objects, properties){
	for (var i = 0, l = objects.length; i < l; i++) objects[i].implement(properties);
};

Native.typize = function(object, family){
	if (!object.type) object.type = function(item){
		return ($type(item) === family);
	};
};

(function(){
	var natives = {'Array': Array, 'Date': Date, 'Function': Function, 'Number': Number, 'RegExp': RegExp, 'String': String};
	for (var n in natives) new Native({name: n, initialize: natives[n], protect: true});

	var types = {'boolean': Boolean, 'native': Native, 'object': Object};
	for (var t in types) Native.typize(types[t], t);

	var generics = {
		'Array': ["concat", "indexOf", "join", "lastIndexOf", "pop", "push", "reverse", "shift", "slice", "sort", "splice", "toString", "unshift", "valueOf"],
		'String': ["charAt", "charCodeAt", "concat", "indexOf", "lastIndexOf", "match", "replace", "search", "slice", "split", "substr", "substring", "toLowerCase", "toUpperCase", "valueOf"]
	};
	for (var g in generics){
		for (var i = generics[g].length; i--;) Native.genericize(natives[g], generics[g][i], true);
	}
})();

var Hash = new Native({

	name: 'Hash',

	initialize: function(object){
		if ($type(object) == 'hash') object = $unlink(object.getClean());
		for (var key in object) this[key] = object[key];
		return this;
	}

});

Hash.implement({

	forEach: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key)) fn.call(bind, this[key], key, this);
		}
	},

	getClean: function(){
		var clean = {};
		for (var key in this){
			if (this.hasOwnProperty(key)) clean[key] = this[key];
		}
		return clean;
	},

	getLength: function(){
		var length = 0;
		for (var key in this){
			if (this.hasOwnProperty(key)) length++;
		}
		return length;
	}

});

Hash.alias('forEach', 'each');

Array.implement({

	forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++) fn.call(bind, this[i], i, this);
	}

});

Array.alias('forEach', 'each');

function $A(iterable){
	if (iterable.item){
		var l = iterable.length, array = new Array(l);
		while (l--) array[l] = iterable[l];
		return array;
	}
	return Array.prototype.slice.call(iterable);
};

function $arguments(i){
	return function(){
		return arguments[i];
	};
};

function $chk(obj){
	return !!(obj || obj === 0);
};

function $clear(timer){
	clearTimeout(timer);
	clearInterval(timer);
	return null;
};

function $defined(obj){
	return (obj != undefined);
};

function $each(iterable, fn, bind){
	var type = $type(iterable);
	((type == 'arguments' || type == 'collection' || type == 'array') ? Array : Hash).each(iterable, fn, bind);
};

function $empty(){};

function $extend(original, extended){
	for (var key in (extended || {})) original[key] = extended[key];
	return original;
};

function $H(object){
	return new Hash(object);
};

function $lambda(value){
	return ($type(value) == 'function') ? value : function(){
		return value;
	};
};

function $merge(){
	var args = Array.slice(arguments);
	args.unshift({});
	return $mixin.apply(null, args);
};

function $mixin(mix){
	for (var i = 1, l = arguments.length; i < l; i++){
		var object = arguments[i];
		if ($type(object) != 'object') continue;
		for (var key in object){
			var op = object[key], mp = mix[key];
			mix[key] = (mp && $type(op) == 'object' && $type(mp) == 'object') ? $mixin(mp, op) : $unlink(op);
		}
	}
	return mix;
};

function $pick(){
	for (var i = 0, l = arguments.length; i < l; i++){
		if (arguments[i] != undefined) return arguments[i];
	}
	return null;
};

function $random(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
};

function $splat(obj){
	var type = $type(obj);
	return (type) ? ((type != 'array' && type != 'arguments') ? [obj] : obj) : [];
};

var $time = Date.now || function(){
	return +new Date;
};

function $try(){
	for (var i = 0, l = arguments.length; i < l; i++){
		try {
			return arguments[i]();
		} catch(e){}
	}
	return null;
};

function $type(obj){
	if (obj == undefined) return false;
	if (obj.$family) return (obj.$family.name == 'number' && !isFinite(obj)) ? false : obj.$family.name;
	if (obj.nodeName){
		switch (obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	} else if (typeof obj.length == 'number'){
		if (obj.callee) return 'arguments';
		else if (obj.item) return 'collection';
	}
	return typeof obj;
};

function $unlink(object){
	var unlinked;
	switch ($type(object)){
		case 'object':
			unlinked = {};
			for (var p in object) unlinked[p] = $unlink(object[p]);
		break;
		case 'hash':
			unlinked = new Hash(object);
		break;
		case 'array':
			unlinked = [];
			for (var i = 0, l = object.length; i < l; i++) unlinked[i] = $unlink(object[i]);
		break;
		default: return object;
	}
	return unlinked;
};


/*
Script: Browser.js
	The Browser Core. Contains Browser initialization, Window and Document, and the Browser Hash.

License:
	MIT-style license.
*/

var Browser = $merge({

	Engine: {name: 'unknown', version: 0},

	Platform: {name: (window.orientation != undefined) ? 'ipod' : (navigator.platform.match(/mac|win|linux/i) || ['other'])[0].toLowerCase()},

	Features: {xpath: !!(document.evaluate), air: !!(window.runtime), query: !!(document.querySelector)},

	Plugins: {},

	Engines: {

		presto: function(){
			return (!window.opera) ? false : ((arguments.callee.caller) ? 960 : ((document.getElementsByClassName) ? 950 : 925));
		},

		trident: function(){
			return (!window.ActiveXObject) ? false : ((window.XMLHttpRequest) ? 5 : 4);
		},

		webkit: function(){
			return (navigator.taintEnabled) ? false : ((Browser.Features.xpath) ? ((Browser.Features.query) ? 525 : 420) : 419);
		},

		gecko: function(){
			return (document.getBoxObjectFor == undefined) ? false : ((document.getElementsByClassName) ? 19 : 18);
		}

	}

}, Browser || {});

Browser.Platform[Browser.Platform.name] = true;

Browser.detect = function(){

	for (var engine in this.Engines){
		var version = this.Engines[engine]();
		if (version){
			this.Engine = {name: engine, version: version};
			this.Engine[engine] = this.Engine[engine + version] = true;
			break;
		}
	}

	return {name: engine, version: version};

};

Browser.detect();

Browser.Request = function(){
	return $try(function(){
		return new XMLHttpRequest();
	}, function(){
		return new ActiveXObject('MSXML2.XMLHTTP');
	});
};

Browser.Features.xhr = !!(Browser.Request());

Browser.Plugins.Flash = (function(){
	var version = ($try(function(){
		return navigator.plugins['Shockwave Flash'].description;
	}, function(){
		return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
	}) || '0 r0').match(/\d+/g);
	return {version: parseInt(version[0] || 0 + '.' + version[1], 10) || 0, build: parseInt(version[2], 10) || 0};
})();

function $exec(text){
	if (!text) return text;
	if (window.execScript){
		window.execScript(text);
	} else {
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script[(Browser.Engine.webkit && Browser.Engine.version < 420) ? 'innerText' : 'text'] = text;
		document.head.appendChild(script);
		document.head.removeChild(script);
	}
	return text;
};

Native.UID = 1;

var $uid = (Browser.Engine.trident) ? function(item){
	return (item.uid || (item.uid = [Native.UID++]))[0];
} : function(item){
	return item.uid || (item.uid = Native.UID++);
};

var Window = new Native({

	name: 'Window',

	legacy: (Browser.Engine.trident) ? null: window.Window,

	initialize: function(win){
		$uid(win);
		if (!win.Element){
			win.Element = $empty;
			if (Browser.Engine.webkit) win.document.createElement("iframe"); //fixes safari 2
			win.Element.prototype = (Browser.Engine.webkit) ? window["[[DOMElement.prototype]]"] : {};
		}
		win.document.window = win;
		return $extend(win, Window.Prototype);
	},

	afterImplement: function(property, value){
		window[property] = Window.Prototype[property] = value;
	}

});

Window.Prototype = {$family: {name: 'window'}};

new Window(window);

var Document = new Native({

	name: 'Document',

	legacy: (Browser.Engine.trident) ? null: window.Document,

	initialize: function(doc){
		$uid(doc);
		doc.head = doc.getElementsByTagName('head')[0];
		doc.html = doc.getElementsByTagName('html')[0];
		if (Browser.Engine.trident && Browser.Engine.version <= 4) $try(function(){
			doc.execCommand("BackgroundImageCache", false, true);
		});
		if (Browser.Engine.trident) doc.window.attachEvent('onunload', function() {
			doc.window.detachEvent('onunload', arguments.callee);
			doc.head = doc.html = doc.window = null;
		});
		return $extend(doc, Document.Prototype);
	},

	afterImplement: function(property, value){
		document[property] = Document.Prototype[property] = value;
	}

});

Document.Prototype = {$family: {name: 'document'}};

new Document(document);


/*
Script: Array.js
	Contains Array Prototypes like each, contains, and erase.

License:
	MIT-style license.
*/

Array.implement({

	every: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (!fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	filter: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},

	clean: function() {
		return this.filter($defined);
	},

	indexOf: function(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	map: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++) results[i] = fn.call(bind, this[i], i, this);
		return results;
	},

	some: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},

	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},

	link: function(object){
		var result = {};
		for (var i = 0, l = this.length; i < l; i++){
			for (var key in object){
				if (object[key](this[i])){
					result[key] = this[i];
					delete object[key];
					break;
				}
			}
		}
		return result;
	},

	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	extend: function(array){
		for (var i = 0, j = array.length; i < j; i++) this.push(array[i]);
		return this;
	},
	
	getLast: function(){
		return (this.length) ? this[this.length - 1] : null;
	},

	getRandom: function(){
		return (this.length) ? this[$random(0, this.length - 1)] : null;
	},

	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},

	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	erase: function(item){
		for (var i = this.length; i--; i){
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},

	empty: function(){
		this.length = 0;
		return this;
	},

	flatten: function(){
		var array = [];
		for (var i = 0, l = this.length; i < l; i++){
			var type = $type(this[i]);
			if (!type) continue;
			array = array.concat((type == 'array' || type == 'collection' || type == 'arguments') ? Array.flatten(this[i]) : this[i]);
		}
		return array;
	},

	hexToRgb: function(array){
		if (this.length != 3) return null;
		var rgb = this.map(function(value){
			if (value.length == 1) value += value;
			return value.toInt(16);
		});
		return (array) ? rgb : 'rgb(' + rgb + ')';
	},

	rgbToHex: function(array){
		if (this.length < 3) return null;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return (array) ? hex : '#' + hex.join('');
	}

});


/*
Script: Function.js
	Contains Function Prototypes like create, bind, pass, and delay.

License:
	MIT-style license.
*/

Function.implement({

	extend: function(properties){
		for (var property in properties) this[property] = properties[property];
		return this;
	},

	create: function(options){
		var self = this;
		options = options || {};
		return function(event){
			var args = options.arguments;
			args = (args != undefined) ? $splat(args) : Array.slice(arguments, (options.event) ? 1 : 0);
			if (options.event) args = [event || window.event].extend(args);
			var returns = function(){
				return self.apply(options.bind || null, args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			if (options.attempt) return $try(returns);
			return returns();
		};
	},

	run: function(args, bind){
		return this.apply(bind, $splat(args));
	},

	pass: function(args, bind){
		return this.create({bind: bind, arguments: args});
	},

	bind: function(bind, args){
		return this.create({bind: bind, arguments: args});
	},

	bindWithEvent: function(bind, args){
		return this.create({bind: bind, arguments: args, event: true});
	},

	attempt: function(args, bind){
		return this.create({bind: bind, arguments: args, attempt: true})();
	},

	delay: function(delay, bind, args){
		return this.create({bind: bind, arguments: args, delay: delay})();
	},

	periodical: function(periodical, bind, args){
		return this.create({bind: bind, arguments: args, periodical: periodical})();
	}

});


/*
Script: Number.js
	Contains Number Prototypes like limit, round, times, and ceil.

License:
	MIT-style license.
*/

Number.implement({

	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	}

});

Number.alias('times', 'each');

(function(math){
	var methods = {};
	math.each(function(name){
		if (!Number[name]) methods[name] = function(){
			return Math[name].apply(null, [this].concat($A(arguments)));
		};
	});
	Number.implement(methods);
})(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan']);


/*
Script: String.js
	Contains String Prototypes like camelCase, capitalize, test, and toInt.

License:
	MIT-style license.
*/

String.implement({

	test: function(regex, params){
		return ((typeof regex == 'string') ? new RegExp(regex, params) : regex).test(this);
	},

	contains: function(string, separator){
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s+/g, ' ').trim();
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	escapeRegExp: function(){
		return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : null;
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : null;
	},

	stripScripts: function(option){
		var scripts = '';
		var text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){
			scripts += arguments[1] + '\n';
			return '';
		});
		if (option === true) $exec(scripts);
		else if ($type(option) == 'function') option(scripts, text);
		return text;
	},

	substitute: function(object, regexp){
		return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != undefined) ? object[name] : '';
		});
	}

});


/*
Script: Hash.js
	Contains Hash Prototypes. Provides a means for overcoming the JavaScript practical impossibility of extending native Objects.

License:
	MIT-style license.
*/

Hash.implement({

	has: Object.prototype.hasOwnProperty,

	keyOf: function(value){
		for (var key in this){
			if (this.hasOwnProperty(key) && this[key] === value) return key;
		}
		return null;
	},

	hasValue: function(value){
		return (Hash.keyOf(this, value) !== null);
	},

	extend: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.set(this, key, value);
		}, this);
		return this;
	},

	combine: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.include(this, key, value);
		}, this);
		return this;
	},

	erase: function(key){
		if (this.hasOwnProperty(key)) delete this[key];
		return this;
	},

	get: function(key){
		return (this.hasOwnProperty(key)) ? this[key] : null;
	},

	set: function(key, value){
		if (!this[key] || this.hasOwnProperty(key)) this[key] = value;
		return this;
	},

	empty: function(){
		Hash.each(this, function(value, key){
			delete this[key];
		}, this);
		return this;
	},

	include: function(key, value){
		if (this[key] == undefined) this[key] = value;
		return this;
	},

	map: function(fn, bind){
		var results = new Hash;
		Hash.each(this, function(value, key){
			results.set(key, fn.call(bind, value, key, this));
		}, this);
		return results;
	},

	filter: function(fn, bind){
		var results = new Hash;
		Hash.each(this, function(value, key){
			if (fn.call(bind, value, key, this)) results.set(key, value);
		}, this);
		return results;
	},

	every: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key) && !fn.call(bind, this[key], key)) return false;
		}
		return true;
	},

	some: function(fn, bind){
		for (var key in this){
			if (this.hasOwnProperty(key) && fn.call(bind, this[key], key)) return true;
		}
		return false;
	},

	getKeys: function(){
		var keys = [];
		Hash.each(this, function(value, key){
			keys.push(key);
		});
		return keys;
	},

	getValues: function(){
		var values = [];
		Hash.each(this, function(value){
			values.push(value);
		});
		return values;
	},

	toQueryString: function(base){
		var queryString = [];
		Hash.each(this, function(value, key){
			if (base) key = base + '[' + key + ']';
			var result;
			switch ($type(value)){
				case 'object': result = Hash.toQueryString(value, key); break;
				case 'array':
					var qs = {};
					value.each(function(val, i){
						qs[i] = val;
					});
					result = Hash.toQueryString(qs, key);
				break;
				default: result = key + '=' + encodeURIComponent(value);
			}
			if (value != undefined) queryString.push(result);
		});

		return queryString.join('&');
	}

});

Hash.alias({keyOf: 'indexOf', hasValue: 'contains'});


/*
Script: Event.js
	Contains the Event Native, to make the event object completely crossbrowser.

License:
	MIT-style license.
*/

var Event = new Native({

	name: 'Event',

	initialize: function(event, win){
		win = win || window;
		var doc = win.document;
		event = event || win.event;
		if (event.$extended) return event;
		this.$extended = true;
		var type = event.type;
		var target = event.target || event.srcElement;
		while (target && target.nodeType == 3) target = target.parentNode;

		if (type.test(/key/)){
			var code = event.which || event.keyCode;
			var key = Event.Keys.keyOf(code);
			if (type == 'keydown'){
				var fKey = code - 111;
				if (fKey > 0 && fKey < 13) key = 'f' + fKey;
			}
			key = key || String.fromCharCode(code).toLowerCase();
		} else if (type.match(/(click|mouse|menu)/i)){
			doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
			var page = {
				x: event.pageX || event.clientX + doc.scrollLeft,
				y: event.pageY || event.clientY + doc.scrollTop
			};
			var client = {
				x: (event.pageX) ? event.pageX - win.pageXOffset : event.clientX,
				y: (event.pageY) ? event.pageY - win.pageYOffset : event.clientY
			};
			if (type.match(/DOMMouseScroll|mousewheel/)){
				var wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
			}
			var rightClick = (event.which == 3) || (event.button == 2);
			var related = null;
			if (type.match(/over|out/)){
				switch (type){
					case 'mouseover': related = event.relatedTarget || event.fromElement; break;
					case 'mouseout': related = event.relatedTarget || event.toElement;
				}
				if (!(function(){
					while (related && related.nodeType == 3) related = related.parentNode;
					return true;
				}).create({attempt: Browser.Engine.gecko})()) related = false;
			}
		}

		return $extend(this, {
			event: event,
			type: type,

			page: page,
			client: client,
			rightClick: rightClick,

			wheel: wheel,

			relatedTarget: related,
			target: target,

			code: code,
			key: key,

			shift: event.shiftKey,
			control: event.ctrlKey,
			alt: event.altKey,
			meta: event.metaKey
		});
	}

});

Event.Keys = new Hash({
	'enter': 13,
	'up': 38,
	'down': 40,
	'left': 37,
	'right': 39,
	'esc': 27,
	'space': 32,
	'backspace': 8,
	'tab': 9,
	'delete': 46
});

Event.implement({

	stop: function(){
		return this.stopPropagation().preventDefault();
	},

	stopPropagation: function(){
		if (this.event.stopPropagation) this.event.stopPropagation();
		else this.event.cancelBubble = true;
		return this;
	},

	preventDefault: function(){
		if (this.event.preventDefault) this.event.preventDefault();
		else this.event.returnValue = false;
		return this;
	}

});


/*
Script: Class.js
	Contains the Class Function for easily creating, extending, and implementing reusable Classes.

License:
	MIT-style license.
*/

function Class(params){
	
	if (params instanceof Function) params = {initialize: params};
	
	var newClass = function(){
		Object.reset(this);
		if (newClass._prototyping) return this;
		this._current = $empty;
		var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
		delete this._current; delete this.caller;
		return value;
	}.extend(this);
	
	newClass.implement(params);
	
	newClass.constructor = Class;
	newClass.prototype.constructor = newClass;

	return newClass;

};

Function.prototype.protect = function(){
	this._protected = true;
	return this;
};

Object.reset = function(object, key){
		
	if (key == null){
		for (var p in object) Object.reset(object, p);
		return object;
	}
	
	delete object[key];
	
	switch ($type(object[key])){
		case 'object':
			var F = function(){};
			F.prototype = object[key];
			var i = new F;
			object[key] = Object.reset(i);
		break;
		case 'array': object[key] = $unlink(object[key]); break;
	}
	
	return object;
	
};

new Native({name: 'Class', initialize: Class}).extend({

	instantiate: function(F){
		F._prototyping = true;
		var proto = new F;
		delete F._prototyping;
		return proto;
	},
	
	wrap: function(self, key, method){
		if (method._origin) method = method._origin;
		
		return function(){
			if (method._protected && this._current == null) throw new Error('The method "' + key + '" cannot be called.');
			var caller = this.caller, current = this._current;
			this.caller = current; this._current = arguments.callee;
			var result = method.apply(this, arguments);
			this._current = current; this.caller = caller;
			return result;
		}.extend({_owner: self, _origin: method, _name: key});

	}
	
});

Class.implement({
	
	implement: function(key, value){
		
		if ($type(key) == 'object'){
			for (var p in key) this.implement(p, key[p]);
			return this;
		}
		
		var mutator = Class.Mutators[key];
		
		if (mutator){
			value = mutator.call(this, value);
			if (value == null) return this;
		}
		
		var proto = this.prototype;

		switch ($type(value)){
			
			case 'function':
				if (value._hidden) return this;
				proto[key] = Class.wrap(this, key, value);
			break;
			
			case 'object':
				var previous = proto[key];
				if ($type(previous) == 'object') $mixin(previous, value);
				else proto[key] = $unlink(value);
			break;
			
			case 'array':
				proto[key] = $unlink(value);
			break;
			
			default: proto[key] = value;

		}
		
		return this;

	}
	
});

Class.Mutators = {
	
	Extends: function(parent){

		this.parent = parent;
		this.prototype = Class.instantiate(parent);

		this.implement('parent', function(){
			var name = this.caller._name, previous = this.caller._owner.parent.prototype[name];
			if (!previous) throw new Error('The method "' + name + '" has no parent.');
			return previous.apply(this, arguments);
		}.protect());

	},

	Implements: function(items){
		$splat(items).each(function(item){
			if (item instanceof Function) item = Class.instantiate(item);
			this.implement(item);
		}, this);

	}
	
};


/*
Script: Class.Extras.js
	Contains Utility Classes that can be implemented into your own Classes to ease the execution of many common tasks.

License:
	MIT-style license.
*/

var Chain = new Class({

	$chain: [],

	chain: function(){
		this.$chain.extend(Array.flatten(arguments));
		return this;
	},

	callChain: function(){
		return (this.$chain.length) ? this.$chain.shift().apply(this, arguments) : false;
	},

	clearChain: function(){
		this.$chain.empty();
		return this;
	}

});

var Events = new Class({

	$events: {},

	addEvent: function(type, fn, internal){
		type = Events.removeOn(type);
		if (fn != $empty){
			this.$events[type] = this.$events[type] || [];
			this.$events[type].include(fn);
			if (internal) fn.internal = true;
		}
		return this;
	},

	addEvents: function(events){
		for (var type in events) this.addEvent(type, events[type]);
		return this;
	},

	fireEvent: function(type, args, delay){
		type = Events.removeOn(type);
		if (!this.$events || !this.$events[type]) return this;
		this.$events[type].each(function(fn){
			fn.create({'bind': this, 'delay': delay, 'arguments': args})();
		}, this);
		return this;
	},

	removeEvent: function(type, fn){
		type = Events.removeOn(type);
		if (!this.$events[type]) return this;
		if (!fn.internal) this.$events[type].erase(fn);
		return this;
	},

	removeEvents: function(events){
		var type;
		if ($type(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		if (events) events = Events.removeOn(events);
		for (type in this.$events){
			if (events && events != type) continue;
			var fns = this.$events[type];
			for (var i = fns.length; i--; i) this.removeEvent(type, fns[i]);
		}
		return this;
	}

});

Events.removeOn = function(string){
	return string.replace(/^on([A-Z])/, function(full, first) {
		return first.toLowerCase();
	});
};

var Options = new Class({

	setOptions: function(){
		this.options = $merge.run([this.options].extend(arguments));
		if (!this.addEvent) return this;
		for (var option in this.options){
			if ($type(this.options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
			this.addEvent(option, this.options[option]);
			delete this.options[option];
		}
		return this;
	}

});


/*
Script: Element.js
	One of the most important items in MooTools. Contains the dollar function, the dollars function, and an handful of cross-browser,
	time-saver methods to let you easily work with HTML Elements.

License:
	MIT-style license.
*/

var Element = new Native({

	name: 'Element',

	legacy: window.Element,

	initialize: function(tag, props){
		var konstructor = Element.Constructors.get(tag);
		if (konstructor) return konstructor(props);
		if (typeof tag == 'string') return document.newElement(tag, props);
		return document.id(tag).set(props);
	},

	afterImplement: function(key, value){
		Element.Prototype[key] = value;
		if (Array[key]) return;
		Elements.implement(key, function(){
			var items = [], elements = true;
			for (var i = 0, j = this.length; i < j; i++){
				var returns = this[i][key].apply(this[i], arguments);
				items.push(returns);
				if (elements) elements = ($type(returns) == 'element');
			}
			return (elements) ? new Elements(items) : items;
		});
	}

});

Element.Prototype = {$family: {name: 'element'}};

Element.Constructors = new Hash;

var IFrame = new Native({

	name: 'IFrame',

	generics: false,

	initialize: function(){
		var params = Array.link(arguments, {properties: Object.type, iframe: $defined});
		var props = params.properties || {};
		var iframe = document.id(params.iframe);
		var onload = props.onload || $empty;
		delete props.onload;
		props.id = props.name = $pick(props.id, props.name, iframe ? (iframe.id || iframe.name) : 'IFrame_' + $time());
		iframe = new Element(iframe || 'iframe', props);
		var onFrameLoad = function(){
			var host = $try(function(){
				return iframe.contentWindow.location.host;
			});
			if (!host || host == window.location.host){
				var win = new Window(iframe.contentWindow);
				new Document(iframe.contentWindow.document);
				$extend(win.Element.prototype, Element.Prototype);
			}
			onload.call(iframe.contentWindow, iframe.contentWindow.document);
		};
		var contentWindow = $try(function(){
			return iframe.contentWindow;
		});
		((contentWindow && contentWindow.document.body) || window.frames[props.id]) ? onFrameLoad() : iframe.addListener('load', onFrameLoad);
		return iframe;
	}

});

var Elements = new Native({

	initialize: function(elements, options){
		options = $extend({ddup: true, cash: true}, options);
		elements = elements || [];
		if (options.ddup || options.cash){
			var uniques = {}, returned = [];
			for (var i = 0, l = elements.length; i < l; i++){
				var el = document.id(elements[i], !options.cash);
				if (options.ddup){
					if (uniques[el.uid]) continue;
					uniques[el.uid] = true;
				}
				returned.push(el);
			}
			elements = returned;
		}
		return (options.cash) ? $extend(elements, this) : elements;
	}

});

Elements.implement({

	filter: function(filter, bind){
		if (!filter) return this;
		return new Elements(Array.filter(this, (typeof filter == 'string') ? function(item){
			return item.match(filter);
		} : filter, bind));
	}

});

Document.implement({

	newElement: function(tag, props){
		if (Browser.Engine.trident && props){
			['name', 'type', 'checked'].each(function(attribute){
				if (!props[attribute]) return;
				tag += ' ' + attribute + '="' + props[attribute] + '"';
				if (attribute != 'checked') delete props[attribute];
			});
			tag = '<' + tag + '>';
		}
		return document.id(this.createElement(tag)).set(props);
	},

	newTextNode: function(text){
		return this.createTextNode(text);
	},

	getDocument: function(){
		return this;
	},

	getWindow: function(){
		return this.window;
	},
	
	id: (function(){
		
		var types = {

			string: function(id, nocash, doc){
				id = doc.getElementById(id);
				return (id) ? types.element(id, nocash) : null;
			},
			
			element: function(el, nocash){
				$uid(el);
				if (!nocash && !el.$family && !(/^object|embed$/i).test(el.tagName)){
					var proto = Element.Prototype;
					for (var p in proto) el[p] = proto[p];
				};
				return el;
			},
			
			object: function(obj, nocash, doc){
				if (obj.toElement) return types.element(obj.toElement(doc), nocash);
				return null;
			}
			
		};

		types.textnode = types.whitespace = types.window = types.document = $arguments(0);
		
		return function(el, nocash, doc){
			if (el && el.$family && el.uid) return el;
			var type = $type(el);
			return (types[type]) ? types[type](el, nocash, doc || document) : null;
		};

	})()

});

if (window.$ == null) Window.implement({
	$: function(el, nc){
		return document.id(el, nc, this.document);
	}
});

Window.implement({

	$$: function(selector){
		if (arguments.length == 1 && typeof selector == 'string') return this.document.getElements(selector);
		var elements = [];
		var args = Array.flatten(arguments);
		for (var i = 0, l = args.length; i < l; i++){
			var item = args[i];
			switch ($type(item)){
				case 'element': elements.push(item); break;
				case 'string': elements.extend(this.document.getElements(item, true));
			}
		}
		return new Elements(elements);
	},

	getDocument: function(){
		return this.document;
	},

	getWindow: function(){
		return this;
	}

});

Native.implement([Element, Document], {

	getElement: function(selector, nocash){
		return document.id(this.getElements(selector, true)[0] || null, nocash);
	},

	getElements: function(tags, nocash){
		tags = tags.split(',');
		var elements = [];
		var ddup = (tags.length > 1);
		tags.each(function(tag){
			var partial = this.getElementsByTagName(tag.trim());
			(ddup) ? elements.extend(partial) : elements = partial;
		}, this);
		return new Elements(elements, {ddup: ddup, cash: !nocash});
	}

});

(function(){

var collected = {}, storage = {};
var props = {input: 'checked', option: 'selected', textarea: (Browser.Engine.webkit && Browser.Engine.version < 420) ? 'innerHTML' : 'value'};

var get = function(uid){
	return (storage[uid] || (storage[uid] = {}));
};

var clean = function(item, retain){
	if (!item) return;
	var uid = item.uid;
	if (Browser.Engine.trident){
		if (item.clearAttributes){
			var clone = retain && item.cloneNode(false);
			item.clearAttributes();
			if (clone) item.mergeAttributes(clone);
		} else if (item.removeEvents){
			item.removeEvents();
		}
		if ((/object/i).test(item.tagName)){
			for (var p in item){
				if (typeof item[p] == 'function') item[p] = $empty;
			}
			Element.dispose(item);
		}
	}	
	if (!uid) return;
	collected[uid] = storage[uid] = null;
};

var purge = function(){
	Hash.each(collected, clean);
	if (Browser.Engine.trident) $A(document.getElementsByTagName('object')).each(clean);
	if (window.CollectGarbage) CollectGarbage();
	collected = storage = null;
};

var walk = function(element, walk, start, match, all, nocash){
	var el = element[start || walk];
	var elements = [];
	while (el){
		if (el.nodeType == 1 && (!match || Element.match(el, match))){
			if (!all) return document.id(el, nocash);
			elements.push(el);
		}
		el = el[walk];
	}
	return (all) ? new Elements(elements, {ddup: false, cash: !nocash}) : null;
};

var attributes = {
	'html': 'innerHTML',
	'class': 'className',
	'for': 'htmlFor',
	'defaultValue': 'defaultValue',
	'text': (Browser.Engine.trident || (Browser.Engine.webkit && Browser.Engine.version < 420)) ? 'innerText' : 'textContent'
};
var bools = ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'readonly', 'multiple', 'selected', 'noresize', 'defer'];
var camels = ['value', 'type', 'defaultValue', 'accessKey', 'cellPadding', 'cellSpacing', 'colSpan', 'frameBorder', 'maxLength', 'readOnly', 'rowSpan', 'tabIndex', 'useMap'];

bools = bools.associate(bools);

Hash.extend(attributes, bools);
Hash.extend(attributes, camels.associate(camels.map(String.toLowerCase)));

var inserters = {

	before: function(context, element){
		if (element.parentNode) element.parentNode.insertBefore(context, element);
	},

	after: function(context, element){
		if (!element.parentNode) return;
		var next = element.nextSibling;
		(next) ? element.parentNode.insertBefore(context, next) : element.parentNode.appendChild(context);
	},

	bottom: function(context, element){
		element.appendChild(context);
	},

	top: function(context, element){
		var first = element.firstChild;
		(first) ? element.insertBefore(context, first) : element.appendChild(context);
	}

};

inserters.inside = inserters.bottom;

Hash.each(inserters, function(inserter, where){

	where = where.capitalize();

	Element.implement('inject' + where, function(el){
		inserter(this, document.id(el, true));
		return this;
	});

	Element.implement('grab' + where, function(el){
		inserter(document.id(el, true), this);
		return this;
	});

});

Element.implement({

	set: function(prop, value){
		switch ($type(prop)){
			case 'object':
				for (var p in prop) this.set(p, prop[p]);
				break;
			case 'string':
				var property = Element.Properties.get(prop);
				(property && property.set) ? property.set.apply(this, Array.slice(arguments, 1)) : this.setProperty(prop, value);
		}
		return this;
	},

	get: function(prop){
		var property = Element.Properties.get(prop);
		return (property && property.get) ? property.get.apply(this, Array.slice(arguments, 1)) : this.getProperty(prop);
	},

	erase: function(prop){
		var property = Element.Properties.get(prop);
		(property && property.erase) ? property.erase.apply(this) : this.removeProperty(prop);
		return this;
	},

	setProperty: function(attribute, value){
		var key = attributes[attribute];
		if (value == undefined) return this.removeProperty(attribute);
		if (key && bools[attribute]) value = !!value;
		(key) ? this[key] = value : this.setAttribute(attribute, '' + value);
		return this;
	},

	setProperties: function(attributes){
		for (var attribute in attributes) this.setProperty(attribute, attributes[attribute]);
		return this;
	},

	getProperty: function(attribute){
		var key = attributes[attribute];
		var value = (key) ? this[key] : this.getAttribute(attribute, 2);
		return (bools[attribute]) ? !!value : (key) ? value : value || null;
	},

	getProperties: function(){
		var args = $A(arguments);
		return args.map(this.getProperty, this).associate(args);
	},

	removeProperty: function(attribute){
		var key = attributes[attribute];
		(key) ? this[key] = (key && bools[attribute]) ? false : '' : this.removeAttribute(attribute);
		return this;
	},

	removeProperties: function(){
		Array.each(arguments, this.removeProperty, this);
		return this;
	},

	hasClass: function(className){
		return this.className.contains(className, ' ');
	},

	addClass: function(className){
		if (!this.hasClass(className)) this.className = (this.className + ' ' + className).clean();
		return this;
	},

	removeClass: function(className){
		this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
		return this;
	},

	toggleClass: function(className){
		return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
	},

	adopt: function(){
		Array.flatten(arguments).each(function(element){
			element = document.id(element, true);
			if (element) this.appendChild(element);
		}, this);
		return this;
	},

	appendText: function(text, where){
		return this.grab(this.getDocument().newTextNode(text), where);
	},

	grab: function(el, where){
		inserters[where || 'bottom'](document.id(el, true), this);
		return this;
	},

	inject: function(el, where){
		inserters[where || 'bottom'](this, document.id(el, true));
		return this;
	},

	replaces: function(el){
		el = document.id(el, true);
		el.parentNode.replaceChild(this, el);
		return this;
	},

	wraps: function(el, where){
		el = document.id(el, true);
		return this.replaces(el).grab(el, where);
	},

	getPrevious: function(match, nocash){
		return walk(this, 'previousSibling', null, match, false, nocash);
	},

	getAllPrevious: function(match, nocash){
		return walk(this, 'previousSibling', null, match, true, nocash);
	},

	getNext: function(match, nocash){
		return walk(this, 'nextSibling', null, match, false, nocash);
	},

	getAllNext: function(match, nocash){
		return walk(this, 'nextSibling', null, match, true, nocash);
	},

	getFirst: function(match, nocash){
		return walk(this, 'nextSibling', 'firstChild', match, false, nocash);
	},

	getLast: function(match, nocash){
		return walk(this, 'previousSibling', 'lastChild', match, false, nocash);
	},

	getParent: function(match, nocash){
		return walk(this, 'parentNode', null, match, false, nocash);
	},

	getParents: function(match, nocash){
		return walk(this, 'parentNode', null, match, true, nocash);
	},
	
	getSiblings: function(match, nocash) {
		return this.getParent().getChildren(match, nocash).erase(this);
	},

	getChildren: function(match, nocash){
		return walk(this, 'nextSibling', 'firstChild', match, true, nocash);
	},

	getWindow: function(){
		return this.ownerDocument.window;
	},

	getDocument: function(){
		return this.ownerDocument;
	},

	getElementById: function(id, nocash){
		var el = this.ownerDocument.getElementById(id);
		if (!el) return null;
		for (var parent = el.parentNode; parent != this; parent = parent.parentNode){
			if (!parent) return null;
		}
		return document.id(el, nocash);
	},

	getSelected: function(){
		return new Elements($A(this.options).filter(function(option){
			return option.selected;
		}));
	},

	getComputedStyle: function(property){
		if (this.currentStyle) return this.currentStyle[property.camelCase()];
		var computed = this.getDocument().defaultView.getComputedStyle(this, null);
		return (computed) ? computed.getPropertyValue([property.hyphenate()]) : null;
	},

	toQueryString: function(){
		var queryString = [];
		this.getElements('input, select, textarea', true).each(function(el){
			if (!el.name || el.disabled || el.type == 'submit' || el.type == 'reset' || el.type == 'file') return;
			var value = (el.tagName.toLowerCase() == 'select') ? Element.getSelected(el).map(function(opt){
				return opt.value;
			}) : ((el.type == 'radio' || el.type == 'checkbox') && !el.checked) ? null : el.value;
			$splat(value).each(function(val){
				if (typeof val != 'undefined') queryString.push(el.name + '=' + encodeURIComponent(val));
			});
		});
		return queryString.join('&');
	},

	clone: function(contents, keepid){
		contents = contents !== false;
		var clone = this.cloneNode(contents);
		var clean = function(node, element){
			if (!keepid) node.removeAttribute('id');
			if (Browser.Engine.trident){
				node.clearAttributes();
				node.mergeAttributes(element);
				node.removeAttribute('uid');
				if (node.options){
					var no = node.options, eo = element.options;
					for (var j = no.length; j--;) no[j].selected = eo[j].selected;
				}
			}
			var prop = props[element.tagName.toLowerCase()];
			if (prop && element[prop]) node[prop] = element[prop];
		};

		if (contents){
			var ce = clone.getElementsByTagName('*'), te = this.getElementsByTagName('*');
			for (var i = ce.length; i--;) clean(ce[i], te[i]);
		}

		clean(clone, this);
		return document.id(clone);
	},

	destroy: function(){
		Element.empty(this);
		Element.dispose(this);
		clean(this, true);
		return null;
	},

	empty: function(){
		$A(this.childNodes).each(function(node){
			Element.destroy(node);
		});
		return this;
	},

	dispose: function(){
		return (this.parentNode) ? this.parentNode.removeChild(this) : this;
	},

	hasChild: function(el){
		el = document.id(el, true);
		if (!el) return false;
		if (Browser.Engine.webkit && Browser.Engine.version < 420) return $A(this.getElementsByTagName(el.tagName)).contains(el);
		return (this.contains) ? (this != el && this.contains(el)) : !!(this.compareDocumentPosition(el) & 16);
	},

	match: function(tag){
		return (!tag || (tag == this) || (Element.get(this, 'tag') == tag));
	}

});

Native.implement([Element, Window, Document], {

	addListener: function(type, fn){
		if (type == 'unload'){
			var old = fn, self = this;
			fn = function(){
				self.removeListener('unload', fn);
				old();
			};
		} else {
			collected[this.uid] = this;
		}
		if (this.addEventListener) this.addEventListener(type, fn, false);
		else this.attachEvent('on' + type, fn);
		return this;
	},

	removeListener: function(type, fn){
		if (this.removeEventListener) this.removeEventListener(type, fn, false);
		else this.detachEvent('on' + type, fn);
		return this;
	},

	retrieve: function(property, dflt){
		var storage = get(this.uid), prop = storage[property];
		if (dflt != undefined && prop == undefined) prop = storage[property] = dflt;
		return $pick(prop);
	},

	store: function(property, value){
		var storage = get(this.uid);
		storage[property] = value;
		return this;
	},

	eliminate: function(property){
		var storage = get(this.uid);
		delete storage[property];
		return this;
	}

});

window.addListener('unload', purge);

})();

Element.Properties = new Hash;

Element.Properties.style = {

	set: function(style){
		this.style.cssText = style;
	},

	get: function(){
		return this.style.cssText;
	},

	erase: function(){
		this.style.cssText = '';
	}

};

Element.Properties.tag = {

	get: function(){
		return this.tagName.toLowerCase();
	}

};

Element.Properties.html = (function(){
	var wrapper = document.createElement('div');

	var translations = {
		table: [1, '<table>', '</table>'],
		select: [1, '<select>', '</select>'],
		tbody: [2, '<table><tbody>', '</tbody></table>'],
		tr: [3, '<table><tbody><tr>', '</tr></tbody></table>']
	};
	translations.thead = translations.tfoot = translations.tbody;

	var html = {
		set: function(){
			var html = Array.flatten(arguments).join('');
			var wrap = Browser.Engine.trident && translations[this.get('tag')];
			if (wrap){
				var first = wrapper;
				first.innerHTML = wrap[1] + html + wrap[2];
				for (var i = wrap[0]; i--;) first = first.firstChild;
				this.empty().adopt(first.childNodes);
			} else {
				this.innerHTML = html;
			}
		}
	};

	html.erase = html.set;

	return html;
})();

if (Browser.Engine.webkit && Browser.Engine.version < 420) Element.Properties.text = {
	get: function(){
		if (this.innerText) return this.innerText;
		var temp = this.ownerDocument.newElement('div', {html: this.innerHTML}).inject(this.ownerDocument.body);
		var text = temp.innerText;
		temp.destroy();
		return text;
	}
};


/*
Script: Element.Event.js
	Contains Element methods for dealing with events, and custom Events.

License:
	MIT-style license.
*/

Element.Properties.events = {set: function(events){
	this.addEvents(events);
}};

Native.implement([Element, Window, Document], {

	addEvent: function(type, fn){
		var events = this.retrieve('events', {});
		events[type] = events[type] || {'keys': [], 'values': []};
		if (events[type].keys.contains(fn)) return this;
		events[type].keys.push(fn);
		var realType = type, custom = Element.Events.get(type), condition = fn, self = this;
		if (custom){
			if (custom.onAdd) custom.onAdd.call(this, fn);
			if (custom.condition){
				condition = function(event){
					if (custom.condition.call(this, event)) return fn.call(this, event);
					return true;
				};
			}
			realType = custom.base || realType;
		}
		var defn = function(){
			return fn.call(self);
		};
		var nativeEvent = Element.NativeEvents[realType];
		if (nativeEvent){
			if (nativeEvent == 2){
				defn = function(event){
					event = new Event(event, self.getWindow());
					if (condition.call(self, event) === false) event.stop();
				};
			}
			this.addListener(realType, defn);
		}
		events[type].values.push(defn);
		return this;
	},

	removeEvent: function(type, fn){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		var pos = events[type].keys.indexOf(fn);
		if (pos == -1) return this;
		events[type].keys.splice(pos, 1);
		var value = events[type].values.splice(pos, 1)[0];
		var custom = Element.Events.get(type);
		if (custom){
			if (custom.onRemove) custom.onRemove.call(this, fn);
			type = custom.base || type;
		}
		return (Element.NativeEvents[type]) ? this.removeListener(type, value) : this;
	},

	addEvents: function(events){
		for (var event in events) this.addEvent(event, events[event]);
		return this;
	},

	removeEvents: function(events){
		var type;
		if ($type(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		var attached = this.retrieve('events');
		if (!attached) return this;
		if (!events){
			for (type in attached) this.removeEvents(type);
			this.eliminate('events');
		} else if (attached[events]){
			while (attached[events].keys[0]) this.removeEvent(events, attached[events].keys[0]);
			attached[events] = null;
		}
		return this;
	},

	fireEvent: function(type, args, delay){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		events[type].keys.each(function(fn){
			fn.create({'bind': this, 'delay': delay, 'arguments': args})();
		}, this);
		return this;
	},

	cloneEvents: function(from, type){
		from = document.id(from);
		var fevents = from.retrieve('events');
		if (!fevents) return this;
		if (!type){
			for (var evType in fevents) this.cloneEvents(from, evType);
		} else if (fevents[type]){
			fevents[type].keys.each(function(fn){
				this.addEvent(type, fn);
			}, this);
		}
		return this;
	}

});

Element.NativeEvents = {
	click: 2, dblclick: 2, mouseup: 2, mousedown: 2, contextmenu: 2, //mouse buttons
	mousewheel: 2, DOMMouseScroll: 2, //mouse wheel
	mouseover: 2, mouseout: 2, mousemove: 2, selectstart: 2, selectend: 2, //mouse movement
	keydown: 2, keypress: 2, keyup: 2, //keyboard
	focus: 2, blur: 2, change: 2, reset: 2, select: 2, submit: 2, //form elements
	load: 1, unload: 1, beforeunload: 2, resize: 1, move: 1, DOMContentLoaded: 1, readystatechange: 1, //window
	error: 1, abort: 1, scroll: 1 //misc
};

(function(){

var $check = function(event){
	var related = event.relatedTarget;
	if (related == undefined) return true;
	if (related === false) return false;
	return ($type(this) != 'document' && related != this && related.prefix != 'xul' && !this.hasChild(related));
};

Element.Events = new Hash({

	mouseenter: {
		base: 'mouseover',
		condition: $check
	},

	mouseleave: {
		base: 'mouseout',
		condition: $check
	},

	mousewheel: {
		base: (Browser.Engine.gecko) ? 'DOMMouseScroll' : 'mousewheel'
	}

});

})();


/*
Script: Element.Style.js
	Contains methods for interacting with the styles of Elements in a fashionable way.

License:
	MIT-style license.
*/

Element.Properties.styles = {set: function(styles){
	this.setStyles(styles);
}};

Element.Properties.opacity = {

	set: function(opacity, novisibility){
		if (!novisibility){
			if (opacity == 0){
				if (this.style.visibility != 'hidden') this.style.visibility = 'hidden';
			} else {
				if (this.style.visibility != 'visible') this.style.visibility = 'visible';
			}
		}
		if (!this.currentStyle || !this.currentStyle.hasLayout) this.style.zoom = 1;
		if (Browser.Engine.trident) this.style.filter = (opacity == 1) ? '' : 'alpha(opacity=' + opacity * 100 + ')';
		this.style.opacity = opacity;
		this.store('opacity', opacity);
	},

	get: function(){
		return this.retrieve('opacity', 1);
	}

};

Element.implement({

	setOpacity: function(value){
		return this.set('opacity', value, true);
	},

	getOpacity: function(){
		return this.get('opacity');
	},

	setStyle: function(property, value){
		switch (property){
			case 'opacity': return this.set('opacity', parseFloat(value));
			case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		if ($type(value) != 'string'){
			var map = (Element.Styles.get(property) || '@').split(' ');
			value = $splat(value).map(function(val, i){
				if (!map[i]) return '';
				return ($type(val) == 'number') ? map[i].replace('@', Math.round(val)) : val;
			}).join(' ');
		} else if (value == String(Number(value))){
			value = Math.round(value);
		}
		this.style[property] = value;
		return this;
	},

	getStyle: function(property){
		switch (property){
			case 'opacity': return this.get('opacity');
			case 'float': property = (Browser.Engine.trident) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		var result = this.style[property];
		if (!$chk(result)){
			result = [];
			for (var style in Element.ShortStyles){
				if (property != style) continue;
				for (var s in Element.ShortStyles[style]) result.push(this.getStyle(s));
				return result.join(' ');
			}
			result = this.getComputedStyle(property);
		}
		if (result){
			result = String(result);
			var color = result.match(/rgba?\([\d\s,]+\)/);
			if (color) result = result.replace(color[0], color[0].rgbToHex());
		}
		if (Browser.Engine.presto || (Browser.Engine.trident && !$chk(parseInt(result, 10)))){
			if (property.test(/^(height|width)$/)){
				var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
				values.each(function(value){
					size += this.getStyle('border-' + value + '-width').toInt() + this.getStyle('padding-' + value).toInt();
				}, this);
				return this['offset' + property.capitalize()] - size + 'px';
			}
			if ((Browser.Engine.presto) && String(result).test('px')) return result;
			if (property.test(/(border(.+)Width|margin|padding)/)) return '0px';
		}
		return result;
	},

	setStyles: function(styles){
		for (var style in styles) this.setStyle(style, styles[style]);
		return this;
	},

	getStyles: function(){
		var result = {};
		Array.flatten(arguments).each(function(key){
			result[key] = this.getStyle(key);
		}, this);
		return result;
	}

});

Element.Styles = new Hash({
	left: '@px', top: '@px', bottom: '@px', right: '@px',
	width: '@px', height: '@px', maxWidth: '@px', maxHeight: '@px', minWidth: '@px', minHeight: '@px',
	backgroundColor: 'rgb(@, @, @)', backgroundPosition: '@px @px', color: 'rgb(@, @, @)',
	fontSize: '@px', letterSpacing: '@px', lineHeight: '@px', clip: 'rect(@px @px @px @px)',
	margin: '@px @px @px @px', padding: '@px @px @px @px', border: '@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)',
	borderWidth: '@px @px @px @px', borderStyle: '@ @ @ @', borderColor: 'rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)',
	zIndex: '@', 'zoom': '@', fontWeight: '@', textIndent: '@px', opacity: '@'
});

Element.ShortStyles = {margin: {}, padding: {}, border: {}, borderWidth: {}, borderStyle: {}, borderColor: {}};

['Top', 'Right', 'Bottom', 'Left'].each(function(direction){
	var Short = Element.ShortStyles;
	var All = Element.Styles;
	['margin', 'padding'].each(function(style){
		var sd = style + direction;
		Short[style][sd] = All[sd] = '@px';
	});
	var bd = 'border' + direction;
	Short.border[bd] = All[bd] = '@px @ rgb(@, @, @)';
	var bdw = bd + 'Width', bds = bd + 'Style', bdc = bd + 'Color';
	Short[bd] = {};
	Short.borderWidth[bdw] = Short[bd][bdw] = All[bdw] = '@px';
	Short.borderStyle[bds] = Short[bd][bds] = All[bds] = '@';
	Short.borderColor[bdc] = Short[bd][bdc] = All[bdc] = 'rgb(@, @, @)';
});


/*
Script: Element.Dimensions.js
	Contains methods to work with size, scroll, or positioning of Elements and the window object.

License:
	MIT-style license.

Credits:
	- Element positioning based on the [qooxdoo](http://qooxdoo.org/) code and smart browser fixes, [LGPL License](http://www.gnu.org/licenses/lgpl.html).
	- Viewport dimensions based on [YUI](http://developer.yahoo.com/yui/) code, [BSD License](http://developer.yahoo.com/yui/license.html).
*/

(function(){

Element.implement({

	scrollTo: function(x, y){
		if (isBody(this)){
			this.getWindow().scrollTo(x, y);
		} else {
			this.scrollLeft = x;
			this.scrollTop = y;
		}
		return this;
	},

	getSize: function(){
		if (isBody(this)) return this.getWindow().getSize();
		return {x: this.offsetWidth, y: this.offsetHeight};
	},

	getScrollSize: function(){
		if (isBody(this)) return this.getWindow().getScrollSize();
		return {x: this.scrollWidth, y: this.scrollHeight};
	},

	getScroll: function(){
		if (isBody(this)) return this.getWindow().getScroll();
		return {x: this.scrollLeft, y: this.scrollTop};
	},

	getScrolls: function(){
		var element = this, position = {x: 0, y: 0};
		while (element && !isBody(element)){
			position.x += element.scrollLeft;
			position.y += element.scrollTop;
			element = element.parentNode;
		}
		return position;
	},

	getOffsetParent: function(){
		var element = this;
		if (isBody(element)) return null;
		if (!Browser.Engine.trident) return element.offsetParent;
		while ((element = element.parentNode) && !isBody(element)){
			if (styleString(element, 'position') != 'static') return element;
		}
		return null;
	},

	getOffsets: function(){		
		if (this.getBoundingClientRect){
			var bound = this.getBoundingClientRect(),
			html = document.id(this.getDocument().documentElement),
			scroll = html.getScroll(),
			isFixed = (styleString(this, 'position') == 'fixed');
			return {
				x: parseInt(bound.left, 10) + ((isFixed) ? 0 : scroll.x) - html.clientLeft,
				y: parseInt(bound.top, 10) +  ((isFixed) ? 0 : scroll.y) - html.clientTop
			};
		}

		var element = this, position = {x: 0, y: 0};
		if (isBody(this)) return position;

		while (element && !isBody(element)){
			position.x += element.offsetLeft;
			position.y += element.offsetTop;

			if (Browser.Engine.gecko){
				if (!borderBox(element)){
					position.x += leftBorder(element);
					position.y += topBorder(element);
				}
				var parent = element.parentNode;
				if (parent && styleString(parent, 'overflow') != 'visible'){
					position.x += leftBorder(parent);
					position.y += topBorder(parent);
				}
			} else if (element != this && Browser.Engine.webkit){
				position.x += leftBorder(element);
				position.y += topBorder(element);
			}

			element = element.offsetParent;
		}
		if (Browser.Engine.gecko && !borderBox(this)){
			position.x -= leftBorder(this);
			position.y -= topBorder(this);
		}
		return position;
	},

	getPosition: function(relative){
		if (isBody(this)) return {x: 0, y: 0};
		var offset = this.getOffsets(), scroll = this.getScrolls();
		var position = {x: offset.x - scroll.x, y: offset.y - scroll.y};
		var relativePosition = (relative && (relative = document.id(relative))) ? relative.getPosition() : {x: 0, y: 0};
		return {x: position.x - relativePosition.x, y: position.y - relativePosition.y};
	},

	getCoordinates: function(element){
		if (isBody(this)) return this.getWindow().getCoordinates();
		var position = this.getPosition(element), size = this.getSize();
		var obj = {left: position.x, top: position.y, width: size.x, height: size.y};
		obj.right = obj.left + obj.width;
		obj.bottom = obj.top + obj.height;
		return obj;
	},

	computePosition: function(obj){
		return {left: obj.x - styleNumber(this, 'margin-left'), top: obj.y - styleNumber(this, 'margin-top')};
	},

	setPosition: function(obj){
		return this.setStyles(this.computePosition(obj));
	}

});


Native.implement([Document, Window], {

	getSize: function(){
		if (Browser.Engine.presto || Browser.Engine.webkit) {
			var win = this.getWindow();
			return {x: win.innerWidth, y: win.innerHeight};
		}
		var doc = getCompatElement(this);
		return {x: doc.clientWidth, y: doc.clientHeight};
	},

	getScroll: function(){
		var win = this.getWindow(), doc = getCompatElement(this);
		return {x: win.pageXOffset || doc.scrollLeft, y: win.pageYOffset || doc.scrollTop};
	},

	getScrollSize: function(){
		var doc = getCompatElement(this), min = this.getSize();
		return {x: Math.max(doc.scrollWidth, min.x), y: Math.max(doc.scrollHeight, min.y)};
	},

	getPosition: function(){
		return {x: 0, y: 0};
	},

	getCoordinates: function(){
		var size = this.getSize();
		return {top: 0, left: 0, bottom: size.y, right: size.x, height: size.y, width: size.x};
	}

});

// private methods

var styleString = Element.getComputedStyle;

function styleNumber(element, style){
	return styleString(element, style).toInt() || 0;
};

function borderBox(element){
	return styleString(element, '-moz-box-sizing') == 'border-box';
};

function topBorder(element){
	return styleNumber(element, 'border-top-width');
};

function leftBorder(element){
	return styleNumber(element, 'border-left-width');
};

function isBody(element){
	return (/^(?:body|html)$/i).test(element.tagName);
};

function getCompatElement(element){
	var doc = element.getDocument();
	return (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
};

})();

//aliases
Element.alias('setPosition', 'position'); //compatability

Native.implement([Window, Document, Element], {

	getHeight: function(){
		return this.getSize().y;
	},

	getWidth: function(){
		return this.getSize().x;
	},

	getScrollTop: function(){
		return this.getScroll().y;
	},

	getScrollLeft: function(){
		return this.getScroll().x;
	},

	getScrollHeight: function(){
		return this.getScrollSize().y;
	},

	getScrollWidth: function(){
		return this.getScrollSize().x;
	},

	getTop: function(){
		return this.getPosition().y;
	},

	getLeft: function(){
		return this.getPosition().x;
	}

});


/*
Script: Selectors.js
	Adds advanced CSS Querying capabilities for targeting elements. Also includes pseudoselectors support.

License:
	MIT-style license.
*/

Native.implement([Document, Element], {

	getElements: function(expression, nocash){
		expression = expression.split(',');
		var items, local = {};
		for (var i = 0, l = expression.length; i < l; i++){
			var selector = expression[i], elements = Selectors.Utils.search(this, selector, local);
			if (i != 0 && elements.item) elements = $A(elements);
			items = (i == 0) ? elements : (items.item) ? $A(items).concat(elements) : items.concat(elements);
		}
		return new Elements(items, {ddup: (expression.length > 1), cash: !nocash});
	}

});

Element.implement({

	match: function(selector){
		if (!selector || (selector == this)) return true;
		var tagid = Selectors.Utils.parseTagAndID(selector);
		var tag = tagid[0], id = tagid[1];
		if (!Selectors.Filters.byID(this, id) || !Selectors.Filters.byTag(this, tag)) return false;
		var parsed = Selectors.Utils.parseSelector(selector);
		return (parsed) ? Selectors.Utils.filter(this, parsed, {}) : true;
	}

});

var Selectors = {Cache: {nth: {}, parsed: {}}};

Selectors.RegExps = {
	id: (/#([\w-]+)/),
	tag: (/^(\w+|\*)/),
	quick: (/^(\w+|\*)$/),
	splitter: (/\s*([+>~\s])\s*([a-zA-Z#.*:\[])/g),
	combined: (/\.([\w-]+)|\[(\w+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g)
};

Selectors.Utils = {

	chk: function(item, uniques){
		if (!uniques) return true;
		var uid = $uid(item);
		if (!uniques[uid]) return uniques[uid] = true;
		return false;
	},

	parseNthArgument: function(argument){
		if (Selectors.Cache.nth[argument]) return Selectors.Cache.nth[argument];
		var parsed = argument.match(/^([+-]?\d*)?([a-z]+)?([+-]?\d*)?$/);
		if (!parsed) return false;
		var inta = parseInt(parsed[1], 10);
		var a = (inta || inta === 0) ? inta : 1;
		var special = parsed[2] || false;
		var b = parseInt(parsed[3], 10) || 0;
		if (a != 0){
			b--;
			while (b < 1) b += a;
			while (b >= a) b -= a;
		} else {
			a = b;
			special = 'index';
		}
		switch (special){
			case 'n': parsed = {a: a, b: b, special: 'n'}; break;
			case 'odd': parsed = {a: 2, b: 0, special: 'n'}; break;
			case 'even': parsed = {a: 2, b: 1, special: 'n'}; break;
			case 'first': parsed = {a: 0, special: 'index'}; break;
			case 'last': parsed = {special: 'last-child'}; break;
			case 'only': parsed = {special: 'only-child'}; break;
			default: parsed = {a: (a - 1), special: 'index'};
		}

		return Selectors.Cache.nth[argument] = parsed;
	},

	parseSelector: function(selector){
		if (Selectors.Cache.parsed[selector]) return Selectors.Cache.parsed[selector];
		var m, parsed = {classes: [], pseudos: [], attributes: []};
		while ((m = Selectors.RegExps.combined.exec(selector))){
			var cn = m[1], an = m[2], ao = m[3], av = m[5], pn = m[6], pa = m[7];
			if (cn){
				parsed.classes.push(cn);
			} else if (pn){
				var parser = Selectors.Pseudo.get(pn);
				if (parser) parsed.pseudos.push({parser: parser, argument: pa});
				else parsed.attributes.push({name: pn, operator: '=', value: pa});
			} else if (an){
				parsed.attributes.push({name: an, operator: ao, value: av});
			}
		}
		if (!parsed.classes.length) delete parsed.classes;
		if (!parsed.attributes.length) delete parsed.attributes;
		if (!parsed.pseudos.length) delete parsed.pseudos;
		if (!parsed.classes && !parsed.attributes && !parsed.pseudos) parsed = null;
		return Selectors.Cache.parsed[selector] = parsed;
	},

	parseTagAndID: function(selector){
		var tag = selector.match(Selectors.RegExps.tag);
		var id = selector.match(Selectors.RegExps.id);
		return [(tag) ? tag[1] : '*', (id) ? id[1] : false];
	},

	filter: function(item, parsed, local){
		var i;
		if (parsed.classes){
			for (i = parsed.classes.length; i--; i){
				var cn = parsed.classes[i];
				if (!Selectors.Filters.byClass(item, cn)) return false;
			}
		}
		if (parsed.attributes){
			for (i = parsed.attributes.length; i--; i){
				var att = parsed.attributes[i];
				if (!Selectors.Filters.byAttribute(item, att.name, att.operator, att.value)) return false;
			}
		}
		if (parsed.pseudos){
			for (i = parsed.pseudos.length; i--; i){
				var psd = parsed.pseudos[i];
				if (!Selectors.Filters.byPseudo(item, psd.parser, psd.argument, local)) return false;
			}
		}
		return true;
	},

	getByTagAndID: function(ctx, tag, id){
		if (id){
			var item = (ctx.getElementById) ? ctx.getElementById(id, true) : Element.getElementById(ctx, id, true);
			return (item && Selectors.Filters.byTag(item, tag)) ? [item] : [];
		} else {
			return ctx.getElementsByTagName(tag);
		}
	},

	search: function(self, expression, local){
		var splitters = [];

		var selectors = expression.trim().replace(Selectors.RegExps.splitter, function(m0, m1, m2){
			splitters.push(m1);
			return ':)' + m2;
		}).split(':)');

		var items, filtered, item;

		for (var i = 0, l = selectors.length; i < l; i++){

			var selector = selectors[i];

			if (i == 0 && Selectors.RegExps.quick.test(selector)){
				items = self.getElementsByTagName(selector);
				continue;
			}

			var splitter = splitters[i - 1];

			var tagid = Selectors.Utils.parseTagAndID(selector);
			var tag = tagid[0], id = tagid[1];

			if (i == 0){
				items = Selectors.Utils.getByTagAndID(self, tag, id);
			} else {
				var uniques = {}, found = [];
				for (var j = 0, k = items.length; j < k; j++) found = Selectors.Getters[splitter](found, items[j], tag, id, uniques);
				items = found;
			}

			var parsed = Selectors.Utils.parseSelector(selector);

			if (parsed){
				filtered = [];
				for (var m = 0, n = items.length; m < n; m++){
					item = items[m];
					if (Selectors.Utils.filter(item, parsed, local)) filtered.push(item);
				}
				items = filtered;
			}

		}

		return items;

	}

};

Selectors.Getters = {

	' ': function(found, self, tag, id, uniques){
		var items = Selectors.Utils.getByTagAndID(self, tag, id);
		for (var i = 0, l = items.length; i < l; i++){
			var item = items[i];
			if (Selectors.Utils.chk(item, uniques)) found.push(item);
		}
		return found;
	},

	'>': function(found, self, tag, id, uniques){
		var children = Selectors.Utils.getByTagAndID(self, tag, id);
		for (var i = 0, l = children.length; i < l; i++){
			var child = children[i];
			if (child.parentNode == self && Selectors.Utils.chk(child, uniques)) found.push(child);
		}
		return found;
	},

	'+': function(found, self, tag, id, uniques){
		while ((self = self.nextSibling)){
			if (self.nodeType == 1){
				if (Selectors.Utils.chk(self, uniques) && Selectors.Filters.byTag(self, tag) && Selectors.Filters.byID(self, id)) found.push(self);
				break;
			}
		}
		return found;
	},

	'~': function(found, self, tag, id, uniques){
		while ((self = self.nextSibling)){
			if (self.nodeType == 1){
				if (!Selectors.Utils.chk(self, uniques)) break;
				if (Selectors.Filters.byTag(self, tag) && Selectors.Filters.byID(self, id)) found.push(self);
			}
		}
		return found;
	}

};

Selectors.Filters = {

	byTag: function(self, tag){
		return (tag == '*' || (self.tagName && self.tagName.toLowerCase() == tag));
	},

	byID: function(self, id){
		return (!id || (self.id && self.id == id));
	},

	byClass: function(self, klass){
		return (self.className && self.className.contains(klass, ' '));
	},

	byPseudo: function(self, parser, argument, local){
		return parser.call(self, argument, local);
	},

	byAttribute: function(self, name, operator, value){
		var result = Element.prototype.getProperty.call(self, name);
		if (!result) return (operator == '!=');
		if (!operator || value == undefined) return true;
		switch (operator){
			case '=': return (result == value);
			case '*=': return (result.contains(value));
			case '^=': return (result.substr(0, value.length) == value);
			case '$=': return (result.substr(result.length - value.length) == value);
			case '!=': return (result != value);
			case '~=': return result.contains(value, ' ');
			case '|=': return result.contains(value, '-');
		}
		return false;
	}

};

Selectors.Pseudo = new Hash({

	// w3c pseudo selectors

	checked: function(){
		return this.checked;
	},
	
	empty: function(){
		return !(this.innerText || this.textContent || '').length;
	},

	not: function(selector){
		return !Element.match(this, selector);
	},

	contains: function(text){
		return (this.innerText || this.textContent || '').contains(text);
	},

	'first-child': function(){
		return Selectors.Pseudo.index.call(this, 0);
	},

	'last-child': function(){
		var element = this;
		while ((element = element.nextSibling)){
			if (element.nodeType == 1) return false;
		}
		return true;
	},

	'only-child': function(){
		var prev = this;
		while ((prev = prev.previousSibling)){
			if (prev.nodeType == 1) return false;
		}
		var next = this;
		while ((next = next.nextSibling)){
			if (next.nodeType == 1) return false;
		}
		return true;
	},

	'nth-child': function(argument, local){
		argument = (argument == undefined) ? 'n' : argument;
		var parsed = Selectors.Utils.parseNthArgument(argument);
		if (parsed.special != 'n') return Selectors.Pseudo[parsed.special].call(this, parsed.a, local);
		var count = 0;
		local.positions = local.positions || {};
		var uid = $uid(this);
		if (!local.positions[uid]){
			var self = this;
			while ((self = self.previousSibling)){
				if (self.nodeType != 1) continue;
				count ++;
				var position = local.positions[$uid(self)];
				if (position != undefined){
					count = position + count;
					break;
				}
			}
			local.positions[uid] = count;
		}
		return (local.positions[uid] % parsed.a == parsed.b);
	},

	// custom pseudo selectors

	index: function(index){
		var element = this, count = 0;
		while ((element = element.previousSibling)){
			if (element.nodeType == 1 && ++count > index) return false;
		}
		return (count == index);
	},

	even: function(argument, local){
		return Selectors.Pseudo['nth-child'].call(this, '2n+1', local);
	},

	odd: function(argument, local){
		return Selectors.Pseudo['nth-child'].call(this, '2n', local);
	},
	
	selected: function(){
		return this.selected;
	},
	
	enabled: function(){
		return (this.disabled === false);
	}

});


/*
Script: Domready.js
	Contains the domready custom event.

License:
	MIT-style license.
*/

Element.Events.domready = {

	onAdd: function(fn){
		if (Browser.loaded) fn.call(this);
	}

};

(function(){

	var domready = function(){
		if (Browser.loaded) return;
		Browser.loaded = true;
		window.fireEvent('domready');
		document.fireEvent('domready');
	};

	if (Browser.Engine.trident){
		var temp = document.createElement('div');
		(function(){
			($try(function(){
				temp.doScroll(); // Technique by Diego Perini
				return document.id(temp).inject(document.body).set('html', 'temp').dispose();
			})) ? domready() : arguments.callee.delay(50);
		})();
	} else if (Browser.Engine.webkit && Browser.Engine.version < 525){
		(function(){
			(['loaded', 'complete'].contains(document.readyState)) ? domready() : arguments.callee.delay(50);
		})();
	} else {
		window.addEvent('load', domready);
		document.addEvent('DOMContentLoaded', domready);
	}

})();


/*
Script: JSON.js
	JSON encoder and decoder.

License:
	MIT-style license.

See Also:
	<http://www.json.org/>
*/

var JSON = new Hash({

	$specialChars: {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'},

	$replaceChars: function(chr){
		return JSON.$specialChars[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
	},

	encode: function(obj){
		switch ($type(obj)){
			case 'string':
				return '"' + obj.replace(/[\x00-\x1f\\"]/g, JSON.$replaceChars) + '"';
			case 'array':
				return '[' + String(obj.map(JSON.encode).clean()) + ']';
			case 'object': case 'hash':
				var string = [];
				Hash.each(obj, function(value, key){
					var json = JSON.encode(value);
					if (json) string.push(JSON.encode(key) + ':' + json);
				});
				return '{' + string + '}';
			case 'number': case 'boolean': return String(obj);
			case false: return 'null';
		}
		return null;
	},

	decode: function(string, secure){
		if ($type(string) != 'string' || !string.length) return null;
		if (secure && !(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, ''))) return null;
		return eval('(' + string + ')');
	}

});

Native.implement([Hash, Array, String, Number], {

	toJSON: function(){
		return JSON.encode(this);
	}

});


/*
Script: Fx.js
	Contains the basic animation logic to be extended by all other Fx Classes.

License:
	MIT-style license.
*/

var Fx = new Class({

	Implements: [Chain, Events, Options],

	options: {
		/*
		onStart: $empty,
		onCancel: $empty,
		onComplete: $empty,
		*/
		fps: 50,
		unit: false,
		duration: 500,
		link: 'ignore'
	},

	initialize: function(options){
		this.subject = this.subject || this;
		this.setOptions(options);
		this.options.duration = Fx.Durations[this.options.duration] || this.options.duration.toInt();
		var wait = this.options.wait;
		if (wait === false) this.options.link = 'cancel';
	},

	getTransition: function(){
		return function(p){
			return -(Math.cos(Math.PI * p) - 1) / 2;
		};
	},

	step: function(){
		var time = $time();
		if (time < this.time + this.options.duration){
			var delta = this.transition((time - this.time) / this.options.duration);
			this.set(this.compute(this.from, this.to, delta));
		} else {
			this.set(this.compute(this.from, this.to, 1));
			this.complete();
		}
	},

	set: function(now){
		return now;
	},

	compute: function(from, to, delta){
		return Fx.compute(from, to, delta);
	},

	check: function(){
		if (!this.timer) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	start: function(from, to){
		if (!this.check(from, to)) return this;
		this.from = from;
		this.to = to;
		this.time = 0;
		this.transition = this.getTransition();
		this.startTimer();
		this.onStart();
		return this;
	},

	complete: function(){
		if (this.stopTimer()) this.onComplete();
		return this;
	},

	cancel: function(){
		if (this.stopTimer()) this.onCancel();
		return this;
	},

	onStart: function(){
		this.fireEvent('start', this.subject);
	},

	onComplete: function(){
		this.fireEvent('complete', this.subject);
		if (!this.callChain()) this.fireEvent('chainComplete', this.subject);
	},

	onCancel: function(){
		this.fireEvent('cancel', this.subject).clearChain();
	},

	pause: function(){
		this.stopTimer();
		return this;
	},

	resume: function(){
		this.startTimer();
		return this;
	},

	stopTimer: function(){
		if (!this.timer) return false;
		this.time = $time() - this.time;
		this.timer = $clear(this.timer);
		return true;
	},

	startTimer: function(){
		if (this.timer) return false;
		this.time = $time() - this.time;
		this.timer = this.step.periodical(Math.round(1000 / this.options.fps), this);
		return true;
	}

});

Fx.compute = function(from, to, delta){
	return (to - from) * delta + from;
};

Fx.Durations = {'short': 250, 'normal': 500, 'long': 1000};


/*
Script: Fx.CSS.js
	Contains the CSS animation logic. Used by Fx.Tween, Fx.Morph, Fx.Elements.

License:
	MIT-style license.
*/

Fx.CSS = new Class({

	Extends: Fx,

	//prepares the base from/to object

	prepare: function(element, property, values){
		values = $splat(values);
		var values1 = values[1];
		if (!$chk(values1)){
			values[1] = values[0];
			values[0] = element.getStyle(property);
		}
		var parsed = values.map(this.parse);
		return {from: parsed[0], to: parsed[1]};
	},

	//parses a value into an array

	parse: function(value){
		value = $lambda(value)();
		value = (typeof value == 'string') ? value.split(' ') : $splat(value);
		return value.map(function(val){
			val = String(val);
			var found = false;
			Fx.CSS.Parsers.each(function(parser, key){
				if (found) return;
				var parsed = parser.parse(val);
				if ($chk(parsed)) found = {value: parsed, parser: parser};
			});
			found = found || {value: val, parser: Fx.CSS.Parsers.String};
			return found;
		});
	},

	//computes by a from and to prepared objects, using their parsers.

	compute: function(from, to, delta){
		var computed = [];
		(Math.min(from.length, to.length)).times(function(i){
			computed.push({value: from[i].parser.compute(from[i].value, to[i].value, delta), parser: from[i].parser});
		});
		computed.$family = {name: 'fx:css:value'};
		return computed;
	},

	//serves the value as settable

	serve: function(value, unit){
		if ($type(value) != 'fx:css:value') value = this.parse(value);
		var returned = [];
		value.each(function(bit){
			returned = returned.concat(bit.parser.serve(bit.value, unit));
		});
		return returned;
	},

	//renders the change to an element

	render: function(element, property, value, unit){
		element.setStyle(property, this.serve(value, unit));
	},

	//searches inside the page css to find the values for a selector

	search: function(selector){
		if (Fx.CSS.Cache[selector]) return Fx.CSS.Cache[selector];
		var to = {};
		Array.each(document.styleSheets, function(sheet, j){
			var href = sheet.href;
			if (href && href.contains('://') && !href.contains(document.domain)) return;
			var rules = sheet.rules || sheet.cssRules;
			Array.each(rules, function(rule, i){
				if (!rule.style) return;
				var selectorText = (rule.selectorText) ? rule.selectorText.replace(/^\w+/, function(m){
					return m.toLowerCase();
				}) : null;
				if (!selectorText || !selectorText.test('^' + selector + '$')) return;
				Element.Styles.each(function(value, style){
					if (!rule.style[style] || Element.ShortStyles[style]) return;
					value = String(rule.style[style]);
					to[style] = (value.test(/^rgb/)) ? value.rgbToHex() : value;
				});
			});
		});
		return Fx.CSS.Cache[selector] = to;
	}

});

Fx.CSS.Cache = {};

Fx.CSS.Parsers = new Hash({

	Color: {
		parse: function(value){
			if (value.match(/^#[0-9a-f]{3,6}$/i)) return value.hexToRgb(true);
			return ((value = value.match(/(\d+),\s*(\d+),\s*(\d+)/))) ? [value[1], value[2], value[3]] : false;
		},
		compute: function(from, to, delta){
			return from.map(function(value, i){
				return Math.round(Fx.compute(from[i], to[i], delta));
			});
		},
		serve: function(value){
			return value.map(Number);
		}
	},

	Number: {
		parse: parseFloat,
		compute: Fx.compute,
		serve: function(value, unit){
			return (unit) ? value + unit : value;
		}
	},

	String: {
		parse: $lambda(false),
		compute: $arguments(1),
		serve: $arguments(0)
	}

});


/*
Script: Fx.Tween.js
	Formerly Fx.Style, effect to transition any CSS property for an element.

License:
	MIT-style license.
*/

Fx.Tween = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(property, now){
		if (arguments.length == 1){
			now = property;
			property = this.property || this.options.property;
		}
		this.render(this.element, property, now, this.options.unit);
		return this;
	},

	start: function(property, from, to){
		if (!this.check(property, from, to)) return this;
		var args = Array.flatten(arguments);
		this.property = this.options.property || args.shift();
		var parsed = this.prepare(this.element, this.property, args);
		return this.parent(parsed.from, parsed.to);
	}

});

Element.Properties.tween = {

	set: function(options){
		var tween = this.retrieve('tween');
		if (tween) tween.cancel();
		return this.eliminate('tween').store('tween:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('tween')){
			if (options || !this.retrieve('tween:options')) this.set('tween', options);
			this.store('tween', new Fx.Tween(this, this.retrieve('tween:options')));
		}
		return this.retrieve('tween');
	}

};

Element.implement({

	tween: function(property, from, to){
		this.get('tween').start(arguments);
		return this;
	},

	fade: function(how){
		var fade = this.get('tween'), o = 'opacity', toggle;
		how = $pick(how, 'toggle');
		switch (how){
			case 'in': fade.start(o, 1); break;
			case 'out': fade.start(o, 0); break;
			case 'show': fade.set(o, 1); break;
			case 'hide': fade.set(o, 0); break;
			case 'toggle':
				var flag = this.retrieve('fade:flag', this.get('opacity') == 1);
				fade.start(o, (flag) ? 0 : 1);
				this.store('fade:flag', !flag);
				toggle = true;
			break;
			default: fade.start(o, arguments);
		}
		if (!toggle) this.eliminate('fade:flag');
		return this;
	},

	highlight: function(start, end){
		if (!end){
			end = this.retrieve('highlight:original', this.getStyle('background-color'));
			end = (end == 'transparent') ? '#fff' : end;
		}
		var tween = this.get('tween');
		tween.start('background-color', start || '#ffff88', end).chain(function(){
			this.setStyle('background-color', this.retrieve('highlight:original'));
			tween.callChain();
		}.bind(this));
		return this;
	}

});


/*
Script: Fx.Morph.js
	Formerly Fx.Styles, effect to transition any number of CSS properties for an element using an object of rules, or CSS based selector rules.

License:
	MIT-style license.
*/

Fx.Morph = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(now){
		if (typeof now == 'string') now = this.search(now);
		for (var p in now) this.render(this.element, p, now[p], this.options.unit);
		return this;
	},

	compute: function(from, to, delta){
		var now = {};
		for (var p in from) now[p] = this.parent(from[p], to[p], delta);
		return now;
	},

	start: function(properties){
		if (!this.check(properties)) return this;
		if (typeof properties == 'string') properties = this.search(properties);
		var from = {}, to = {};
		for (var p in properties){
			var parsed = this.prepare(this.element, p, properties[p]);
			from[p] = parsed.from;
			to[p] = parsed.to;
		}
		return this.parent(from, to);
	}

});

Element.Properties.morph = {

	set: function(options){
		var morph = this.retrieve('morph');
		if (morph) morph.cancel();
		return this.eliminate('morph').store('morph:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('morph')){
			if (options || !this.retrieve('morph:options')) this.set('morph', options);
			this.store('morph', new Fx.Morph(this, this.retrieve('morph:options')));
		}
		return this.retrieve('morph');
	}

};

Element.implement({

	morph: function(props){
		this.get('morph').start(props);
		return this;
	}

});


/*
Script: Fx.Transitions.js
	Contains a set of advanced transitions to be used with any of the Fx Classes.

License:
	MIT-style license.

Credits:
	Easing Equations by Robert Penner, <http://www.robertpenner.com/easing/>, modified and optimized to be used with MooTools.
*/

Fx.implement({

	getTransition: function(){
		var trans = this.options.transition || Fx.Transitions.Sine.easeInOut;
		if (typeof trans == 'string'){
			var data = trans.split(':');
			trans = Fx.Transitions;
			trans = trans[data[0]] || trans[data[0].capitalize()];
			if (data[1]) trans = trans['ease' + data[1].capitalize() + (data[2] ? data[2].capitalize() : '')];
		}
		return trans;
	}

});

Fx.Transition = function(transition, params){
	params = $splat(params);
	return $extend(transition, {
		easeIn: function(pos){
			return transition(pos, params);
		},
		easeOut: function(pos){
			return 1 - transition(1 - pos, params);
		},
		easeInOut: function(pos){
			return (pos <= 0.5) ? transition(2 * pos, params) / 2 : (2 - transition(2 * (1 - pos), params)) / 2;
		}
	});
};

Fx.Transitions = new Hash({

	linear: $arguments(0)

});

Fx.Transitions.extend = function(transitions){
	for (var transition in transitions) Fx.Transitions[transition] = new Fx.Transition(transitions[transition]);
};

Fx.Transitions.extend({

	Pow: function(p, x){
		return Math.pow(p, x[0] || 6);
	},

	Expo: function(p){
		return Math.pow(2, 8 * (p - 1));
	},

	Circ: function(p){
		return 1 - Math.sin(Math.acos(p));
	},

	Sine: function(p){
		return 1 - Math.sin((1 - p) * Math.PI / 2);
	},

	Back: function(p, x){
		x = x[0] || 1.618;
		return Math.pow(p, 2) * ((x + 1) * p - x);
	},

	Bounce: function(p){
		var value;
		for (var a = 0, b = 1; 1; a += b, b /= 2){
			if (p >= (7 - 4 * a) / 11){
				value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
				break;
			}
		}
		return value;
	},

	Elastic: function(p, x){
		return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);
	}

});

['Quad', 'Cubic', 'Quart', 'Quint'].each(function(transition, i){
	Fx.Transitions[transition] = new Fx.Transition(function(p){
		return Math.pow(p, [i + 2]);
	});
});


/*
Script: Request.js
	Powerful all purpose Request Class. Uses XMLHTTPRequest.

License:
	MIT-style license.
*/

var Request = new Class({

	Implements: [Chain, Events, Options],

	options: {/*
		onRequest: $empty,
		onComplete: $empty,
		onCancel: $empty,
		onSuccess: $empty,
		onFailure: $empty,
		onException: $empty,*/
		url: '',
		data: '',
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
		},
		async: true,
		format: false,
		method: 'post',
		link: 'ignore',
		isSuccess: null,
		emulation: true,
		urlEncoded: true,
		encoding: 'utf-8',
		evalScripts: false,
		evalResponse: false,
		noCache: false
	},

	initialize: function(options){
		this.xhr = new Browser.Request();
		this.setOptions(options);
		this.options.isSuccess = this.options.isSuccess || this.isSuccess;
		this.headers = new Hash(this.options.headers);
	},

	onStateChange: function(){
		if (this.xhr.readyState != 4 || !this.running) return;
		this.running = false;
		this.status = 0;
		$try(function(){
			this.status = this.xhr.status;
		}.bind(this));
		this.xhr.onreadystatechange = $empty;
		if (this.options.isSuccess.call(this, this.status)){
			this.response = {text: this.xhr.responseText, xml: this.xhr.responseXML};
			this.success(this.response.text, this.response.xml);
		} else {
			this.response = {text: null, xml: null};
			this.failure();
		}
	},

	isSuccess: function(){
		return ((this.status >= 200) && (this.status < 300));
	},

	processScripts: function(text){
		if (this.options.evalResponse || (/(ecma|java)script/).test(this.getHeader('Content-type'))) return $exec(text);
		return text.stripScripts(this.options.evalScripts);
	},

	success: function(text, xml){
		this.onSuccess(this.processScripts(text), xml);
	},

	onSuccess: function(){
		this.fireEvent('complete', arguments).fireEvent('success', arguments).callChain();
	},

	failure: function(){
		this.onFailure();
	},

	onFailure: function(){
		this.fireEvent('complete').fireEvent('failure', this.xhr);
	},

	setHeader: function(name, value){
		this.headers.set(name, value);
		return this;
	},

	getHeader: function(name){
		return $try(function(){
			return this.xhr.getResponseHeader(name);
		}.bind(this));
	},

	check: function(){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	send: function(options){
		if (!this.check(options)) return this;
		this.running = true;

		var type = $type(options);
		if (type == 'string' || type == 'element') options = {data: options};

		var old = this.options;
		options = $extend({data: old.data, url: old.url, method: old.method}, options);
		var data = options.data, url = options.url, method = options.method.toLowerCase();

		switch ($type(data)){
			case 'element': data = document.id(data).toQueryString(); break;
			case 'object': case 'hash': data = Hash.toQueryString(data);
		}

		if (this.options.format){
			var format = 'format=' + this.options.format;
			data = (data) ? format + '&' + data : format;
		}

		if (this.options.emulation && !['get', 'post'].contains(method)){
			var _method = '_method=' + method;
			data = (data) ? _method + '&' + data : _method;
			method = 'post';
		}

		if (this.options.urlEncoded && method == 'post'){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.headers.set('Content-type', 'application/x-www-form-urlencoded' + encoding);
		}

		if (this.options.noCache){
			var noCache = 'noCache=' + new Date().getTime();
			data = (data) ? noCache + '&' + data : noCache;
		}

		var trimPosition = url.lastIndexOf('/');
		if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

		if (data && method == 'get'){
			url = url + (url.contains('?') ? '&' : '?') + data;
			data = null;
		}

		this.xhr.open(method.toUpperCase(), url, this.options.async);

		this.xhr.onreadystatechange = this.onStateChange.bind(this);

		this.headers.each(function(value, key){
			try {
				this.xhr.setRequestHeader(key, value);
			} catch (e){
				this.fireEvent('exception', [key, value]);
			}
		}, this);

		this.fireEvent('request');
		this.xhr.send(data);
		if (!this.options.async) this.onStateChange();
		return this;
	},

	cancel: function(){
		if (!this.running) return this;
		this.running = false;
		this.xhr.abort();
		this.xhr.onreadystatechange = $empty;
		this.xhr = new Browser.Request();
		this.fireEvent('cancel');
		return this;
	}

});

(function(){

var methods = {};
['get', 'post', 'put', 'delete', 'GET', 'POST', 'PUT', 'DELETE'].each(function(method){
	methods[method] = function(){
		var params = Array.link(arguments, {url: String.type, data: $defined});
		return this.send($extend(params, {method: method}));
	};
});

Request.implement(methods);

})();

Element.Properties.send = {

	set: function(options){
		var send = this.retrieve('send');
		if (send) send.cancel();
		return this.eliminate('send').store('send:options', $extend({
			data: this, link: 'cancel', method: this.get('method') || 'post', url: this.get('action')
		}, options));
	},

	get: function(options){
		if (options || !this.retrieve('send')){
			if (options || !this.retrieve('send:options')) this.set('send', options);
			this.store('send', new Request(this.retrieve('send:options')));
		}
		return this.retrieve('send');
	}

};

Element.implement({

	send: function(url){
		var sender = this.get('send');
		sender.send({data: this, url: url || sender.options.url});
		return this;
	}

});
MooTools.More = {
	'version': '1.2.3.1'
};

/*
Script: MooTools.Lang.js
	Provides methods for localization.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

(function(){

	var data = {
		language: 'en-US',
		languages: {
			'en-US': {}
		},
		cascades: ['en-US']
	};
	
	var cascaded;

	MooTools.lang = new Events();

	$extend(MooTools.lang, {

		setLanguage: function(lang){
			if (!data.languages[lang]) return this;
			data.language = lang;
			this.load();
			this.fireEvent('langChange', lang);
			return this;
		},

		load: function() {
			var langs = this.cascade(this.getCurrentLanguage());
			cascaded = {};
			$each(langs, function(set, setName){
				cascaded[setName] = this.lambda(set);
			}, this);
		},

		getCurrentLanguage: function(){
			return data.language;
		},

		addLanguage: function(lang){
			data.languages[lang] = data.languages[lang] || {};
			return this;
		},

		cascade: function(lang){
			var cascades = (data.languages[lang] || {}).cascades || [];
			cascades.combine(data.cascades);
			cascades.erase(lang).push(lang);
			var langs = cascades.map(function(lng){
				return data.languages[lng];
			}, this);
			return $merge.apply(this, langs);
		},

		lambda: function(set) {
			(set || {}).get = function(key, args){
				return $lambda(set[key]).apply(this, $splat(args));
			};
			return set;
		},

		get: function(set, key, args){
			if (cascaded && cascaded[set]) return (key ? cascaded[set].get(key, args) : cascaded[set]);
		},

		set: function(lang, set, members){
			this.addLanguage(lang);
			langData = data.languages[lang];
			if (!langData[set]) langData[set] = {};
			$extend(langData[set], members);
			if (lang == this.getCurrentLanguage()){
				this.load();
				this.fireEvent('langChange', lang);
			}
			return this;
		},

		list: function(){
			return Hash.getKeys(data.languages);
		}

	});

})();

/*
Script: Log.js
	Provides basic logging functionality for plugins to implement.

	License:
		MIT-style license.

	Authors:
		Guillermo Rauch
*/

var Log = new Class({
	
	log: function(){
		Log.logger.call(this, arguments);
	}
	
});

Log.logged = [];

Log.logger = function(){
	if(window.console && console.log) console.log.apply(console, arguments);
	else Log.logged.push(arguments);
};

/*
Script: Class.Refactor.js
	Extends a class onto itself with new property, preserving any items attached to the class's namespace.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

Class.refactor = function(original, refactors){

	$each(refactors, function(item, name){
		var origin = original.prototype[name];
		if (origin && (origin = origin._origin) && typeof item == 'function') original.implement(name, function(){
			var old = this.previous;
			this.previous = origin;
			var value = item.apply(this, arguments);
			this.previous = old;
			return value;
		}); else original.implement(name, item);
	});

	return original;

};

/*
Script: Class.Binds.js
	Automagically binds specified methods in a class to the instance of the class.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

Class.Mutators.Binds = function(binds){
    return binds;
};

Class.Mutators.initialize = function(initialize){
	return function(){
		$splat(this.Binds).each(function(name){
			var original = this[name];
			if (original) this[name] = original.bind(this);
		}, this);
		return initialize.apply(this, arguments);
	};
};

/*
Script: Class.Occlude.js
	Prevents a class from being applied to a DOM element twice.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

Class.Occlude = new Class({

	occlude: function(property, element){
		element = document.id(element || this.element);
		var instance = element.retrieve(property || this.property);
		if (instance && !$defined(this.occluded)){
			this.occluded = instance;
		} else {
			this.occluded = false;
			element.store(property || this.property, this);
		}
		return this.occluded;
	}

});

/*
Script: Date.js
	Extends the Date native object to include methods useful in managing dates.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
		Nicholas Barthelemy - https://svn.nbarthelemy.com/date-js/
		Harald Kirshner - mail [at] digitarald.de; http://digitarald.de
		Scott Kyle - scott [at] appden.com; http://appden.com

*/

(function(){

if (!Date.now) Date.now = $time;

Date.Methods = {};

['Date', 'Day', 'FullYear', 'Hours', 'Milliseconds', 'Minutes', 'Month', 'Seconds', 'Time', 'TimezoneOffset',
	'Week', 'Timezone', 'GMTOffset', 'DayOfYear', 'LastMonth', 'LastDayOfMonth', 'UTCDate', 'UTCDay', 'UTCFullYear',
	'AMPM', 'Ordinal', 'UTCHours', 'UTCMilliseconds', 'UTCMinutes', 'UTCMonth', 'UTCSeconds'].each(function(method){
	Date.Methods[method.toLowerCase()] = method;
});

$each({
	ms: 'Milliseconds',
	year: 'FullYear',
	min: 'Minutes',
	mo: 'Month',
	sec: 'Seconds',
	hr: 'Hours'
}, function(value, key){
	Date.Methods[key] = value;
});

var zeroize = function(what, length){
	return new Array(length - what.toString().length + 1).join('0') + what;
};

Date.implement({

	set: function(prop, value){
		switch ($type(prop)){
			case 'object':
				for (var p in prop) this.set(p, prop[p]);
				break;
			case 'string':
				prop = prop.toLowerCase();
				var m = Date.Methods;
				if (m[prop]) this['set' + m[prop]](value);
		}
		return this;
	},

	get: function(prop){
		prop = prop.toLowerCase();
		var m = Date.Methods;
		if (m[prop]) return this['get' + m[prop]]();
		return null;
	},

	clone: function(){
		return new Date(this.get('time'));
	},

	increment: function(interval, times){
		interval = interval || 'day';
		times = $pick(times, 1);

		switch (interval){
			case 'year':
				return this.increment('month', times * 12);
			case 'month':
				var d = this.get('date');
				this.set('date', 1).set('mo', this.get('mo') + times);
				return this.set('date', d.min(this.get('lastdayofmonth')));
			case 'week':
				return this.increment('day', times * 7);
			case 'day':
				return this.set('date', this.get('date') + times);
		}

		if (!Date.units[interval]) throw new Error(interval + ' is not a supported interval');

		return this.set('time', this.get('time') + times * Date.units[interval]());
	},

	decrement: function(interval, times){
		return this.increment(interval, -1 * $pick(times, 1));
	},

	isLeapYear: function(){
		return Date.isLeapYear(this.get('year'));
	},

	clearTime: function(){
		return this.set({hr: 0, min: 0, sec: 0, ms: 0});
	},

	diff: function(d, resolution){
		resolution = resolution || 'day';
		if ($type(d) == 'string') d = Date.parse(d);

		switch (resolution){
			case 'year':
				return d.get('year') - this.get('year');
			case 'month':
				var months = (d.get('year') - this.get('year')) * 12;
				return months + d.get('mo') - this.get('mo');
			default:
				var diff = d.get('time') - this.get('time');
				if (Date.units[resolution]() > diff.abs()) return 0;
				return ((d.get('time') - this.get('time')) / Date.units[resolution]()).round();
		}

		return null;
	},

	getLastDayOfMonth: function(){
		return Date.daysInMonth(this.get('mo'), this.get('year'));
	},

	getDayOfYear: function(){
		return (Date.UTC(this.get('year'), this.get('mo'), this.get('date') + 1) 
			- Date.UTC(this.get('year'), 0, 1)) / Date.units.day();
	},

	getWeek: function(){
		return (this.get('dayofyear') / 7).ceil();
	},
	
	getOrdinal: function(day){
		return Date.getMsg('ordinal', day || this.get('date'));
	},

	getTimezone: function(){
		return this.toString()
			.replace(/^.*? ([A-Z]{3}).[0-9]{4}.*$/, '$1')
			.replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, '$1$2$3');
	},

	getGMTOffset: function(){
		var off = this.get('timezoneOffset');
		return ((off > 0) ? '-' : '+') + zeroize((off.abs() / 60).floor(), 2) + zeroize(off % 60, 2);
	},

	setAMPM: function(ampm){
		ampm = ampm.toUpperCase();
		var hr = this.get('hr');
		if (hr > 11 && ampm == 'AM') return this.decrement('hour', 12);
		else if (hr < 12 && ampm == 'PM') return this.increment('hour', 12);
		return this;
	},

	getAMPM: function(){
		return (this.get('hr') < 12) ? 'AM' : 'PM';
	},

	parse: function(str){
		this.set('time', Date.parse(str));
		return this;
	},

	isValid: function(date) {
		return !!(date || this).valueOf();
	},

	format: function(f){
		if (!this.isValid()) return 'invalid date';
		f = f || '%x %X';
		f = formats[f.toLowerCase()] || f; // replace short-hand with actual format
		var d = this;
		return f.replace(/%([a-z%])/gi,
			function($1, $2){
				switch ($2){
					case 'a': return Date.getMsg('days')[d.get('day')].substr(0, 3);
					case 'A': return Date.getMsg('days')[d.get('day')];
					case 'b': return Date.getMsg('months')[d.get('month')].substr(0, 3);
					case 'B': return Date.getMsg('months')[d.get('month')];
					case 'c': return d.toString();
					case 'd': return zeroize(d.get('date'), 2);
					case 'H': return zeroize(d.get('hr'), 2);
					case 'I': return ((d.get('hr') % 12) || 12);
					case 'j': return zeroize(d.get('dayofyear'), 3);
					case 'm': return zeroize((d.get('mo') + 1), 2);
					case 'M': return zeroize(d.get('min'), 2);
					case 'o': return d.get('ordinal');
					case 'p': return Date.getMsg(d.get('ampm'));
					case 'S': return zeroize(d.get('seconds'), 2);
					case 'U': return zeroize(d.get('week'), 2);
					case 'w': return d.get('day');
					case 'x': return d.format(Date.getMsg('shortDate'));
					case 'X': return d.format(Date.getMsg('shortTime'));
					case 'y': return d.get('year').toString().substr(2);
					case 'Y': return d.get('year');
					case 'T': return d.get('GMTOffset');
					case 'Z': return d.get('Timezone');
				}
				return $2;
			}
		);
	},

	toISOString: function(){
		return this.format('iso8601');
	}

});

Date.alias('diff', 'compare');
Date.alias('format', 'strftime');

var formats = {
	db: '%Y-%m-%d %H:%M:%S',
	compact: '%Y%m%dT%H%M%S',
	iso8601: '%Y-%m-%dT%H:%M:%S%T',
	rfc822: '%a, %d %b %Y %H:%M:%S %Z',
	'short': '%d %b %H:%M',
	'long': '%B %d, %Y %H:%M'
};

var nativeParse = Date.parse;

var parseWord = function(type, word, num){
	var ret = -1;
	var translated = Date.getMsg(type + 's');

	switch ($type(word)){
		case 'object':
			ret = translated[word.get(type)];
			break;
		case 'number':
			ret = translated[month - 1];
			if (!ret) throw new Error('Invalid ' + type + ' index: ' + index);
			break;
		case 'string':
			var match = translated.filter(function(name){
				return this.test(name);
			}, new RegExp('^' + word, 'i'));
			if (!match.length)    throw new Error('Invalid ' + type + ' string');
			if (match.length > 1) throw new Error('Ambiguous ' + type);
			ret = match[0];
	}

	return (num) ? translated.indexOf(ret) : ret;
};


Date.extend({

	getMsg: function(key, args) {
		return MooTools.lang.get('Date', key, args);
	},

	units: {
		ms: $lambda(1),
		second: $lambda(1000),
		minute: $lambda(60000),
		hour: $lambda(3600000),
		day: $lambda(86400000),
		week: $lambda(608400000),
		month: function(month, year){
			var d = new Date;
			return Date.daysInMonth($pick(month, d.get('mo')), $pick(year, d.get('year'))) * 86400000;
		},
		year: function(year){
			year = year || new Date().get('year');
			return Date.isLeapYear(year) ? 31622400000 : 31536000000;
		}
	},

	daysInMonth: function(month, year){
		return [31, Date.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	},

	isLeapYear: function(year){
		return new Date(year, 1, 29).get('date') == 29;
	},

	parse: function(from){
		var t = $type(from);
		if (t == 'number') return new Date(from);
		if (t != 'string') return from;
		from = from.clean();
		if (!from.length) return null;

		var parsed;
		Date.parsePatterns.some(function(pattern){
			var r = pattern.re.exec(from);
			return (r) ? (parsed = pattern.handler(r)) : false;
		});

		return parsed || new Date(nativeParse(from));
	},

	parseDay: function(day, num){
		return parseWord('day', day, num);
	},

	parseMonth: function(month, num){
		return parseWord('month', month, num);
	},

	parseUTC: function(value){
		var localDate = new Date(value);
		var utcSeconds = Date.UTC(localDate.get('year'), 
		localDate.get('mo'),
		localDate.get('date'), 
		localDate.get('hr'), 
		localDate.get('min'), 
		localDate.get('sec'));
		return new Date(utcSeconds);
	},

	orderIndex: function(unit){
		return Date.getMsg('dateOrder').indexOf(unit) + 1;
	},

	defineFormat: function(name, format){
		formats[name] = format;
	},

	defineFormats: function(formats){
		for (var name in formats) Date.defineFormat(name, formats[f]);
	},

	parsePatterns: [],
	
	defineParser: function(pattern){
		Date.parsePatterns.push( pattern.re && pattern.handler ? pattern : build(pattern) );
	},
	
	defineParsers: function(){
		Array.flatten(arguments).each(Date.defineParser);
	},
	
	define2DigitYearStart: function(year){
		yr_start = year % 100;
		yr_base = year - yr_start;
	}

});

var yr_base = 1900;
var yr_start = 70;

var replacers = function(key){
	switch(key){
		case 'x': // iso8601 covers yyyy-mm-dd, so just check if month is first
			return (Date.orderIndex('month') == 1) ? '%m[.-/]%d([.-/]%y)?' : '%d[.-/]%m([.-/]%y)?';
		case 'X':
			return '%H([.:]%M)?([.:]%S([.:]%s)?)?\\s?%p?\\s?%T?';
		case 'o':
			return '[^\\d\\s]*';
	}
	return null;
};

var keys = {
	a: /[a-z]{3,}/,
	d: /[0-2]?[0-9]|3[01]/,
	H: /[01]?[0-9]|2[0-3]/,
	I: /0?[1-9]|1[0-2]/,
	M: /[0-5]?\d/,
	s: /\d+/,
	p: /[ap]\.?m\.?/,
	y: /\d{2}|\d{4}/,
	Y: /\d{4}/,
	T: /Z|[+-]\d{2}(?::?\d{2})?/
};

keys.B = keys.b = keys.A = keys.a;
keys.m = keys.I;
keys.S = keys.M;

var lang;

var build = function(format){
	if (!lang) return {format: format}; // wait until language is set
	
	var parsed = [null];

	var re = (format.source || format) // allow format to be regex
	 .replace(/%([a-z])/gi,
		function($1, $2){
			return replacers($2) || $1;
		}
	).replace(/\((?!\?)/g, '(?:') // make all groups non-capturing
	 .replace(/ (?!\?|\*)/g, ',? ') // be forgiving with spaces and commas
	 .replace(/%([a-z%])/gi,
		function($1, $2){
			var p = keys[$2];
			if (!p) return $2;
			parsed.push($2);
			return '(' + p.source + ')';
		}
	);

	return {
		format: format,
		re: new RegExp('^' + re + '$', 'i'),
		handler: function(bits){
			var date = new Date().clearTime();
			for (var i = 1; i < parsed.length; i++)
				date = handle.call(date, parsed[i], bits[i]);
			return date;
		}
	};
};

var handle = function(key, value){
	if (!value){
		if (key == 'm' || key == 'd') value = 1;
		else return this;
	}

	switch(key){
		case 'a': case 'A': return this.set('day', Date.parseDay(value, true));
		case 'b': case 'B': return this.set('mo', Date.parseMonth(value, true));
		case 'd': return this.set('date', value);
		case 'H': case 'I': return this.set('hr', value);
		case 'm': return this.set('mo', value - 1);
		case 'M': return this.set('min', value);
		case 'p': return this.set('ampm', value.replace(/\./g, ''));
		case 'S': return this.set('sec', value);
		case 's': return this.set('ms', ('0.' + value) * 1000);
		case 'w': return this.set('day', value);
		case 'Y': return this.set('year', value);
		case 'y':
			value = +value;
			if (value < 100) value += yr_base + (value < yr_start ? 100 : 0);
			return this.set('year', value);
		case 'T':
			if (value == 'Z') value = '+00';
			var offset = value.match(/([+-])(\d{2}):?(\d{2})?/);
			offset = (offset[1] + '1') * (offset[2] * 60 + (+offset[3] || 0)) + this.getTimezoneOffset();
			return this.set('time', (this * 1) - offset * 60000);
	}

	return this;
};

Date.defineParsers(
	'%Y([-./]%m([-./]%d((T| )%X)?)?)?', // "1999-12-31", "1999-12-31 11:59pm", "1999-12-31 23:59:59", ISO8601
	'%Y%m%d(T%H(%M%S?)?)?', // "19991231", "19991231T1159", compact
	'%x( %X)?', // "12/31", "12.31.99", "12-31-1999", "12/31/2008 11:59 PM"
	'%d%o( %b( %Y)?)?( %X)?', // "31st", "31st December", "31 Dec 1999", "31 Dec 1999 11:59pm"
	'%b %d%o?( %Y)?( %X)?', // Same as above with month and day switched
	'%b %Y' // "December 1999"
);

MooTools.lang.addEvent('langChange', function(language){
	if (!MooTools.lang.get('Date')) return;

	lang = language;
	Date.parsePatterns.each(function(pattern, i){
		if (pattern.format) Date.parsePatterns[i] = build(pattern.format);
	});

}).fireEvent('langChange', MooTools.lang.getCurrentLanguage());

})();

/*
Script: Hash.Extras.js
	Extends the Hash native object to include getFromPath which allows a path notation to child elements.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

Hash.implement({

	getFromPath: function(notation){
		var source = this.getClean();
		notation.replace(/\[([^\]]+)\]|\.([^.[]+)|[^[.]+/g, function(match){
			if (!source) return null;
			var prop = arguments[2] || arguments[1] || arguments[0];
			source = (prop in source) ? source[prop] : null;
			return match;
		});
		return source;
	},

	cleanValues: function(method){
		method = method || $defined;
		this.each(function(v, k){
			if (!method(v)) this.erase(k);
		}, this);
		return this;
	},

	run: function(){
		var args = arguments;
		this.each(function(v, k){
			if ($type(v) == 'function') v.run(args);
		});
	}

});

/*
Script: String.Extras.js
	Extends the String native object to include methods useful in managing various kinds of strings (query strings, urls, html, etc).

	License:
		MIT-style license.

	Authors:
		Aaron Newton
		Guillermo Rauch

*/

(function(){
  
var special = ['À','à','Á','á','Â','â','Ã','ã','Ä','ä','Å','å','Ă','ă','Ą','ą','Ć','ć','Č','č','Ç','ç', 'Ď','ď','Đ','đ', 'È','è','É','é','Ê','ê','Ë','ë','Ě','ě','Ę','ę', 'Ğ','ğ','Ì','ì','Í','í','Î','î','Ï','ï', 'Ĺ','ĺ','Ľ','ľ','Ł','ł', 'Ñ','ñ','Ň','ň','Ń','ń','Ò','ò','Ó','ó','Ô','ô','Õ','õ','Ö','ö','Ø','ø','ő','Ř','ř','Ŕ','ŕ','Š','š','Ş','ş','Ś','ś', 'Ť','ť','Ť','ť','Ţ','ţ','Ù','ù','Ú','ú','Û','û','Ü','ü','Ů','ů', 'Ÿ','ÿ','ý','Ý','Ž','ž','Ź','ź','Ż','ż', 'Þ','þ','Ð','ð','ß','Œ','œ','Æ','æ','µ'];

var standard = ['A','a','A','a','A','a','A','a','Ae','ae','A','a','A','a','A','a','C','c','C','c','C','c','D','d','D','d', 'E','e','E','e','E','e','E','e','E','e','E','e','G','g','I','i','I','i','I','i','I','i','L','l','L','l','L','l', 'N','n','N','n','N','n', 'O','o','O','o','O','o','O','o','Oe','oe','O','o','o', 'R','r','R','r', 'S','s','S','s','S','s','T','t','T','t','T','t', 'U','u','U','u','U','u','Ue','ue','U','u','Y','y','Y','y','Z','z','Z','z','Z','z','TH','th','DH','dh','ss','OE','oe','AE','ae','u'];

var tidymap = {
	"[\xa0\u2002\u2003\u2009]": " ",
	"\xb7": "*",
	"[\u2018\u2019]": "'",
	"[\u201c\u201d]": '"',
	"\u2026": "...",
	"\u2013": "-",
	"\u2014": "--",
	"\uFFFD": "&raquo;"
};

String.implement({

	standardize: function(){
		var text = this;
		special.each(function(ch, i){
			text = text.replace(new RegExp(ch, 'g'), standard[i]);
		});
		return text;
	},

	repeat: function(times){
		return new Array(times + 1).join(this);
	},

	pad: function(length, str, dir){
		if (this.length >= length) return this;
		str = str || ' ';
		var pad = str.repeat(length - this.length).substr(0, length - this.length);
		if (!dir || dir == 'right') return this + pad;
		if (dir == 'left') return pad + this;
		return pad.substr(0, (pad.length / 2).floor()) + this + pad.substr(0, (pad.length / 2).ceil());
	},

	stripTags: function(){
		return this.replace(/<\/?[^>]+>/gi, '');
	},

	tidy: function(){
		var txt = this.toString();
		$each(tidymap, function(value, key){
			txt = txt.replace(new RegExp(key, 'g'), value);
		});
		return txt;
	}

});

})();

/*
Script: Element.Forms.js
	Extends the Element native object to include methods useful in managing inputs.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

Element.implement({

	tidy: function(){
		this.set('value', this.get('value').tidy());
	},

	getTextInRange: function(start, end){
		return this.get('value').substring(start, end);
	},

	getSelectedText: function(){
		if (this.setSelectionRange) return this.getTextInRange(this.getSelectionStart(), this.getSelectionEnd());
		return document.selection.createRange().text;
	},

	getSelectedRange: function() {
		if ($defined(this.selectionStart)) return {start: this.selectionStart, end: this.selectionEnd};
		var pos = {start: 0, end: 0};
		var range = this.getDocument().selection.createRange();
		if (!range || range.parentElement() != this) return pos;
		var dup = range.duplicate();
		if (this.type == 'text') {
			pos.start = 0 - dup.moveStart('character', -100000);
			pos.end = pos.start + range.text.length;
		} else {
			var value = this.get('value');
			var offset = value.length - value.match(/[\n\r]*$/)[0].length;
			dup.moveToElementText(this);
			dup.setEndPoint('StartToEnd', range);
			pos.end = offset - dup.text.length;
			dup.setEndPoint('StartToStart', range);
			pos.start = offset - dup.text.length;
		}
		return pos;
	},

	getSelectionStart: function(){
		return this.getSelectedRange().start;
	},

	getSelectionEnd: function(){
		return this.getSelectedRange().end;
	},

	setCaretPosition: function(pos){
		if (pos == 'end') pos = this.get('value').length;
		this.selectRange(pos, pos);
		return this;
	},

	getCaretPosition: function(){
		return this.getSelectedRange().start;
	},

	selectRange: function(start, end){
		if (this.setSelectionRange) {
			this.focus();
			this.setSelectionRange(start, end);
		} else {
			var value = this.get('value');
			var diff = value.substr(start, end - start).replace(/\r/g, '').length;
			start = value.substr(0, start).replace(/\r/g, '').length;
			var range = this.createTextRange();
			range.collapse(true);
			range.moveEnd('character', start + diff);
			range.moveStart('character', start);
			range.select();
		}
		return this;
	},

	insertAtCursor: function(value, select){
		var pos = this.getSelectedRange();
		var text = this.get('value');
		this.set('value', text.substring(0, pos.start) + value + text.substring(pos.end, text.length));
		if ($pick(select, true)) this.selectRange(pos.start, pos.start + value.length);
		else this.setCaretPosition(pos.start + value.length);
		return this;
	},

	insertAroundCursor: function(options, select){
		options = $extend({
			before: '',
			defaultMiddle: '',
			after: ''
		}, options);
		var value = this.getSelectedText() || options.defaultMiddle;
		var pos = this.getSelectedRange();
		var text = this.get('value');
		if (pos.start == pos.end){
			this.set('value', text.substring(0, pos.start) + options.before + value + options.after + text.substring(pos.end, text.length));
			this.selectRange(pos.start + options.before.length, pos.end + options.before.length + value.length);
		} else {
			var current = text.substring(pos.start, pos.end);
			this.set('value', text.substring(0, pos.start) + options.before + current + options.after + text.substring(pos.end, text.length));
			var selStart = pos.start + options.before.length;
			if ($pick(select, true)) this.selectRange(selStart, selStart + current.length);
			else this.setCaretPosition(selStart + text.length);
		}
		return this;
	}

});

/*
Script: Element.Measure.js
	Extends the Element native object to include methods useful in measuring dimensions.

	Element.measure / .expose methods by Daniel Steigerwald
	License: MIT-style license.
	Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

Element.implement({

	measure: function(fn){
		var vis = function(el) {
			return !!(!el || el.offsetHeight || el.offsetWidth);
		};
		if (vis(this)) return fn.apply(this);
		var parent = this.getParent(),
			toMeasure = [], 
			restorers = [];
		while (!vis(parent) && parent != document.body) {
			toMeasure.push(parent.expose());
			parent = parent.getParent();
		}
		var restore = this.expose();
		var result = fn.apply(this);
		restore();
		toMeasure.each(function(restore){
			restore();
		});
		return result;
	},

	expose: function(){
		if (this.getStyle('display') != 'none') return $empty;
		var before = this.style.cssText;
		this.setStyles({
			display: 'block',
			position: 'absolute',
			visibility: 'hidden'
		});
		return function(){
			this.style.cssText = before;
		}.bind(this);
	},

	getDimensions: function(options){
		options = $merge({computeSize: false},options);
		var dim = {};
		var getSize = function(el, options){
			return (options.computeSize)?el.getComputedSize(options):el.getSize();
		};
		if (this.getStyle('display') == 'none'){
			dim = this.measure(function(){
				return getSize(this, options);
			});
		} else {
			try { //safari sometimes crashes here, so catch it
				dim = getSize(this, options);
			}catch(e){}
		}
		return $chk(dim.x) ? $extend(dim, {width: dim.x, height: dim.y}) : $extend(dim, {x: dim.width, y: dim.height});
	},

	getComputedSize: function(options){
		options = $merge({
			styles: ['padding','border'],
			plains: {
				height: ['top','bottom'],
				width: ['left','right']
			},
			mode: 'both'
		}, options);
		var size = {width: 0,height: 0};
		switch (options.mode){
			case 'vertical':
				delete size.width;
				delete options.plains.width;
				break;
			case 'horizontal':
				delete size.height;
				delete options.plains.height;
				break;
		}
		var getStyles = [];
		//this function might be useful in other places; perhaps it should be outside this function?
		$each(options.plains, function(plain, key){
			plain.each(function(edge){
				options.styles.each(function(style){
					getStyles.push((style == 'border') ? style + '-' + edge + '-' + 'width' : style + '-' + edge);
				});
			});
		});
		var styles = {};
		getStyles.each(function(style){ styles[style] = this.getComputedStyle(style); }, this);
		var subtracted = [];
		$each(options.plains, function(plain, key){ //keys: width, height, plains: ['left', 'right'], ['top','bottom']
			var capitalized = key.capitalize();
			size['total' + capitalized] = 0;
			size['computed' + capitalized] = 0;
			plain.each(function(edge){ //top, left, right, bottom
				size['computed' + edge.capitalize()] = 0;
				getStyles.each(function(style, i){ //padding, border, etc.
					//'padding-left'.test('left') size['totalWidth'] = size['width'] + [padding-left]
					if (style.test(edge)){
						styles[style] = styles[style].toInt() || 0; //styles['padding-left'] = 5;
						size['total' + capitalized] = size['total' + capitalized] + styles[style];
						size['computed' + edge.capitalize()] = size['computed' + edge.capitalize()] + styles[style];
					}
					//if width != width (so, padding-left, for instance), then subtract that from the total
					if (style.test(edge) && key != style &&
						(style.test('border') || style.test('padding')) && !subtracted.contains(style)){
						subtracted.push(style);
						size['computed' + capitalized] = size['computed' + capitalized]-styles[style];
					}
				});
			});
		});

		['Width', 'Height'].each(function(value){
			var lower = value.toLowerCase();
			if(!$chk(size[lower])) return;

			size[lower] = size[lower] + this['offset' + value] + size['computed' + value];
			size['total' + value] = size[lower] + size['total' + value];
			delete size['computed' + value];
		}, this);

		return $extend(styles, size);
	}

});

/*
Script: Element.Pin.js
	Extends the Element native object to include the pin method useful for fixed positioning for elements.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

(function(){
	var supportsPositionFixed = false;
	window.addEvent('domready', function(){
		var test = new Element('div').setStyles({
			position: 'fixed',
			top: 0,
			right: 0
		}).inject(document.body);
		supportsPositionFixed = (test.offsetTop === 0);
		test.dispose();
	});

	Element.implement({

		pin: function(enable){
			if (this.getStyle('display') == 'none') return null;
			
			var p;
			if (enable !== false){
				p = this.getPosition();
				if (!this.retrieve('pinned')){
					var pos = {
						top: p.y - window.getScroll().y,
						left: p.x - window.getScroll().x
					};
					if (supportsPositionFixed){
						this.setStyle('position', 'fixed').setStyles(pos);
					} else {
						this.store('pinnedByJS', true);
						this.setStyles({
							position: 'absolute',
							top: p.y,
							left: p.x
						});
						this.store('scrollFixer', (function(){
							if (this.retrieve('pinned'))
								this.setStyles({
									top: pos.top.toInt() + window.getScroll().y,
									left: pos.left.toInt() + window.getScroll().x
								});
						}).bind(this));
						window.addEvent('scroll', this.retrieve('scrollFixer'));
					}
					this.store('pinned', true);
				}
			} else {
				var op;
				if (!Browser.Engine.trident){
					if (this.getParent().getComputedStyle('position') != 'static') op = this.getParent();
					else op = this.getParent().getOffsetParent();
				}
				p = this.getPosition(op);
				this.store('pinned', false);
				var reposition;
				if (supportsPositionFixed && !this.retrieve('pinnedByJS')){
					reposition = {
						top: p.y + window.getScroll().y,
						left: p.x + window.getScroll().x
					};
				} else {
					this.store('pinnedByJS', false);
					window.removeEvent('scroll', this.retrieve('scrollFixer'));
					reposition = {
						top: p.y,
						left: p.x
					};
				}
				this.setStyles($merge(reposition, {position: 'absolute'}));
			}
			return this.addClass('isPinned');
		},

		unpin: function(){
			return this.pin(false).removeClass('isPinned');
		},

		togglepin: function(){
			this.pin(!this.retrieve('pinned'));
		}

	});

})();

/*
Script: Element.Position.js
	Extends the Element native object to include methods useful positioning elements relative to others.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

(function(){

var original = Element.prototype.position;

Element.implement({

	position: function(options){
		//call original position if the options are x/y values
		if (options && ($defined(options.x) || $defined(options.y))) return original ? original.apply(this, arguments) : this;
		$each(options||{}, function(v, k){ if (!$defined(v)) delete options[k]; });
		options = $merge({
			relativeTo: document.body,
			position: {
				x: 'center', //left, center, right
				y: 'center' //top, center, bottom
			},
			edge: false,
			offset: {x: 0, y: 0},
			returnPos: false,
			relFixedPosition: false,
			ignoreMargins: false,
			allowNegative: false
		}, options);
		//compute the offset of the parent positioned element if this element is in one
		var parentOffset = {x: 0, y: 0};
		var parentPositioned = false;
		/* dollar around getOffsetParent should not be necessary, but as it does not return
		 * a mootools extended element in IE, an error occurs on the call to expose. See:
		 * http://mootools.lighthouseapp.com/projects/2706/tickets/333-element-getoffsetparent-inconsistency-between-ie-and-other-browsers */
		var offsetParent = this.measure(function(){
			return document.id(this.getOffsetParent());
		});
		if (offsetParent && offsetParent != this.getDocument().body){
			parentOffset = offsetParent.measure(function(){
				return this.getPosition();
			});
			parentPositioned = true;
			options.offset.x = options.offset.x - parentOffset.x;
			options.offset.y = options.offset.y - parentOffset.y;
		}
		//upperRight, bottomRight, centerRight, upperLeft, bottomLeft, centerLeft
		//topRight, topLeft, centerTop, centerBottom, center
		var fixValue = function(option){
			if ($type(option) != 'string') return option;
			option = option.toLowerCase();
			var val = {};
			if (option.test('left')) val.x = 'left';
			else if (option.test('right')) val.x = 'right';
			else val.x = 'center';
			if (option.test('upper') || option.test('top')) val.y = 'top';
			else if (option.test('bottom')) val.y = 'bottom';
			else val.y = 'center';
			return val;
		};
		options.edge = fixValue(options.edge);
		options.position = fixValue(options.position);
		if (!options.edge){
			if (options.position.x == 'center' && options.position.y == 'center') options.edge = {x:'center', y:'center'};
			else options.edge = {x:'left', y:'top'};
		}

		this.setStyle('position', 'absolute');
		var rel = document.id(options.relativeTo) || document.body;
		var calc = rel == document.body ? window.getScroll() : rel.getPosition();
		var top = calc.y;
		var left = calc.x;

		if (Browser.Engine.trident){
			var scrolls = rel.getScrolls();
			top += scrolls.y;
			left += scrolls.x;
		}

		var dim = this.getDimensions({computeSize: true, styles:['padding', 'border','margin']});
		if (options.ignoreMargins){
			options.offset.x = options.offset.x - dim['margin-left'];
			options.offset.y = options.offset.y - dim['margin-top'];
		}
		var pos = {};
		var prefY = options.offset.y;
		var prefX = options.offset.x;
		var winSize = window.getSize();
		switch(options.position.x){
			case 'left':
				pos.x = left + prefX;
				break;
			case 'right':
				pos.x = left + prefX + rel.offsetWidth;
				break;
			default: //center
				pos.x = left + ((rel == document.body ? winSize.x : rel.offsetWidth)/2) + prefX;
				break;
		}
		switch(options.position.y){
			case 'top':
				pos.y = top + prefY;
				break;
			case 'bottom':
				pos.y = top + prefY + rel.offsetHeight;
				break;
			default: //center
				pos.y = top + ((rel == document.body ? winSize.y : rel.offsetHeight)/2) + prefY;
				break;
		}

		if (options.edge){
			var edgeOffset = {};

			switch(options.edge.x){
				case 'left':
					edgeOffset.x = 0;
					break;
				case 'right':
					edgeOffset.x = -dim.x-dim.computedRight-dim.computedLeft;
					break;
				default: //center
					edgeOffset.x = -(dim.x/2);
					break;
			}
			switch(options.edge.y){
				case 'top':
					edgeOffset.y = 0;
					break;
				case 'bottom':
					edgeOffset.y = -dim.y-dim.computedTop-dim.computedBottom;
					break;
				default: //center
					edgeOffset.y = -(dim.y/2);
					break;
			}
			pos.x = pos.x + edgeOffset.x;
			pos.y = pos.y + edgeOffset.y;
		}
		pos = {
			left: ((pos.x >= 0 || parentPositioned || options.allowNegative) ? pos.x : 0).toInt(),
			top: ((pos.y >= 0 || parentPositioned || options.allowNegative) ? pos.y : 0).toInt()
		};
		if (rel.getStyle('position') == 'fixed' || options.relFixedPosition){
			var winScroll = window.getScroll();
			pos.top = pos.top.toInt() + winScroll.y;
			pos.left = pos.left.toInt() + winScroll.x;
		}

		if (options.returnPos) return pos;
		else this.setStyles(pos);
		return this;
	}

});

})();

/*
Script: Element.Shortcuts.js
	Extends the Element native object to include some shortcut methods.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

Element.implement({

	isDisplayed: function(){
		return this.getStyle('display') != 'none';
	},

	toggle: function(){
		return this[this.isDisplayed() ? 'hide' : 'show']();
	},

	hide: function(){
		var d;
		try {
			//IE fails here if the element is not in the dom
			if ('none' != this.getStyle('display')) d = this.getStyle('display');
		} catch(e){}

		return this.store('originalDisplay', d || 'block').setStyle('display', 'none');
	},

	show: function(display){
		return this.setStyle('display', display || this.retrieve('originalDisplay') || 'block');
	},

	swapClass: function(remove, add){
		return this.removeClass(remove).addClass(add);
	}

});


/*
Script: FormValidator.js
	A css-class based form validation system.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/
var InputValidator = new Class({

	Implements: [Options],

	options: {
		errorMsg: 'Validation failed.',
		test: function(field){return true;}
	},

	initialize: function(className, options){
		this.setOptions(options);
		this.className = className;
	},

	test: function(field, props){
		if (document.id(field)) return this.options.test(document.id(field), props||this.getProps(field));
		else return false;
	},

	getError: function(field, props){
		var err = this.options.errorMsg;
		if ($type(err) == 'function') err = err(document.id(field), props||this.getProps(field));
		return err;
	},

	getProps: function(field){
		if (!document.id(field)) return {};
		return field.get('validatorProps');
	}

});

Element.Properties.validatorProps = {

	set: function(props){
		return this.eliminate('validatorProps').store('validatorProps', props);
	},

	get: function(props){
		if (props) this.set(props);
		if (this.retrieve('validatorProps')) return this.retrieve('validatorProps');
		if (this.getProperty('validatorProps')){
			try {
				this.store('validatorProps', JSON.decode(this.getProperty('validatorProps')));
			}catch(e){
				return {};
			}
		} else {
			var vals = this.get('class').split(' ').filter(function(cls){
				return cls.test(':');
			});
			if (!vals.length){
				this.store('validatorProps', {});
			} else {
				props = {};
				vals.each(function(cls){
					var split = cls.split(':');
					if (split[1]) {
						try {
							props[split[0]] = JSON.decode(split[1]);
						} catch(e) {}
					}
				});
				this.store('validatorProps', props);
			}
		}
		return this.retrieve('validatorProps');
	}

};

var FormValidator = new Class({

	Implements:[Options, Events],

	Binds: ['onSubmit'],

	options: {/*
		onFormValidate: $empty(isValid, form, event),
		onElementValidate: $empty(isValid, field, className, warn),
		onElementPass: $empty(field),
		onElementFail: $empty(field, validatorsFailed) */
		fieldSelectors: 'input, select, textarea',
		ignoreHidden: true,
		useTitles: false,
		evaluateOnSubmit: true,
		evaluateFieldsOnBlur: true,
		evaluateFieldsOnChange: true,
		serial: true,
		stopOnFailure: true,
		warningPrefix: function(){
			return FormValidator.getMsg('warningPrefix') || 'Warning: ';
		},
		errorPrefix: function(){
			return FormValidator.getMsg('errorPrefix') || 'Error: ';
		}
	},

	initialize: function(form, options){
		this.setOptions(options);
		this.element = document.id(form);
		this.element.store('validator', this);
		this.warningPrefix = $lambda(this.options.warningPrefix)();
		this.errorPrefix = $lambda(this.options.errorPrefix)();
		if (this.options.evaluateOnSubmit) this.element.addEvent('submit', this.onSubmit);
		if (this.options.evaluateFieldsOnBlur || this.options.evaluateFieldsOnChange) this.watchFields(this.getFields());
	},

	toElement: function(){
		return this.element;
	},

	getFields: function(){
		return (this.fields = this.element.getElements(this.options.fieldSelectors));
	},

	watchFields: function(fields){
		fields.each(function(el){
			if (this.options.evaluateFieldsOnBlur)
				el.addEvent('blur', this.validationMonitor.pass([el, false], this));
			if (this.options.evaluateFieldsOnChange)
				el.addEvent('change', this.validationMonitor.pass([el, true], this));
		}, this);
	},

	validationMonitor: function(){
		$clear(this.timer);
		this.timer = this.validateField.delay(50, this, arguments);
	},

	onSubmit: function(event){
		if (!this.validate(event) && event) event.preventDefault();
		else this.reset();
	},

	reset: function(){
		this.getFields().each(this.resetField, this);
		return this;
	},

	validate: function(event){
		var result = this.getFields().map(function(field){
			return this.validateField(field, true);
		}, this).every(function(v){ return v;});
		this.fireEvent('formValidate', [result, this.element, event]);
		if (this.options.stopOnFailure && !result && event) event.preventDefault();
		return result;
	},

	validateField: function(field, force){
		if (this.paused) return true;
		field = document.id(field);
		var passed = !field.hasClass('validation-failed');
		var failed, warned;
		if (this.options.serial && !force){
			failed = this.element.getElement('.validation-failed');
			warned = this.element.getElement('.warning');
		}
		if (field && (!failed || force || field.hasClass('validation-failed') || (failed && !this.options.serial))){
			var validators = field.className.split(' ').some(function(cn){
				return this.getValidator(cn);
			}, this);
			var validatorsFailed = [];
			field.className.split(' ').each(function(className){
				if (className && !this.test(className, field)) validatorsFailed.include(className);
			}, this);
			passed = validatorsFailed.length === 0;
			if (validators && !field.hasClass('warnOnly')){
				if (passed){
					field.addClass('validation-passed').removeClass('validation-failed');
					this.fireEvent('elementPass', field);
				} else {
					field.addClass('validation-failed').removeClass('validation-passed');
					this.fireEvent('elementFail', [field, validatorsFailed]);
				}
			}
			if (!warned){
				var warnings = field.className.split(' ').some(function(cn){
					if (cn.test('^warn-') || field.hasClass('warnOnly'))
						return this.getValidator(cn.replace(/^warn-/,''));
					else return null;
				}, this);
				field.removeClass('warning');
				var warnResult = field.className.split(' ').map(function(cn){
					if (cn.test('^warn-') || field.hasClass('warnOnly'))
						return this.test(cn.replace(/^warn-/,''), field, true);
					else return null;
				}, this);
			}
		}
		return passed;
	},

	test: function(className, field, warn){
		var validator = this.getValidator(className);
		field = document.id(field);
		if (field.hasClass('ignoreValidation')) return true;
		warn = $pick(warn, false);
		if (field.hasClass('warnOnly')) warn = true;
		var isValid = validator ? validator.test(field) : true;
		if (validator && this.isVisible(field)) this.fireEvent('elementValidate', [isValid, field, className, warn]);
		if (warn) return true;
		return isValid;
	},

	isVisible : function(field){
		if (!this.options.ignoreHidden) return true;
		while(field != document.body){
			if (document.id(field).getStyle('display') == 'none') return false;
			field = field.getParent();
		}
		return true;
	},

	resetField: function(field){
		field = document.id(field);
		if (field){
			field.className.split(' ').each(function(className){
				if (className.test('^warn-')) className = className.replace(/^warn-/, '');
				field.removeClass('validation-failed');
				field.removeClass('warning');
				field.removeClass('validation-passed');
			}, this);
		}
		return this;
	},

	stop: function(){
		this.paused = true;
		return this;
	},

	start: function(){
		this.paused = false;
		return this;
	},

	ignoreField: function(field, warn){
		field = document.id(field);
		if (field){
			this.enforceField(field);
			if (warn) field.addClass('warnOnly');
			else field.addClass('ignoreValidation');
		}
		return this;
	},

	enforceField: function(field){
		field = document.id(field);
		if (field) field.removeClass('warnOnly').removeClass('ignoreValidation');
		return this;
	}

});

FormValidator.getMsg = function(key){
	return MooTools.lang.get('FormValidator', key);
};

FormValidator.adders = {

	validators:{},

	add : function(className, options){
		this.validators[className] = new InputValidator(className, options);
		//if this is a class (this method is used by instances of FormValidator and the FormValidator namespace)
		//extend these validators into it
		//this allows validators to be global and/or per instance
		if (!this.initialize){
			this.implement({
				validators: this.validators
			});
		}
	},

	addAllThese : function(validators){
		$A(validators).each(function(validator){
			this.add(validator[0], validator[1]);
		}, this);
	},

	getValidator: function(className){
		return this.validators[className.split(':')[0]];
	}

};

$extend(FormValidator, FormValidator.adders);

FormValidator.implement(FormValidator.adders);

FormValidator.add('IsEmpty', {

	errorMsg: false,
	test: function(element){
		if (element.type == 'select-one' || element.type == 'select')
			return !(element.selectedIndex >= 0 && element.options[element.selectedIndex].value != '');
		else
			return ((element.get('value') == null) || (element.get('value').length == 0));
	}

});

FormValidator.addAllThese([

	['required', {
		errorMsg: function(){
			return FormValidator.getMsg('required');
		},
		test: function(element){
			return !FormValidator.getValidator('IsEmpty').test(element);
		}
	}],

	['minLength', {
		errorMsg: function(element, props){
			if ($type(props.minLength))
				return FormValidator.getMsg('minLength').substitute({minLength:props.minLength,length:element.get('value').length });
			else return '';
		},
		test: function(element, props){
			if ($type(props.minLength)) return (element.get('value').length >= $pick(props.minLength, 0));
			else return true;
		}
	}],

	['maxLength', {
		errorMsg: function(element, props){
			//props is {maxLength:10}
			if ($type(props.maxLength))
				return FormValidator.getMsg('maxLength').substitute({maxLength:props.maxLength,length:element.get('value').length });
			else return '';
		},
		test: function(element, props){
			//if the value is <= than the maxLength value, element passes test
			return (element.get('value').length <= $pick(props.maxLength, 10000));
		}
	}],

	['validate-integer', {
		errorMsg: FormValidator.getMsg.pass('integer'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) || (/^(-?[1-9]\d*|0)$/).test(element.get('value'));
		}
	}],

	['validate-numeric', {
		errorMsg: FormValidator.getMsg.pass('numeric'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) ||
				(/^-?(?:0$0(?=\d*\.)|[1-9]|0)\d*(\.\d+)?$/).test(element.get('value'));
		}
	}],

	['validate-digits', {
		errorMsg: FormValidator.getMsg.pass('digits'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) || (/^[\d() .:\-\+#]+$/.test(element.get('value')));
		}
	}],

	['validate-alpha', {
		errorMsg: FormValidator.getMsg.pass('alpha'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) ||  (/^[a-zA-Z]+$/).test(element.get('value'));
		}
	}],

	['validate-alphanum', {
		errorMsg: FormValidator.getMsg.pass('alphanum'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) || !(/\W/).test(element.get('value'));
		}
	}],

	['validate-date', {
		errorMsg: function(element, props){
			if (Date.parse){
				var format = props.dateFormat || '%x';
				return FormValidator.getMsg('dateSuchAs').substitute({date: new Date().format(format)});
			} else {
				return FormValidator.getMsg('dateInFormatMDY');
			}
		},
		test: function(element, props){
			if (FormValidator.getValidator('IsEmpty').test(element)) return true;
			var d;
			if (Date.parse){
				var format = props.dateFormat || '%x';
				d = Date.parse(element.get('value'));
				var formatted = d.format(format);
				if (formatted != 'invalid date') element.set('value', formatted);
				return !isNaN(d);
			} else {
				var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
				if (!regex.test(element.get('value'))) return false;
				d = new Date(element.get('value').replace(regex, '$1/$2/$3'));
				return (parseInt(RegExp.$1, 10) == (1 + d.getMonth())) &&
					(parseInt(RegExp.$2, 10) == d.getDate()) &&
					(parseInt(RegExp.$3, 10) == d.getFullYear());
			}
		}
	}],

	['validate-email', {
		errorMsg: FormValidator.getMsg.pass('email'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) || (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i).test(element.get('value'));
		}
	}],

	['validate-url', {
		errorMsg: FormValidator.getMsg.pass('url'),
		test: function(element){
			return FormValidator.getValidator('IsEmpty').test(element) || (/^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i).test(element.get('value'));
		}
	}],

	['validate-currency-dollar', {
		errorMsg: FormValidator.getMsg.pass('currencyDollar'),
		test: function(element){
			// [$]1[##][,###]+[.##]
			// [$]1###+[.##]
			// [$]0.##
			// [$].##
			return FormValidator.getValidator('IsEmpty').test(element) ||  (/^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/).test(element.get('value'));
		}
	}],

	['validate-one-required', {
		errorMsg: FormValidator.getMsg.pass('oneRequired'),
		test: function(element, props){
			var p = document.id(props['validate-one-required']) || element.parentNode;
			return p.getElements('input').some(function(el){
				if (['checkbox', 'radio'].contains(el.get('type'))) return el.get('checked');
				return el.get('value');
			});
		}
	}]

]);

Element.Properties.validator = {

	set: function(options){
		var validator = this.retrieve('validator');
		if (validator) validator.setOptions(options);
		return this.store('validator:options');
	},

	get: function(options){
		if (options || !this.retrieve('validator')){
			if (options || !this.retrieve('validator:options')) this.set('validator', options);
			this.store('validator', new FormValidator(this, this.retrieve('validator:options')));
		}
		return this.retrieve('validator');
	}

};

Element.implement({

	validate: function(options){
		this.set('validator', options);
		return this.get('validator', options).validate();
	}

});

/*
Script: FormValidator.Inline.js
	Extends FormValidator to add inline messages.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

FormValidator.Inline = new Class({

	Extends: FormValidator,

	options: {
		scrollToErrorsOnSubmit: true,
		scrollFxOptions: {
			transition: 'quad:out',
			offset: {
				y: -20
			}
		}
	},

	initialize: function(form, options){
		this.parent(form, options);
		this.addEvent('onElementValidate', function(isValid, field, className, warn){
			var validator = this.getValidator(className);
			if (!isValid && validator.getError(field)){
				if (warn) field.addClass('warning');
				var advice = this.makeAdvice(className, field, validator.getError(field), warn);
				this.insertAdvice(advice, field);
				this.showAdvice(className, field);
			} else {
				this.hideAdvice(className, field);
			}
		});
	},

	makeAdvice: function(className, field, error, warn){
		var errorMsg = (warn)?this.warningPrefix:this.errorPrefix;
			errorMsg += (this.options.useTitles) ? field.title || error:error;
		var cssClass = (warn) ? 'warning-advice' : 'validation-advice';
		var advice = this.getAdvice(className, field);
		if(advice) {
			advice = advice.clone(true, true).set('html', errorMsg).replaces(advice);
		} else {
			advice = new Element('div', {
				html: errorMsg,
				styles: { display: 'none' },
				id: 'advice-' + className + '-' + this.getFieldId(field)
			}).addClass(cssClass);
		}
		field.store('advice-' + className, advice);
		return advice;
	},

	getFieldId : function(field){
		return field.id ? field.id : field.id = 'input_' + field.name;
	},

	showAdvice: function(className, field){
		var advice = this.getAdvice(className, field);
		if (advice && !field.retrieve(this.getPropName(className))
				&& (advice.getStyle('display') == 'none'
				|| advice.getStyle('visiblity') == 'hidden'
				|| advice.getStyle('opacity') == 0)){
			field.store(this.getPropName(className), true);
			if (advice.reveal) advice.reveal();
			else advice.setStyle('display', 'block');
		}
	},

	hideAdvice: function(className, field){
		var advice = this.getAdvice(className, field);
		if (advice && field.retrieve(this.getPropName(className))){
			field.store(this.getPropName(className), false);
			//if Fx.Reveal.js is present, transition the advice out
			if (advice.dissolve) advice.dissolve();
			else advice.setStyle('display', 'none');
		}
	},

	getPropName: function(className){
		return 'advice' + className;
	},

	resetField: function(field){
		field = document.id(field);
		if (!field) return this;
		this.parent(field);
		field.className.split(' ').each(function(className){
			this.hideAdvice(className, field);
		}, this);
		return this;
	},

	getAllAdviceMessages: function(field, force){
		var advice = [];
		if (field.hasClass('ignoreValidation') && !force) return advice;
		var validators = field.className.split(' ').some(function(cn){
			var warner = cn.test('^warn-') || field.hasClass('warnOnly');
			if (warner) cn = cn.replace(/^warn-/, '');
			var validator = this.getValidator(cn);
			if (!validator) return;
			advice.push({
				message: validator.getError(field),
				warnOnly: warner,
				passed: validator.test(),
				validator: validator
			});
		}, this);
		return advice;
	},

	getAdvice: function(className, field){
		return field.retrieve('advice-' + className);
	},

	insertAdvice: function(advice, field){
		//Check for error position prop
		var props = field.get('validatorProps');
		//Build advice
		if (!props.msgPos || !document.id(props.msgPos)){
			if(field.type.toLowerCase() == 'radio') field.getParent().adopt(advice);
			else advice.inject(document.id(field), 'after');
		} else {
			document.id(props.msgPos).grab(advice);
		}
	},

	validateField: function(field, force){
		var result = this.parent(field, force);
		if (this.options.scrollToErrorsOnSubmit && !result){
			var failed = document.id(this).getElement('.validation-failed');
			var par = document.id(this).getParent();
			while (par != document.body && par.getScrollSize().y == par.getSize().y){
				par = par.getParent();
			}
			var fx = par.retrieve('fvScroller');
			if (!fx && window.Fx && Fx.Scroll){
				fx = new Fx.Scroll(par, this.options.scrollFxOptions);
				par.store('fvScroller', fx);
			}
			if (failed){
				if (fx) fx.toElement(failed);
				else par.scrollTo(par.getScroll().x, failed.getPosition(par).y - 20);
			}
		}
		return result;
	}

});


/*
Script: FormValidator.Extras.js
	Additional validators for the FormValidator class.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/
FormValidator.addAllThese([

	['validate-enforce-oncheck', {
		test: function(element, props){
			if (element.checked){
				var fv = element.getParent('form').retrieve('validator');
				if (!fv) return true;
				(props.toEnforce || document.id(props.enforceChildrenOf).getElements('input, select, textarea')).map(function(item){
					fv.enforceField(item);
				});
			}
			return true;
		}
	}],

	['validate-ignore-oncheck', {
		test: function(element, props){
			if (element.checked){
				var fv = element.getParent('form').retrieve('validator');
				if (!fv) return true;
				(props.toIgnore || document.id(props.ignoreChildrenOf).getElements('input, select, textarea')).each(function(item){
					fv.ignoreField(item);
					fv.resetField(item);
				});
			}
			return true;
		}
	}],

	['validate-nospace', {
		errorMsg: function(){
			return FormValidator.getMsg('noSpace');
		},
		test: function(element, props){
			return !element.get('value').test(/\s/);
		}
	}],

	['validate-toggle-oncheck', {
		test: function(element, props){
			var fv = element.getParent('form').retrieve('validator');
			if (!fv) return true;
			var eleArr = props.toToggle || document.id(props.toToggleChildrenOf).getElements('input, select, textarea');
			if (!element.checked){
				eleArr.each(function(item){
					fv.ignoreField(item);
					fv.resetField(item);
				});
			} else {
				eleArr.each(function(item){
					fv.enforceField(item);
				});
			}
			return true;
		}
	}],

	['validate-reqchk-bynode', {
		errorMsg: function(){
			return FormValidator.getMsg('reqChkByNode');
		},
		test: function(element, props){
			return (document.id(props.nodeId).getElements(props.selector || 'input[type=checkbox], input[type=radio]')).some(function(item){
				return item.checked;
			});
		}
	}],

	['validate-required-check', {
		errorMsg: function(element, props){
			return props.useTitle ? element.get('title') : FormValidator.getMsg('requiredChk');
		},
		test: function(element, props){
			return !!element.checked;
		}
	}],

	['validate-reqchk-byname', {
		errorMsg: function(element, props){
			return FormValidator.getMsg('reqChkByName').substitute({label: props.label || element.get('type')});
		},
		test: function(element, props){
			var grpName = props.groupName || element.get('name');
			var oneCheckedItem = $$(document.getElementsByName(grpName)).some(function(item, index){
				return item.checked;
			});
			var fv = element.getParent('form').retrieve('validator');
			if (oneCheckedItem && fv) fv.resetField(element);
			return oneCheckedItem;
		}
	}],

	['validate-match', {
		errorMsg: function(element, props){
			return FormValidator.getMsg('match').substitute({matchName: props.matchName || document.id(props.matchInput).get('name')});
		},
		test: function(element, props){
			var eleVal = element.get('value');
			var matchVal = document.id(props.matchInput) && document.id(props.matchInput).get('value');
			return eleVal && matchVal ? eleVal == matchVal : true;
		}
	}],

	['validate-after-date', {
		errorMsg: function(element, props){
			return FormValidator.getMsg('afterDate').substitute({
				label: props.afterLabel || (props.afterElement ? FormValidator.getMsg('startDate') : FormValidator.getMsg('currentDate'))
			});
		},
		test: function(element, props){
			var start = document.id(props.afterElement) ? Date.parse(document.id(props.afterElement).get('value')) : new Date();
			var end = Date.parse(element.get('value'));
			return end && start ? end >= start : true;
		}
	}],

	['validate-before-date', {
		errorMsg: function(element, props){
			return FormValidator.getMsg('beforeDate').substitute({
				label: props.beforeLabel || (props.beforeElement ? FormValidator.getMsg('endDate') : FormValidator.getMsg('currentDate'))
			});
		},
		test: function(element, props){
			var start = Date.parse(element.get('value'));
			var end = document.id(props.beforeElement) ? Date.parse(document.id(props.beforeElement).get('value')) : new Date();
			return end && start ? end >= start : true;
		}
	}],

	['validate-custom-required', {
		errorMsg: function(){
			return FormValidator.getMsg('required');
		},
		test: function(element, props){
			return element.get('value') != props.emptyValue;
		}
	}],

	['validate-same-month', {
		errorMsg: function(element, props){
			var startMo = document.id(props.sameMonthAs) && document.id(props.sameMonthAs).get('value');
			var eleVal = element.get('value');
			if (eleVal != '') return FormValidator.getMsg(startMo ? 'sameMonth' : 'startMonth');
		},
		test: function(element, props){
			var d1 = Date.parse(element.get('value'));
			var d2 = Date.parse(document.id(props.sameMonthAs) && document.id(props.sameMonthAs).get('value'));
			return d1 && d2 ? d1.format('%B') == d2.format('%B') : true;
		}
	}]

]);

/*
Script: OverText.js
	Shows text over an input that disappears when the user clicks into it. The text remains hidden if the user adds a value.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

var OverText = new Class({

	Implements: [Options, Events, Class.Occlude],

	Binds: ['reposition', 'assert', 'focus'],

	options: {/*
		textOverride: null,
		onFocus: $empty()
		onTextHide: $empty(textEl, inputEl),
		onTextShow: $empty(textEl, inputEl), */
		element: 'label',
		positionOptions: {
			position: 'upperLeft',
			edge: 'upperLeft',
			offset: {
				x: 4,
				y: 2
			}
		},
		poll: false,
		pollInterval: 250
	},

	property: 'OverText',

	initialize: function(element, options){
		this.element = document.id(element);
		if (this.occlude()) return this.occluded;
		this.setOptions(options);
		this.attach(this.element);
		OverText.instances.push(this);
		if (this.options.poll) this.poll();
		return this;
	},

	toElement: function(){
		return this.element;
	},

	attach: function(){
		var val = this.options.textOverride || this.element.get('alt') || this.element.get('title');
		if (!val) return;
		this.text = new Element(this.options.element, {
			'class': 'overTxtLabel',
			styles: {
				lineHeight: 'normal',
				position: 'absolute'
			},
			html: val,
			events: {
				click: this.hide.pass(true, this)
			}
		}).inject(this.element, 'after');
		if (this.options.element == 'label') this.text.set('for', this.element.get('id'));
		this.element.addEvents({
			focus: this.focus,
			blur: this.assert,
			change: this.assert
		}).store('OverTextDiv', this.text);
		window.addEvent('resize', this.reposition.bind(this));
		this.assert(true);
		this.reposition();
	},

	startPolling: function(){
		this.pollingPaused = false;
		return this.poll();
	},

	poll: function(stop){
		//start immediately
		//pause on focus
		//resumeon blur
		if (this.poller && !stop) return this;
		var test = function(){
			if (!this.pollingPaused) this.assert(true);
		}.bind(this);
		if (stop) $clear(this.poller);
		else this.poller = test.periodical(this.options.pollInterval, this);
		return this;
	},

	stopPolling: function(){
		this.pollingPaused = true;
		return this.poll(true);
	},

	focus: function(){
		if (!this.text.isDisplayed() || this.element.get('disabled')) return;
		this.hide();
	},

	hide: function(suppressFocus){
		if (this.text.isDisplayed() && !this.element.get('disabled')){
			this.text.hide();
			this.fireEvent('textHide', [this.text, this.element]);
			this.pollingPaused = true;
			try {
				if (!suppressFocus) this.element.fireEvent('focus').focus();
			} catch(e){} //IE barfs if you call focus on hidden elements
		}
		return this;
	},

	show: function(){
		if (!this.text.isDisplayed()){
			this.text.show();
			this.reposition();
			this.fireEvent('textShow', [this.text, this.element]);
			this.pollingPaused = false;
		}
		return this;
	},

	assert: function(suppressFocus){
		this[this.test() ? 'show' : 'hide'](suppressFocus);
	},

	test: function(){
		var v = this.element.get('value');
		return !v;
	},

	reposition: function(){
		this.assert(true);
		if (!this.element.getParent() || !this.element.offsetHeight) return this.stopPolling().hide();
		if (this.test()) this.text.position($merge(this.options.positionOptions, {relativeTo: this.element}));
		return this;
	}

});

OverText.instances = [];

OverText.update = function(){

	return OverText.instances.map(function(ot){
		if (ot.element && ot.text) return ot.reposition();
		return null; //the input or the text was destroyed
	});

};

if (window.Fx && Fx.Reveal) {
	Fx.Reveal.implement({
		hideInputs: Browser.Engine.trident ? 'select, input, textarea, object, embed, .overTxtLabel' : false
	});
}

/*
Script: Fx.Elements.js
	Effect to change any number of CSS properties of any number of Elements.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

Fx.Elements = new Class({

	Extends: Fx.CSS,

	initialize: function(elements, options){
		this.elements = this.subject = $$(elements);
		this.parent(options);
	},

	compute: function(from, to, delta){
		var now = {};
		for (var i in from){
			var iFrom = from[i], iTo = to[i], iNow = now[i] = {};
			for (var p in iFrom) iNow[p] = this.parent(iFrom[p], iTo[p], delta);
		}
		return now;
	},

	set: function(now){
		for (var i in now){
			var iNow = now[i];
			for (var p in iNow) this.render(this.elements[i], p, iNow[p], this.options.unit);
		}
		return this;
	},

	start: function(obj){
		if (!this.check(obj)) return this;
		var from = {}, to = {};
		for (var i in obj){
			var iProps = obj[i], iFrom = from[i] = {}, iTo = to[i] = {};
			for (var p in iProps){
				var parsed = this.prepare(this.elements[i], p, iProps[p]);
				iFrom[p] = parsed.from;
				iTo[p] = parsed.to;
			}
		}
		return this.parent(from, to);
	}

});

/*
Script: Fx.Accordion.js
	An Fx.Elements extension which allows you to easily create accordion type controls.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

var Accordion = Fx.Accordion = new Class({

	Extends: Fx.Elements,

	options: {/*
		onActive: $empty(toggler, section),
		onBackground: $empty(toggler, section),*/
		display: 0,
		show: false,
		height: true,
		width: false,
		opacity: true,
		fixedHeight: false,
		fixedWidth: false,
		wait: false,
		alwaysHide: false,
		trigger: 'click',
		initialDisplayFx: true
	},

	initialize: function(){
		var params = Array.link(arguments, {'container': Element.type, 'options': Object.type, 'togglers': $defined, 'elements': $defined});
		this.parent(params.elements, params.options);
		this.togglers = $$(params.togglers);
		this.container = document.id(params.container);
		this.previous = -1;
		if (this.options.alwaysHide) this.options.wait = true;
		if ($chk(this.options.show)){
			this.options.display = false;
			this.previous = this.options.show;
		}
		if (this.options.start){
			this.options.display = false;
			this.options.show = false;
		}
		this.effects = {};
		if (this.options.opacity) this.effects.opacity = 'fullOpacity';
		if (this.options.width) this.effects.width = this.options.fixedWidth ? 'fullWidth' : 'offsetWidth';
		if (this.options.height) this.effects.height = this.options.fixedHeight ? 'fullHeight' : 'scrollHeight';
		for (var i = 0, l = this.togglers.length; i < l; i++) this.addSection(this.togglers[i], this.elements[i]);
		this.elements.each(function(el, i){
			if (this.options.show === i){
				this.fireEvent('active', [this.togglers[i], el]);
			} else {
				for (var fx in this.effects) el.setStyle(fx, 0);
			}
		}, this);
		if ($chk(this.options.display)) this.display(this.options.display, this.options.initialDisplayFx);
	},

	addSection: function(toggler, element){
		toggler = document.id(toggler);
		element = document.id(element);
		var test = this.togglers.contains(toggler);
		this.togglers.include(toggler);
		this.elements.include(element);
		var idx = this.togglers.indexOf(toggler);
		toggler.addEvent(this.options.trigger, this.display.bind(this, idx));
		if (this.options.height) element.setStyles({'padding-top': 0, 'border-top': 'none', 'padding-bottom': 0, 'border-bottom': 'none'});
		if (this.options.width) element.setStyles({'padding-left': 0, 'border-left': 'none', 'padding-right': 0, 'border-right': 'none'});
		element.fullOpacity = 1;
		if (this.options.fixedWidth) element.fullWidth = this.options.fixedWidth;
		if (this.options.fixedHeight) element.fullHeight = this.options.fixedHeight;
		element.setStyle('overflow', 'hidden');
		if (!test){
			for (var fx in this.effects) element.setStyle(fx, 0);
		}
		return this;
	},

	display: function(index, useFx){
		useFx = $pick(useFx, true);
		index = ($type(index) == 'element') ? this.elements.indexOf(index) : index;
		if ((this.timer && this.options.wait) || (index === this.previous && !this.options.alwaysHide)) return this;
		this.previous = index;
		var obj = {};
		this.elements.each(function(el, i){
			obj[i] = {};
			var hide = (i != index) || (this.options.alwaysHide && (el.offsetHeight > 0));
			this.fireEvent(hide ? 'background' : 'active', [this.togglers[i], el]);
			for (var fx in this.effects) obj[i][fx] = hide ? 0 : el[this.effects[fx]];
		}, this);
		return useFx ? this.start(obj) : this.set(obj);
	}

});

/*
Script: Fx.Move.js
	Defines Fx.Move, a class that works with Element.Position.js to transition an element from one location to another.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

Fx.Move = new Class({

	Extends: Fx.Morph,

	options: {
		relativeTo: document.body,
		position: 'center',
		edge: false,
		offset: {x: 0, y: 0}
	},

	start: function(destination){
		return this.parent(this.element.position($merge(this.options, destination, {returnPos: true})));
	}

});

Element.Properties.move = {

	set: function(options){
		var morph = this.retrieve('move');
		if (morph) morph.cancel();
		return this.eliminate('move').store('move:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('move')){
			if (options || !this.retrieve('move:options')) this.set('move', options);
			this.store('move', new Fx.Move(this, this.retrieve('move:options')));
		}
		return this.retrieve('move');
	}

};

Element.implement({

	move: function(options){
		this.get('move').start(options);
		return this;
	}

});


/*
Script: Fx.Reveal.js
	Defines Fx.Reveal, a class that shows and hides elements with a transition.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

Fx.Reveal = new Class({

	Extends: Fx.Morph,

	options: {/*	  
		onShow: $empty(thisElement),
		onHide: $empty(thisElement),
		onComplete: $empty(thisElement),
		heightOverride: null,
		widthOverride: null, */
		styles: ['padding', 'border', 'margin'],
		transitionOpacity: !Browser.Engine.trident4,
		mode: 'vertical',
		display: 'block',
		hideInputs: Browser.Engine.trident ? 'select, input, textarea, object, embed' : false
	},

	dissolve: function(){
		try {
			if (!this.hiding && !this.showing){
				if (this.element.getStyle('display') != 'none'){
					this.hiding = true;
					this.showing = false;
					this.hidden = true;
					var startStyles = this.element.getComputedSize({
						styles: this.options.styles,
						mode: this.options.mode
					});
					var setToAuto = (this.element.style.height === ''||this.element.style.height == 'auto');
					this.element.setStyle('display', 'block');
					if (this.options.transitionOpacity) startStyles.opacity = 1;
					var zero = {};
					$each(startStyles, function(style, name){
						zero[name] = [style, 0];
					}, this);
					var overflowBefore = this.element.getStyle('overflow');
					this.element.setStyle('overflow', 'hidden');
					var hideThese = this.options.hideInputs ? this.element.getElements(this.options.hideInputs) : null;
					this.$chain.unshift(function(){
						if (this.hidden){
							this.hiding = false;
							$each(startStyles, function(style, name){
								startStyles[name] = style;
							}, this);
							this.element.setStyles($merge({display: 'none', overflow: overflowBefore}, startStyles));
							if (setToAuto){
								if (['vertical', 'both'].contains(this.options.mode)) this.element.style.height = '';
								if (['width', 'both'].contains(this.options.mode)) this.element.style.width = '';
							}
							if (hideThese) hideThese.setStyle('visibility', 'visible');
						}
						this.fireEvent('hide', this.element);
						this.callChain();
					}.bind(this));
					if (hideThese) hideThese.setStyle('visibility', 'hidden');
					this.start(zero);
				} else {
					this.callChain.delay(10, this);
					this.fireEvent('complete', this.element);
					this.fireEvent('hide', this.element);
				}
			} else if (this.options.link == 'chain'){
				this.chain(this.dissolve.bind(this));
			} else if (this.options.link == 'cancel' && !this.hiding){
				this.cancel();
				this.dissolve();
			}
		} catch(e){
			this.hiding = false;
			this.element.setStyle('display', 'none');
			this.callChain.delay(10, this);
			this.fireEvent('complete', this.element);
			this.fireEvent('hide', this.element);
		}
		return this;
	},

	reveal: function(){
		try {
			if (!this.showing && !this.hiding){
				if (this.element.getStyle('display') == 'none' ||
					 this.element.getStyle('visiblity') == 'hidden' ||
					 this.element.getStyle('opacity') == 0){
					this.showing = true;
					this.hiding = false;
					this.hidden = false;
					var setToAuto, startStyles;
					//toggle display, but hide it
					this.element.measure(function(){
						setToAuto = (this.element.style.height === '' || this.element.style.height == 'auto');
						//create the styles for the opened/visible state
						startStyles = this.element.getComputedSize({
							styles: this.options.styles,
							mode: this.options.mode
						});
					}.bind(this));
					$each(startStyles, function(style, name){
						startStyles[name] = style;
					});
					//if we're overridding height/width
					if ($chk(this.options.heightOverride)) startStyles.height = this.options.heightOverride.toInt();
					if ($chk(this.options.widthOverride)) startStyles.width = this.options.widthOverride.toInt();
					if (this.options.transitionOpacity) {
						this.element.setStyle('opacity', 0);
						startStyles.opacity = 1;
					}
					//create the zero state for the beginning of the transition
					var zero = {
						height: 0,
						display: this.options.display
					};
					$each(startStyles, function(style, name){ zero[name] = 0; });
					var overflowBefore = this.element.getStyle('overflow');
					//set to zero
					this.element.setStyles($merge(zero, {overflow: 'hidden'}));
					//hide inputs
					var hideThese = this.options.hideInputs ? this.element.getElements(this.options.hideInputs) : null;
					if (hideThese) hideThese.setStyle('visibility', 'hidden');
					//start the effect
					this.start(startStyles);
					this.$chain.unshift(function(){
						this.element.setStyle('overflow', overflowBefore);
						if (!this.options.heightOverride && setToAuto){
							if (['vertical', 'both'].contains(this.options.mode)) this.element.style.height = '';
							if (['width', 'both'].contains(this.options.mode)) this.element.style.width = '';
						}
						if (!this.hidden) this.showing = false;
						if (hideThese) hideThese.setStyle('visibility', 'visible');
						this.callChain();
						this.fireEvent('show', this.element);
					}.bind(this));
				} else {
					this.callChain();
					this.fireEvent('complete', this.element);
					this.fireEvent('show', this.element);
				}
			} else if (this.options.link == 'chain'){
				this.chain(this.reveal.bind(this));
			} else if (this.options.link == 'cancel' && !this.showing){
				this.cancel();
				this.reveal();
			}
		} catch(e){
			this.element.setStyles({
				display: this.options.display,
				visiblity: 'visible',
				opacity: 1
			});
			this.showing = false;
			this.callChain.delay(10, this);
			this.fireEvent('complete', this.element);
			this.fireEvent('show', this.element);
		}
		return this;
	},

	toggle: function(){
		if (this.element.getStyle('display') == 'none' ||
			 this.element.getStyle('visiblity') == 'hidden' ||
			 this.element.getStyle('opacity') == 0){
			this.reveal();
		} else {
			this.dissolve();
		}
		return this;
	}

});

Element.Properties.reveal = {

	set: function(options){
		var reveal = this.retrieve('reveal');
		if (reveal) reveal.cancel();
		return this.eliminate('reveal').store('reveal:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('reveal')){
			if (options || !this.retrieve('reveal:options')) this.set('reveal', options);
			this.store('reveal', new Fx.Reveal(this, this.retrieve('reveal:options')));
		}
		return this.retrieve('reveal');
	}

};

Element.Properties.dissolve = Element.Properties.reveal;

Element.implement({

	reveal: function(options){
		this.get('reveal', options).reveal();
		return this;
	},

	dissolve: function(options){
		this.get('reveal', options).dissolve();
		return this;
	},

	nix: function(){
		var params = Array.link(arguments, {destroy: Boolean.type, options: Object.type});
		this.get('reveal', params.options).dissolve().chain(function(){
			this[params.destroy ? 'destroy' : 'dispose']();
		}.bind(this));
		return this;
	},

	wink: function(){
		var params = Array.link(arguments, {duration: Number.type, options: Object.type});
		var reveal = this.get('reveal', params.options);
		reveal.reveal().chain(function(){
			(function(){
				reveal.dissolve();
			}).delay(params.duration || 2000);
		});
	}


});

/*
Script: Fx.Scroll.js
	Effect to smoothly scroll any element, including the window.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

Fx.Scroll = new Class({

	Extends: Fx,

	options: {
		offset: {x: 0, y: 0},
		wheelStops: true
	},

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
		var cancel = this.cancel.bind(this, false);

		if ($type(this.element) != 'element') this.element = document.id(this.element.getDocument().body);

		var stopper = this.element;

		if (this.options.wheelStops){
			this.addEvent('start', function(){
				stopper.addEvent('mousewheel', cancel);
			}, true);
			this.addEvent('complete', function(){
				stopper.removeEvent('mousewheel', cancel);
			}, true);
		}
	},

	set: function(){
		var now = Array.flatten(arguments);
		this.element.scrollTo(now[0], now[1]);
	},

	compute: function(from, to, delta){
		return [0, 1].map(function(i){
			return Fx.compute(from[i], to[i], delta);
		});
	},

	start: function(x, y){
		if (!this.check(x, y)) return this;
		var offsetSize = this.element.getSize(), scrollSize = this.element.getScrollSize();
		var scroll = this.element.getScroll(), values = {x: x, y: y};
		for (var z in values){
			var max = scrollSize[z] - offsetSize[z];
			if ($chk(values[z])) values[z] = ($type(values[z]) == 'number') ? values[z].limit(0, max) : max;
			else values[z] = scroll[z];
			values[z] += this.options.offset[z];
		}
		return this.parent([scroll.x, scroll.y], [values.x, values.y]);
	},

	toTop: function(){
		return this.start(false, 0);
	},

	toLeft: function(){
		return this.start(0, false);
	},

	toRight: function(){
		return this.start('right', false);
	},

	toBottom: function(){
		return this.start(false, 'bottom');
	},

	toElement: function(el){
		var position = document.id(el).getPosition(this.element);
		return this.start(position.x, position.y);
	},

	scrollIntoView: function(el, axes, offset){
		axes = axes ? $splat(axes) : ['x','y'];
		var to = {};
		el = document.id(el);
		var pos = el.getPosition(this.element);
		var size = el.getSize();
		var scroll = this.element.getScroll();
		var containerSize = this.element.getSize();
		var edge = {
			x: pos.x + size.x,
			y: pos.y + size.y
		};
		['x','y'].each(function(axis) {
			if (axes.contains(axis)) {
				if (edge[axis] > scroll[axis] + containerSize[axis]) to[axis] = edge[axis] - containerSize[axis];
				if (pos[axis] < scroll[axis]) to[axis] = pos[axis];
			}
			if (to[axis] == null) to[axis] = scroll[axis];
			if (offset && offset[axis]) to[axis] = to[axis] + offset[axis];
		}, this);
		if (to.x != scroll.x || to.y != scroll.y) this.start(to.x, to.y);
		return this;
	}

});


/*
Script: Fx.Slide.js
	Effect to slide an element in and out of view.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

Fx.Slide = new Class({

	Extends: Fx,

	options: {
		mode: 'vertical'
	},

	initialize: function(element, options){
		this.addEvent('complete', function(){
			this.open = (this.wrapper['offset' + this.layout.capitalize()] != 0);
			if (this.open && Browser.Engine.webkit419) this.element.dispose().inject(this.wrapper);
		}, true);
		this.element = this.subject = document.id(element);
		this.parent(options);
		var wrapper = this.element.retrieve('wrapper');
		this.wrapper = wrapper || new Element('div', {
			styles: $extend(this.element.getStyles('margin', 'position'), {overflow: 'hidden'})
		}).wraps(this.element);
		this.element.store('wrapper', this.wrapper).setStyle('margin', 0);
		this.now = [];
		this.open = true;
	},

	vertical: function(){
		this.margin = 'margin-top';
		this.layout = 'height';
		this.offset = this.element.offsetHeight;
	},

	horizontal: function(){
		this.margin = 'margin-left';
		this.layout = 'width';
		this.offset = this.element.offsetWidth;
	},

	set: function(now){
		this.element.setStyle(this.margin, now[0]);
		this.wrapper.setStyle(this.layout, now[1]);
		return this;
	},

	compute: function(from, to, delta){
		return [0, 1].map(function(i){
			return Fx.compute(from[i], to[i], delta);
		});
	},

	start: function(how, mode){
		if (!this.check(how, mode)) return this;
		this[mode || this.options.mode]();
		var margin = this.element.getStyle(this.margin).toInt();
		var layout = this.wrapper.getStyle(this.layout).toInt();
		var caseIn = [[margin, layout], [0, this.offset]];
		var caseOut = [[margin, layout], [-this.offset, 0]];
		var start;
		switch (how){
			case 'in': start = caseIn; break;
			case 'out': start = caseOut; break;
			case 'toggle': start = (layout == 0) ? caseIn : caseOut;
		}
		return this.parent(start[0], start[1]);
	},

	slideIn: function(mode){
		return this.start('in', mode);
	},

	slideOut: function(mode){
		return this.start('out', mode);
	},

	hide: function(mode){
		this[mode || this.options.mode]();
		this.open = false;
		return this.set([-this.offset, 0]);
	},

	show: function(mode){
		this[mode || this.options.mode]();
		this.open = true;
		return this.set([0, this.offset]);
	},

	toggle: function(mode){
		return this.start('toggle', mode);
	}

});

Element.Properties.slide = {

	set: function(options){
		var slide = this.retrieve('slide');
		if (slide) slide.cancel();
		return this.eliminate('slide').store('slide:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('slide')){
			if (options || !this.retrieve('slide:options')) this.set('slide', options);
			this.store('slide', new Fx.Slide(this, this.retrieve('slide:options')));
		}
		return this.retrieve('slide');
	}

};

Element.implement({

	slide: function(how, mode){
		how = how || 'toggle';
		var slide = this.get('slide'), toggle;
		switch (how){
			case 'hide': slide.hide(mode); break;
			case 'show': slide.show(mode); break;
			case 'toggle':
				var flag = this.retrieve('slide:flag', slide.open);
				slide[flag ? 'slideOut' : 'slideIn'](mode);
				this.store('slide:flag', !flag);
				toggle = true;
			break;
			default: slide.start(how, mode);
		}
		if (!toggle) this.eliminate('slide:flag');
		return this;
	}

});


/*
Script: Fx.SmoothScroll.js
	Class for creating a smooth scrolling effect to all internal links on the page.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

var SmoothScroll = Fx.SmoothScroll = new Class({

	Extends: Fx.Scroll,

	initialize: function(options, context){
		context = context || document;
		this.doc = context.getDocument();
		var win = context.getWindow();
		this.parent(this.doc, options);
		this.links = this.options.links ? $$(this.options.links) : $$(this.doc.links);
		var location = win.location.href.match(/^[^#]*/)[0] + '#';
		this.links.each(function(link){
			if (link.href.indexOf(location) != 0) {return;}
			var anchor = link.href.substr(location.length);
			if (anchor) this.useLink(link, anchor);
		}, this);
		if (!Browser.Engine.webkit419) {
			this.addEvent('complete', function(){
				win.location.hash = this.anchor;
			}, true);
		}
	},

	useLink: function(link, anchor){
		var el;
		link.addEvent('click', function(event){
			if (el !== false && !el) el = document.id(anchor) || this.doc.getElement('a[name=' + anchor + ']');
			if (el) {
				event.preventDefault();
				this.anchor = anchor;
				this.toElement(el);
				link.blur();
			}
		}.bind(this));
	}

});

/*
Script: Fx.Sort.js
	Defines Fx.Sort, a class that reorders lists with a transition.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

Fx.Sort = new Class({

	Extends: Fx.Elements,

	options: {
		mode: 'vertical'
	},

	initialize: function(elements, options){
		this.parent(elements, options);
		this.elements.each(function(el){
			if (el.getStyle('position') == 'static') el.setStyle('position', 'relative');
		});
		this.setDefaultOrder();
	},

	setDefaultOrder: function(){
		this.currentOrder = this.elements.map(function(el, index){
			return index;
		});
	},

	sort: function(newOrder){
		if ($type(newOrder) != 'array') return false;
		var top = 0;
		var left = 0;
		var zero = {};
		var vert = this.options.mode == 'vertical';
		var current = this.elements.map(function(el, index){
			var size = el.getComputedSize({styles: ['border', 'padding', 'margin']});
			var val;
			if (vert){
				val = {
					top: top,
					margin: size['margin-top'],
					height: size.totalHeight
				};
				top += val.height - size['margin-top'];
			} else {
				val = {
					left: left,
					margin: size['margin-left'],
					width: size.totalWidth
				};
				left += val.width;
			}
			var plain = vert ? 'top' : 'left';
			zero[index] = {};
			var start = el.getStyle(plain).toInt();
			zero[index][plain] = start || 0;
			return val;
		}, this);
		this.set(zero);
		newOrder = newOrder.map(function(i){ return i.toInt(); });
		if (newOrder.length != this.elements.length){
			this.currentOrder.each(function(index){
				if (!newOrder.contains(index)) newOrder.push(index);
			});
			if (newOrder.length > this.elements.length)
				newOrder.splice(this.elements.length-1, newOrder.length - this.elements.length);
		}
		top = 0;
		left = 0;
		var margin = 0;
		var next = {};
		newOrder.each(function(item, index){
			var newPos = {};
			if (vert){
				newPos.top = top - current[item].top - margin;
				top += current[item].height;
			} else {
				newPos.left = left - current[item].left;
				left += current[item].width;
			}
			margin = margin + current[item].margin;
			next[item]=newPos;
		}, this);
		var mapped = {};
		$A(newOrder).sort().each(function(index){
			mapped[index] = next[index];
		});
		this.start(mapped);
		this.currentOrder = newOrder;
		return this;
	},

	rearrangeDOM: function(newOrder){
		newOrder = newOrder || this.currentOrder;
		var parent = this.elements[0].getParent();
		var rearranged = [];
		this.elements.setStyle('opacity', 0);
		//move each element and store the new default order
		newOrder.each(function(index){
			rearranged.push(this.elements[index].inject(parent).setStyles({
				top: 0,
				left: 0
			}));
		}, this);
		this.elements.setStyle('opacity', 1);
		this.elements = $$(rearranged);
		this.setDefaultOrder();
		return this;
	},

	getDefaultOrder: function(){
		return this.elements.map(function(el, index){
			return index;
		});
	},

	forward: function(){
		return this.sort(this.getDefaultOrder());
	},

	backward: function(){
		return this.sort(this.getDefaultOrder().reverse());
	},

	reverse: function(){
		return this.sort(this.currentOrder.reverse());
	},

	sortByElements: function(elements){
		return this.sort(elements.map(function(el){
			return this.elements.indexOf(el);
		}, this));
	},

	swap: function(one, two){
		if ($type(one) == 'element') one = this.elements.indexOf(one);
		if ($type(two) == 'element') two = this.elements.indexOf(two);
		
		var newOrder = $A(this.currentOrder);
		newOrder[this.currentOrder.indexOf(one)] = two;
		newOrder[this.currentOrder.indexOf(two)] = one;
		this.sort(newOrder);
	}

});

/*
Script: Drag.js
	The base Drag Class. Can be used to drag and resize Elements using mouse events.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
		Tom Occhinno
		Jan Kassens
*/

var Drag = new Class({

	Implements: [Events, Options],

	options: {/*
		onBeforeStart: $empty(thisElement),
		onStart: $empty(thisElement, event),
		onSnap: $empty(thisElement)
		onDrag: $empty(thisElement, event),
		onCancel: $empty(thisElement),
		onComplete: $empty(thisElement, event),*/
		snap: 6,
		unit: 'px',
		grid: false,
		style: true,
		limit: false,
		handle: false,
		invert: false,
		preventDefault: false,
		modifiers: {x: 'left', y: 'top'}
	},

	initialize: function(){
		var params = Array.link(arguments, {'options': Object.type, 'element': $defined});
		this.element = document.id(params.element);
		this.document = this.element.getDocument();
		this.setOptions(params.options || {});
		var htype = $type(this.options.handle);
		this.handles = ((htype == 'array' || htype == 'collection') ? $$(this.options.handle) : document.id(this.options.handle)) || this.element;
		this.mouse = {'now': {}, 'pos': {}};
		this.value = {'start': {}, 'now': {}};

		this.selection = (Browser.Engine.trident) ? 'selectstart' : 'mousedown';

		this.bound = {
			start: this.start.bind(this),
			check: this.check.bind(this),
			drag: this.drag.bind(this),
			stop: this.stop.bind(this),
			cancel: this.cancel.bind(this),
			eventStop: $lambda(false)
		};
		this.attach();
	},

	attach: function(){
		this.handles.addEvent('mousedown', this.bound.start);
		return this;
	},

	detach: function(){
		this.handles.removeEvent('mousedown', this.bound.start);
		return this;
	},

	start: function(event){
		if (this.options.preventDefault) event.preventDefault();
		this.mouse.start = event.page;
		this.fireEvent('beforeStart', this.element);
		var limit = this.options.limit;
		this.limit = {x: [], y: []};
		for (var z in this.options.modifiers){
			if (!this.options.modifiers[z]) continue;
			if (this.options.style) this.value.now[z] = this.element.getStyle(this.options.modifiers[z]).toInt();
			else this.value.now[z] = this.element[this.options.modifiers[z]];
			if (this.options.invert) this.value.now[z] *= -1;
			this.mouse.pos[z] = event.page[z] - this.value.now[z];
			if (limit && limit[z]){
				for (var i = 2; i--; i){
					if ($chk(limit[z][i])) this.limit[z][i] = $lambda(limit[z][i])();
				}
			}
		}
		if ($type(this.options.grid) == 'number') this.options.grid = {x: this.options.grid, y: this.options.grid};
		this.document.addEvents({mousemove: this.bound.check, mouseup: this.bound.cancel});
		this.document.addEvent(this.selection, this.bound.eventStop);
	},

	check: function(event){
		if (this.options.preventDefault) event.preventDefault();
		var distance = Math.round(Math.sqrt(Math.pow(event.page.x - this.mouse.start.x, 2) + Math.pow(event.page.y - this.mouse.start.y, 2)));
		if (distance > this.options.snap){
			this.cancel();
			this.document.addEvents({
				mousemove: this.bound.drag,
				mouseup: this.bound.stop
			});
			this.fireEvent('start', [this.element, event]).fireEvent('snap', this.element);
		}
	},

	drag: function(event){
		if (this.options.preventDefault) event.preventDefault();
		this.mouse.now = event.page;
		for (var z in this.options.modifiers){
			if (!this.options.modifiers[z]) continue;
			this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];
			if (this.options.invert) this.value.now[z] *= -1;
			if (this.options.limit && this.limit[z]){
				if ($chk(this.limit[z][1]) && (this.value.now[z] > this.limit[z][1])){
					this.value.now[z] = this.limit[z][1];
				} else if ($chk(this.limit[z][0]) && (this.value.now[z] < this.limit[z][0])){
					this.value.now[z] = this.limit[z][0];
				}
			}
			if (this.options.grid[z]) this.value.now[z] -= ((this.value.now[z] - (this.limit[z][0]||0)) % this.options.grid[z]);
			if (this.options.style) this.element.setStyle(this.options.modifiers[z], this.value.now[z] + this.options.unit);
			else this.element[this.options.modifiers[z]] = this.value.now[z];
		}
		this.fireEvent('drag', [this.element, event]);
	},

	cancel: function(event){
		this.document.removeEvent('mousemove', this.bound.check);
		this.document.removeEvent('mouseup', this.bound.cancel);
		if (event){
			this.document.removeEvent(this.selection, this.bound.eventStop);
			this.fireEvent('cancel', this.element);
		}
	},

	stop: function(event){
		this.document.removeEvent(this.selection, this.bound.eventStop);
		this.document.removeEvent('mousemove', this.bound.drag);
		this.document.removeEvent('mouseup', this.bound.stop);
		if (event) this.fireEvent('complete', [this.element, event]);
	}

});

Element.implement({

	makeResizable: function(options){
		var drag = new Drag(this, $merge({modifiers: {x: 'width', y: 'height'}}, options));
		this.store('resizer', drag);
		return drag.addEvent('drag', function(){
			this.fireEvent('resize', drag);
		}.bind(this));
	}

});


/*
Script: Drag.Move.js
	A Drag extension that provides support for the constraining of draggables to containers and droppables.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
		Tom Occhinno
		Jan Kassens*/

Drag.Move = new Class({

	Extends: Drag,

	options: {/*
		onEnter: $empty(thisElement, overed),
		onLeave: $empty(thisElement, overed),
		onDrop: $empty(thisElement, overed, event),*/
		droppables: [],
		container: false,
		precalculate: false,
		includeMargins: true,
		checkDroppables: true
	},

	initialize: function(element, options){
		this.parent(element, options);
		this.droppables = $$(this.options.droppables);
		this.container = document.id(this.options.container);
		if (this.container && $type(this.container) != 'element') this.container = document.id(this.container.getDocument().body);

		var position = this.element.getStyle('position');
		if (position=='static') position = 'absolute';
		if ([this.element.getStyle('left'), this.element.getStyle('top')].contains('auto')) this.element.position(this.element.getPosition(this.element.offsetParent));
		this.element.setStyle('position', position);

		this.addEvent('start', this.checkDroppables, true);

		this.overed = null;
	},

	start: function(event){
		if (this.container){
			var ccoo = this.container.getCoordinates(this.element.getOffsetParent()), cbs = {}, ems = {};

			['top', 'right', 'bottom', 'left'].each(function(pad){
				cbs[pad] = this.container.getStyle('border-' + pad).toInt();
				ems[pad] = this.element.getStyle('margin-' + pad).toInt();
			}, this);

			var width = this.element.offsetWidth + ems.left + ems.right;
			var height = this.element.offsetHeight + ems.top + ems.bottom;

			if (this.options.includeMargins) {
				$each(ems, function(value, key) {
					ems[key] = 0;
				});
			}
			if (this.container == this.element.getOffsetParent()) {
				this.options.limit = {
					x: [0 - ems.left, ccoo.right - cbs.left - cbs.right - width + ems.right],
					y: [0 - ems.top, ccoo.bottom - cbs.top - cbs.bottom - height + ems.bottom]
				};
			} else {
				this.options.limit = {
					x: [ccoo.left + cbs.left - ems.left, ccoo.right - cbs.right - width + ems.right],
					y: [ccoo.top + cbs.top - ems.top, ccoo.bottom - cbs.bottom - height + ems.bottom]
				};
			}

		}
		if (this.options.precalculate){
			this.positions = this.droppables.map(function(el) {
				return el.getCoordinates();
			});
		}
		this.parent(event);
	},

	checkAgainst: function(el, i){
		el = (this.positions) ? this.positions[i] : el.getCoordinates();
		var now = this.mouse.now;
		return (now.x > el.left && now.x < el.right && now.y < el.bottom && now.y > el.top);
	},

	checkDroppables: function(){
		var overed = this.droppables.filter(this.checkAgainst, this).getLast();
		if (this.overed != overed){
			if (this.overed) this.fireEvent('leave', [this.element, this.overed]);
			if (overed) this.fireEvent('enter', [this.element, overed]);
			this.overed = overed;
		}
	},

	drag: function(event){
		this.parent(event);
		if (this.options.checkDroppables && this.droppables.length) this.checkDroppables();
	},

	stop: function(event){
		this.checkDroppables();
		this.fireEvent('drop', [this.element, this.overed, event]);
		this.overed = null;
		return this.parent(event);
	}

});

Element.implement({

	makeDraggable: function(options){
		var drag = new Drag.Move(this, options);
		this.store('dragger', drag);
		return drag;
	}

});


/*
Script: Slider.js
	Class for creating horizontal and vertical slider controls.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

var Slider = new Class({

	Implements: [Events, Options],

	Binds: ['clickedElement', 'draggedKnob', 'scrolledElement'],

	options: {/*
		onTick: $empty(intPosition),
		onChange: $empty(intStep),
		onComplete: $empty(strStep),*/
		onTick: function(position){
			if (this.options.snap) position = this.toPosition(this.step);
			this.knob.setStyle(this.property, position);
		},
		snap: false,
		offset: 0,
		range: false,
		wheel: false,
		steps: 100,
		mode: 'horizontal'
	},

	initialize: function(element, knob, options){
		this.setOptions(options);
		this.element = document.id(element);
		this.knob = document.id(knob);
		this.previousChange = this.previousEnd = this.step = -1;
		var offset, limit = {}, modifiers = {'x': false, 'y': false};
		switch (this.options.mode){
			case 'vertical':
				this.axis = 'y';
				this.property = 'top';
				offset = 'offsetHeight';
				break;
			case 'horizontal':
				this.axis = 'x';
				this.property = 'left';
				offset = 'offsetWidth';
		}
		this.half = this.knob[offset] / 2;
		this.full = this.element[offset] - this.knob[offset] + (this.options.offset * 2);
		this.min = $chk(this.options.range[0]) ? this.options.range[0] : 0;
		this.max = $chk(this.options.range[1]) ? this.options.range[1] : this.options.steps;
		this.range = this.max - this.min;
		this.steps = this.options.steps || this.full;
		this.stepSize = Math.abs(this.range) / this.steps;
		this.stepWidth = this.stepSize * this.full / Math.abs(this.range) ;

		this.knob.setStyle('position', 'relative').setStyle(this.property, - this.options.offset);
		modifiers[this.axis] = this.property;
		limit[this.axis] = [- this.options.offset, this.full - this.options.offset];

		this.bound = {
			clickedElement: this.clickedElement.bind(this),
			scrolledElement: this.scrolledElement.bindWithEvent(this),
			draggedKnob: this.draggedKnob.bind(this)
		};

		var dragOptions = {
			snap: 0,
			limit: limit,
			modifiers: modifiers,
			onDrag: this.bound.draggedKnob,
			onStart: this.bound.draggedKnob,
			onBeforeStart: (function(){
				this.isDragging = true;
			}).bind(this),
			onComplete: function(){
				this.isDragging = false;
				this.draggedKnob();
				this.end();
			}.bind(this)
		};
		if (this.options.snap){
			dragOptions.grid = Math.ceil(this.stepWidth);
			dragOptions.limit[this.axis][1] = this.full;
		}

		this.drag = new Drag(this.knob, dragOptions);
		this.attach();
	},

	attach: function(){
		this.element.addEvent('mousedown', this.bound.clickedElement);
		if (this.options.wheel) this.element.addEvent('mousewheel', this.bound.scrolledElement);
		this.drag.attach();
		return this;
	},

	detach: function(){
		this.element.removeEvent('mousedown', this.bound.clickedElement);
		this.element.removeEvent('mousewheel', this.bound.scrolledElement);
		this.drag.detach();
		return this;
	},

	set: function(step){
		if (!((this.range > 0) ^ (step < this.min))) step = this.min;
		if (!((this.range > 0) ^ (step > this.max))) step = this.max;

		this.step = Math.round(step);
		this.checkStep();
		this.fireEvent('tick', this.toPosition(this.step));
		this.end();
		return this;
	},

	clickedElement: function(event){
		if (this.isDragging || event.target == this.knob) return;

		var dir = this.range < 0 ? -1 : 1;
		var position = event.page[this.axis] - this.element.getPosition()[this.axis] - this.half;
		position = position.limit(-this.options.offset, this.full -this.options.offset);

		this.step = Math.round(this.min + dir * this.toStep(position));
		this.checkStep();
		this.fireEvent('tick', position);
		this.end();
	},

	scrolledElement: function(event){
		var mode = (this.options.mode == 'horizontal') ? (event.wheel < 0) : (event.wheel > 0);
		this.set(mode ? this.step - this.stepSize : this.step + this.stepSize);
		event.stop();
	},

	draggedKnob: function(){
		var dir = this.range < 0 ? -1 : 1;
		var position = this.drag.value.now[this.axis];
		position = position.limit(-this.options.offset, this.full -this.options.offset);
		this.step = Math.round(this.min + dir * this.toStep(position));
		this.checkStep();
	},

	checkStep: function(){
		if (this.previousChange != this.step){
			this.previousChange = this.step;
			this.fireEvent('change', this.step);
		}
	},

	end: function(){
		if (this.previousEnd !== this.step){
			this.previousEnd = this.step;
			this.fireEvent('complete', this.step + '');
		}
	},

	toStep: function(position){
		var step = (position + this.options.offset) * this.stepSize / this.full * this.steps;
		return this.options.steps ? Math.round(step -= step % this.stepSize) : step;
	},

	toPosition: function(step){
		return (this.full * Math.abs(this.min - step)) / (this.steps * this.stepSize) - this.options.offset;
	}

});

/*
Script: Sortables.js
	Class for creating a drag and drop sorting interface for lists of items.

	License:
		MIT-style license.

	Authors:
		Tom Occhino
*/

var Sortables = new Class({

	Implements: [Events, Options],

	options: {/*
		onSort: $empty(element, clone),
		onStart: $empty(element, clone),
		onComplete: $empty(element),*/
		snap: 4,
		opacity: 1,
		clone: false,
		revert: false,
		handle: false,
		constrain: false
	},

	initialize: function(lists, options){
		this.setOptions(options);
		this.elements = [];
		this.lists = [];
		this.idle = true;

		this.addLists($$(document.id(lists) || lists));
		if (!this.options.clone) this.options.revert = false;
		if (this.options.revert) this.effect = new Fx.Morph(null, $merge({duration: 250, link: 'cancel'}, this.options.revert));
	},

	attach: function(){
		this.addLists(this.lists);
		return this;
	},

	detach: function(){
		this.lists = this.removeLists(this.lists);
		return this;
	},

	addItems: function(){
		Array.flatten(arguments).each(function(element){
			this.elements.push(element);
			var start = element.retrieve('sortables:start', this.start.bindWithEvent(this, element));
			(this.options.handle ? element.getElement(this.options.handle) || element : element).addEvent('mousedown', start);
		}, this);
		return this;
	},

	addLists: function(){
		Array.flatten(arguments).each(function(list){
			this.lists.push(list);
			this.addItems(list.getChildren());
		}, this);
		return this;
	},

	removeItems: function(){
		return $$(Array.flatten(arguments).map(function(element){
			this.elements.erase(element);
			var start = element.retrieve('sortables:start');
			(this.options.handle ? element.getElement(this.options.handle) || element : element).removeEvent('mousedown', start);
			
			return element;
		}, this));
	},

	removeLists: function(){
		return $$(Array.flatten(arguments).map(function(list){
			this.lists.erase(list);
			this.removeItems(list.getChildren());
			
			return list;
		}, this));
	},

	getClone: function(event, element){
		if (!this.options.clone) return new Element('div').inject(document.body);
		if ($type(this.options.clone) == 'function') return this.options.clone.call(this, event, element, this.list);
		return element.clone(true).setStyles({
			margin: '0px',
			position: 'absolute',
			visibility: 'hidden',
			'width': element.getStyle('width')
		}).inject(this.list).position(element.getPosition(element.getOffsetParent()));
	},

	getDroppables: function(){
		var droppables = this.list.getChildren();
		if (!this.options.constrain) droppables = this.lists.concat(droppables).erase(this.list);
		return droppables.erase(this.clone).erase(this.element);
	},

	insert: function(dragging, element){
		var where = 'inside';
		if (this.lists.contains(element)){
			this.list = element;
			this.drag.droppables = this.getDroppables();
		} else {
			where = this.element.getAllPrevious().contains(element) ? 'before' : 'after';
		}
		this.element.inject(element, where);
		this.fireEvent('sort', [this.element, this.clone]);
	},

	start: function(event, element){
		if (!this.idle) return;
		this.idle = false;
		this.element = element;
		this.opacity = element.get('opacity');
		this.list = element.getParent();
		this.clone = this.getClone(event, element);

		this.drag = new Drag.Move(this.clone, {
			snap: this.options.snap,
			container: this.options.constrain && this.element.getParent(),
			droppables: this.getDroppables(),
			onSnap: function(){
				event.stop();
				this.clone.setStyle('visibility', 'visible');
				this.element.set('opacity', this.options.opacity || 0);
				this.fireEvent('start', [this.element, this.clone]);
			}.bind(this),
			onEnter: this.insert.bind(this),
			onCancel: this.reset.bind(this),
			onComplete: this.end.bind(this)
		});

		this.clone.inject(this.element, 'before');
		this.drag.start(event);
	},

	end: function(){
		this.drag.detach();
		this.element.set('opacity', this.opacity);
		if (this.effect){
			var dim = this.element.getStyles('width', 'height');
			var pos = this.clone.computePosition(this.element.getPosition(this.clone.offsetParent));
			this.effect.element = this.clone;
			this.effect.start({
				top: pos.top,
				left: pos.left,
				width: dim.width,
				height: dim.height,
				opacity: 0.25
			}).chain(this.reset.bind(this));
		} else {
			this.reset();
		}
	},

	reset: function(){
		this.idle = true;
		this.clone.destroy();
		this.fireEvent('complete', this.element);
	},

	serialize: function(){
		var params = Array.link(arguments, {modifier: Function.type, index: $defined});
		var serial = this.lists.map(function(list){
			return list.getChildren().map(params.modifier || function(element){
				return element.get('id');
			}, this);
		}, this);

		var index = params.index;
		if (this.lists.length == 1) index = 0;
		return $chk(index) && index >= 0 && index < this.lists.length ? serial[index] : serial;
	}

});


/*
Script: IframeShim.js
	Defines IframeShim, a class for obscuring select lists and flash objects in IE.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

var IframeShim = new Class({

	Implements: [Options, Events, Class.Occlude],

	options: {
		className: 'iframeShim',
		display: false,
		zIndex: null,
		margin: 0,
		offset: {x: 0, y: 0},
		browsers: (Browser.Engine.trident4 || (Browser.Engine.gecko && !Browser.Engine.gecko19 && Browser.Platform.mac))
	},

	property: 'IframeShim',

	initialize: function(element, options){
		this.element = document.id(element);
		if (this.occlude()) return this.occluded;
		this.setOptions(options);
		this.makeShim();
		return this;
	},

	makeShim: function(){
		if(this.options.browsers){
			var zIndex = this.element.getStyle('zIndex').toInt();

			if (!zIndex){
				zIndex = 1;
				var pos = this.element.getStyle('position');
				if (pos == 'static' || !pos) this.element.setStyle('position', 'relative');
				this.element.setStyle('zIndex', zIndex);
			}
			zIndex = ($chk(this.options.zIndex) && zIndex > this.options.zIndex) ? this.options.zIndex : zIndex - 1;
			if (zIndex < 0) zIndex = 1;
			this.shim = new Element('iframe', {
				src:'javascript:false;document.write("");',
				scrolling: 'no',
				frameborder: 0,
				styles: {
					zIndex: zIndex,
					position: 'absolute',
					border: 'none',
					filter: 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)'
				},
				'class': this.options.className
			}).store('IframeShim', this);
			var inject = (function(){
				this.shim.inject(this.element, 'after');
				this[this.options.display ? 'show' : 'hide']();
				this.fireEvent('inject');
			}).bind(this);
			if (Browser.Engine.trident && !IframeShim.ready) window.addEvent('load', inject);
			else inject();
		} else {
			this.position = this.hide = this.show = this.dispose = $lambda(this);
		}
	},

	position: function(){
		if (!IframeShim.ready) return this;
		var size = this.element.measure(function(){ return this.getSize(); });
		if ($type(this.options.margin)){
			size.x = size.x - (this.options.margin * 2);
			size.y = size.y - (this.options.margin * 2);
			this.options.offset.x += this.options.margin;
			this.options.offset.y += this.options.margin;
		}
		if (this.shim) {
			this.shim.set({width: size.x, height: size.y}).position({
				relativeTo: this.element,
				offset: this.options.offset
			});
		}
		return this;
	},

	hide: function(){
		if (this.shim) this.shim.setStyle('display', 'none');
		return this;
	},

	show: function(){
		if (this.shim) this.shim.setStyle('display', 'block');
		return this.position();
	},

	dispose: function(){
		if (this.shim) this.shim.dispose();
		return this;
	},

	destroy: function(){
		if (this.shim) this.shim.destroy();
		return this;
	}

});

window.addEvent('load', function(){
	IframeShim.ready = true;
});

/*
Script: Scroller.js
	Class which scrolls the contents of any Element (including the window) when the mouse reaches the Element's boundaries.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
*/

var Scroller = new Class({

	Implements: [Events, Options],

	options: {
		area: 20,
		velocity: 1,
		onChange: function(x, y){
			this.element.scrollTo(x, y);
		},
		fps: 50
	},

	initialize: function(element, options){
		this.setOptions(options);
		this.element = document.id(element);
		this.listener = ($type(this.element) != 'element') ? document.id(this.element.getDocument().body) : this.element;
		this.timer = null;
		this.bound = {
			attach: this.attach.bind(this),
			detach: this.detach.bind(this),
			getCoords: this.getCoords.bind(this)
		};
	},

	start: function(){
		this.listener.addEvents({
			mouseenter: this.bound.attach,
			mouseleave: this.bound.detach
		});
	},

	stop: function(){
		this.listener.removeEvents({
			mouseenter: this.bound.attach,
			mouseleave: this.bound.detach
		});
		this.timer = $clear(this.timer);
	},

	attach: function(){
		this.listener.addEvent('mousemove', this.bound.getCoords);
	},

	detach: function(){
		this.listener.removeEvent('mousemove', this.bound.getCoords);
		this.timer = $clear(this.timer);
	},

	getCoords: function(event){
		this.page = (this.listener.get('tag') == 'body') ? event.client : event.page;
		if (!this.timer) this.timer = this.scroll.periodical(Math.round(1000 / this.options.fps), this);
	},

	scroll: function(){
		var size = this.element.getSize(), 
			scroll = this.element.getScroll(), 
			pos = this.element.getOffsets(), 
			scrollSize = this.element.getScrollSize(), 
			change = {x: 0, y: 0};
		for (var z in this.page){
			if (this.page[z] < (this.options.area + pos[z]) && scroll[z] != 0)
				change[z] = (this.page[z] - this.options.area - pos[z]) * this.options.velocity;
			else if (this.page[z] + this.options.area > (size[z] + pos[z]) && scroll[z] + size[z] != scrollSize[z])
				change[z] = (this.page[z] - size[z] + this.options.area - pos[z]) * this.options.velocity;
		}
		if (change.y || change.x) this.fireEvent('change', [scroll.x + change.x, scroll.y + change.y]);
	}

});

/*
Script: Tips.js
	Class for creating nice tips that follow the mouse cursor when hovering an element.

	License:
		MIT-style license.

	Authors:
		Valerio Proietti
		Christoph Pojer
*/

var Tips = new Class({

	Implements: [Events, Options],

	options: {
		onShow: function(tip){
			tip.setStyle('visibility', 'visible');
		},
		onHide: function(tip){
			tip.setStyle('visibility', 'hidden');
		},
		title: 'title',
		text: function(el){
			return el.get('rel') || el.get('href');
		},
		showDelay: 100,
		hideDelay: 100,
		className: null,
		offset: {x: 16, y: 16},
		fixed: false
	},

	initialize: function(){
		var params = Array.link(arguments, {options: Object.type, elements: $defined});
		if (params.options && params.options.offsets) params.options.offset = params.options.offsets;
		this.setOptions(params.options);
		this.container = new Element('div', {'class': 'tip'});
		this.tip = this.getTip();
		
		if (params.elements) this.attach(params.elements);
	},

	getTip: function(){
		return new Element('div', {
			'class': this.options.className,
			styles: {
				visibility: 'hidden',
				display: 'none',
				position: 'absolute',
				top: 0,
				left: 0
			}
		}).adopt(
			new Element('div', {'class': 'tip-top'}),
			this.container,
			new Element('div', {'class': 'tip-bottom'})
		).inject(document.body);
	},

	attach: function(elements){
		var read = function(option, element){
			if (option == null) return '';
			return $type(option) == 'function' ? option(element) : element.get(option);
		};
		$$(elements).each(function(element){
			var title = read(this.options.title, element);
			element.erase('title').store('tip:native', title).retrieve('tip:title', title);
			element.retrieve('tip:text', read(this.options.text, element));
			
			var events = ['enter', 'leave'];
			if (!this.options.fixed) events.push('move');
			
			events.each(function(value){
				element.addEvent('mouse' + value, element.retrieve('tip:' + value, this['element' + value.capitalize()].bindWithEvent(this, element)));
			}, this);
		}, this);
		
		return this;
	},

	detach: function(elements){
		$$(elements).each(function(element){
			['enter', 'leave', 'move'].each(function(value){
				element.removeEvent('mouse' + value, element.retrieve('tip:' + value) || $empty);
			});
			
			element.eliminate('tip:enter').eliminate('tip:leave').eliminate('tip:move');
			
			if ($type(this.options.title) == 'string' && this.options.title == 'title'){
				var original = element.retrieve('tip:native');
				if (original) element.set('title', original);
			}
		}, this);
		
		return this;
	},

	elementEnter: function(event, element){
		$A(this.container.childNodes).each(Element.dispose);
		
		['title', 'text'].each(function(value){
			var content = element.retrieve('tip:' + value);
			if (!content) return;
			
			this[value + 'Element'] = new Element('div', {'class': 'tip-' + value}).inject(this.container);
			this.fill(this[value + 'Element'], content);
		}, this);
		
		this.timer = $clear(this.timer);
		this.timer = this.show.delay(this.options.showDelay, this, element);
		this.tip.setStyle('display', 'block');
		this.position((!this.options.fixed) ? event : {page: element.getPosition()});
	},

	elementLeave: function(event, element){
		$clear(this.timer);
		this.tip.setStyle('display', 'none');
		this.timer = this.hide.delay(this.options.hideDelay, this, element);
	},

	elementMove: function(event){
		this.position(event);
	},

	position: function(event){
		var size = window.getSize(), scroll = window.getScroll(),
			tip = {x: this.tip.offsetWidth, y: this.tip.offsetHeight},
			props = {x: 'left', y: 'top'},
			obj = {};
		
		for (var z in props){
			obj[props[z]] = event.page[z] + this.options.offset[z];
			if ((obj[props[z]] + tip[z] - scroll[z]) > size[z]) obj[props[z]] = event.page[z] - this.options.offset[z] - tip[z];
		}
		
		this.tip.setStyles(obj);
	},

	fill: function(element, contents){
		if(typeof contents == 'string') element.set('html', contents);
		else element.adopt(contents);
	},

	show: function(el){
		this.fireEvent('show', [this.tip, el]);
	},

	hide: function(el){
		this.fireEvent('hide', [this.tip, el]);
	}

});

/*
Script: Date.English.US.js
	Date messages for US English.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

MooTools.lang.set('en-US', 'Date', {

	months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	//culture's date order: MM/DD/YYYY
	dateOrder: ['month', 'date', 'year'],
	shortDate: '%m/%d/%Y',
	shortTime: '%I:%M%p',
	AM: 'AM',
	PM: 'PM',

	/* Date.Extras */
	ordinal: function(dayOfMonth){
		//1st, 2nd, 3rd, etc.
		return (dayOfMonth > 3 && dayOfMonth < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(dayOfMonth % 10, 4)];
	},

	lessThanMinuteAgo: 'less than a minute ago',
	minuteAgo: 'about a minute ago',
	minutesAgo: '{delta} minutes ago',
	hourAgo: 'about an hour ago',
	hoursAgo: 'about {delta} hours ago',
	dayAgo: '1 day ago',
	daysAgo: '{delta} days ago',
	lessThanMinuteUntil: 'less than a minute from now',
	minuteUntil: 'about a minute from now',
	minutesUntil: '{delta} minutes from now',
	hourUntil: 'about an hour from now',
	hoursUntil: 'about {delta} hours from now',
	dayUntil: '1 day from now',
	daysUntil: '{delta} days from now'

});

/*
Script: FormValidator.English.js
	Date messages for English.

	License:
		MIT-style license.

	Authors:
		Aaron Newton

*/

MooTools.lang.set('en-US', 'FormValidator', {

	required:'This field is required.',
	minLength:'Please enter at least {minLength} characters (you entered {length} characters).',
	maxLength:'Please enter no more than {maxLength} characters (you entered {length} characters).',
	integer:'Please enter an integer in this field. Numbers with decimals (e.g. 1.25) are not permitted.',
	numeric:'Please enter only numeric values in this field (i.e. "1" or "1.1" or "-1" or "-1.1").',
	digits:'Please use numbers and punctuation only in this field (for example, a phone number with dashes or dots is permitted).',
	alpha:'Please use letters only (a-z) with in this field. No spaces or other characters are allowed.',
	alphanum:'Please use only letters (a-z) or numbers (0-9) only in this field. No spaces or other characters are allowed.',
	dateSuchAs:'Please enter a valid date such as {date}',
	dateInFormatMDY:'Please enter a valid date such as MM/DD/YYYY (i.e. "12/31/1999")',
	email:'Please enter a valid email address. For example "fred@domain.com".',
	url:'Please enter a valid URL such as http://www.google.com.',
	currencyDollar:'Please enter a valid $ amount. For example $100.00 .',
	oneRequired:'Please enter something for at least one of these inputs.',
	errorPrefix: 'Error: ',
	warningPrefix: 'Warning: ',

	//FormValidator.Extras

	noSpace: 'There can be no spaces in this input.',
	reqChkByNode: 'No items are selected.',
	requiredChk: 'This field is required.',
	reqChkByName: 'Please select a {label}.',
	match: 'This field needs to match the {matchName} field',
	startDate: 'the start date',
	endDate: 'the end date',
	currendDate: 'the current date',
	afterDate: 'The date should be the same or after {label}.',
	beforeDate: 'The date should be the same or before {label}.',
	startMonth: 'Please select a start month',
	sameMonth: 'These two dates must be in the same month - you must change one or the other.'

});/*
Script: Clientcide.js
	The Clientcide namespace.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var Clientcide = {
	version: '2.1.0',
	setAssetLocation: function(baseHref) {
		var clean = function(str){
			return str.replace(/\/\//g, '/');
		};
		if (window.StickyWin && StickyWin.UI) {
			StickyWin.UI.implement({
				options: {
					baseHref: clean(baseHref + '/stickyWinHTML/')
				}
			});
			if (StickyWin.Alert) {
				StickyWin.Alert.implement({
					options: {
						baseHref: baseHref + "/simple.error.popup"
					}
				});
			}
			if (StickyWin.UI.Pointy) {
				StickyWin.UI.Pointy.implement({
					options: {
						baseHref: clean(baseHref + '/PointyTip/')
					}
				});
			}
		}
		if (window.TagMaker) {
			TagMaker.implement({
			    options: {
			        baseHref: clean(baseHref + '/tips/')
			    }
			});
		}
		if (window.ProductPicker) {
			ProductPicker.implement({
			    options:{
			        baseHref: clean(baseHref + '/Picker')
			    }
			});
		}

		if (window.Autocompleter) {
			Autocompleter.Base.implement({
					options: {
						baseHref: clean(baseHref + '/autocompleter/')
					}
			});
		}

		if (window.Lightbox) {
			Lightbox.implement({
			    options: {
			        assetBaseUrl: clean(baseHref + '/slimbox/')
			    }
			});
		}

		if (window.Waiter) {
			Waiter.implement({
				options: {
					baseHref: clean(baseHref + '/waiter/')
				}
			});
		}
	},
	preLoadCss: function(){
		if (window.StickyWin && StickyWin.ui) StickyWin.ui();
		if (window.StickyWin && StickyWin.pointy) StickyWin.pointy();
		Clientcide.preloaded = true;
		return true;
	},
	preloaded: false
};
(function(){
	if (!window.addEvent) return;
	var preload = function(){
		if (window.dbug) dbug.log('preloading clientcide css');
		if (!Clientcide.preloaded) Clientcide.preLoadCss();
	};
	window.addEvent('domready', preload);
	window.addEvent('load', preload);
})();
setCNETAssetBaseHref = Clientcide.setAssetLocation;

/*
Script: dbug.js
	A wrapper for Firebug console.* statements.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var dbug = {
	logged: [],	
	timers: {},
	firebug: false, 
	enabled: false, 
	log: function() {
		dbug.logged.push(arguments);
	},
	nolog: function(msg) {
		dbug.logged.push(arguments);
	},
	time: function(name){
		dbug.timers[name] = new Date().getTime();
	},
	timeEnd: function(name){
		if (dbug.timers[name]) {
			var end = new Date().getTime() - dbug.timers[name];
			dbug.timers[name] = false;
			dbug.log('%s: %s', name, end);
		} else dbug.log('no such timer: %s', name);
	},
	enable: function(silent) { 
		var con = window.firebug ? firebug.d.console.cmd : window.console;

		if((!!window.console && !!window.console.warn) || window.firebug) {
			try {
				dbug.enabled = true;
				dbug.log = function(){
						(con.debug || con.log).apply(con, arguments);
				};
				dbug.time = function(){
					con.time.apply(con, arguments);
				};
				dbug.timeEnd = function(){
					con.timeEnd.apply(con, arguments);
				};
				if(!silent) dbug.log('enabling dbug');
				for(var i=0;i<dbug.logged.length;i++){ dbug.log.apply(con, dbug.logged[i]); }
				dbug.logged=[];
			} catch(e) {
				dbug.enable.delay(400);
			}
		}
	},
	disable: function(){ 
		if(dbug.firebug) dbug.enabled = false;
		dbug.log = dbug.nolog;
		dbug.time = function(){};
		dbug.timeEnd = function(){};
	},
	cookie: function(set){
		var value = document.cookie.match('(?:^|;)\\s*jsdebug=([^;]*)');
		var debugCookie = value ? unescape(value[1]) : false;
		if((!$defined(set) && debugCookie != 'true') || ($defined(set) && set)) {
			dbug.enable();
			dbug.log('setting debugging cookie');
			var date = new Date();
			date.setTime(date.getTime()+(24*60*60*1000));
			document.cookie = 'jsdebug=true;expires='+date.toGMTString()+';path=/;';
		} else dbug.disableCookie();
	},
	disableCookie: function(){
		dbug.log('disabling debugging cookie');
		document.cookie = 'jsdebug=false;path=/;';
	}
};

(function(){
	var fb = !!window.console || !!window.firebug;
	var con = window.firebug ? window.firebug.d.console.cmd : window.console;
	var debugMethods = ['debug','info','warn','error','assert','dir','dirxml'];
	var otherMethods = ['trace','group','groupEnd','profile','profileEnd','count'];
	function set(methodList, defaultFunction) {
		for(var i = 0; i < methodList.length; i++){
			dbug[methodList[i]] = (fb && con[methodList[i]])?con[methodList[i]]:defaultFunction;
		}
	};
	set(debugMethods, dbug.log);
	set(otherMethods, function(){});
})();
if ((!!window.console && !!window.console.warn) || window.firebug){
	dbug.firebug = true;
	var value = document.cookie.match('(?:^|;)\\s*jsdebug=([^;]*)');
	var debugCookie = value ? unescape(value[1]) : false;
	if(window.location.href.indexOf("jsdebug=true")>0 || debugCookie=='true') dbug.enable();
	if(debugCookie=='true')dbug.log('debugging cookie enabled');
	if(window.location.href.indexOf("jsdebugCookie=true")>0){
		dbug.cookie();
		if(!dbug.enabled)dbug.enable();
	}
	if(window.location.href.indexOf("jsdebugCookie=false")>0)dbug.disableCookie();
}

/*
Script: ToElement.js
	Defines the toElement method for a class.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
Class.ToElement = new Class({
	toElement: function(){
		return this.element;
	}
});
var ToElement = Class.ToElement;

//returns a collection given an id or a selector
$G = function(elements) {
	return $splat(document.id(elements)||$$(elements));
};

/*
Script: IconMenu.js
	Defines IconMenu, a simple icon (img) based menu.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var IconMenu = new Class({
	Implements: [Options, Events],
	options: {
		container: document,
		images: ".iconImgs",
		captions: ".iconCaptions",
		removeLinks: false,
		clearLinks: false,
		useAxis: 'x',
		onFocusDelay: 0,
		initialFocusDelay: 250,
		onBlurDelay: 0,
		length: 'auto',
		iconPadding: 1,
		scrollFxOptions: {
			duration: 1800,
			transition: 'cubic:in:out'
		},
		backScrollButtons: '#scrollLeft',
		forwardScrollButtons: '#scrollRight',
		onSelect: function(index, img){
			img.morph({
					'border-top-color': '#00A0C6',
					'border-left-color': '#00A0C6',
					'border-right-color': '#00A0C6',
					'border-bottom-color': '#00A0C6'
			});
		},
		onDeSelect: function(index, img){
			img.morph({
					'border-top-color': '#555',
					'border-left-color': '#555',
					'border-right-color': '#555',
					'border-bottom-color': '#555'
			});
//		onFocus: $empty, //mouseover of target area
//		onBlur: $empty, //mouseout of target area
//		onEmpty: $empty,
//		onRemoveItem: $empty,
//		onRemoveItems: $empty,
//		onScroll: $empty,
//		onPageForward: $empty,
//		onPageBack: $empty,
		}
	},
	imgs: [],
	selected: [],
	initialize: function(options) {
		//set the options
		this.setOptions(options);
		//save a reference to the container
		this.container = document.id(this.options.container);
		//get the captions from the options
		var captions = ($type(this.options.captions) == "string")
			?this.container.getElements(this.options.captions)
			:this.options.captions;
		//get the images from the options
		var imgs = ($type(this.options.images) == "string")
			?this.container.getElements(this.options.images)
			:this.options.images;
		//loop through each one
		imgs.each(function(img, index) {
			//add it to the menu
			this.addItem(img, captions[index], null);
		}, this);
		
		this.fireEvent('onItemsAdded', this.imgs, 50);
		this.side = (this.options.useAxis == 'x')?'left':'top';
		this.container.setStyle(this.side, this.container.getStyle(this.side).toInt()||0);
		this.onFocusDelay = this.options.initialFocusDelay;
		//set up the events
		this.setupEvents();
	},
	toElement: function(){
		return this.container;
	},
	bound: {
			mouseover: {},
			mouseout: {}
	},
	scrollTo: function(index, useFx){
		//set useFx default to true
		useFx = $pick(useFx, true);
		//get the current range in view
		var currentRange = this.calculateRange();
		//if we're there, exit
		if (index == currentRange.start) return this;
		//get the range for the new position
		var newRange = this.calculateRange(index);
		//if this returns no items, exit
		if (!newRange.elements.length) return this; //no next page! >> Ajax here
		//make sure the container has a position set
		if (this.container.getStyle('position') == 'static') this.container.setStyle('position', 'relative');
		//create the scroll effects if not present already
		if (!this.scrollerFx) 
			this.scrollerFx = new Fx.Tween(this.container, $merge(this.options.scrollFxOptions, {property: this.side, wait: false}));
		//scroll to the new location
		if (useFx) {
			this.scrollerFx.start(-newRange.elements[0].offset).chain(function(){
			//set the index to be this new location
				this.fireEvent('onScroll', [index, newRange]);
			}.bind(this));
		} else {
			//we're not using effects, so just jump to the location
			this.scrollerFx.set(-newRange.elements[0].offset);
			this.fireEvent('onScroll', [index, newRange]);
		}
		this.currentOffset = index;
		return this;
	},
	pageForward: function(howMany){
		var range = this.calculateRange();
		return this.scrollTo(($type(howMany) == "number")?range.start+howMany:range.end);
	},
	pageBack: function(howMany) {
		return this.scrollTo(($type(howMany) == "number")?this.currentOffset-howMany:this.calculateRange(this.currentOffset, true).start);
	},
	addItem: function(img, caption, where) {
		if (caption) {
			img.store('caption', caption);
			caption.store('image', img);
		}
		//figure out where to put it
		where = ($defined(where))?where:this.imgs.length;
		//if we've already got this image in there, remove it before putting it in the right place
		if (this.imgs.contains(img)) this.removeItems([img], true);
		//insert the image and caption into the array of these things
		this.imgs.splice(where, 0, document.id(img));

		//set up the events for the element
		this.setupIconEvents(img, caption);
		this.fireEvent('onAdd', [img, caption]);
		return this;
	},
	removeItems: function(imgs, useFx){
		var range = this.calculateRange();
		if (!imgs.length) return this;;
		//create a copy; this is because
		//IconMenu.empty passes *this.selected*
		//which we modify in the process of removing things
		//so we must work on a copy of that so we don't change
		//the list as we iterate over it
		imgs = $A(imgs);
		//set the fx default
		useFx = $pick(useFx, true);
		//placeholder for the items we're removing; the effect will
		//only be applied to the dom element that contains the image and the caption
		var fadeItems = [];
		var fadeItemImgs = [];
		//the effect we'll use
		var effect = {
				width: 0,
				'border-width':0
		};
		//an object to store all the copies of the effect; one for each item to be passed
		//to Fx.Elements
		var fadeEffects = {};
		//for items that aren't in the current view, we're not going to use a transition
		var itemsToQuietlyRemove = {
			before: [],
			beforeImgs: [],
			after: [],
			afterImgs: []
		};
				
		//a list of all the icons by index
		var indexes = [];
		//for each image in the set to be removed
		imgs.each(function(image){
			var index = this.imgs.indexOf(image);
			//if the image is visible
			if (index >= range.end) {
				itemsToQuietlyRemove.after.push(image.getParent());
				itemsToQuietlyRemove.afterImgs.push(image);
			} else if (index < range.start) {
				itemsToQuietlyRemove.before.push(image.getParent());
				itemsToQuietlyRemove.beforeImgs.push(image);
			} else {
				//store the parent of the image
				fadeItems.push(image.getParent());
				fadeItemImgs.push(image);
				//copy the effect value for this item
				fadeEffects[fadeItems.length-1] = $unlink(effect);
			}
			//remove the reference in the selected array
			//because when it's gone, it won't be selected anymore
			this.selected.erase(image);
			//store the index of where this image was in the menu
			indexes.push(index);
		}, this);
		//for the list of images in the menu that were selected, remove them
		//we didn't do this earlier so we could avoid changing
		//the array while we were working on it
		this.imgs = this.imgs.filter(function(img, index){
			return !indexes.contains(index);
		});
		var removed = [];
		//items page left, remove them, but then we have to update the scroll offset to account
		//for their departure
		if (itemsToQuietlyRemove.before.length) {
			var scrollTo = this.imgs.indexOf(range.elements[0].image);
			itemsToQuietlyRemove.before.each(function(el, index){
				this.fireEvent('onRemoveItem', [el]);
				var img = itemsToQuietlyRemove.beforeImgs[index];
				removed.push(img);
				try {
					el.dispose();
					//scroll to the current offset again quickly
				}catch(e){ dbug.log('before: error removing element %o, %o', el, e); }
			}, this);
			this.scrollTo(scrollTo, false);
		}
		//for items page right, just remove them quickly and quietly
		itemsToQuietlyRemove.after.each(function(el, index){
			this.fireEvent('onRemoveItem', [el]);
			removed.push(itemsToQuietlyRemove.afterImgs[index]);
			try {
				el.dispose(); 
			}catch(e){ dbug.log('after: error removing element %o, %o', el, e); }
		});

		//define a function that removes all the items from the dom
		function clean(range, additionalItems){
			var items = [];
			//then fade out the items that are currently visible
			fadeItems.each(function(el, index){
				this.fireEvent('onRemoveItem', [el]);
				items.push(fadeItemImgs[index]);
				try {
					el.dispose(); 
				}catch(e){ dbug.log('fade: error removing element %o, %o', el, e); }
			}, this);
			items.combine(additionalItems);
			this.fireEvent('onRemoveItems', [items]);
			range = this.calculateRange();
			if (range.elements == 0 && range.start > 0) this.pageBack();
			//if there aren't any items left, fire the onEmpty event
			if (!this.imgs.length) this.fireEvent('onEmpty');
		}
		//if we're using effects, do the transition then call clean()
		if (useFx) new Fx.Elements(fadeItems).start(fadeEffects).chain(clean.bind(this, [range, removed]));
		//else just clean
		else clean.apply(this, [range, removed]);
		return this;
	},
	removeSelected: function(useFx){
		this.removeItems(this.selected, useFx);
		return this;
	},
	empty: function(suppressEvent){
		//placeholder for the effects and items
		var effect = {};
		var items = [];
		//loop through all the images in the icon menu
		this.imgs.each(function(img, index){
			//add the icon container to the list of items to remove
			items.push(img.getParent());
			//create a reference for each one to pass to Fx.Elements
			effect[index] = {opacity: 0};
		});
		//create an instance of Fx.Elements and fade them all out
		new Fx.Elements(items).start(effect).chain(function(){
			//then remove them all instantly
			this.removeItems(this.imgs, false);
			//and fire the onEmpty event
			if (!suppressEvent) this.fireEvent('onEmpty');
		}.bind(this));
		return this;
	},
	selectItem: function(index, select){
		//get the image to select
		var img = this.imgs[index];
		//add or remove the "selected" class
		if ($defined(select)) {
			if (select) img.addClass('selected');
			else img.removeClass('selected');
		} else {
			img.toggleClass('selected');
		}
		//if it has the class, then fade the border blue
		if (img.hasClass('selected')){
			//store this image in the index of selected images
			this.selected.push(img);
			this.fireEvent('select', [index, img]);
		} else {
			//else we're deselecting; remove the image from the index of selected images
			this.selected.erase(img);
			this.fireEvent('onDeSelect', [index, img]);
		}
		return this;
	},
	getDefaultWidth: function(){
		//if the user specified a width, just return it
		if ($type(this.options.length) == "number") return this.options.length;
		//if, on the other hand, they specified another element than the container
		//to calculate the width, use it
		var container = document.id(this.options.length);
		//otherwise, use the container
		if (!container) container = this.container.getParent();
		//return the width or height of that element, depending on the axis chosen in the options
		return container.getSize()[this.options.useAxis];
	},
	getIconPositions: function(){
		var offsets = [];
		var cumulative = 0;
		var prev;
		//loop through all the items
		this.imgs.each(function(img, index){
			//we're measuring the element that contains the image
			var parent = img.getParent();
			//get the width or height of that parent using the appropriate axis
			cumulative += (prev)?img['offset'+this.side.capitalize()] - prev['offset'+this.side.capitalize()]:0;
			prev = img;
			//var size = parent.getSize().size[this.options.useAxis]
			//store the data
			offsets.push({
				image: img,
				size: parent.getSize()[this.options.useAxis],
				offset: cumulative,
				container: parent
			});
		}, this);
		return offsets;
	},
	calculateRange: function(index, fromEnd){
		if (!this.imgs.length) return {start: 0, end: 0, elements: []};
		index = $pick(index, this.currentOffset||0);
		if (index < 0) index = 0;
		//dbug.trace();
		//get the width of space that icons are visible
		var length = this.getDefaultWidth();
		//get the positions of all the icons
		var positions = this.getIconPositions();
		var referencePoint;
		//if we're paginating forward the reference point is the left edge 
		//of the range is the left edge of the first icon
		//but if we're going backwards, the referencePoint is the left edge of the first icon currently in range
		//the problem is if the user removes the entire last page of icons, then this
		//item no longer exists, so...
		if (positions[index]) {
			//if the item exists, use it
			referencePoint = positions[index].offset;
		} else {
			//else the right edge of the last icon is the reference point
			//the last icon is the container of the last image
			var lastIcon = this.imgs.getLast().getParent();
			var coords = lastIcon.getCoordinates();
			//and the reference point is that icon's width plus it's left offset minus the offset 
			//of the parent (which gets offset negatively and positively for scrolling
			referencePoint = coords.width + coords.left - lastIcon.getParent().getPosition().x;
		}
		//figure out which ones are in range
		var range = positions.filter(function(position, i){
			//if the index supplied is the endpoint
			//then it's in range if the index of the icon is less than the index,
			//and the left side is less than that of the one at the end point
			//and if the left side is greater than or equal to the end point's position minus the length
			if (fromEnd) return i < index && 
				position.offset < referencePoint &&
				position.offset >= referencePoint-length;
			
			//else we go forward...
			//if the item is after the index start and the posision is 
			//less than or equal to the max width defined, include it
			else return i >= index && position.offset+position.size <= length+positions[index].offset;
		});
		//return the data
		return (fromEnd)?{start: index-range.length, end: index, elements: range}
					 :{start: index, end: range.length+index, elements: range};
	},
	inRange: function(index) {
		//calculate the range
		var range = this.calculateRange();
		//return the result
		return index < range.end && index >= range.start;
	},
	setupEvents: function(){
		document.id(this.options.container).addEvents({
			"mouseleave": function() {
				if (this.inFocus) this.inFocus = null;
				this.imgOut(null, true);
			}.bind(this)
		});
		
		$$(this.options.backScrollButtons).each(function(el){
			el.addEvents({
				click: this.pageBack.bind(this),
				mouseover: function(){ this.addClass('hover'); },
				mouseout: function(){ this.removeClass('hover'); }
			});
		}, this);
		$$(this.options.forwardScrollButtons).each(function(el){
			el.addEvents({
				click: this.pageForward.bind(this),
				mouseover: function(){ this.addClass('hover'); },
				mouseout: function(){ this.removeClass('hover'); }
			});
		}, this);

		$$(this.options.clearLinks).each(function(el){
			el.addEvent('click', this.empty.bind(this));
		}, this);
		$$(this.options.removeLinks).each(function(el){
			el.addEvent('click', this.removeSelected.bind(this));
		}, this);
	},
	imgOver: function(img){
		//set the value of what's in focus to be this image
		this.inFocus = img;
		//clear the overTimeout
		$clear(this.overTimeout);
		//delay for the duration of the onFocusDelay option
		this.overTimeout = (function(){
			this.onFocusDelay = this.options.onFocusDelay;
			//if the user is still focused on the image, fire the onFocus event
			if (this.inFocus == img) this.fireEvent("onFocus", [img, this.imgs.indexOf(img)]);
		}).delay(this.onFocusDelay, this);
	},
	imgOut: function(img, force){
		if (!$defined(img) && force) img = this.prevFocus||this.imgs[0];
		//if the focused image is this one
		if (this.inFocus == img && img) {
			//set it to null
			this.inFocus = null;
			//clear the delay timeout
			$clear(this.outTimeout);
			//wait the duration of the onBlurDelay
			this.outTimeout = (function(){
				this.prevFocus = img;
				//if we're not still focused on this image, fire onBlur
				if (this.inFocus != img || (img == null && force)) this.fireEvent("onBlur", [img, this.imgs.indexOf(img)]);
				if (!this.inFocus) this.onFocusDelay = this.options.initialFocusDelay;
			}).delay(this.options.onBlurDelay, this);
		}
	},
	setupIconEvents: function(img, caption){
		//add the click event
		img.addEvents({
			click: function(e){
				//if the user is holding down control, select the image
				if (e.control||e.meta) {
					this.selectItem(this.imgs.indexOf(img));
					e.stop();
				}
			}.bind(this)
		});
		img.getParent().addEvents({
			mouseover: this.imgOver.bind(this, img),
			mouseout: this.imgOver.bind(this, img)
		});
	}
});

/*
Script: modalizer.js
	Defines Modalizer: functionality to overlay the window contents with a semi-transparent layer that prevents interaction with page content until it is removed

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var Modalizer = new Class({
	defaultModalStyle: {
		display:'block',
		position:'fixed',
		top:0,
		left:0,	
		'z-index':5000,
		'background-color':'#333',
		opacity:0.8
	},
	setModalOptions: function(options){
		this.modalOptions = $merge({
			width:(window.getScrollSize().x),
			height:(window.getScrollSize().y),
			elementsToHide: 'select, embed' + (Browser.Engine.trident ? '': ', object'),
			hideOnClick: true,
			modalStyle: {},
			updateOnResize: true,
			layerId: 'modalOverlay',
			onModalHide: $empty,
			onModalShow: $empty
		}, this.modalOptions, options);
		return this;
	},
	layer: function(){
		if (!this.modalOptions.layerId) this.setModalOptions();
		return document.id(this.modalOptions.layerId) || new Element('div', {id: this.modalOptions.layerId}).inject(document.body);
	},
	resize: function(){
		if (this.layer()) {
			this.layer().setStyles({
				width:(window.getScrollSize().x),
				height:(window.getScrollSize().y)
			});
		}
	},
	setModalStyle: function (styleObject){
		this.modalOptions.modalStyle = styleObject;
		this.modalStyle = $merge(this.defaultModalStyle, {
			width:this.modalOptions.width,
			height:this.modalOptions.height
		}, styleObject);
		if (this.layer()) this.layer().setStyles(this.modalStyle);
		return(this.modalStyle);
	},
	modalShow: function(options){
		this.setModalOptions(options);
		this.layer().setStyles(this.setModalStyle(this.modalOptions.modalStyle));
		if (Browser.Engine.trident4) this.layer().setStyle('position','absolute');
		this.layer().removeEvents('click').addEvent('click', function(){
			this.modalHide(this.modalOptions.hideOnClick);
		}.bind(this));
		this.bound = this.bound||{};
		if (!this.bound.resize && this.modalOptions.updateOnResize) {
			this.bound.resize = this.resize.bind(this);
			window.addEvent('resize', this.bound.resize);
		}
		if ($type(this.modalOptions.onModalShow)  == "function") this.modalOptions.onModalShow();
		this.togglePopThroughElements(0);
		this.layer().setStyle('display','block');
		return this;
	},
	modalHide: function(override, force){
		if (override === false) return false; //this is internal, you don't need to pass in an argument
		this.togglePopThroughElements(1);
		if ($type(this.modalOptions.onModalHide) == "function") this.modalOptions.onModalHide();
		this.layer().setStyle('display','none');
		if (this.modalOptions.updateOnResize) {
			this.bound = this.bound||{};
			if (!this.bound.resize) this.bound.resize = this.resize.bind(this);
			window.removeEvent('resize', this.bound.resize);
		}
		return this;
	},
	togglePopThroughElements: function(opacity){
		if (Browser.Engine.trident4 || (Browser.Engine.gecko && Browser.Platform.mac)) {
			$$(this.modalOptions.elementsToHide).each(function(sel){
				sel.setStyle('opacity', opacity);
			});
		}
	}
});

/*
Script: ObjectBrowser.js
	Creates a tree view of any javascript object.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/

var ObjectBrowser = new Class({
	Implements: [Options, Events],
	options: {
//	onLeafClick: $empty,
		onBranchClick: function(data){
			this.showLevel(data.path?data.path+'.'+data.key:data.key, data.nodePath);
		},
		initPath: '',
		buildOnInit: true,
		data: {},
		excludeKeys: [],
		includeKeys: []
	},
	initialize: function(container, options){
		this.container = document.id(container);
		this.setOptions(options);
		this.data = $H(this.options.data);
		this.levels = {};
		this.elements = {};
		if (this.options.buildOnInit) this.showLevel(this.options.initPath, this.container);
	},
	toElement: function(){
		return this.container;
	},
	//gets a member of the object by path; eg "fruits.apples.green" will return the value at that path.
	//path - the string path
	//parent - (boolean) if true, will return the parent of the item found ( in the example above, fruits.apples)
	getMemberByPath: function(path, parent){
		if (path === "" || path == "top") return this.data.getClean();
		var h = parent?$H(parent):this.data;
		return h.getFromPath(path);
	},
	//replaceMemberByPath will set the location at the path to the value passed in
	replaceMemberByPath: function(path, value){
		if (path === "" || path == "top") return this.data = $H(value);
		var parentObj = this.getMemberByPath( path, true );
		parentObj[path.split(".").pop()] = value;
		return this.data;
	},
	//gets the path for a given dom node.
	getPathByNode: function(el) {
		return $H(this.elements).keyOf(el);
	},
	//validates that a key is a valid node value
	//against options.includeKeys and options.excludeKeys
	validLevel: function(key){
		return (!this.options.excludeKeys.contains(key) && 
			 (!this.options.includeKeys.length || this.options.includeKeys.contains(key)));
	},
	//builds a level into the interface given a path
	buildLevel:function(path) {
		//if the path ends in a dot, remove it
		if (path.test(".$")) path = path.substring(0, path.length);
		//get the corresponding level for the path
		var level = this.getMemberByPath(path);
		//if the path already has been built, return
		if (this.levels[path]) return this.levels[path];
		//create the section
		var section = new Element('ul');
		switch($type(level)) {
			case "function":
					this.buildNode(level, "function()", section, path, true);
				break;
			case "string": case "number":
					this.buildNode(level, null, section, path, true);
				break;
			case "array":
				level.each(function(node, index){
					this.buildNode(node, index, section, path, ["string", "function"].contains($type(node)));
				}.bind(this));
				break;
			default:
				$H(level).each(function(value, key){
					var db = false;
					if (key == "element_dimensions") db = true;
					if (db) dbug.log(key);
					if (this.validLevel(key)) {
						if (db) dbug.log('is valid level');
						var isLeaf;
						if ($type(value) == "object") {
							isLeaf = false;
							$each(value, function(v, k){
								if (this.validLevel(k)) {
									if (db) dbug.log('not a leaf!');
									isLeaf = false;
								} else {
									isLeaf = true;
								}
							}, this);
							if (isLeaf) value = false;
						}
						if (db) dbug.log(value, key, section, path, $chk(isLeaf)?isLeaf:null);
						this.buildNode(value, key, section, path, $chk(isLeaf)?isLeaf:null);
					}
				}, this);
		}
		//set the resulting DOM element to the levels map
		this.levels[path] = section;
		//return the section
		return section;
	},
	//gets the parent node for an element
	getParentFromPath: function(path){
		return this.elements[(path || "top")+'NODE'];
	},
	//displays a level given a path
	//if the level hasn't been built yet,
	//the level is built and then injected
	//into the target using the given method
	//example:
	//showLevel("fruit.apples", "fruit", "injectInside");
	//note that target and method are set to the parent path and injectInside by default
	showLevel: function(path, target, method){
		target = target || path;
		if (! this.elements[path]) 
			this.elements[path] = this.buildLevel(path)[method||"inject"](this.elements[target]||this.container);
		else this.elements[path].toggle();
		dbug.log('toggle class');
		this.elements[path].getParent().toggleClass('collapsed');
		return this;
	},
	//builds a node given the arguments:
	//value - the value of the node
	//key - the key of the node
	//section - the container where this node goes; typically a section generated by buildLevel
	//path - the path to this node
	//leaf - boolean; true if this is a leaf node
	//note: if the key or the value is an empty string, leaf will be set to true.
	buildNode: function(value, key, section, path, leaf){
		if (key==="" || value==="") leaf = true;
		if (!this.validLevel(key)) return null;
		var nodePath = (path?path+'.'+key:key)+'NODE';
		var lnk = this.buildLink((leaf)?value||key:$chk(key)?key:value, leaf);
		var li = new Element('li').addClass((leaf)?'leaf':'branch collapsed').adopt(lnk).inject(section);
		lnk.addEvent('click', function(e){
			e.stopPropagation();
			if (leaf) {
				this.fireEvent('onLeafClick', {
					li: li, 
					key: key, 
					value: value, 
					path: path,
					nodePath: nodePath,
					event: e
				});
			} else {
				this.fireEvent('onBranchClick', {
					li: li, 
					key: key, 
					value: value, 
					path: path,
					nodePath: nodePath,
					event: e
				});
			}							
		}.bind(this));
		this.elements[nodePath] = li;
		return li;
	},
	//builds a link for a given key
	buildLink: function(key) {
		if ($type(key) == "function") {
			key = key.toString();
			key = key.substring(0, key.indexOf("{")+1)+"...";
		}
		return new Element('a', {
			href: "javascript: void(0);"
		}).set('html', key);
	}
});

/*
Script: StyleWriter.js

Provides a simple method for injecting a css style element into the DOM if it's not already present.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/

var StyleWriter = new Class({
	createStyle: function(css, id) {
		window.addEvent('domready', function(){
			try {
				if (document.id(id) && id) return;
				var style = new Element('style', {id: id||''}).inject($$('head')[0]);
				if (Browser.Engine.trident) style.styleSheet.cssText = css;
				else style.set('text', css);
			}catch(e){dbug.log('error: %s',e);}
		}.bind(this));
	}
});

/*
Script: StickyWin.js

Creates a div within the page with the specified contents at the location relative to the element you specify; basically an in-page popup maker.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/

var StickyWin = new Class({
	Binds: ['destroy', 'hide', 'togglepin', 'esc'],
	Implements: [Options, Events, StyleWriter, Class.ToElement],
	options: {
//		onDisplay: $empty,
//		onClose: $empty,
//		onDestroy: $empty,
		closeClassName: 'closeSticky',
		pinClassName: 'pinSticky',
		content: '',
		zIndex: 10000,
		className: '',
//		id: ... set above in initialize function
/*  	these are the defaults for Element.position anyway
		************************************************
		edge: false, //see Element.position
		position: 'center', //center, corner == upperLeft, upperRight, bottomLeft, bottomRight
		offset: {x:0,y:0},
		relativeTo: document.body, */
		width: false,
		height: false,
		timeout: -1,
		allowMultipleByClass: false,
		allowMultiple: true,
		showNow: true,
		useIframeShim: true,
		iframeShimSelector: '',
		destroyOnClose: false,
		closeOnClickOut: false,
		closeOnEsc: false
	},

	css: '.SWclearfix:after {content: "."; display: block; height: 0; clear: both; visibility: hidden;}'+
		 '.SWclearfix {display: inline-table;} * html .SWclearfix {height: 1%;} .SWclearfix {display: block;}',
	
	initialize: function(options){
		this.options.inject = this.options.inject || {
			target: document.body,
			where: 'bottom' 
		};
		this.setOptions(options);
		this.id = this.options.id || 'StickyWin_'+new Date().getTime();
		this.makeWindow();

		if (this.options.content) this.setContent(this.options.content);
		if (this.options.timeout > 0) {
			this.addEvent('onDisplay', function(){
				this.hide.delay(this.options.timeout, this)
			}.bind(this));
		}
		//add css for clearfix
		this.createStyle(this.css, 'StickyWinClearFix');
		if (this.options.closeOnClickOut || this.options.closeOnEsc) this.attach();
		if (this.options.destroyOnClose) this.addEvent('close', this.destroy);
		if (this.options.showNow) this.show();
	},
	attach: function(attach){
		var method = $pick(attach, true) ? 'addEvents' : 'removeEvents';
		var events = {};
		if (this.options.closeOnClickOut) events.click = this.esc;
		if (this.options.closeOnEsc) events.keyup = this.esc;
		document[method](events);
	},
	esc: function(e) {
		if (e.key == "esc") this.hide();
		if (e.type == "click" && this.element != e.target && !this.element.hasChild(e.target)) this.hide();
	},
	makeWindow: function(){
		this.destroyOthers();
		if (!document.id(this.id)) {
			this.win = new Element('div', {
				id:		this.id
			}).addClass(this.options.className).addClass('StickyWinInstance').addClass('SWclearfix').setStyles({
			 	display:'none',
				position:'absolute',
				zIndex:this.options.zIndex
			}).inject(this.options.inject.target, this.options.inject.where).store('StickyWin', this);			
		} else this.win = document.id(this.id);
		this.element = this.win;
		if (this.options.width && $type(this.options.width.toInt())=="number") this.win.setStyle('width', this.options.width.toInt());
		if (this.options.height && $type(this.options.height.toInt())=="number") this.win.setStyle('height', this.options.height.toInt());
		return this;
	},
	show: function(suppressEvent){
		this.showWin();
		if (!suppressEvent) this.fireEvent('display');
		if (this.options.useIframeShim) this.showIframeShim();
		this.visible = true;
		return this;
	},
	showWin: function(){
		if (!this.positioned) this.position();
		this.win.show();
	},
	hide: function(suppressEvent){
		if ($type(suppressEvent) == "event" || !suppressEvent) this.fireEvent('close');
		this.hideWin();
		if (this.options.useIframeShim) this.hideIframeShim();
		this.visible = false;
		return this;
	},
	hideWin: function(){
		this.win.setStyle('display','none');
	},
	destroyOthers: function() {
		if (!this.options.allowMultipleByClass || !this.options.allowMultiple) {
			$$('div.StickyWinInstance').each(function(sw) {
				if (!this.options.allowMultiple || (!this.options.allowMultipleByClass && sw.hasClass(this.options.className))) 
					sw.retrieve('StickyWin').destroy();
			}, this);
		}
	},
	setContent: function(html) {
		if (this.win.getChildren().length>0) this.win.empty();
		if ($type(html) == "string") this.win.set('html', html);
		else if (document.id(html)) this.win.adopt(html);
		this.win.getElements('.'+this.options.closeClassName).each(function(el){
			el.addEvent('click', this.hide);
		}, this);
		this.win.getElements('.'+this.options.pinClassName).each(function(el){
			el.addEvent('click', this.togglepin);
		}, this);
		return this;
	},
	position: function(options){
		this.positioned = true;
		this.setOptions(options);
		this.win.position({
			allowNegative: $pick(this.options.allowNegative, this.options.relativeTo != document.body),
			relativeTo: this.options.relativeTo,
			position: this.options.position,
			offset: this.options.offset,
			edge: this.options.edge
		});
		if (this.shim) this.shim.position();
		return this;
	},
	pin: function(pin) {
		if (!this.win.pin) {
			dbug.log('you must include element.pin.js!');
			return this;
		}
		this.pinned = $pick(pin, true);
		this.win.pin(pin);
		return this;
	},
	unpin: function(){
		return this.pin(false);
	},
	togglepin: function(){
		return this.pin(!this.pinned);
	},
	makeIframeShim: function(){
		if (!this.shim){
			var el = (this.options.iframeShimSelector)?this.win.getElement(this.options.iframeShimSelector):this.win;
			this.shim = new IframeShim(el, {
				display: false,
				name: 'StickyWinShim'
			});
		}
	},
	showIframeShim: function(){
		if (this.options.useIframeShim) {
			this.makeIframeShim();
			this.shim.show();
		}
	},
	hideIframeShim: function(){
		if (this.shim) this.shim.hide();
	},
	destroy: function(){
		if (this.win) this.win.destroy();
		if (this.options.useIframeShim && this.shim) this.shim.destroy();
		if (document.id('modalOverlay')) document.id('modalOverlay').destroy();
		this.fireEvent('destroy');
	}
});


/*
Script: StickyWin.Fx.js

	Extends StickyWin to create popups that fade in and out.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

/*
Script: StickyWin.Fx.js

Extends StickyWin to create popups that fade in and out and can be dragged and resized (requires StickyWin.Fx.Drag.js).

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin = Class.refactor(StickyWin, {
	options: {
		//fadeTransition: 'sine:in:out',
		fade: true,
		fadeDuration: 150
	},
	hideWin: function(){
		if (this.options.fade) this.fade(0);
		else this.previous();
	},
	showWin: function(){
		if (this.options.fade) this.fade(1);
		else this.previous();
	},
	hide: function(){
		this.previous(this.options.fade);
	},
	show: function(){
		this.previous(this.options.fade);
	},
	fade: function(to){
		if (!this.fadeFx) {
			this.win.setStyles({
				opacity: 0,
				display: 'block'
			});
			var opts = {
				property: 'opacity',
				duration: this.options.fadeDuration
			};
			if (this.options.fadeTransition) opts.transition = this.options.fadeTransition;
			this.fadeFx = new Fx.Tween(this.win, opts);
		}
		if (to > 0) {
			this.win.setStyle('display','block');
			this.position();
		}
		this.fadeFx.clearChain();
		this.fadeFx.start(to).chain(function (){
			if (to == 0) {
				this.win.setStyle('display', 'none');
				this.fireEvent('onClose');
			} else {
				this.fireEvent('onDisplay');
			}
		}.bind(this));
		return this;
	}
});
StickyWin.Fx = StickyWin;

/*
Script: StickyWin.Drag.js

Implements drag and resize functionaity into StickyWin.Fx. See StickyWin.Fx for the options.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin = Class.refactor(StickyWin, {
	options: {
		draggable: false,
		dragOptions: {},
		dragHandleSelector: '.dragHandle',
		resizable: false,
		resizeOptions: {},
		resizeHandleSelector: ''
	},
	setContent: function(html){
		this.previous(html);
		if (this.options.draggable) this.makeDraggable();
		if (this.options.resizable) this.makeResizable();
		return this;
	},
	makeDraggable: function(){
		var toggled = this.toggleVisible(true);
		if (this.options.useIframeShim) {
			this.makeIframeShim();
			var onComplete = (this.options.dragOptions.onComplete || $empty);
			this.options.dragOptions.onComplete = function(){
				onComplete();
				this.shim.position();
			}.bind(this);
		}
		if (this.options.dragHandleSelector) {
			var handle = this.win.getElement(this.options.dragHandleSelector);
			if (handle) {
				handle.setStyle('cursor','move');
				this.options.dragOptions.handle = handle;
			}
		}
		this.win.makeDraggable(this.options.dragOptions);
		if (toggled) this.toggleVisible(false);
	}, 
	makeResizable: function(){
		var toggled = this.toggleVisible(true);
		if (this.options.useIframeShim) {
			this.makeIframeShim();
			var onComplete = (this.options.resizeOptions.onComplete || $empty);
			this.options.resizeOptions.onComplete = function(){
				onComplete();
				this.shim.position();
			}.bind(this);
		}
		if (this.options.resizeHandleSelector) {
			var handle = this.win.getElement(this.options.resizeHandleSelector);
			if (handle) this.options.resizeOptions.handle = this.win.getElement(this.options.resizeHandleSelector);
		}
		this.win.makeResizable(this.options.resizeOptions);
		if (toggled) this.toggleVisible(false);
	},
	toggleVisible: function(show){
		if (!this.visible && Browser.Engine.webkit && $pick(show, true)) {
			this.win.setStyles({
				display: 'block',
				opacity: 0
			});
			return true;
		} else if (!$pick(show, false)){
			this.win.setStyles({
				display: 'none',
				opacity: 1
			});
			return false;
		}
		return false;
	}
});
StickyWin.Fx = StickyWin;

/*
Script: StickyWin.Modal.js

This script extends StickyWin and StickyWin.Fx classes to add Modalizer functionality.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.Modal = new Class({

	Extends: StickyWin,

	Implements: Modalizer,
	
	options: {
		modalize: true
	},

	initialize: function(options){
		options = options||{};
		this.setModalOptions($merge(options.modalOptions||{}, {
			onModalHide: function(){
					this.hide(false);
				}.bind(this)
			}));
		this.parent(options);
	},

	show: function(showModal){
		if ($pick(showModal, this.options.modalize)) {
			this.modalShow();
			if (this.modalOptions.elementsToHide) this.win.getElements(this.modalOptions.elementsToHide).setStyle('opacity', 1);
		}
		this.parent();
	},

	hide: function(hideModal){
		if ($pick(hideModal, true)) this.modalHide();
		else this.parent();
	}

});
if (StickyWin.Fx) StickyWin.Fx.Modal = StickyWin.Modal;

/*
Script: StickyWin.Ajaxjs

Adds ajax functionality to all the StickyWin classes.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
(function(){
	var SWA = function(extend){
		return {
			Extends: extend,
			options: {
				url: '',
				showNow: false,
				requestOptions: {
					method: 'get',
					evalScripts: true
				},
				wrapWithUi: false, 
				caption: '',
				uiOptions:{},
				handleResponse: function(response){
					var responseScript = "";
					this.Request.response.text.stripScripts(function(script){	responseScript += script; });
					if (this.options.wrapWithUi) response = StickyWin.ui(this.options.caption, response, this.options.uiOptions);
					this.setContent(response);
					this.show();
					if (this.evalScripts) $exec(responseScript);
				}
			},
			initialize: function(options){
				var showNow;
				if (options && options.showNow) {
					showNow = true;
					options.showNow = false;
				}
				this.parent(options);
				this.evalScripts = this.options.requestOptions.evalScripts;
				this.options.requestOptions.evalScripts = false;
				this.createRequest();
				if (showNow) this.update();
			},
			createRequest: function(){
				this.Request = new Request(this.options.requestOptions).addEvent('onSuccess',
					this.options.handleResponse.bind(this));
			},
			update: function(url, options){
				this.Request.setOptions(options).send({url: url||this.options.url});
				return this;
			}
		};
	};
	try {	StickyWin.Ajax = new Class(SWA(StickyWin)); } catch(e){}
	try {	StickyWin.Modal.Ajax = new Class(SWA(StickyWin.Modal)); } catch(e){}
})();

/*
Script: StickyWin.Alert.js
	Defines StickyWin.Alert, a simple little alert box with a close button.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.Alert = new Class({
	Implements: Options,
	Extends: StickyWin.Modal,
	options: {
		baseHref: "http://www.cnet.com/html/rb/assets/global/simple.error.popup",
		destroyOnClose: true,
		modalOptions: {
			modalStyle: {
				zIndex: 11000
			}
		},
		zIndex: 110001,
		uiOptions: {
			width: 250,
			buttons: [
				{text: 'Ok'}
			]
		}
	},
	initialize: function(caption, message, options) {
		this.message = message;
		this.caption = caption;
		this.setOptions(options);
		this.setOptions({
			content: this.build()
		});
		this.parent(options);
	},
	makeMessage: function() {
		return new Element('p', {
			'class': 'errorMsg SWclearfix',
			styles: {
				margin: 0,
				minHeight: 10
			},
			html: this.message
		});
	},
	build: function(){
		return StickyWin.ui(this.caption, this.makeMessage(), this.options.uiOptions);
	}
});

StickyWin.Error = new Class({
	Extends: StickyWin.Alert, 
	makeMessage: function(){
		var message = this.parent();
		new Element('img', {
			src: this.options.baseHref + '/icon_problems_sm.gif',
			'class': 'bang clearfix',
			styles: {
				'float': 'left',
				width: 30,
				height: 30,
				margin: '3px 5px 5px 0px'
			}
		}).inject(message, 'top');
		return message;
	}
});

StickyWin.alert = function(caption, message, options) {
	if ($type(options) == "string") options = {baseHref: options};
	return new StickyWin.Alert(caption, message);
};

StickyWin.error = function(caption, message, options) {
	return new StickyWin.Error(caption, message, options);
};

/*
Script: StickyWin.Confirm.js
	Defines StickyWin.Conferm, a simple confirmation box with an ok and a close button.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.Confirm = new Class({
	Extends: StickyWin.Alert,
	options: {
		uiOptions: {
			width: 250
		}
	},
	build: function(callback){
		this.setOptions({
			uiOptions: {
				buttons: [
					{text: 'Cancel'},
					{
						text: 'Ok', 
						onClick: callback || function(){
							this.fireEvent('confirm');
						}.bind(this)
					}
				]
			}
		});
		return this.parent();
	}
});

StickyWin.confirm = function(caption, message, callback, options) {
	return new StickyWin.Confirm(caption, message, options).addEvent('confirm', callback);
};

/*
Script: StickyWin.Prompt.js
	Defines StickyWin.Prompt, a little prompt box with an input as well as ok close buttons.	
License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/

StickyWin.Prompt = new Class({
	Extends: StickyWin.Confirm,
	options: {
		defaultValue: ''
	},
	initialize: function(message, header, options){
		this.addEvent('display', function(){
			this.input.select();
		}.bind(this));
		this.parent.apply(this, arguments);
	},
	makeMessage: function(){
		this.input = new Element('input', {
			value: this.options.defaultValue,
			type: 'text',
			id: 'foo',
			styles: {
				width: '100%'
			},
			events: {
				keyup: function(e) {
					if (e.key == 'enter') {
						this.fireEvent('confirm', this.input.get('value'));
						this.hide();
					}
				}.bind(this)
			}
		});
		return new Element('div').adopt(this.parent()).adopt(this.input);
	},
	build: function(){
		return this.parent(function(){
			this.fireEvent('confirm', this.input.get('value'));
		}.bind(this));
	}
});

StickyWin.prompt = function(caption, message, callback, options) {
	return new StickyWin.Prompt(caption, message, options).addEvent('confirm', callback);
};

/*
Script: StickyWin.ui.js

Creates an html holder for in-page popups using a default style.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.UI = new Class({
	Implements: [Options, Class.ToElement, StyleWriter],
	options: {
		width: 300,
		css: "div.DefaultStickyWin {font-family:verdana; font-size:11px; line-height: 13px;}"+
			"div.DefaultStickyWin div.top_ul{background:url({%baseHref%}full.png) top left no-repeat; height:30px; width:15px; float:left}"+
			"div.DefaultStickyWin div.top_ur{position:relative; left:0px !important; left:-4px; background:url({%baseHref%}full.png) top right !important; height:30px; margin:0px 0px 0px 15px !important; margin-right:-4px; padding:0px}"+
			"div.DefaultStickyWin h1.caption{clear: none !important; margin:0px !important; overflow: hidden; padding:0 !important; font-weight:bold; color:#555; font-size:14px !important; position:relative; top:8px !important; left:5px !important; float: left; height: 22px !important;}"+
			"div.DefaultStickyWin div.middle, div.DefaultStickyWin div.closeBody {background:url({%baseHref%}body.png) top left repeat-y; margin:0px 20px 0px 0px !important;	margin-bottom: -3px; position: relative;	top: 0px !important; top: -3px;}"+
			"div.DefaultStickyWin div.body{background:url({%baseHref%}body.png) top right repeat-y; padding:8px 30px 8px 0px !important; margin-left:5px !important; position:relative; right:-20px !important; z-index: 1;}"+
			"div.DefaultStickyWin div.bottom{clear:both;}"+
			"div.DefaultStickyWin div.bottom_ll{background:url({%baseHref%}full.png) bottom left no-repeat; width:15px; height:15px; float:left}"+
			"div.DefaultStickyWin div.bottom_lr{background:url({%baseHref%}full.png) bottom right; position:relative; left:0px !important; left:-4px; margin:0px 0px 0px 15px !important; margin-right:-4px; height:15px}"+
			"div.DefaultStickyWin div.closeButtons{text-align: center; background:url({%baseHref%}body.png) top right repeat-y; padding: 4px 30px 8px 0px; margin-left:5px; position:relative; right:-20px}"+
			"div.DefaultStickyWin a.button:hover{background:url({%baseHref%}big_button_over.gif) repeat-x}"+
			"div.DefaultStickyWin a.button {background:url({%baseHref%}big_button.gif) repeat-x; margin: 2px 8px 2px 8px; padding: 2px 12px; cursor:pointer; border: 1px solid #999 !important; text-decoration:none; color: #000 !important;}"+
			"div.DefaultStickyWin div.closeButton{width:13px; height:13px; background:url({%baseHref%}closebtn.gif) no-repeat; position: absolute; right: 0px; margin:10px 15px 0px 0px !important; cursor:pointer;top:0px}"+
			"div.DefaultStickyWin div.dragHandle {	width: 11px;	height: 25px;	position: relative;	top: 5px;	left: -3px;	cursor: move;	background: url({%baseHref%}drag_corner.gif); float: left;}",
		cornerHandle: false,
		cssClass: '',
		baseHref: 'http://www.cnet.com/html/rb/assets/global/stickyWinHTML/',
		buttons: [],
		cssId: 'defaultStickyWinStyle',
		cssClassName: 'DefaultStickyWin',
		closeButton: true
/*	These options are deprecated:
		closeTxt: false,
		onClose: $empty,
		confirmTxt: false,
		onConfirm: $empty	*/
	},
	initialize: function() {
		var args = this.getArgs(arguments);
		this.setOptions(args.options);
		this.legacy();
		var css = this.options.css.substitute({baseHref: this.options.baseHref}, /\\?\{%([^}]+)%\}/g);
		if (Browser.Engine.trident4) css = css.replace(/png/g, 'gif');
		this.createStyle(css, this.options.cssId);
		this.build();
		if (args.caption || args.body) this.setContent(args.caption, args.body);
	},
	getArgs: function(){
		return StickyWin.UI.getArgs.apply(this, arguments);
	},
	legacy: function(){
		var opt = this.options; //saving bytes
		//legacy support
		if (opt.confirmTxt) opt.buttons.push({text: opt.confirmTxt, onClick: opt.onConfirm || $empty});
		if (opt.closeTxt) opt.buttons.push({text: opt.closeTxt, onClick: opt.onClose || $empty});
	},
	build: function(){
		var opt = this.options;

		var container = new Element('div', {
			'class': opt.cssClassName
		});
		if (opt.width) container.setStyle('width', opt.width);
		this.element = container;
		this.element.store('StickyWinUI', this);
		if (opt.cssClass) container.addClass(opt.cssClass);
		

		var bodyDiv = new Element('div').addClass('body');
		this.body = bodyDiv;
		
		var top_ur = new Element('div').addClass('top_ur');
		this.top_ur = top_ur;
		this.top = new Element('div').addClass('top').adopt(
				new Element('div').addClass('top_ul')
			).adopt(top_ur);
		container.adopt(this.top);
		
		if (opt.cornerHandle) new Element('div').addClass('dragHandle').inject(top_ur, 'top');
		
		//body
		container.adopt(new Element('div').addClass('middle').adopt(bodyDiv));
		//close buttons
		if (opt.buttons.length > 0){
			var closeButtons = new Element('div').addClass('closeButtons');
			opt.buttons.each(function(button){
				if (button.properties && button.properties.className){
					button.properties['class'] = button.properties.className;
					delete button.properties.className;
				}
				var properties = $merge({'class': 'closeSticky'}, button.properties);
				new Element('a').addEvent('click', button.onClick || $empty)
					.appendText(button.text).inject(closeButtons).set(properties).addClass('button');
			});
			container.adopt(new Element('div').addClass('closeBody').adopt(closeButtons));
		}
		//footer
		container.adopt(
			new Element('div').addClass('bottom').adopt(
					new Element('div').addClass('bottom_ll')
				).adopt(
					new Element('div').addClass('bottom_lr')
			)
		);
		if (this.options.closeButton) container.adopt(new Element('div').addClass('closeButton').addClass('closeSticky'));
		return this;
	},
	makeCaption: function(caption) {
		if (!caption) return this.destroyCaption();
		this.caption = caption;
		var opt = this.options;
		var h1Caption = new Element('h1').addClass('caption');
		if (opt.width) h1Caption.setStyle('width', (opt.width-(opt.cornerHandle?55:40)-(opt.closeButton?10:0)));
		if (document.id(this.caption)) h1Caption.adopt(this.caption);
		else h1Caption.set('html', this.caption);
		this.top_ur.adopt(h1Caption);
		this.h1 = h1Caption;
		if (!this.options.cornerHandle) this.h1.addClass('dragHandle');
		return this;
	},
	destroyCaption: function(){
		if (this.h1) {
			this.h1.destroy();
			this.h1 = null;
		}
		return this;
	},
	setContent: function(){
		var args = this.getArgs.apply(this, arguments);
		var caption = args.caption;
		var body = args.body;
		if (this.h1) this.destroyCaption();
		this.makeCaption(caption);
		if (document.id(body)) this.body.empty().adopt(body);
		else this.body.set('html', body);
		return this;
	}
});
StickyWin.UI.getArgs = function(){
	var input = $type(arguments[0]) == "arguments"?arguments[0]:arguments;
	var cap = input[0], bod = input[1];
	var args = Array.link(input, {options: Object.type});
	if (input.length == 3 || (!args.options && input.length == 2)) {
		args.caption = cap;
		args.body = bod;
	} else if (($type(bod) == 'object' || !bod) && cap && $type(cap) != 'object'){
		args.body = cap;
	}
	return args;
};

StickyWin.ui = function(caption, body, options){
	return document.id(new StickyWin.UI(caption, body, options))
};


/*
Script: StickyWin.UI.Pointy.js

Creates an html holder for in-page popups using a default style - this one including a pointer in the specified direction.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.UI.Pointy = new Class({
	Extends: StickyWin.UI,
	options: {
		theme: 'dark',
		themes: {
			dark: {
				bgColor: '#333',
				fgColor: '#ddd',
				imgset: 'dark'
			},
			light: {
				bgColor: '#ccc',
				fgColor: '#333',
				imgset: 'light'
			}
		},
		css: "div.DefaultPointyTip {vertical-align: auto; position: relative;}"+
		"div.DefaultPointyTip * {text-align:left !important}"+
		"div.DefaultPointyTip .pointyWrapper div.body{background: {%bgColor%}; color: {%fgColor%}; left: 0px; right: 0px !important;padding:  0px 10px !important;margin-left: 0px !important;font-family: verdana;font-size: 11px;line-height: 13px;position: relative;}"+
		"div.DefaultPointyTip .pointyWrapper div.top {position: relative;height: 25px; overflow: visible;}"+
		"div.DefaultPointyTip .pointyWrapper div.top_ul{background: url({%baseHref%}{%imgset%}_back.png) top left no-repeat;width: 8px;height: 25px; position: absolute; left: 0px;}"+
		"div.DefaultPointyTip .pointyWrapper div.top_ur{background: url({%baseHref%}{%imgset%}_back.png) top right !important;margin: 0 0 0 8px !important;height: 25px;position: relative;left: 0px !important;padding: 0;}"+
		"div.DefaultPointyTip .pointyWrapper h1.caption{color: {%fgColor%};left: 0px !important;top: 4px !important;clear: none !important;overflow: hidden;font-weight: 700;font-size: 12px !important;position: relative;float: left;height: 22px !important;margin: 0 !important;padding: 0 !important;}"+
		"div.DefaultPointyTip .pointyWrapper div.middle, div.DefaultPointyTip .pointyWrapper div.closeBody{background:  {%bgColor%};margin: 0 0px 0 0 !important;position: relative;top: 0 !important;}"+
		"div.DefaultPointyTip .pointyWrapper div.bottom {clear: both; width: 100% !important; background: none; height: 6px} "+
		"div.DefaultPointyTip .pointyWrapper div.bottom_ll{font-size:1; background: url({%baseHref%}{%imgset%}_back.png) bottom left no-repeat;width: 6px;height: 6px;position: absolute; left: 0px;}"+
		"div.DefaultPointyTip .pointyWrapper div.bottom_lr{font-size:1; background: url({%baseHref%}{%imgset%}_back.png) bottom right;height: 6px;margin: 0 0 0 6px !important;position: relative;left: 0 !important;}"+
		"div.DefaultPointyTip .pointyWrapper div.noCaption{ height: 6px; overflow: hidden}"+
		"div.DefaultPointyTip .pointyWrapper div.closeButton{width:13px; height:13px; background:url({%baseHref%}{%imgset%}_x.png) no-repeat; position: absolute; right: 0px; margin:0px !important; cursor:pointer; z-index: 1; top: 4px;}"+
		"div.DefaultPointyTip .pointyWrapper div.pointyDivot {background: url({%divot%}) no-repeat;}",
		baseHref: 'http://github.com/anutron/clientcide/raw/master/Assets/PointyTip/',
		divot: '{%baseHref%}{%imgset%}_divot.png',
		divotSize: 22,
		direction: 12,
		cssId: 'defaultPointyTipStyle',
		cssClassName: 'DefaultPointyTip'
	},
	initialize: function() {
		var args = this.getArgs(arguments);
		this.setOptions(args.options);
		$extend(this.options, this.options.themes[this.options.theme]);
		this.options.divot = this.options.divot.substitute(this.options, /\\?\{%([^}]+)%\}/g);
		if (Browser.Engine.trident4) this.options.divot = this.options.divot.replace(/png/g, 'gif');
		this.options.css = this.options.css.substitute(this.options, /\\?\{%([^}]+)%\}/g);
		if (args.options && args.options.theme) {
			while (!this.id) {
				var id = $random(0, 999999999);
				if (!StickyWin.UI.Pointy[id]) {
					StickyWin.UI.Pointy[id] = this;
					this.id = id;
				}
			}
			this.options.css = this.options.css.replace(/div\.DefaultPointyTip/g, "div#pointy_"+this.id);
			this.options.cssId = "pointyTipStyle_" + this.id;
		}
		if ($type(this.options.direction) == 'string') {
			var map = {
				left: 9,
				right: 3,
				up: 12,
				down: 6
			};
			this.options.direction = map[this.options.direction];
		}
		
		this.parent(args.caption, args.body, this.options);
		if (this.id) document.id(this).set('id', "pointy_"+this.id);
	},
	build: function(){
		this.parent();
		var opt = this.options;
		this.pointyWrapper = new Element('div', {
			'class': 'pointyWrapper'
		}).inject(document.id(this));
		document.id(this).getChildren().each(function(el){
			if (el != this.pointyWrapper) this.pointyWrapper.grab(el);
		}, this);

		var w = opt.divotSize;
		var h = w;
		var left = (opt.width - opt.divotSize)/2;
		var orient = function(){
			switch(opt.direction) {
				case 12: case 1: case 11:
					return {
						height: h/2
					};
				case 5: case 6: case 7:
					return {
						height: h/2,
						backgroundPosition: '0 -'+h/2+'px'
					};
				case 8: case 9: case 10:
					return {
						width: w/2
					};
				case 2: case 3: case 4:
					return {
						width: w/2,
						backgroundPosition: '100%'
					};
			};
		};
		this.pointer = new Element('div', {
			styles: $extend({
				width: w,
				height: h,
				overflow: 'hidden'
			}, orient()),
			'class': 'pointyDivot pointy_'+opt.direction
		}).inject(this.pointyWrapper);
	},
	expose: function(){
		if (document.id(this).getStyle('display') != 'none' && document.id(document.body).hasChild(document.id(this))) return $empty;
		document.id(this).setStyles({
			visibility: 'hidden',
			position: 'absolute'
		});
		var dispose;
		if (!document.body.hasChild(document.id(this))) {
			document.id(this).inject(document.body);
			dispose = true;
		}
		return (function(){
			if (dispose) document.id(this).dispose();
			document.id(this).setStyles({
				visibility: 'visible',
				position: 'relative'
			});
		}).bind(this);
	},
	positionPointer: function(options){
		if (!this.pointer) return;
		var opt = options || this.options;
		var pos;
		var d = opt.direction;
		switch (d){
			case 12: case 1: case 11:
				pos = {
					edge: {x: 'center', y: 'bottom'},
					position: {
						x: d==12?'center':d==1?'right':'left', 
						y: 'top'
					},
					offset: {
						x: (d==12?0:d==1?-1:1)*opt.divotSize,
						y: 1
					}
				};
				break;
			case 2: case 3: case 4:
				pos = {
					edge: {x: 'left', y: 'center'},
					position: {
						x: 'right', 
						y: d==3?'center':d==2?'top':'bottom'
					},
					offset: {
						x: -1,
						y: (d==3?0:d==4?-1:1)*opt.divotSize
					}
				};
				break;
			case 5: case 6: case 7:
				pos = {
					edge: {x: 'center', y: 'top'},
					position: {
						x: d==6?'center':d==5?'right':'left', 
						y: 'bottom'
					},
					offset: {
						x: (d==6?0:d==5?-1:1)*opt.divotSize,
						y: -1
					}
				};
				break;
			case 8: case 9: case 10:
				pos = {
					edge: {x: 'right', y: 'center'},
					position: {
						x: 'left', 
						y: d==9?'center':d==10?'top':'bottom'
					},
					offset: {
						x: 1,
						y: (d==9?0:d==8?-1:1)*opt.divotSize
					}
				};
				break;
		};
		var putItBack = this.expose();
		this.pointer.position($extend({
			relativeTo: this.pointyWrapper
		}, pos, options));
		putItBack();
	},
	setContent: function(a1, a2){
		this.parent(a1, a2);
		this.top[this.h1?'removeClass':'addClass']('noCaption');
		if (Browser.Engine.trident4) document.id(this).getElements('.bottom_ll, .bottom_lr').setStyle('font-size', 1); //IE6 bullshit
		if (this.options.closeButton) this.body.setStyle('margin-right', 6);
		this.positionPointer();
		return this;
	},
	makeCaption: function(caption){
		this.parent(caption);
		if (this.options.width && this.h1) this.h1.setStyle('width', (this.options.width-(this.options.closeButton?25:15)));
	}
});

StickyWin.UI.pointy = function(caption, body, options){
	return document.id(new StickyWin.UI.Pointy(caption, body, options));
};
StickyWin.ui.pointy = StickyWin.UI.pointy;

/*
Script: StickyWin.PointyTip.js
	Positions a pointy tip relative to the element you specify.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.PointyTip = new Class({
	Extends: StickyWin,
	options: {
		point: "left",
		pointyOptions: {}
	},
	initialize: function(){
		var args = this.getArgs(arguments);
		this.setOptions(args.options);
		var popts = this.options.pointyOptions;
		var d = popts.direction;
		if (!d) {
			var map = {
				left: 9,
				right: 3,
				up: 12,
				down: 6
			};
			d = map[this.options.point];
			if (!d) d = this.options.point;
			popts.direction = d;
		}
		if (!popts.width) popts.width = this.options.width;
		this.pointy = new StickyWin.UI.Pointy(args.caption, args.body, popts);
		this.options.content = null;
		this.setOptions(args.options, this.getPositionSettings());
		this.parent(this.options);
		this.win.empty().adopt(document.id(this.pointy));
		this.attachHandlers(this.win);
		if (this.options.showNow) this.position();
	},
	getArgs: function(){
		return StickyWin.UI.getArgs.apply(this, arguments);
	},
	getPositionSettings: function(){
		var s = this.pointy.options.divotSize;
		var d = this.options.point;
		switch(d) {
			case "left": case 8: case 9: case 10:
				return {
					edge: {
						x: 'left', 
						y: d==10?'top':d==8?'bottom':'center'
					},
					position: {x: 'right', y: 'center'},
					offset: {
						x: s
					}
				};
			case "right": case 2:  case 3: case 4:
				return {
					edge: {
						x: 'right', 
						y: d==2?'top':d==4?'bottom':'center'
					},
					position: {x: 'left', y: 'center'},
					offset: {x: -s}
				};
			case "up": case 11: case 12: case 1:
				return {
					edge: { 
						x: d==11?'left':d==1?'right':'center', 
						y: 'top' 
					},
					position: {	x: 'center', y: 'bottom' },
					offset: {
						y: s,
						x: d==11?-s:d==1?s:0
					}
				};
			case "down": case 5: case 6: case 7:
				return {
					edge: {
						x: d==7?'left':d==5?'right':'center', 
						y: 'bottom'
					},
					position: {x: 'center', y: 'top'},
					offset: {
						y: -s,
						x: d==7?-s:d==5?s:0
					}
				};
		};
	},
	setContent: function() {
		var args = this.getArgs(arguments);
		this.pointy.setContent(args.caption, args.body);
		[this.pointy.h1, this.pointy.body].each(this.attachHandlers, this);
		if (this.visible) this.position();
		return this;
	},
	showWin: function(){
		this.parent();
		this.pointy.positionPointer();
	},
	position: function(options){
		this.parent(options);
		this.pointy.positionPointer();
	},
	attachHandlers: function(content) {
		if (!content) return;
		content.getElements('.'+this.options.closeClassName).addEvent('click', function(){ this.hide(); }.bind(this));
		content.getElements('.'+this.options.pinClassName).addEvent('click', function(){ this.togglepin(); }.bind(this));
	}
});

/*
Script: PopupDetails.js
	Creates hover detail popups for a collection of elements and data.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var PopupDetail = new Class({
	Implements: [Options, Events],
	visible: false,
	observed: false,
	hasData: false,
	options: {
		observerAction: 'mouseenter', //or click
		closeOnMouseOut: true,
		linkPopup: false, //or true to use observer href, or url
		data: {}, //key/value parse to parse in to html
		templateOptions: {}, //see simple template parser
		useAjax: false,
		ajaxOptions:{
			method: 'get'
		},
		ajaxLink: false, //defaults to use observer.src
		ajaxCache: {},
		delayOn: 100,
		delayOff: 100,
		stickyWinOptions:{},
		stickyWinToUse: StickyWin,
		showNow: false,
		htmlResponse: false,
		regExp: /\\?%([^%]+)%/g
/*	onPopupShow: $empty,
		onPopupHide: $empty */
	},
	initialize: function(html, observer, options){
		this.setOptions(options);
		this.observer = document.id(observer);
		this.html = (document.id(html))?document.id(html).get('html'):html||'';
		if (this.options.showNow) this.show.delay(this.options.delayOn, this);
		this.setUpObservers();
	},
	setUpObservers: function(){
		var opt = this.options; //saving bytes here
		this.observer.addEvent(opt.observerAction, function(){
			this.observed = true;
			this.show.delay(opt.delayOn, this);
		}.bind(this));
		if ((opt.observerAction == "mouseenter" || opt.observerAction == "mouseover") && this.options.closeOnMouseOut){
			this.observer.addEvent("mouseleave", function(){
				this.observed = false;
				this.hide.delay(opt.delayOff, this);
			}.bind(this));
		}
		return this;
	},
	parseTemplate: function(string, values){
		return string.substitute(values, this.options.regExp);
	},
	makePopup: function(){
		if (!this.stickyWin){
			var opt = this.options;//saving bytes
			if (opt.htmlResponse) this.content = this.data;
			else this.content = this.parseTemplate(this.html, opt.data);
			this.stickyWin = new opt.stickyWinToUse($merge(opt.stickyWinOptions, {
				relativeTo: this.observer,
				showNow: false,
				content: this.content,
				allowMultipleByClass: true
			}));
			if (document.id(opt.linkPopup) || $type(opt.linkPopup)=='string') {
				this.stickyWin.win.setStyle('cursor','pointer').addEvent('click', function(){
					window.location.href = ($type(url)=='string')?url:url.src;
				});
			}
			this.stickyWin.win.addEvent('mouseenter', function(){
				this.observed = true;
			}.bind(this));
			this.stickyWin.win.addEvent('mouseleave', function(){
				this.observed = false;
				if (opt.closeOnMouseOut) this.hide.delay(opt.delayOff, this);
			}.bind(this));
		}
		return this;
	},
	getContent: function(){
		try {
			new Request($merge(this.options.ajaxOptions, {
					url: this.options.ajaxLink || this.observer.href,
					onSuccess: this.show.bind(this)
				})
			).send();
		} catch(e) {
			dbug.log('ajax error on PopupDetail: %s', e);
		}
	},
	show: function(data){
		var opt = this.options;
		if (data) this.data = data;
		if (this.observed && !this.visible) {
			if (opt.useAjax && !this.data) {
				var cachedVal = opt.ajaxCache[this.options.ajaxLink] || opt.ajaxCache[this.observer.href];
				if (cachedVal) {
					this.fireEvent('onPopupShow', this);
					return this.show(cachedVal);
				}
				this.cursorStyle = this.observer.getStyle('cursor');
				this.observer.setStyle('cursor', 'wait');
				this.getContent();
				return false;
			} else {
				if (this.cursorStyle) this.observer.setStyle('cursor', this.cursorStyle);
				if (opt.useAjax && !opt.htmlResponse) opt.data = JSON.decode(this.data);
				this.makePopup();
				this.fireEvent('onPopupShow', this);
				this.stickyWin.show();
				this.visible = true;
				return this;
			}
		}
		return this;
	},
	hide: function(){
		if (!this.observed){
			this.fireEvent('onPopupHide');
			if (this.stickyWin)this.stickyWin.hide();
			this.visible = false;
		}
		return this;
	}
});

var PopupDetailCollection = new Class({
	Implements: [Options],
	options: {
		details: {},
		links: [],
		ajaxLinks: [],
		useCache: true,
		template: '',
		popupDetailOptions: {}
	},
	cache: {},
	initialize: function(observers, options) {
		this.observers = $$(observers);
		this.setOptions(options);
		var ln = this.options.ajaxLinks.length;
		if (ln <= 0) ln = this.options.details.length;
		if (this.observers.length != ln) 
			dbug.log("warning: observers and details are out of sync.");
		this.makePopupDetails();
	},
	makePopupDetails: function(){
		this.popupDetailObjs = this.observers.map(function(observer, index){
			var opt = this.options.popupDetailOptions;//saving bytes
			var pd = new PopupDetail(this.options.template, observer, $merge(opt, {
				data: $pick(this.options.details[index], {}),
				linkItem: $pick(this.options.links[index], $pick(opt.linkItem, false)),
				ajaxLink: $pick(this.options.ajaxLinks[index], false),
				ajaxCache: (this.options.useCache)?this.cache:{},
				useAjax: this.options.ajaxLinks.length>0
			}));
			return pd;
		}, this);
	}
});


/*
Script: Tips.Pointy.js
	Defines Tips.Pointy, An extension to Tips that adds a pointy style to the tip.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/

Tips.Pointy = new Class({
	Extends: Tips,
	options: {
		onShow: function(tip, stickyWin){
			stickyWin.show();
		},
		onHide: function(tip, stickyWin){
			stickyWin.hide();
		},
		pointyTipOptions: {
			point: 11,
			width: 150,
			pointyOptions: {
				closeButton: false
			}
		}
	},
	initialize: function(){
		var params = Array.link(arguments, {options: Object.type, elements: $defined});
		this.setOptions(params.options);
		this.tip = new StickyWin.PointyTip($extend(this.options.pointyTipOptions, {
			showNow: false
		}));
		if (this.options.className) document.id(this.tip).addClass(this.options.className);
		if (params.elements) this.attach(params.elements);
	},
	elementEnter: function(event, element){

		var title = element.retrieve('tip:title');
		var text = element.retrieve('tip:text');
		this.tip.setContent(title, text);

		this.timer = $clear(this.timer);
		this.timer = this.show.delay(this.options.showDelay, this);

		this.position(element);
	},

	elementLeave: function(event){
		$clear(this.timer);
		this.timer = this.hide.delay(this.options.hideDelay, this);
	},

	elementMove: function(event){
		return; //always fixed
	},

	position: function(element){
		this.tip.setOptions({
			relativeTo: element
		});
		this.tip.position();
	},

	show: function(){
		this.fireEvent('show', [document.id(this.tip), this.tip]);
	},

	hide: function(){
		this.fireEvent('hide', [document.id(this.tip), this.tip]);
	}

});

/*
Script: Waiter.js

Adds a semi-transparent overlay over a dom element with a spinnin ajax icon.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var Waiter = new Class({
	Implements: [Options, Events, Chain, Class.Occlude],
	options: {
		baseHref: 'http://www.cnet.com/html/rb/assets/global/waiter/',
		containerProps: {
			styles: {
				position: 'absolute',
				'text-align': 'center'
			},
			'class':'waiterContainer'
		},
		containerPosition: {},
		msg: false,
		msgProps: {
			styles: {
				'text-align': 'center',
				fontWeight: 'bold'
			},
			'class':'waiterMsg'
		},
		img: {
			src: 'waiter.gif',
			styles: {
				width: 24,
				height: 24
			},
			'class':'waiterImg'
		},
		layer:{
			styles: {
				width: 0,
				height: 0,
				position: 'absolute',
				zIndex: 999,
				display: 'none',
				opacity: 0.9,
				background: '#fff'
			},
			'class': 'waitingDiv'
		},
		useIframeShim: true,
		fxOptions: {},
		injectWhere: null
//	iframeShimOptions: {},
//	onShow: $empty
//	onHide: $empty
	},
	property: 'Waiter',
	initialize: function(target, options){
		this.element = document.id(target)||document.id(document.body);
		if (this.occlude()) return this.occluded;
		this.setOptions(options);
		this.build();
		this.place(target);
	},
	build: function(){
		this.waiterContainer = new Element('div', this.options.containerProps);
		if (this.options.msg) {
			this.msgContainer = new Element('div', this.options.msgProps);
			this.waiterContainer.adopt(this.msgContainer);
			if (!document.id(this.options.msg)) this.msg = new Element('p').appendText(this.options.msg);
			else this.msg = document.id(this.options.msg);
			this.msgContainer.adopt(this.msg);
		}
		if (this.options.img) this.waiterImg = document.id(this.options.img.id) || new Element('img', $merge(this.options.img, {
			src: this.options.baseHref + this.options.img.src
		})).inject(this.waiterContainer);
		this.waiterOverlay = document.id(this.options.layer.id) || new Element('div').adopt(this.waiterContainer);
		this.waiterOverlay.set(this.options.layer);
		try {
			if (this.options.useIframeShim) this.shim = new IframeShim(this.waiterOverlay, this.options.iframeShimOptions);
		} catch(e) {
			dbug.log("Waiter attempting to use IframeShim but failed; did you include IframeShim? Error: ", e);
			this.options.useIframeShim = false;
		}
		this.waiterFx = this.waiterFx || new Fx.Elements($$(this.waiterContainer, this.waiterOverlay), this.options.fxOptions);
	},
	place: function(target, where){
		var where = where || this.options.injectWhere || target == document.body ? 'inside' : 'after';
		this.waiterOverlay.inject(target, where);
	},
	toggle: function(element, show) {
		//the element or the default
		element = document.id(element) || document.id(this.active) || document.id(this.element);
		this.place(element);
		if (!document.id(element)) return this;
		if (this.active && element != this.active) return this.stop(this.start.bind(this, element));
		//if it's not active or show is explicit
		//or show is not explicitly set to false
		//start the effect
		if ((!this.active || show) && show !== false) this.start(element);
		//else if it's active and show isn't explicitly set to true
		//stop the effect
		else if (this.active && !show) this.stop();
		return this;
	},
	reset: function(){
		this.waiterFx.cancel().set({
			0: { opacity:[0]},
			1: { opacity:[0]}
		});
	},
	start: function(element){
		this.reset();
		element = document.id(element) || document.id(this.element);
		this.place(element);
		var start = function() {
			var dim = element.getComputedSize();
			this.active = element;
			this.waiterOverlay.setStyles({
				width: this.options.layer.width||dim.totalWidth,
				height: this.options.layer.height||dim.totalHeight,
				display: 'block'
			}).position({
				relativeTo: element,
				position: 'upperLeft'
			});
			this.waiterContainer.position($merge({
				relativeTo: this.waiterOverlay
			}, this.options.containerPosition));
			if (this.options.useIframeShim) this.shim.show();
			this.waiterFx.start({
				0: { opacity:[1] },
				1: { opacity:[this.options.layer.styles.opacity]}
			}).chain(function(){
				if (this.active == element) this.fireEvent('onShow', element);
				this.callChain();
			}.bind(this));
		}.bind(this);

		if (this.active && this.active != element) this.stop(start);
		else start();
		
		return this;
	},
	stop: function(callback){
		if (!this.active) {
			if ($type(callback) == "function") callback.attempt();
			return this;
		}
		this.waiterFx.cancel();
		this.waiterFx.clearChain();
		//fade the waiter out
		this.waiterFx.start({
			0: { opacity:[0]},
			1: { opacity:[0]}
		}).chain(function(){
			this.active = null;
			this.waiterOverlay.hide();
			if (this.options.useIframeShim) this.shim.hide();
			this.fireEvent('onHide', this.active);
			this.callChain();
			this.clearChain();
			if ($type(callback) == "function") callback.attempt();
		}.bind(this));
		return this;
	}
});

if (window.Request) {
	Request = Class.refactor(Request, {
		options: {
			useWaiter: false,
			waiterOptions: {},
			waiterTarget: false
		},
		initialize: function(options){
			this._send = this.send;
			this.send = function(options){
				if (this.waiter) this.waiter.start().chain(this._send.bind(this, options));
				else this._send(options);
				return this;
			};
			this.previous(options);
			if (this.options.useWaiter && (document.id(this.options.update) || document.id(this.options.waiterTarget))) {
				this.waiter = new Waiter(this.options.waiterTarget || this.options.update, this.options.waiterOptions);
				['onComplete', 'onException', 'onCancel'].each(function(event){
					this.addEvent(event, this.waiter.stop.bind(this.waiter));
				}, this);
			}
		}
	});
}

Element.Properties.waiter = {

	set: function(options){
		var waiter = this.retrieve('waiter');
		return this.eliminate('waiter').store('waiter:options', options);
	},

	get: function(options){
		if (options || !this.retrieve('waiter')){
			if (options || !this.retrieve('waiter:options')) this.set('waiter', options);
			this.store('waiter', new Waiter(this, this.retrieve('waiter:options')));
		}
		return this.retrieve('waiter');
	}

};

Element.implement({

	wait: function(options){
		this.get('waiter', options).start();
		return this;
	},
	
	release: function(){
		var opt = Array.link(arguments, {options: Object.type, callback: Function.type});
		this.get('waiter', opt.options).stop(opt.callback);
		return this;
	}

});

/*
Script: Collapsable.js
	Enables a dom element to, when clicked, hide or show (it toggles) another dom element. Kind of an Accordion for one item.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var Collapsable = new Class({
	Extends: Fx.Reveal,
	initialize: function(clicker, section, options) {
		this.clicker = document.id(clicker);
		this.section = document.id(section);
		this.parent(this.section, options);
		this.addEvents();
	},
	addEvents: function(){
		this.clicker.addEvent('click', this.toggle.bind(this));
	}
});

var HoverGroup = new Class({
	Implements: [Options, Events],
	Binds: ['enter', 'leave', 'remain'],
	options: {
		//onEnter: $empty,
		//onLeave: $empty,
		elements: [],
		delay: 300,
		start: ['mouseenter'],
		remain: [],
		end: ['mouseleave']
	},
	initialize: function(options) {
		this.setOptions(options);
		this.attachTo(this.options.elements);
		this.addEvents({
			leave: function(){
				this.active = false;
			},
			enter: function(){
				this.active = true;
			}
		});
	},
	elements: [],
	attachTo: function(elements, detach){
		var starters = {}, remainers = {}, enders = {};
		elements = $G(elements);
		this.options.start.each(function(start) {
			starters[start] = this.enter;
		}, this);
		this.options.end.each(function(end) {
			enders[end] = this.leave;
		}, this);
		this.options.remain.each(function(remain){
			remainers[remain] = this.remain;
		}, this);
		if (detach) {
			elements.each(function(el) {
				el.removeEvents(starters).removeEvents(enders).removeEvents(remainers);
				this.elements.erase(el);
			});
		} else {
			elements.each(function(el){
				el.addEvents(starters).addEvents(enders).addEvents(remainers);
			});
			this.elements.combine(elements);
		}
		return this;
	},
	detachFrom: function(elements){
		this.attachTo(elements, true);
	},
	enter: function(e){
		this.isMoused = true;
		this.assert(e);
	},
	leave: function(e){
		this.isMoused = false;
		this.assert(e);
	},
	remain: function(e){
		if (this.active) this.enter(e);
	},
	assert: function(e){
		$clear(this.assertion);
		this.assertion = (function(){
			if (!this.isMoused && this.active) this.fireEvent('leave', e);
			else if (this.isMoused && !this.active) this.fireEvent('enter', e);
		}).delay(this.options.delay, this);
	}
});

/*
Script: HtmlTable.js

Builds table elements with methods to add rows quickly.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var HtmlTable = new Class({
	Implements: [Options],
	options: {
		properties: {
			cellpadding: 0,
			cellspacing: 0,
			border: 0
		},
		rows: []
	},
	initialize: function(options) {
		this.setOptions(options);
		this.table = new Element('table').setProperties(this.options.properties);
		this.table.store('HtmlTable', this);
		this.tbody = new Element('tbody').inject(this.table);
		this.options.rows.each(this.push.bind(this));
		["adopt", "inject", "wraps", "grab", "replaces", "empty", "dispose"].each(function(method){
				this[method] = this.table[method].bind(this.table);
		}, this);
	},
	toElement: function(){
		return this.table;
	},
	push: function(row) {
		var tr = new Element('tr').inject(this.tbody);
		var tds = row.map(function (tdata) {
			tdata = tdata || '';
			var td = new Element('td').inject(tr);
			if (tdata.properties) td.setProperties(tdata.properties);
			function setContent(content){
				if (document.id(content)) td.adopt(document.id(content));
				else td.set('html', content);
			};
			if ($defined(tdata.content)) setContent(tdata.content);
			else setContent(tdata);
			return td;
		}, this);
		return {tr: tr, tds: tds};
	}
});

/*
Script: MenuSlider.js
	Slides open a menu when the user mouses over a dom element. leaves it open while the mouse is over that element or the menu.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var MenuSlider = new Class({
	Implements: [Options, Events],
	Binds: ['slideIn', 'slideOut'],
	options: {
	/*	onIn: $empty,
		onInStart: $empty,
		onOut: $empty,
		hoverGroupOptions: {}, */
		fxOptions: {
			duration: 400,
			transition: 'expo:out',
			link: 'cancel'
		},
		useIframeShim: true
	},
	initialize: function(menu, subMenu, options) {
		this.menu = document.id(menu);
		this.subMenu = document.id(subMenu);
		this.setOptions(options);
		this.makeSlider();
		this.hoverGroup = new HoverGroup($merge(this.options.hoverGroupOptions, {
			elements: [this.menu, this.subMenu],
			onEnter: this.slideIn,
			onLeave: this.slideOut
		}));
	},
	makeSlider: function(){
		this.slider = new Fx.Slide(this.subMenu, this.options.fxOptions).hide();
		if (this.options.useIframeShim && window.IframeShim) this.shim = new IframeShim(this.subMenu);
	},
	slideIn: function(){
		this.fireEvent('inStart');
		this.slider.slideIn().chain(function(){
			if (this.shim) this.shim.show();
			this.fireEvent('in');
		}.bind(this));
		this.visible = true;
		return this;
	},
	slideOut: function(){
		this.hide();
		this.fireEvent('out');
		if (this.shim) this.shim.hide();
		this.visible = false;
		return this;
	},
	hide: function(){
		$clear(this.hoverGroup.assertion);
		this.hoverGroup.active = false;
		this.slider.cancel();
		this.slider.hide();
		if (this.shim) this.shim.hide();
		this.visible = true;
		return this;
	},
	isVisible: function(){
		return this.visible;
	}
});

/*
Script: MooScroller.js

Recreates the standard scrollbar behavior for elements with overflow but using DOM elements so that the scroll bar elements are completely styleable by css.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var MooScroller = new Class({
	Implements: [Options, Events],
	options: {
		maxThumbSize: 10,
		mode: 'vertical',
		width: 0, //required only for mode: horizontal
		scrollSteps: 10,
		wheel: true,
		scrollLinks: {
			forward: 'scrollForward',
			back: 'scrollBack'
		},
		hideWhenNoOverflow: true
//		onScroll: $empty,
//		onPage: $empty
	},

	initialize: function(content, knob, options){
		this.setOptions(options);
		this.horz = (this.options.mode == "horizontal");

		this.content = document.id(content).setStyle('overflow', 'hidden');
		this.knob = document.id(knob);
		this.track = this.knob.getParent();
		this.setPositions();
		
		if (this.horz && this.options.width) {
			this.wrapper = new Element('div');
			this.content.getChildren().each(function(child){
				this.wrapper.adopt(child);
			}, this);
			this.wrapper.inject(this.content).setStyle('width', this.options.width);
		}
		

		this.bound = {
			'start': this.start.bind(this),
			'end': this.end.bind(this),
			'drag': this.drag.bind(this),
			'wheel': this.wheel.bind(this),
			'page': this.page.bind(this)
		};

		this.position = {};
		this.mouse = {};
		this.update();
		this.attach();
		
		var clearScroll = function (){
			$clear(this.scrolling);
		}.bind(this);
		['forward','back'].each(function(direction) {
			var lnk = document.id(this.options.scrollLinks[direction]);
			if (lnk) {
				lnk.addEvents({
					mousedown: function() {
						this.scrolling = this[direction].periodical(50, this);
					}.bind(this),
					mouseup: clearScroll.bind(this),
					click: clearScroll.bind(this)
				});
			}
		}, this);
		this.knob.addEvent('click', clearScroll.bind(this));
		window.addEvent('domready', function(){
			try {
				document.id(document.body).addEvent('mouseup', clearScroll.bind(this));
			}catch(e){}
		}.bind(this));
	},
	setPositions: function(){
		[this.track, this.knob].each(function(el){
			if (el.getStyle('position') == 'static') el.setStyle('position','relative');
		});

	},
	toElement: function(){
		return this.content;
	},
	update: function(){
		var plain = this.horz?'Width':'Height';
		this.contentSize = this.content['offset'+plain];
		this.contentScrollSize = this.content['scroll'+plain];
		this.trackSize = this.track['offset'+plain];

		this.contentRatio = this.contentSize / this.contentScrollSize;

		this.knobSize = (this.trackSize * this.contentRatio).limit(this.options.maxThumbSize, this.trackSize);

		if (this.options.hideWhenNoOverflow) {
			this.hidden = this.knobSize == this.trackSize;
			this.track.setStyle('opacity', this.hidden?0:1);
		}
		
		this.scrollRatio = this.contentScrollSize / this.trackSize;
		this.knob.setStyle(plain.toLowerCase(), this.knobSize);

		this.updateThumbFromContentScroll();
		this.updateContentFromThumbPosition();
	},

	updateContentFromThumbPosition: function(){
		this.content[this.horz?'scrollLeft':'scrollTop'] = this.position.now * this.scrollRatio;
	},

	updateThumbFromContentScroll: function(){
		this.position.now = (this.content[this.horz?'scrollLeft':'scrollTop'] / this.scrollRatio).limit(0, (this.trackSize - this.knobSize));
		this.knob.setStyle(this.horz?'left':'top', this.position.now);
	},

	attach: function(){
		this.knob.addEvent('mousedown', this.bound.start);
		if (this.options.scrollSteps) this.content.addEvent('mousewheel', this.bound.wheel);
		this.track.addEvent('mouseup', this.bound.page);
	},

	wheel: function(event){
		if (this.hidden) return;
		this.scroll(-(event.wheel * this.options.scrollSteps));
		this.updateThumbFromContentScroll();
		event.stop();
	},

	scroll: function(steps){
		steps = steps||this.options.scrollSteps;
		this.content[this.horz?'scrollLeft':'scrollTop'] += steps;
		this.updateThumbFromContentScroll();
		this.fireEvent('onScroll', steps);
	},
	forward: function(steps){
		this.scroll(steps);
	},
	back: function(steps){
		steps = steps||this.options.scrollSteps;
		this.scroll(-steps);
	},

	page: function(event){
		var axis = this.horz?'x':'y';
		var forward = (event.page[axis] > this.knob.getPosition()[axis]);
		this.scroll((forward?1:-1)*this.content['offset'+(this.horz?'Width':'Height')]);
		this.updateThumbFromContentScroll();
		this.fireEvent('onPage', forward);
		event.stop();
	},

	
	start: function(event){
		var axis = this.horz?'x':'y';
		this.mouse.start = event.page[axis];
		this.position.start = this.knob.getStyle(this.horz?'left':'top').toInt();
		document.addEvent('mousemove', this.bound.drag);
		document.addEvent('mouseup', this.bound.end);
		this.knob.addEvent('mouseup', this.bound.end);
		event.stop();
	},

	end: function(event){
		document.removeEvent('mousemove', this.bound.drag);
		document.removeEvent('mouseup', this.bound.end);
		this.knob.removeEvent('mouseup', this.bound.end);
		event.stop();
	},

	drag: function(event){
		var axis = this.horz?'x':'y';
		this.mouse.now = event.page[axis];
		this.position.now = (this.position.start + (this.mouse.now - this.mouse.start)).limit(0, (this.trackSize - this.knobSize));
		this.updateContentFromThumbPosition();
		this.updateThumbFromContentScroll();
		event.stop();
	}

});


/*
Script: MultipleOpenAccordion.js

Creates a Mootools Fx.Accordion that allows the user to open more than one element.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var MultipleOpenAccordion = new Class({
	Implements: [Options, Events, Chain],
	options: {
		togglers: [],
		elements: [],
		openAll: false,
		firstElementsOpen: [0],
		fixedHeight: false,
		fixedWidth: false,
		height: true,
		opacity: true,
		width: false
//	onActive: $empty,
//	onBackground: $empty
	},
	togglers: [],
	elements: [],
	initialize: function(options){
		var args = Array.link(arguments, {options: Object.type, elements: Array.type});
		this.setOptions(args.options);
		elements = $$(this.options.elements);
		$$(this.options.togglers).each(function(toggler, idx){
			this.addSection(toggler, elements[idx], idx);
		}, this);
		if (this.togglers.length) {
			if (this.options.openAll) this.showAll();
			else this.toggleSections(this.options.firstElementsOpen, false, true);
		}
		this.openSections = this.showSections.bind(this);
		this.closeSections = this.hideSections.bind(this);
	},
	addSection: function(toggler, element){
		toggler = document.id(toggler);
		element = document.id(element);
		var test = this.togglers.contains(toggler);
		var len = this.togglers.length;
		this.togglers.include(toggler);
		this.elements.include(element);
		var idx = this.togglers.indexOf(toggler);
		toggler.addEvent('click', this.toggleSection.bind(this, idx));
		var mode;
		if (this.options.height && this.options.width) mode = "both";
		else mode = (this.options.height)?"vertical":"horizontal";
		element.store('reveal', new Fx.Reveal(element, {
			transitionOpacity: this.options.opacity,
			mode: mode,
			heightOverride: this.options.fixedHeight,
			widthOverride: this.options.fixedWidth
		}));
		return this;
	},
	onComplete: function(idx, callChain){
		this.fireEvent(this.elements[idx].isDisplayed()?'onActive':'onBackground', [this.togglers[idx], this.elements[idx]]);
		this.callChain();
		return this;
	},
	showSection: function(idx, useFx){
		this.toggleSection(idx, useFx, true);
	},
	hideSection: function(idx, useFx){
		this.toggleSection(idx, useFx, false);
	},
	toggleSection: function(idx, useFx, show, callChain){
		var method = show?'reveal':$defined(show)?'dissolve':'toggle';
		callChain = $pick(callChain, true);
		var el = this.elements[idx];
		if ($pick(useFx, true)) {
			el.retrieve('reveal')[method]().chain(
				this.onComplete.bind(this, [idx, callChain])
			);
		} else {
				if (method == "toggle") el.togglek();
				else el[method == "reveal"?'show':'hide']();
				this.onComplete(idx, callChain);
		}
		return this;
	},
	toggleAll: function(useFx, show){
		var method = show?'reveal':$chk(show)?'disolve':'toggle';
		var last = this.elements.getLast();
		this.elements.each(function(el, idx){
			this.toggleSection(idx, useFx, show, el == last);
		}, this);
		return this;
	},
	toggleSections: function(sections, useFx, show) {
		last = sections.getLast();
		this.elements.each(function(el,idx){
			this.toggleSection(idx, useFx, sections.contains(idx)?show:!show, idx == last);
		}, this);
		return this;
	},
	showSections: function(sections, useFx){
		sections.each(function(i){
			this.showSection(i, useFx);
		}, this);
	},
	hideSections: function(sections, useFx){
		sections.each(function(i){
			this.hideSection(i, useFx);
		}, this);
	},
	showAll: function(useFx){
		return this.toggleAll(useFx, true);
	},
	hideAll: function(useFx){
		return this.toggleAll(useFx, false);
	}
});


/*
Script: SimpleCarousel.js

Builds a carousel object that manages the basic functions of a generic carousel (a carousel	here being a collection of "slides" that play from one to the next, with a collection of "buttons" that reference each slide).

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var SimpleCarousel = new Class({
	Implements: [Options, Events],
	options: {
//		onRotate: $empty,
//		onStop: $empty,
//		onAutoPlay: $empty,
//		onShowSlide: $empty,
		slideInterval: 4000,
		transitionDuration: 700,
		startIndex: 0,
		buttonOnClass: "selected",
		buttonOffClass: "off",
		rotateAction: "none",
		rotateActionDuration: 100,
		autoplay: true
	},
	initialize: function(container, slides, buttons, options){
		this.container = document.id(container);
		var instance = this.container.retrieve('SimpleCarouselInstance');
		if (instance) return instance;
		this.container.store('SimpleCarouselInstance', this);
		this.setOptions(options);
		this.container.addClass('hasCarousel');
		this.slides = $$(slides);
		this.buttons = $$(buttons);
		this.createFx();
		this.showSlide(this.options.startIndex);
		if (this.options.autoplay) this.autoplay();
		if (this.options.rotateAction != 'none') this.setupAction(this.options.rotateAction);
		return this;
	},
	toElement: function(){
		return this.container;
	},
	setupAction: function(action) {
		this.buttons.each(function(el, idx){
			document.id(el).addEvent(action, function() {
				this.slideFx.setOptions(this.slideFx.options, {duration: this.options.rotateActionDuration});
				if (this.currentSlide != idx) this.showSlide(idx);
				this.stop();
			}.bind(this));
		}, this);
	},
	createFx: function(){
		if (!this.slideFx) this.slideFx = new Fx.Elements(this.slides, {duration: this.options.transitionDuration});
		this.slides.each(function(slide){
			slide.setStyle('opacity',0);
		});
	},
	showSlide: function(slideIndex){
		var action = {};
		this.slides.each(function(slide, index){
			if (index == slideIndex && index != this.currentSlide){ //show
				document.id(this.buttons[index]).swapClass(this.options.buttonOffClass, this.options.buttonOnClass);
				action[index.toString()] = {
					opacity: 1
				};
			} else {
				document.id(this.buttons[index]).swapClass(this.options.buttonOnClass, this.options.buttonOffClass);
				action[index.toString()] = {
					opacity:0
				};
			}
		}, this);
		this.fireEvent('onShowSlide', slideIndex);
		this.currentSlide = slideIndex;
		this.slideFx.start(action);
		return this;
	},
	autoplay: function(){
		this.slideshowInt = this.rotate.periodical(this.options.slideInterval, this);
		this.fireEvent('onAutoPlay');
		return this;
	},
	stop: function(){
		$clear(this.slideshowInt);
		this.fireEvent('onStop');
		return this;
	},
	rotate: function(){
		var current = this.currentSlide;
		var next = (current+1 >= this.slides.length) ? 0 : current+1;
		this.showSlide(next);
		this.fireEvent('onRotate', next);
		return this;
	}
});

/*
Script: SimpleSlideShow.js

Makes a very, very simple slideshow gallery with a collection of dom elements and previous and next buttons.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var SimpleSlideShow = new Class({
	Implements: [Events, Options, Chain],
	options: {
		startIndex: 0,
		slides: [],
		currentSlideClass: 'currentSlide',
		currentIndexContainer: false,
		maxContainer: false,
		nextLink: false,
		prevLink: false,
		wrap: true,
		disabledLinkClass: 'disabled',
//		onNext: $empty,
//		onPrev: $empty,
//		onSlideClick: $empty,
//		onSlideDisplay: $empty,
		crossFadeOptions: {}
	},
	initialize: function(options){
		this.setOptions(options);
		var slides = this.options.slides;
		this.makeSlides(slides);
		this.setCounters();
		this.setUpNav();
		this.now = this.options.startIndex;
		if (this.slides.length > 0) this.show(this.now);
	},
	slides:[],
	setCounters: function(){
		if (document.id(this.options.currentIndexContainer))document.id(this.options.currentIndexContainer).set('html', this.now+1);
		if (document.id(this.options.maxContainer))document.id(this.options.maxContainer).set('html', this.slides.length);
	},
	makeSlides: function(slides){
		//hide them all
		slides.each(function(slide, index){
			if (index != this.now) slide.setStyle('display', 'none');
			else slide.setStyle('display', 'block');
			this.makeSlide(slide);
		}, this);
	},
	makeSlide: function(slide){
		slide.addEvent('click', function(){ this.fireEvent('onSlideClick'); }.bind(this));
		this.slides.include(slide);
	},
	setUpNav: function(){	
		if (document.id(this.options.nextLink)) {
			document.id(this.options.nextLink).addEvent('click', function(){
				this.forward();
			}.bind(this));
		}
		if (document.id(this.options.prevLink)) {
			document.id(this.options.prevLink).addEvent('click', function(){
				this.back();
			}.bind(this));
		}
	},
	disableLinks: function(now){
		if (this.options.wrap) return;
		now = $pick(now, this.now);
		var prev = document.id(this.options.prevLink);
		var next = document.id(this.options.nextLink);
		var dlc = this.options.disabledLinkClass;
		if (now > 0) {
			if (prev) prev.removeClass(dlc);
			if (now === this.slides.length-1 && next) next.addClass(dlc);
			else if (next) next.removeClass(dlc)
		}	else { //now is zero
			if (this.slides.length > 0 && next) next.removeClass(dlc);
			if (prev) prev.addClass(dlc);
		}
	},
	forward: function(){
		if ($type(this.now) && this.now < this.slides.length-1) this.show(this.now+1);
		else if ($type(this.now) && this.options.wrap) this.show(0);
		else if (!$type(this.now)) this.show(this.options.startIndex);
		this.fireEvent('next');
		return this;
	},
	back: function(){
		if (this.now > 0) {
			this.show(this.now-1);
			this.fireEvent('onPrev');
		} else if (this.options.wrap && this.slides.length > 1) {
			this.show(this.slides.length-1);
			this.fireEvent('prev');
		}
		return this;
	},
	show: function(index){
		if (this.showing) return this.chain(this.show.bind(this, index));
		var now = this.now;
		var s = this.slides[index]; //saving bytes
		function fadeIn(s, resetOpacity){
			s.setStyle('display','block');
			if (!Browser.Engine.trident4) {
				if (resetOpacity) s.setStyle('opacity', 0);
				s.set('tween', this.options.crossFadeOptions).get('tween').start('opacity', 1).chain(function(){
					this.showing = false;
					this.disableLinks();
					this.callChain();
					this.fireEvent('onSlideDisplay', index);
				}.bind(this));
			}
		};
		if (s) {
			if ($type(this.now) && this.now != index){
				if (!Browser.Engine.trident4) {
					var fx = this.slides[this.now].get('tween');
					fx.setOptions(this.options.crossFadeOptions);
					this.showing = true;
					fx.start('opacity', 0).chain(function(){
						this.slides[now].setStyle('display','none');
						s.addClass(this.options.currentSlideClass);
						fadeIn.run([s, true], this);
						this.fireEvent('onSlideDisplay', index);
					}.bind(this));
				} else {
					this.slides[this.now].setStyle('display','none');
					fadeIn.run(s, this);
				}
			} else fadeIn.run(s, this);
			this.now = index;
			this.setCounters();
		}
	},
	slideClick: function(){
		this.fireEvent('onSlideClick', [this.slides[this.now], this.now]);
	}
});

SimpleSlideShow.Carousel = new Class({
	Extends: SimpleSlideShow,
	Implements: [Class.ToElement],
	Binds: ['makeSlide'],
	options: {
		sliderWidth: 999999
	},
	initialize: function(container, options){
		this.setOptions(options);
		this.container = document.id(container);
		this.element = new Element('div').wraps(this.container).setStyles({
			width: this.container.getSize().x,
			overflow: 'hidden',
			position: 'relative'
		});
		this.container.setStyles({
			width: this.options.sliderWidth,
			position: 'relative'
		});
		this.parent(options);
	},
	makeSlides: function(slides) {
		this.slides = [];
		slides.each(this.makeSlide);
	},
	makeSlide: function(slide) {
		if (slide.retrieve('slideSetup')) return;
		slide.store('slideSetup', true);
		slide.show();
		var s = new Element('div', {
			styles: {
				'float': 'left',
				width: document.id(this).getSize().x
			}
		}).wraps(slide);
		this.parent(s);
		this.slides.erase(slide);
		this.setCounters();
		s.show();
		s.inject(this.container);
	},
	show: function(index) {
		if (!this.container) return;
		this.fx = this.fx || new Fx.Tween(this.container, {
			property: 'left'
		});
		if (this.showing) return this.chain(this.show.bind(this, index));
		var now = this.now;
		var s = this.slides[index]; //saving bytes
		if (s) {
			if (this.now != index) {
				this.fx.start(-s.getPosition(this.container).x).chain(function(){
					s.addClass(this.options.currentSlideClass);
					this.showing = false;
					this.disableLinks();
					this.callChain();
					this.fireEvent('onSlideDisplay', index);
				}.bind(this));
			}
			this.now = index;
			this.setCounters();
		}
	}
});

var SimpleImageSlideShow;
(function(){
	var extender = function(extend, passContainer) {
		return {
			Extends: extend,
			Implements: Class.ToElement,
			options: {
				imgUrls: [],
				imgClass: 'screenshot',
				container: false
			},
			initialize: function(){
				var args = Array.link(arguments, {options: Object.type, container: $defined});
				this.container = document.id(args.container) || (args.options?document.id(args.options.container):false); //legacy
				if (passContainer) this.parent(this.container, args.options);
				else this.parent(args.options);
				this.options.imgUrls.each(function(url){
					this.addImg(url);
				}, this);
				this.show(this.options.startIndex);
			},
			addImg: function(url){
				if (this.container) {
					var img = new Element('img', {
						'src': url,
						'id': this.options.imgClass+this.slides.length
					}).addClass(this.options.imgClass).setStyle(
						'display', 'none').inject(this.container).addEvent(
						'click', this.slideClick.bind(this));
					this.slides.push(img);
					this.makeSlide(img);
					this.setCounters();
				}
				return this;
			}
		};
	};
	SimpleImageSlideShow = new Class(extender(SimpleSlideShow));
	SimpleImageSlideShow.Carousel = new Class(extender(SimpleSlideShow.Carousel, true));
})();


/*
Script: TabSwapper.js

Handles the scripting for a common UI layout; the tabbed box.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var TabSwapper = new Class({
	Implements: [Options, Events],
	options: {
		selectedClass: 'tabSelected',
		mouseoverClass: 'tabOver',
		deselectedClass: '',
		rearrangeDOM: true,
		initPanel: 0, 
		smooth: false, 
		smoothSize: false,
		maxSize: null,
		effectOptions: {
			duration: 500
		},
		cookieName: null, 
		cookieDays: 999
//	onActive: $empty,
//	onActiveAfterFx: $empty,
//	onBackground: $empty
	},
	tabs: [],
	sections: [],
	clickers: [],
	sectionFx: [],
	initialize: function(options){
		this.setOptions(options);
		var prev = this.setup();
		if (prev) return prev;
		if (this.options.cookieName && this.recall()) this.show(this.recall().toInt());
		else this.show(this.options.initPanel);
	},
	setup: function(){
		var opt = this.options;
		sections = $$(opt.sections);
		tabs = $$(opt.tabs);
		if (tabs[0] && tabs[0].retrieve('tabSwapper')) return tabs[0].retrieve('tabSwapper');
		clickers = $$(opt.clickers);
		tabs.each(function(tab, index){
			this.addTab(tab, sections[index], clickers[index], index);
		}, this);
	},
	addTab: function(tab, section, clicker, index){
		tab = document.id(tab); clicker = document.id(clicker); section = document.id(section);
		//if the tab is already in the interface, just move it
		if (this.tabs.indexOf(tab) >= 0 && tab.retrieve('tabbered') 
			 && this.tabs.indexOf(tab) != index && this.options.rearrangeDOM) {
			this.moveTab(this.tabs.indexOf(tab), index);
			return this;
		}
		//if the index isn't specified, put the tab at the end
		if (!$defined(index)) index = this.tabs.length;
		//if this isn't the first item, and there's a tab
		//already in the interface at the index 1 less than this
		//insert this after that one
		if (index > 0 && this.tabs[index-1] && this.options.rearrangeDOM) {
			tab.inject(this.tabs[index-1], 'after');
			section.inject(this.tabs[index-1].retrieve('section'), 'after');
		}
		this.tabs.splice(index, 0, tab);
		clicker = clicker || tab;

		tab.addEvents({
			mouseout: function(){
				tab.removeClass(this.options.mouseoverClass);
			}.bind(this),
			mouseover: function(){
				tab.addClass(this.options.mouseoverClass);
			}.bind(this)
		});

		clicker.addEvent('click', function(e){
			e.preventDefault();
			this.show(index);
		}.bind(this));

		tab.store('tabbered', true);
		tab.store('section', section);
		tab.store('clicker', clicker);
		this.hideSection(index);
		return this;
	},
	removeTab: function(index){
		var now = this.tabs[this.now];
		if (this.now == index){
			if (index > 0) this.show(index - 1);
			else if (index < this.tabs.length) this.show(index + 1);
		}
		this.now = this.tabs.indexOf(now);
		return this;
	},
	moveTab: function(from, to){
		var tab = this.tabs[from];
		var clicker = tab.retrieve('clicker');
		var section = tab.retrieve('section');
		
		var toTab = this.tabs[to];
		var toClicker = toTab.retrieve('clicker');
		var toSection = toTab.retrieve('section');
		
		this.tabs.erase(tab).splice(to, 0, tab);

		tab.inject(toTab, 'before');
		clicker.inject(toClicker, 'before');
		section.inject(toSection, 'before');
		return this;
	},
	show: function(i){
		if (!$chk(this.now)) {
			this.tabs.each(function(tab, idx){
				if (i != idx) 
					this.hideSection(idx)
			}, this);
		}
		this.showSection(i).save(i);
		return this;
	},
	save: function(index){
		if (this.options.cookieName) 
			Cookie.write(this.options.cookieName, index, {duration:this.options.cookieDays});
		return this;
	},
	recall: function(){
		return (this.options.cookieName)?$pick(Cookie.read(this.options.cookieName), false): false;
	},
	hideSection: function(idx) {
		var tab = this.tabs[idx];
		if (!tab) return this;
		var sect = tab.retrieve('section');
		if (!sect) return this;
		if (sect.getStyle('display') != 'none') {
			this.lastHeight = sect.getSize().y;
			sect.setStyle('display', 'none');
			tab.swapClass(this.options.selectedClass, this.options.deselectedClass);
			this.fireEvent('onBackground', [idx, sect, tab]);
		}
		return this;
	},
	showSection: function(idx) {
		var tab = this.tabs[idx];
		if (!tab) return this;
		var sect = tab.retrieve('section');
		if (!sect) return this;
		var smoothOk = this.options.smooth && (!Browser.Engine.trident4 
										|| (Browser.Engine.trident4 && !Browser.Engine.trident4));
		if (this.now != idx) {
			if (!tab.retrieve('tabFx')) 
				tab.store('tabFx', new Fx.Morph(sect, this.options.effectOptions));
			var start = {
				display:'block',
				overflow: 'hidden'
			};
			if (smoothOk) start.opacity = 0;
			var effect = false;
			if (smoothOk) {
				effect = {opacity: 1};
			} else if (sect.getStyle('opacity').toInt() < 1) {
				sect.setStyle('opacity', 1);
				if (!this.options.smoothSize) 
					this.fireEvent('onActiveAfterFx', [idx, sect, tab]);
			}
			if (this.options.smoothSize) {
				var size = sect.getDimensions().height;
				if ($chk(this.options.maxSize) && this.options.maxSize < size) 
					size = this.options.maxSize;
				if (!effect) effect = {};
				effect.height = size;
			}
			if ($chk(this.now)) this.hideSection(this.now);
			if (this.options.smoothSize && this.lastHeight) start.height = this.lastHeight;
			sect.setStyles(start);
			if (effect) {
				tab.retrieve('tabFx').start(effect).chain(function(){
					this.fireEvent('onActiveAfterFx', [idx, sect, tab]);
					sect.setStyle("height", "auto");
				}.bind(this));
			}
			this.now = idx;
			this.fireEvent('onActive', [idx, sect, tab]);
		}
		tab.swapClass(this.options.deselectedClass, this.options.selectedClass);
		return this;
	}
});
