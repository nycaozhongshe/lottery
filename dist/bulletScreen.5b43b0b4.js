// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped, ModuleConfig) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }
      
      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(ModuleConfig);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({"js/bulletScreen.js":[function(require,module,exports) {
var bulletScreen = 6;

(function () {
  /**
   * 设置 弹幕DOM池 每一个通道最多六条弹幕
   **/
  var MAX_DM_COUNT = 6;
  var CHANNEL_COUNT = 16;
  var mark = true;
  var domPool = [];
  var danmuPool = ['微信关注公众号新之航软件，即可发送弹幕'];
  var hasPosition = [];
  /**
   * 做一下初始化工作
   */

  function init() {
    var wrapper = document.getElementById('wrapper'); // 先new一些span 重复利用这些DOM

    var _loop = function _loop(j) {
      var doms = [];

      var _loop2 = function _loop2(_i) {
        // 要全部放进wrapper
        var dom = document.createElement('span');
        wrapper.appendChild(dom); // 初始化dom的位置 通过设置className

        dom.className = 'right'; // DOM的通道是固定的 所以设置好top就不需要再改变了

        dom.style.top = j * 2 + .5 + 'vw'; // 放入改通道的DOM池

        doms.push(dom); // 每次到transition结束的时候 就是弹幕划出屏幕了 将DOM位置重置 再放回DOM池

        dom.addEventListener('transitionend', function () {
          dom.className = 'right'; // dom.style.transition = null;
          // dom.style.left = null;

          dom.style.transform = null;
          domPool[j].push(dom);
        });
      };

      for (var _i = 0; _i < MAX_DM_COUNT; _i++) {
        _loop2(_i);
      }

      domPool.push(doms);
    };

    for (var j = 0; j < CHANNEL_COUNT; j++) {
      _loop(j);
    } // hasPosition 标记每个通道目前是否有位置


    for (var i = 0; i < CHANNEL_COUNT; i++) {
      hasPosition[i] = true;
    }
  }
  /**
   * 获取一个可以发射弹幕的通道 没有则返回-1
   */


  function getChannel() {
    for (var i = 0; i < CHANNEL_COUNT; i++) {
      if (hasPosition[i] && domPool[i].length) return i;
    }

    return -1;
  }
  /**
   * 根据DOM和弹幕信息 发射弹幕
   */


  function shootDanmu(dom, text, channel) {
    dom.innerText = text; // 如果为每个弹幕设置 transition 可以保证每个弹幕的速度相同 这里没有保证速度相同
    // dom.style.transition = `transform ${7 + dom.clientWidth / 100}s linear`;
    // dom.style.left = '-' + dom.clientWidth + 'px';
    // 设置弹幕的位置信息 性能优化 left -> transform

    dom.style.transform = "translateX(".concat(-dom.clientWidth, "px)");
    dom.className = 'left';
    hasPosition[channel] = false; // 弹幕全部显示之后 才能开始下一条弹幕
    // 大概 dom.clientWidth * 10 的时间 该条弹幕就从右边全部划出到可见区域 再加1秒保证弹幕之间距离

    setTimeout(function () {
      hasPosition[channel] = true;
    }, dom.clientWidth * 10 + 1000);
  }

  init(); // 每隔1ms从弹幕池里获取弹幕（如果有的话）并发射

  setInterval(function () {
    if (mark) {
      danmuPool.push('微信关注公众号新之航软件，即可发送弹幕');
    }
  }, 7000);
  setInterval(function () {
    var channel;

    if (danmuPool.length && (channel = getChannel()) != -1) {
      var dom = domPool[channel].shift();
      var danmu = danmuPool.shift();
      shootDanmu(dom, danmu, channel);
    }
  }, 17);
})();
},{}],0:[function(require,module,exports) {
var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module(config) {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    },
    data: config && config.hot
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent && typeof WebSocket !== 'undefined') {
  var ws = new WebSocket('ws://localhost:57946/');
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        window.location.reload();
      }
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id, undefined, {
    hot: true
  });

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id)
  });
}
},{}]},{},[0,"js/bulletScreen.js"])