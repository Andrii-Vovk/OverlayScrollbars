/*!
 * OverlayScrollbars
 * Version: 2.0.0-beta.0
 *
 * Copyright (c) Rene Haas | KingSora.
 * https://github.com/KingSora
 *
 * Released under the MIT license.
 */

const OverlayScrollbars = function(t) {
  "use strict";
  function each(t, n) {
    if (isArrayLike(t)) {
      for (let o = 0; o < t.length; o++) {
        if (false === n(t[o], o, t)) {
          break;
        }
      }
    } else if (t) {
      each(Object.keys(t), (o => n(t[o], o, t)));
    }
    return t;
  }
  function style(t, n) {
    const o = isString(n);
    const s = isArray(n) || o;
    if (s) {
      let s = o ? "" : {};
      if (t) {
        const e = window.getComputedStyle(t, null);
        s = o ? getCSSVal(t, e, n) : n.reduce(((n, o) => {
          n[o] = getCSSVal(t, e, o);
          return n;
        }), s);
      }
      return s;
    }
    t && each(keys(n), (o => setCSSVal(t, o, n[o])));
  }
  const createCache = (t, n) => {
    const {o: o, u: s, _: e} = t;
    let c = o;
    let r;
    const cacheUpdateContextual = (t, n) => {
      const o = c;
      const l = t;
      const i = n || (s ? !s(o, l) : o !== l);
      if (i || e) {
        c = l;
        r = o;
      }
      return [ c, i, r ];
    };
    const cacheUpdateIsolated = t => cacheUpdateContextual(n(c, r), t);
    const getCurrentCache = t => [ c, !!t, r ];
    return [ n ? cacheUpdateIsolated : cacheUpdateContextual, getCurrentCache ];
  };
  const n = Node.ELEMENT_NODE;
  const {toString: o, hasOwnProperty: s} = Object.prototype;
  const isUndefined = t => void 0 === t;
  const isNull = t => null === t;
  const type = t => isUndefined(t) || isNull(t) ? `${t}` : o.call(t).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
  const isNumber = t => "number" === typeof t;
  const isString = t => "string" === typeof t;
  const isBoolean = t => "boolean" === typeof t;
  const isFunction = t => "function" === typeof t;
  const isArray = t => Array.isArray(t);
  const isObject = t => "object" === typeof t && !isArray(t) && !isNull(t);
  const isArrayLike = t => {
    const n = !!t && t.length;
    const o = isNumber(n) && n > -1 && n % 1 == 0;
    return isArray(t) || !isFunction(t) && o ? n > 0 && isObject(t) ? n - 1 in t : true : false;
  };
  const isPlainObject = t => {
    if (!t || !isObject(t) || "object" !== type(t)) {
      return false;
    }
    let n;
    const o = "constructor";
    const e = t[o];
    const c = e && e.prototype;
    const r = s.call(t, o);
    const l = c && s.call(c, "isPrototypeOf");
    if (e && !r && !l) {
      return false;
    }
    for (n in t) {}
    return isUndefined(n) || s.call(t, n);
  };
  const isHTMLElement = t => {
    const o = HTMLElement;
    return t ? o ? t instanceof o : t.nodeType === n : false;
  };
  const isElement = t => {
    const o = Element;
    return t ? o ? t instanceof o : t.nodeType === n : false;
  };
  const indexOf = (t, n, o) => t.indexOf(n, o);
  const push = (t, n, o) => {
    !o && !isString(n) && isArrayLike(n) ? Array.prototype.push.apply(t, n) : t.push(n);
    return t;
  };
  const from = t => {
    const n = Array.from;
    const o = [];
    if (n && t) {
      return n(t);
    }
    if (t instanceof Set) {
      t.forEach((t => {
        push(o, t);
      }));
    } else {
      each(t, (t => {
        push(o, t);
      }));
    }
    return o;
  };
  const isEmptyArray = t => !!t && 0 === t.length;
  const runEachAndClear = (t, n, o) => {
    const runFn = t => t && t.apply(void 0, n || []);
    each(t, runFn);
    !o && (t.length = 0);
  };
  const hasOwnProperty = (t, n) => Object.prototype.hasOwnProperty.call(t, n);
  const keys = t => t ? Object.keys(t) : [];
  const assignDeep = (t, n, o, s, e, c, r) => {
    const l = [ n, o, s, e, c, r ];
    if (("object" !== typeof t || isNull(t)) && !isFunction(t)) {
      t = {};
    }
    each(l, (n => {
      each(keys(n), (o => {
        const s = n[o];
        if (t === s) {
          return true;
        }
        const e = isArray(s);
        if (s && (isPlainObject(s) || e)) {
          const n = t[o];
          let c = n;
          if (e && !isArray(n)) {
            c = [];
          } else if (!e && !isPlainObject(n)) {
            c = {};
          }
          t[o] = assignDeep(c, s);
        } else {
          t[o] = s;
        }
      }));
    }));
    return t;
  };
  const isEmptyObject = t => {
    for (const n in t) {
      return false;
    }
    return true;
  };
  const getSetProp = (t, n, o, s) => {
    if (isUndefined(s)) {
      return o ? o[t] : n;
    }
    o && (isString(s) || isNumber(s)) && (o[t] = s);
  };
  const attr = (t, n, o) => {
    if (isUndefined(o)) {
      return t ? t.getAttribute(n) : null;
    }
    t && t.setAttribute(n, o);
  };
  const attrClass = (t, n, o, s) => {
    if (o) {
      const e = attr(t, n) || "";
      const c = new Set(e.split(" "));
      c[s ? "add" : "delete"](o);
      attr(t, n, from(c).join(" ").trim());
    }
  };
  const hasAttrClass = (t, n, o) => {
    const s = attr(t, n) || "";
    const e = new Set(s.split(" "));
    return e.has(o);
  };
  const removeAttr = (t, n) => {
    t && t.removeAttribute(n);
  };
  const scrollLeft = (t, n) => getSetProp("scrollLeft", 0, t, n);
  const scrollTop = (t, n) => getSetProp("scrollTop", 0, t, n);
  const e = Element.prototype;
  const find = (t, n) => {
    const o = [];
    const s = n ? isElement(n) ? n : null : document;
    return s ? push(o, s.querySelectorAll(t)) : o;
  };
  const findFirst = (t, n) => {
    const o = n ? isElement(n) ? n : null : document;
    return o ? o.querySelector(t) : null;
  };
  const is = (t, n) => {
    if (isElement(t)) {
      const o = e.matches || e.msMatchesSelector;
      return o.call(t, n);
    }
    return false;
  };
  const contents = t => t ? from(t.childNodes) : [];
  const parent = t => t ? t.parentElement : null;
  const closest = (t, n) => {
    if (isElement(t)) {
      const o = e.closest;
      if (o) {
        return o.call(t, n);
      }
      do {
        if (is(t, n)) {
          return t;
        }
        t = parent(t);
      } while (t);
    }
    return null;
  };
  const liesBetween = (t, n, o) => {
    const s = t && closest(t, n);
    const e = t && findFirst(o, s);
    const c = closest(e, n) === s;
    return s && e ? s === t || e === t || c && closest(closest(t, o), n) !== s : false;
  };
  const before = (t, n, o) => {
    if (o && t) {
      let s = n;
      let e;
      if (isArrayLike(o)) {
        e = document.createDocumentFragment();
        each(o, (t => {
          if (t === s) {
            s = t.previousSibling;
          }
          e.appendChild(t);
        }));
      } else {
        e = o;
      }
      if (n) {
        if (!s) {
          s = t.firstChild;
        } else if (s !== n) {
          s = s.nextSibling;
        }
      }
      t.insertBefore(e, s || null);
    }
  };
  const appendChildren = (t, n) => {
    before(t, null, n);
  };
  const insertBefore = (t, n) => {
    before(parent(t), t, n);
  };
  const insertAfter = (t, n) => {
    before(parent(t), t && t.nextSibling, n);
  };
  const removeElements = t => {
    if (isArrayLike(t)) {
      each(from(t), (t => removeElements(t)));
    } else if (t) {
      const n = parent(t);
      if (n) {
        n.removeChild(t);
      }
    }
  };
  const createDiv = t => {
    const n = document.createElement("div");
    if (t) {
      attr(n, "class", t);
    }
    return n;
  };
  const createDOM = t => {
    const n = createDiv();
    n.innerHTML = t.trim();
    return each(contents(n), (t => removeElements(t)));
  };
  const firstLetterToUpper = t => t.charAt(0).toUpperCase() + t.slice(1);
  const getDummyStyle = () => createDiv().style;
  const c = [ "-webkit-", "-moz-", "-o-", "-ms-" ];
  const r = [ "WebKit", "Moz", "O", "MS", "webkit", "moz", "o", "ms" ];
  const l = {};
  const i = {};
  const cssProperty = t => {
    let n = i[t];
    if (hasOwnProperty(i, t)) {
      return n;
    }
    const o = firstLetterToUpper(t);
    const s = getDummyStyle();
    each(c, (e => {
      const c = e.replace(/-/g, "");
      const r = [ t, e + t, c + o, firstLetterToUpper(c) + o ];
      return !(n = r.find((t => void 0 !== s[t])));
    }));
    return i[t] = n || "";
  };
  const jsAPI = t => {
    let n = l[t] || window[t];
    if (hasOwnProperty(l, t)) {
      return n;
    }
    each(r, (o => {
      n = n || window[o + firstLetterToUpper(t)];
      return !n;
    }));
    l[t] = n;
    return n;
  };
  const a = jsAPI("MutationObserver");
  const u = jsAPI("IntersectionObserver");
  const d = jsAPI("ResizeObserver");
  const f = jsAPI("cancelAnimationFrame");
  const _ = jsAPI("requestAnimationFrame");
  const h = window.setTimeout;
  const g = window.clearTimeout;
  const v = /[^\x20\t\r\n\f]+/g;
  const classListAction = (t, n, o) => {
    const s = t && t.classList;
    let e;
    let c = 0;
    let r = false;
    if (s && n && isString(n)) {
      const t = n.match(v) || [];
      r = t.length > 0;
      while (e = t[c++]) {
        r = !!o(s, e) && r;
      }
    }
    return r;
  };
  const hasClass = (t, n) => classListAction(t, n, ((t, n) => t.contains(n)));
  const removeClass = (t, n) => {
    classListAction(t, n, ((t, n) => t.remove(n)));
  };
  const addClass = (t, n) => {
    classListAction(t, n, ((t, n) => t.add(n)));
    return removeClass.bind(0, t, n);
  };
  const equal = (t, n, o, s) => {
    if (t && n) {
      let e = true;
      each(o, (o => {
        const c = s ? s(t[o]) : t[o];
        const r = s ? s(n[o]) : n[o];
        if (c !== r) {
          e = false;
        }
      }));
      return e;
    }
    return false;
  };
  const equalWH = (t, n) => equal(t, n, [ "w", "h" ]);
  const equalXY = (t, n) => equal(t, n, [ "x", "y" ]);
  const equalTRBL = (t, n) => equal(t, n, [ "t", "r", "b", "l" ]);
  const equalBCRWH = (t, n, o) => equal(t, n, [ "width", "height" ], o && (t => Math.round(t)));
  const noop = () => {};
  const selfCancelTimeout = t => {
    let n;
    const o = t ? h : _;
    const s = t ? g : f;
    return [ e => {
      s(n);
      n = o(e, isFunction(t) ? t() : t);
    }, () => s(n) ];
  };
  const debounce = (t, n) => {
    let o;
    let s;
    let e;
    let c = noop;
    const {g: r, v: l, p: i} = n || {};
    const a = function invokeFunctionToDebounce(n) {
      c();
      g(o);
      o = s = void 0;
      c = noop;
      t.apply(this, n);
    };
    const mergeParms = t => i && s ? i(s, t) : t;
    const flush = () => {
      if (c !== noop) {
        a(mergeParms(e) || e);
      }
    };
    const u = function debouncedFn() {
      const t = from(arguments);
      const n = isFunction(r) ? r() : r;
      const i = isNumber(n) && n >= 0;
      if (i) {
        const r = isFunction(l) ? l() : l;
        const i = isNumber(r) && r >= 0;
        const u = n > 0 ? h : _;
        const d = n > 0 ? g : f;
        const v = mergeParms(t);
        const w = v || t;
        const p = a.bind(0, w);
        c();
        const b = u(p, n);
        c = () => d(b);
        if (i && !o) {
          o = h(flush, r);
        }
        s = e = w;
      } else {
        a(t);
      }
    };
    u.m = flush;
    return u;
  };
  const w = {
    opacity: 1,
    zindex: 1
  };
  const parseToZeroOrNumber = (t, n) => {
    const o = n ? parseFloat(t) : parseInt(t, 10);
    return o === o ? o : 0;
  };
  const adaptCSSVal = (t, n) => !w[t.toLowerCase()] && isNumber(n) ? `${n}px` : n;
  const getCSSVal = (t, n, o) => null != n ? n[o] || n.getPropertyValue(o) : t.style[o];
  const setCSSVal = (t, n, o) => {
    try {
      const {style: s} = t;
      if (!isUndefined(s[n])) {
        s[n] = adaptCSSVal(n, o);
      } else {
        s.setProperty(n, o);
      }
    } catch (s) {}
  };
  const directionIsRTL = t => "rtl" === style(t, "direction");
  const topRightBottomLeft = (t, n, o) => {
    const s = n ? `${n}-` : "";
    const e = o ? `-${o}` : "";
    const c = `${s}top${e}`;
    const r = `${s}right${e}`;
    const l = `${s}bottom${e}`;
    const i = `${s}left${e}`;
    const a = style(t, [ c, r, l, i ]);
    return {
      t: parseToZeroOrNumber(a[c]),
      r: parseToZeroOrNumber(a[r]),
      b: parseToZeroOrNumber(a[l]),
      l: parseToZeroOrNumber(a[i])
    };
  };
  const {round: p} = Math;
  const b = {
    w: 0,
    h: 0
  };
  const windowSize = () => ({
    w: window.innerWidth,
    h: window.innerHeight
  });
  const offsetSize = t => t ? {
    w: t.offsetWidth,
    h: t.offsetHeight
  } : b;
  const clientSize = t => t ? {
    w: t.clientWidth,
    h: t.clientHeight
  } : b;
  const scrollSize = t => t ? {
    w: t.scrollWidth,
    h: t.scrollHeight
  } : b;
  const fractionalSize = t => {
    const n = parseFloat(style(t, "height")) || 0;
    const o = parseFloat(style(t, "width")) || 0;
    return {
      w: o - p(o),
      h: n - p(n)
    };
  };
  const getBoundingClientRect = t => t.getBoundingClientRect();
  let y;
  const supportPassiveEvents = () => {
    if (isUndefined(y)) {
      y = false;
      try {
        window.addEventListener("test", null, Object.defineProperty({}, "passive", {
          get() {
            y = true;
          }
        }));
      } catch (t) {}
    }
    return y;
  };
  const splitEventNames = t => t.split(" ");
  const off = (t, n, o, s) => {
    each(splitEventNames(n), (n => {
      t.removeEventListener(n, o, s);
    }));
  };
  const on = (t, n, o, s) => {
    var e;
    const c = supportPassiveEvents();
    const r = null != (e = c && s && s.S) ? e : c;
    const l = s && s.$ || false;
    const i = s && s.C || false;
    const a = [];
    const u = c ? {
      passive: r,
      capture: l
    } : l;
    each(splitEventNames(n), (n => {
      const s = i ? e => {
        t.removeEventListener(n, s, l);
        o && o(e);
      } : o;
      push(a, off.bind(null, t, n, s, l));
      t.addEventListener(n, s, u);
    }));
    return runEachAndClear.bind(0, a);
  };
  const stopPropagation = t => t.stopPropagation();
  const preventDefault = t => t.preventDefault();
  const m = {
    x: 0,
    y: 0
  };
  const absoluteCoordinates = t => {
    const n = t ? getBoundingClientRect(t) : 0;
    return n ? {
      x: n.left + window.pageYOffset,
      y: n.top + window.pageXOffset
    } : m;
  };
  const manageListener = (t, n) => {
    each(isArray(n) ? n : [ n ], t);
  };
  const createEventListenerHub = t => {
    const n = new Map;
    const removeEvent = (t, o) => {
      if (t) {
        const s = n.get(t);
        manageListener((t => {
          if (s) {
            s[t ? "delete" : "clear"](t);
          }
        }), o);
      } else {
        n.forEach((t => {
          t.clear();
        }));
        n.clear();
      }
    };
    const addEvent = (t, o) => {
      const s = n.get(t) || new Set;
      n.set(t, s);
      manageListener((t => {
        t && s.add(t);
      }), o);
      return removeEvent.bind(0, t, o);
    };
    const triggerEvent = (t, o) => {
      const s = n.get(t);
      each(from(s), (t => {
        if (o && !isEmptyArray(o)) {
          t.apply(0, o);
        } else {
          t();
        }
      }));
    };
    const o = keys(t);
    each(o, (n => {
      addEvent(n, t[n]);
    }));
    return [ addEvent, removeEvent, triggerEvent ];
  };
  const opsStringify = t => JSON.stringify(t, ((t, n) => {
    if (isFunction(n)) {
      throw new Error;
    }
    return n;
  }));
  const S = {
    paddingAbsolute: false,
    showNativeOverlaidScrollbars: false,
    update: {
      elementEvents: [ [ "img", "load" ] ],
      debounce: [ 0, 33 ],
      attributes: null,
      ignoreMutation: null
    },
    overflow: {
      x: "scroll",
      y: "scroll"
    },
    scrollbars: {
      theme: "os-theme-dark",
      visibility: "auto",
      autoHide: "never",
      autoHideDelay: 1300,
      dragScroll: true,
      clickScroll: false,
      pointers: [ "mouse", "touch", "pen" ]
    }
  };
  const getOptionsDiff = (t, n) => {
    const o = {};
    const s = keys(n).concat(keys(t));
    each(s, (s => {
      const e = t[s];
      const c = n[s];
      if (isObject(e) && isObject(c)) {
        assignDeep(o[s] = {}, getOptionsDiff(e, c));
      } else if (hasOwnProperty(n, s) && c !== e) {
        let t = true;
        if (isArray(e) || isArray(c)) {
          try {
            if (opsStringify(e) === opsStringify(c)) {
              t = false;
            }
          } catch (r) {}
        }
        if (t) {
          o[s] = c;
        }
      }
    }));
    return o;
  };
  const $ = "os-environment";
  const x = `${$}-flexbox-glue`;
  const C = `${x}-max`;
  const O = "data-overlayscrollbars";
  const E = `${O}-overflow-x`;
  const A = `${O}-overflow-y`;
  const T = "overflowVisible";
  const z = "scrollbarHidden";
  const I = "updating";
  const L = "os-padding";
  const H = "os-viewport";
  const M = `${H}-arrange`;
  const P = "os-content";
  const D = `${H}-scrollbar-hidden`;
  const R = `os-overflow-visible`;
  const k = "os-size-observer";
  const B = `${k}-appear`;
  const V = `${k}-listener`;
  const j = `${V}-scroll`;
  const Y = `${V}-item`;
  const q = `${Y}-final`;
  const F = "os-trinsic-observer";
  const G = "os-scrollbar";
  const N = `${G}-rtl`;
  const X = `${G}-horizontal`;
  const U = `${G}-vertical`;
  const W = `${G}-track`;
  const J = `${G}-handle`;
  const K = `${G}-visible`;
  const Z = `${G}-cornerless`;
  const Q = `${G}-transitionless`;
  const tt = `${G}-interaction`;
  const nt = `${G}-unusable`;
  const ot = `${G}-auto-hidden`;
  const st = `${G}-wheel`;
  const et = `${W}-interactive`;
  const ct = `${J}-interactive`;
  const rt = {};
  const getPlugins = () => rt;
  const addPlugin = t => {
    each(isArray(t) ? t : [ t ], (t => {
      const n = keys(t)[0];
      rt[n] = t[n];
    }));
  };
  const lt = {
    boolean: "__TPL_boolean_TYPE__",
    number: "__TPL_number_TYPE__",
    string: "__TPL_string_TYPE__",
    array: "__TPL_array_TYPE__",
    object: "__TPL_object_TYPE__",
    function: "__TPL_function_TYPE__",
    null: "__TPL_null_TYPE__"
  };
  const it = lt.number;
  const at = lt.boolean;
  const ut = [ lt.array, lt.null ];
  const dt = "hidden scroll visible visible-hidden";
  const ft = "visible hidden auto";
  const _t = "never scroll leavemove";
  ({
    paddingAbsolute: at,
    showNativeOverlaidScrollbars: at,
    update: {
      elementEvents: ut,
      attributes: ut,
      debounce: [ lt.number, lt.array, lt.null ],
      ignoreMutation: [ lt.function, lt.null ]
    },
    overflow: {
      x: dt,
      y: dt
    },
    scrollbars: {
      theme: [ lt.string, lt.null ],
      visibility: ft,
      autoHide: _t,
      autoHideDelay: it,
      dragScroll: at,
      clickScroll: at,
      pointers: [ lt.array, lt.null ]
    }
  });
  const ht = "__osOptionsValidationPlugin";
  const gt = 3333333;
  const vt = "scroll";
  const wt = "__osSizeObserverPlugin";
  const pt = /* @__PURE__ */ (() => ({
    [wt]: {
      O: (t, n, o) => {
        const s = createDOM(`<div class="${Y}" dir="ltr"><div class="${Y}"><div class="${q}"></div></div><div class="${Y}"><div class="${q}" style="width: 200%; height: 200%"></div></div></div>`);
        appendChildren(t, s);
        addClass(t, j);
        const e = s[0];
        const c = e.lastChild;
        const r = e.firstChild;
        const l = null == r ? void 0 : r.firstChild;
        let i = offsetSize(e);
        let a = i;
        let u = false;
        let d;
        const reset = () => {
          scrollLeft(r, gt);
          scrollTop(r, gt);
          scrollLeft(c, gt);
          scrollTop(c, gt);
        };
        const onResized = t => {
          d = 0;
          if (u) {
            i = a;
            n(true === t);
          }
        };
        const onScroll = t => {
          a = offsetSize(e);
          u = !t || !equalWH(a, i);
          if (t) {
            stopPropagation(t);
            if (u && !d) {
              f(d);
              d = _(onResized);
            }
          } else {
            onResized(false === t);
          }
          reset();
        };
        const h = push([], [ on(r, vt, onScroll), on(c, vt, onScroll) ]);
        style(l, {
          width: gt,
          height: gt
        });
        _(reset);
        return [ o ? onScroll.bind(0, false) : reset, h ];
      }
    }
  }))();
  let bt = 0;
  const {round: yt, abs: mt} = Math;
  const getWindowDPR = () => {
    const t = window.screen.deviceXDPI || 0;
    const n = window.screen.logicalXDPI || 1;
    return window.devicePixelRatio || t / n;
  };
  const diffBiggerThanOne = (t, n) => {
    const o = mt(t);
    const s = mt(n);
    return !(o === s || o + 1 === s || o - 1 === s);
  };
  const St = "__osScrollbarsHidingPlugin";
  const $t = /* @__PURE__ */ (() => ({
    [St]: {
      A: t => {
        const {T: n, I: o, L: s} = t;
        const e = !s && !n && (o.x || o.y);
        const c = e ? document.createElement("style") : false;
        if (c) {
          attr(c, "id", `${M}-${bt}`);
          bt++;
        }
        return c;
      },
      H: (t, n, o, s, e, c, r) => {
        const arrangeViewport = (n, c, r, l) => {
          if (t) {
            const {M: t} = e();
            const {P: i, D: a} = n;
            const {x: u, y: d} = a;
            const {x: f, y: _} = i;
            const h = l ? "paddingRight" : "paddingLeft";
            const g = t[h];
            const v = t.paddingTop;
            const w = c.w + r.w;
            const p = c.h + r.h;
            const b = {
              w: _ && d ? `${_ + w - g}px` : "",
              h: f && u ? `${f + p - v}px` : ""
            };
            if (s) {
              const {sheet: t} = s;
              if (t) {
                const {cssRules: n} = t;
                if (n) {
                  if (!n.length) {
                    t.insertRule(`#${attr(s, "id")} + .${M}::before {}`, 0);
                  }
                  const o = n[0].style;
                  o.width = b.w;
                  o.height = b.h;
                }
              }
            } else {
              style(o, {
                "--os-vaw": b.w,
                "--os-vah": b.h
              });
            }
          }
          return t;
        };
        const undoViewportArrange = (s, l, i) => {
          if (t) {
            const a = i || c(s);
            const {M: u} = e();
            const {D: d} = a;
            const {x: f, y: _} = d;
            const h = {};
            const assignProps = t => each(t.split(" "), (t => {
              h[t] = u[t];
            }));
            if (f) {
              assignProps("marginBottom paddingTop paddingBottom");
            }
            if (_) {
              assignProps("marginLeft marginRight paddingLeft paddingRight");
            }
            const g = style(o, keys(h));
            removeClass(o, M);
            if (!n) {
              h.height = "";
            }
            style(o, h);
            return [ () => {
              r(a, l, t, g);
              style(o, g);
              addClass(o, M);
            }, a ];
          }
          return [ noop ];
        };
        return [ arrangeViewport, undoViewportArrange ];
      },
      R: () => {
        let t = {
          w: 0,
          h: 0
        };
        let n = 0;
        return (o, s, e) => {
          const c = windowSize();
          const r = {
            w: c.w - t.w,
            h: c.h - t.h
          };
          if (0 === r.w && 0 === r.h) {
            return;
          }
          const l = {
            w: mt(r.w),
            h: mt(r.h)
          };
          const i = {
            w: mt(yt(c.w / (t.w / 100))),
            h: mt(yt(c.h / (t.h / 100)))
          };
          const a = getWindowDPR();
          const u = l.w > 2 && l.h > 2;
          const d = !diffBiggerThanOne(i.w, i.h);
          const f = a !== n && a > 0;
          const _ = u && d && f;
          if (_) {
            const [t, n] = s();
            assignDeep(o.k, t);
            if (n) {
              e();
            }
          }
          t = c;
          n = a;
        };
      }
    }
  }))();
  let xt;
  const getNativeScrollbarSize = (t, n, o, s) => {
    appendChildren(t, n);
    const e = clientSize(n);
    const c = offsetSize(n);
    const r = fractionalSize(o);
    s && removeElements(n);
    return {
      x: c.h - e.h + r.h,
      y: c.w - e.w + r.w
    };
  };
  const getNativeScrollbarsHiding = t => {
    let n = false;
    const o = addClass(t, D);
    try {
      n = "none" === style(t, cssProperty("scrollbar-width")) || "none" === window.getComputedStyle(t, "::-webkit-scrollbar").getPropertyValue("display");
    } catch (s) {}
    o();
    return n;
  };
  const getRtlScrollBehavior = (t, n) => {
    const o = "hidden";
    style(t, {
      overflowX: o,
      overflowY: o,
      direction: "rtl"
    });
    scrollLeft(t, 0);
    const s = absoluteCoordinates(t);
    const e = absoluteCoordinates(n);
    scrollLeft(t, -999);
    const c = absoluteCoordinates(n);
    return {
      i: s.x === e.x,
      n: e.x !== c.x
    };
  };
  const getFlexboxGlue = (t, n) => {
    const o = addClass(t, x);
    const s = getBoundingClientRect(t);
    const e = getBoundingClientRect(n);
    const c = equalBCRWH(e, s, true);
    const r = addClass(t, C);
    const l = getBoundingClientRect(t);
    const i = getBoundingClientRect(n);
    const a = equalBCRWH(i, l, true);
    o();
    r();
    return c && a;
  };
  const createEnvironment = () => {
    const {body: t} = document;
    const n = createDOM(`<div class="${$}"><div></div></div>`);
    const o = n[0];
    const s = o.firstChild;
    const [e, , c] = createEventListenerHub();
    const [r, l] = createCache({
      o: getNativeScrollbarSize(t, o, s),
      u: equalXY
    }, getNativeScrollbarSize.bind(0, t, o, s, true));
    const [i] = l();
    const a = getNativeScrollbarsHiding(o);
    const u = {
      x: 0 === i.x,
      y: 0 === i.y
    };
    const d = {
      elements: {
        host: null,
        padding: !a,
        viewport: t => a && t === t.ownerDocument.body && t,
        content: false
      },
      scrollbars: {
        slot: true
      },
      cancel: {
        nativeScrollbarsOverlaid: false,
        body: null
      }
    };
    const f = assignDeep({}, S);
    const _ = {
      k: i,
      I: u,
      T: a,
      L: "-1" === style(o, "zIndex"),
      B: getRtlScrollBehavior(o, s),
      V: getFlexboxGlue(o, s),
      j: t => e("_", t),
      Y: assignDeep.bind(0, {}, d),
      q(t) {
        assignDeep(d, t);
      },
      F: assignDeep.bind(0, {}, f),
      G(t) {
        assignDeep(f, t);
      },
      N: assignDeep({}, d),
      X: assignDeep({}, f)
    };
    removeAttr(o, "style");
    removeElements(o);
    if (!a && (!u.x || !u.y)) {
      let t;
      window.addEventListener("resize", (() => {
        const n = getPlugins()[St];
        t = t || n && n.R();
        t && t(_, r, c.bind(0, "_"));
      }));
    }
    return _;
  };
  const getEnvironment = () => {
    if (!xt) {
      xt = createEnvironment();
    }
    return xt;
  };
  const resolveInitialization = (t, n) => isFunction(t) ? t.apply(0, n) : t;
  const staticInitializationElement = (t, n, o, s) => {
    const e = isUndefined(s) ? o : s;
    const c = resolveInitialization(e, t);
    return c || n();
  };
  const dynamicInitializationElement = (t, n, o, s) => {
    const e = isUndefined(s) ? o : s;
    const c = resolveInitialization(e, t);
    return !!c && (isHTMLElement(c) ? c : n());
  };
  const cancelInitialization = (t, n) => {
    const {nativeScrollbarsOverlaid: o, body: s} = t || {};
    const {U: e} = n;
    const {Y: c, I: r, T: l} = getEnvironment();
    const {nativeScrollbarsOverlaid: i, body: a} = c().cancel;
    const u = null != o ? o : i;
    const d = isUndefined(s) ? a : s;
    const f = (r.x || r.y) && u;
    const _ = e && (isNull(d) ? !l : d);
    return !!f || !!_;
  };
  const Ct = new WeakMap;
  const addInstance = (t, n) => {
    Ct.set(t, n);
  };
  const removeInstance = t => {
    Ct.delete(t);
  };
  const getInstance = t => Ct.get(t);
  const getPropByPath = (t, n) => t ? n.split(".").reduce(((t, n) => t && hasOwnProperty(t, n) ? t[n] : void 0), t) : void 0;
  const createOptionCheck = (t, n, o) => s => [ getPropByPath(t, s), o || void 0 !== getPropByPath(n, s) ];
  const createState = t => {
    let n = t;
    return [ () => n, t => {
      n = assignDeep({}, n, t);
    } ];
  };
  const Ot = "tabindex";
  const Et = createDiv.bind(0, "");
  const unwrap = t => {
    appendChildren(parent(t), contents(t));
    removeElements(t);
  };
  const addDataAttrHost = (t, n) => {
    attr(t, O, n);
    return removeAttr.bind(0, t, O);
  };
  const createStructureSetupElements = t => {
    const n = getEnvironment();
    const {Y: o, T: s} = n;
    const e = getPlugins()[St];
    const c = e && e.A;
    const {elements: r} = o();
    const {host: l, viewport: i, padding: a, content: u} = r;
    const d = isHTMLElement(t);
    const f = d ? {} : t;
    const {elements: _} = f;
    const {host: h, padding: g, viewport: v, content: w} = _ || {};
    const p = d ? t : f.target;
    const b = is(p, "textarea");
    const y = p.ownerDocument;
    const m = p === y.body;
    const S = y.defaultView;
    const $ = staticInitializationElement.bind(0, [ p ]);
    const x = dynamicInitializationElement.bind(0, [ p ]);
    const C = $(Et, i, v);
    const T = C === p;
    const z = T && m;
    const I = y.activeElement;
    const M = !T && S.top === S && I === p;
    const R = {
      W: p,
      J: b ? $(Et, l, h) : p,
      K: C,
      Z: !T && x(Et, a, g),
      tt: !T && x(Et, u, w),
      nt: !T && !s && c && c(n),
      ot: z ? y.documentElement : C,
      st: z ? y : C,
      et: S,
      ct: y,
      rt: b,
      U: m,
      lt: d,
      it: T,
      ut: (t, n) => T ? hasAttrClass(C, O, n) : hasClass(C, t),
      dt: (t, n, o) => T ? attrClass(C, O, n, o) : (o ? addClass : removeClass)(C, t)
    };
    const k = keys(R).reduce(((t, n) => {
      const o = R[n];
      return push(t, o && !parent(o) ? o : false);
    }), []);
    const elementIsGenerated = t => t ? indexOf(k, t) > -1 : null;
    const {W: B, J: V, Z: j, K: Y, tt: q, nt: F} = R;
    const G = [];
    const N = b && elementIsGenerated(V);
    let X = b ? B : contents([ q, Y, j, V, B ].find((t => false === elementIsGenerated(t))));
    const U = q || Y;
    const appendElements = () => {
      const t = addDataAttrHost(V, T ? "viewport" : "host");
      const n = addClass(j, L);
      const o = addClass(Y, !T && H);
      const e = addClass(q, P);
      const c = m ? addClass(parent(p), D) : noop;
      if (N) {
        insertAfter(B, V);
        push(G, (() => {
          insertAfter(V, B);
          removeElements(V);
        }));
      }
      appendChildren(U, X);
      appendChildren(V, j);
      appendChildren(j || V, !T && Y);
      appendChildren(Y, q);
      push(G, (() => {
        c();
        t();
        removeAttr(Y, E);
        removeAttr(Y, A);
        if (elementIsGenerated(q)) {
          unwrap(q);
        }
        if (elementIsGenerated(Y)) {
          unwrap(Y);
        }
        if (elementIsGenerated(j)) {
          unwrap(j);
        }
        n();
        o();
        e();
      }));
      if (s && !T) {
        push(G, removeClass.bind(0, Y, D));
      }
      if (F) {
        insertBefore(Y, F);
        push(G, removeElements.bind(0, F));
      }
      if (M) {
        const t = attr(Y, Ot);
        attr(Y, Ot, "-1");
        Y.focus();
        const n = on(y, "pointerdown keydown", (() => {
          t ? attr(Y, Ot, t) : removeAttr(Y, Ot);
          n();
        }));
      } else if (I && I.focus) {
        I.focus();
      }
      X = 0;
    };
    return [ R, appendElements, runEachAndClear.bind(0, G) ];
  };
  const createTrinsicUpdateSegment = (t, n) => {
    const {tt: o} = t;
    const [s] = n;
    return t => {
      const {V: n} = getEnvironment();
      const {ft: e} = s();
      const {_t: c} = t;
      const r = (o || !n) && c;
      if (r) {
        style(o, {
          height: e ? "" : "100%"
        });
      }
      return {
        ht: r,
        gt: r
      };
    };
  };
  const createPaddingUpdateSegment = (t, n) => {
    const [o, s] = n;
    const {J: e, Z: c, K: r, it: l} = t;
    const [i, a] = createCache({
      u: equalTRBL,
      o: topRightBottomLeft()
    }, topRightBottomLeft.bind(0, e, "padding", ""));
    return (t, n, e) => {
      let [u, d] = a(e);
      const {T: f, V: _} = getEnvironment();
      const {vt: h} = o();
      const {ht: g, gt: v, wt: w} = t;
      const [p, b] = n("paddingAbsolute");
      const y = !_ && v;
      if (g || d || y) {
        [u, d] = i(e);
      }
      const m = !l && (b || w || d);
      if (m) {
        const t = !p || !c && !f;
        const n = u.r + u.l;
        const o = u.t + u.b;
        const e = {
          marginRight: t && !h ? -n : 0,
          marginBottom: t ? -o : 0,
          marginLeft: t && h ? -n : 0,
          top: t ? -u.t : 0,
          right: t ? h ? -u.r : "auto" : 0,
          left: t ? h ? "auto" : -u.l : 0,
          width: t ? `calc(100% + ${n}px)` : ""
        };
        const l = {
          paddingTop: t ? u.t : 0,
          paddingRight: t ? u.r : 0,
          paddingBottom: t ? u.b : 0,
          paddingLeft: t ? u.l : 0
        };
        style(c || r, e);
        style(r, l);
        s({
          Z: u,
          bt: !t,
          M: c ? l : assignDeep({}, e, l)
        });
      }
      return {
        yt: m
      };
    };
  };
  const {max: At} = Math;
  const Tt = At.bind(0, 0);
  const zt = "visible";
  const It = "hidden";
  const Lt = 42;
  const Ht = {
    u: equalWH,
    o: {
      w: 0,
      h: 0
    }
  };
  const Mt = {
    u: equalXY,
    o: {
      x: It,
      y: It
    }
  };
  const getOverflowAmount = (t, n) => {
    const o = window.devicePixelRatio % 1 !== 0 ? 1 : 0;
    const s = {
      w: Tt(t.w - n.w),
      h: Tt(t.h - n.h)
    };
    return {
      w: s.w > o ? s.w : 0,
      h: s.h > o ? s.h : 0
    };
  };
  const conditionalClass = (t, n, o) => o ? addClass(t, n) : removeClass(t, n);
  const overflowIsVisible = t => 0 === t.indexOf(zt);
  const createOverflowUpdateSegment = (t, n) => {
    const [o, s] = n;
    const {J: e, Z: c, K: r, nt: l, it: i, dt: a, U: u, et: d} = t;
    const {k: f, V: _, T: h, I: g} = getEnvironment();
    const v = getPlugins()[St];
    const w = !i && !h && (g.x || g.y);
    const p = u && i;
    const [b, y] = createCache(Ht, fractionalSize.bind(0, r));
    const [m, S] = createCache(Ht, scrollSize.bind(0, r));
    const [$, x] = createCache(Ht);
    const [C, I] = createCache(Ht);
    const [L] = createCache(Mt);
    const fixFlexboxGlue = (t, n) => {
      style(r, {
        height: ""
      });
      if (n) {
        const {bt: n, Z: s} = o();
        const {St: c, P: l} = t;
        const i = fractionalSize(e);
        const a = clientSize(e);
        const u = "content-box" === style(r, "boxSizing");
        const d = n || u ? s.b + s.t : 0;
        const f = !(g.x && u);
        style(r, {
          height: a.h + i.h + (c.x && f ? l.x : 0) - d
        });
      }
    };
    const getViewportOverflowState = (t, n) => {
      const o = !h && !t ? Lt : 0;
      const getStatePerAxis = (t, s, e) => {
        const c = style(r, t);
        const l = n ? n[t] : c;
        const i = "scroll" === l;
        const a = s ? o : e;
        const u = i && !h ? a : 0;
        const d = s && !!o;
        return [ c, i, u, d ];
      };
      const [s, e, c, l] = getStatePerAxis("overflowX", g.x, f.x);
      const [i, a, u, d] = getStatePerAxis("overflowY", g.y, f.y);
      return {
        $t: {
          x: s,
          y: i
        },
        St: {
          x: e,
          y: a
        },
        P: {
          x: c,
          y: u
        },
        D: {
          x: l,
          y: d
        }
      };
    };
    const setViewportOverflowState = (t, n, o, s) => {
      const setAxisOverflowStyle = (t, n) => {
        const o = overflowIsVisible(t);
        const s = n && o && t.replace(`${zt}-`, "") || "";
        return [ n && !o ? t : "", overflowIsVisible(s) ? "hidden" : s ];
      };
      const [e, c] = setAxisOverflowStyle(o.x, n.x);
      const [r, l] = setAxisOverflowStyle(o.y, n.y);
      s.overflowX = c && r ? c : e;
      s.overflowY = l && e ? l : r;
      return getViewportOverflowState(t, s);
    };
    const hideNativeScrollbars = (t, n, s, e) => {
      const {P: c, D: r} = t;
      const {x: l, y: i} = r;
      const {x: a, y: u} = c;
      const {M: d} = o();
      const f = n ? "marginLeft" : "marginRight";
      const _ = n ? "paddingLeft" : "paddingRight";
      const h = d[f];
      const g = d.marginBottom;
      const v = d[_];
      const w = d.paddingBottom;
      e.width = `calc(100% + ${u + -1 * h}px)`;
      e[f] = -u + h;
      e.marginBottom = -a + g;
      if (s) {
        e[_] = v + (i ? u : 0);
        e.paddingBottom = w + (l ? a : 0);
      }
    };
    const [H, M] = v ? v.H(w, _, r, l, o, getViewportOverflowState, hideNativeScrollbars) : [ () => w, () => [ noop ] ];
    return (t, n, l) => {
      const {ht: u, xt: f, gt: v, yt: w, _t: P, wt: k} = t;
      const {ft: B, vt: V} = o();
      const [j, Y] = n("showNativeOverlaidScrollbars");
      const [q, F] = n("overflow");
      const G = j && g.x && g.y;
      const N = !i && !_ && (u || v || f || Y || P);
      const X = overflowIsVisible(q.x);
      const U = overflowIsVisible(q.y);
      const W = X || U;
      let J = y(l);
      let K = S(l);
      let Z = x(l);
      let Q = I(l);
      let tt;
      if (Y && h) {
        a(D, z, !G);
      }
      if (N) {
        tt = getViewportOverflowState(G);
        fixFlexboxGlue(tt, B);
      }
      if (u || w || v || k || Y) {
        if (W) {
          a(R, T, false);
        }
        const [t, n] = M(G, V, tt);
        const [o, s] = J = b(l);
        const [e, c] = K = m(l);
        const i = clientSize(r);
        let u = e;
        let f = i;
        t();
        if ((c || s || Y) && n && !G && H(n, e, o, V)) {
          f = clientSize(r);
          u = scrollSize(r);
        }
        const _ = {
          w: Tt(At(e.w, u.w) + o.w),
          h: Tt(At(e.h, u.h) + o.h)
        };
        const h = {
          w: Tt(p ? d.innerWidth : f.w + Tt(i.w - e.w) + o.w),
          h: Tt(p ? d.innerHeight : f.h + Tt(i.h - e.h) + o.h)
        };
        Q = C(h);
        Z = $(getOverflowAmount(_, h), l);
      }
      const [nt, ot] = Q;
      const [st, et] = Z;
      const [ct, rt] = K;
      const [lt, it] = J;
      const at = {
        x: st.w > 0,
        y: st.h > 0
      };
      const ut = X && U && (at.x || at.y) || X && at.x && !at.y || U && at.y && !at.x;
      if (w || k || it || rt || ot || et || F || Y || N) {
        const t = {
          marginRight: 0,
          marginBottom: 0,
          marginLeft: 0,
          width: "",
          overflowY: "",
          overflowX: ""
        };
        const n = setViewportOverflowState(G, at, q, t);
        const o = H(n, ct, lt, V);
        if (!i) {
          hideNativeScrollbars(n, V, o, t);
        }
        if (N) {
          fixFlexboxGlue(n, B);
        }
        if (i) {
          attr(e, E, t.overflowX);
          attr(e, A, t.overflowY);
        } else {
          style(r, t);
        }
      }
      attrClass(e, O, T, ut);
      conditionalClass(c, R, ut);
      !i && conditionalClass(r, R, W);
      const [dt, ft] = L(getViewportOverflowState(G).$t);
      s({
        $t: dt,
        Ct: {
          x: nt.w,
          y: nt.h
        },
        Ot: {
          x: st.w,
          y: st.h
        },
        Et: at
      });
      return {
        At: ft,
        Tt: ot,
        zt: et
      };
    };
  };
  const prepareUpdateHints = (t, n, o) => {
    const s = {};
    const e = n || {};
    const c = keys(t).concat(keys(e));
    each(c, (n => {
      const c = t[n];
      const r = e[n];
      s[n] = !!(o || c || r);
    }));
    return s;
  };
  const createStructureSetupUpdate = (t, n) => {
    const {W: o, K: s, dt: e, it: c} = t;
    const {T: r, I: l, V: i} = getEnvironment();
    const a = !r && (l.x || l.y);
    const u = [ createTrinsicUpdateSegment(t, n), createPaddingUpdateSegment(t, n), createOverflowUpdateSegment(t, n) ];
    return (t, n, r) => {
      const l = prepareUpdateHints(assignDeep({
        ht: false,
        yt: false,
        wt: false,
        _t: false,
        Tt: false,
        zt: false,
        At: false,
        xt: false,
        gt: false
      }, n), {}, r);
      const d = a || !i;
      const f = d && scrollLeft(s);
      const _ = d && scrollTop(s);
      e("", I, true);
      let h = l;
      each(u, (n => {
        h = prepareUpdateHints(h, n(h, t, !!r) || {}, r);
      }));
      scrollLeft(s, f);
      scrollTop(s, _);
      e("", I);
      if (!c) {
        scrollLeft(o, 0);
        scrollTop(o, 0);
      }
      return h;
    };
  };
  const Pt = 3333333;
  const domRectHasDimensions = t => t && (t.height || t.width);
  const createSizeObserver = (t, n, o) => {
    const {It: s = false, Lt: e = false} = o || {};
    const c = getPlugins()[wt];
    const {B: r} = getEnvironment();
    const l = createDOM(`<div class="${k}"><div class="${V}"></div></div>`);
    const i = l[0];
    const a = i.firstChild;
    const u = directionIsRTL.bind(0, t);
    const [f] = createCache({
      o: void 0,
      _: true,
      u: (t, n) => !(!t || !domRectHasDimensions(t) && domRectHasDimensions(n))
    });
    const onSizeChangedCallbackProxy = t => {
      const o = isArray(t) && t.length > 0 && isObject(t[0]);
      const e = !o && isBoolean(t[0]);
      let c = false;
      let l = false;
      let a = true;
      if (o) {
        const [n, , o] = f(t.pop().contentRect);
        const s = domRectHasDimensions(n);
        const e = domRectHasDimensions(o);
        c = !o || !s;
        l = !e && s;
        a = !c;
      } else if (e) {
        [, a] = t;
      } else {
        l = true === t;
      }
      if (s && a) {
        const n = e ? t[0] : directionIsRTL(i);
        scrollLeft(i, n ? r.n ? -Pt : r.i ? 0 : Pt : Pt);
        scrollTop(i, Pt);
      }
      if (!c) {
        n({
          ht: !e,
          Ht: e ? t : void 0,
          Lt: !!l
        });
      }
    };
    const _ = [];
    let h = e ? onSizeChangedCallbackProxy : false;
    return [ () => {
      runEachAndClear(_);
      removeElements(i);
    }, () => {
      if (d) {
        const t = new d(onSizeChangedCallbackProxy);
        t.observe(a);
        push(_, (() => {
          t.disconnect();
        }));
      } else if (c) {
        const [t, n] = c.O(a, onSizeChangedCallbackProxy, e);
        h = t;
        push(_, n);
      }
      if (s) {
        const [t] = createCache({
          o: !u()
        }, u);
        push(_, on(i, "scroll", (n => {
          const o = t();
          const [s, e] = o;
          if (e) {
            removeClass(a, "ltr rtl");
            if (s) {
              addClass(a, "rtl");
            } else {
              addClass(a, "ltr");
            }
            onSizeChangedCallbackProxy(o);
          }
          stopPropagation(n);
        })));
      }
      if (h) {
        addClass(i, B);
        push(_, on(i, "animationstart", h, {
          C: !!d
        }));
      }
      appendChildren(t, i);
    } ];
  };
  const isHeightIntrinsic = t => 0 === t.h || t.isIntersecting || t.intersectionRatio > 0;
  const createTrinsicObserver = (t, n) => {
    let o;
    const s = createDiv(F);
    const e = [];
    const [c] = createCache({
      o: false
    });
    const triggerOnTrinsicChangedCallback = (t, o) => {
      if (t) {
        const s = c(isHeightIntrinsic(t));
        const [, e] = s;
        if (e) {
          !o && n(s);
          return [ s ];
        }
      }
    };
    const intersectionObserverCallback = (t, n) => {
      if (t && t.length > 0) {
        return triggerOnTrinsicChangedCallback(t.pop(), n);
      }
    };
    return [ () => {
      runEachAndClear(e);
      removeElements(s);
    }, () => {
      if (u) {
        o = new u((t => intersectionObserverCallback(t)), {
          root: t
        });
        o.observe(s);
        push(e, (() => {
          o.disconnect();
        }));
      } else {
        const onSizeChanged = () => {
          const t = offsetSize(s);
          triggerOnTrinsicChangedCallback(t);
        };
        const [t, n] = createSizeObserver(s, onSizeChanged);
        push(e, t);
        n();
        onSizeChanged();
      }
      appendChildren(t, s);
    }, () => {
      if (o) {
        return intersectionObserverCallback(o.takeRecords(), true);
      }
    } ];
  };
  const createEventContentChange = (t, n, o) => {
    let s;
    let e = false;
    const destroy = () => {
      e = true;
    };
    const updateElements = c => {
      if (o) {
        const r = o.reduce(((n, o) => {
          if (o) {
            const s = o[0];
            const e = o[1];
            const r = e && s && (c ? c(s) : find(s, t));
            if (r && r.length && e && isString(e)) {
              push(n, [ r, e.trim() ], true);
            }
          }
          return n;
        }), []);
        each(r, (t => each(t[0], (o => {
          const c = t[1];
          const r = s.get(o);
          if (r) {
            const t = r[0];
            const n = r[1];
            if (t === c) {
              n();
            }
          }
          const l = on(o, c, (t => {
            if (e) {
              l();
              s.delete(o);
            } else {
              n(t);
            }
          }));
          s.set(o, [ c, l ]);
        }))));
      }
    };
    if (o) {
      s = new WeakMap;
      updateElements();
    }
    return [ destroy, updateElements ];
  };
  const createDOMObserver = (t, n, o, s) => {
    let e = false;
    const {Mt: c, Pt: r, Dt: l, Rt: i, kt: u, Bt: d} = s || {};
    const f = debounce((() => {
      if (e) {
        o(true);
      }
    }), {
      g: 33,
      v: 99
    });
    const [_, h] = createEventContentChange(t, f, l);
    const g = c || [];
    const v = r || [];
    const w = g.concat(v);
    const observerCallback = (e, c) => {
      const r = u || noop;
      const l = d || noop;
      const a = [];
      const f = [];
      let _ = false;
      let g = false;
      let w = false;
      each(e, (o => {
        const {attributeName: e, target: c, type: u, oldValue: d, addedNodes: h} = o;
        const p = "attributes" === u;
        const b = "childList" === u;
        const y = t === c;
        const m = p && isString(e) ? attr(c, e) : 0;
        const S = 0 !== m && d !== m;
        const $ = indexOf(v, e) > -1 && S;
        if (n && !y) {
          const n = !p;
          const a = p && $;
          const u = a && i && is(c, i);
          const _ = u ? !r(c, e, d, m) : n || a;
          const v = _ && !l(o, !!u, t, s);
          push(f, h);
          g = g || v;
          w = w || b;
        }
        if (!n && y && S && !r(c, e, d, m)) {
          push(a, e);
          _ = _ || $;
        }
      }));
      if (w && !isEmptyArray(f)) {
        h((t => f.reduce(((n, o) => {
          push(n, find(t, o));
          return is(o, t) ? push(n, o) : n;
        }), [])));
      }
      if (n) {
        !c && g && o(false);
        return [ false ];
      }
      if (!isEmptyArray(a) || _) {
        !c && o(a, _);
        return [ a, _ ];
      }
    };
    const p = new a((t => observerCallback(t)));
    p.observe(t, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: w,
      subtree: n,
      childList: n,
      characterData: n
    });
    e = true;
    return [ () => {
      if (e) {
        _();
        p.disconnect();
        e = false;
      }
    }, () => {
      if (e) {
        f.m();
        const t = p.takeRecords();
        return !isEmptyArray(t) && observerCallback(t, true);
      }
    } ];
  };
  const Dt = `[${O}]`;
  const Rt = `.${H}`;
  const kt = [ "tabindex" ];
  const Bt = [ "wrap", "cols", "rows" ];
  const Vt = [ "id", "class", "style", "open" ];
  const createStructureSetupObservers = (t, n, o) => {
    let s;
    let e;
    let c;
    const [, r] = n;
    const {J: l, K: i, tt: a, rt: u, it: f, ut: _, dt: h} = t;
    const {V: g} = getEnvironment();
    const [v] = createCache({
      u: equalWH,
      o: {
        w: 0,
        h: 0
      }
    }, (() => {
      const t = _(R, T);
      const n = _(M, "");
      const o = n && scrollLeft(i);
      const s = n && scrollTop(i);
      h(R, T);
      h(M, "");
      h("", I, true);
      const e = scrollSize(a);
      const c = scrollSize(i);
      const r = fractionalSize(i);
      h(R, T, t);
      h(M, "", n);
      h("", I);
      scrollLeft(i, o);
      scrollTop(i, s);
      return {
        w: c.w + e.w + r.w,
        h: c.h + e.h + r.h
      };
    }));
    const w = u ? Bt : Vt.concat(Bt);
    const p = debounce(o, {
      g: () => s,
      v: () => e,
      p(t, n) {
        const [o] = t;
        const [s] = n;
        return [ keys(o).concat(keys(s)).reduce(((t, n) => {
          t[n] = o[n] || s[n];
          return t;
        }), {}) ];
      }
    });
    const updateViewportAttrsFromHost = t => {
      each(t || kt, (t => {
        if (indexOf(kt, t) > -1) {
          const n = attr(l, t);
          if (isString(n)) {
            attr(i, t, n);
          } else {
            removeAttr(i, t);
          }
        }
      }));
    };
    const onTrinsicChanged = (t, n) => {
      const [s, e] = t;
      const c = {
        _t: e
      };
      r({
        ft: s
      });
      !n && o(c);
      return c;
    };
    const onSizeChanged = ({ht: t, Ht: n, Lt: s}) => {
      const e = !t || s ? o : p;
      let c = false;
      if (n) {
        const [t, o] = n;
        c = o;
        r({
          vt: t
        });
      }
      e({
        ht: t,
        wt: c
      });
    };
    const onContentMutation = (t, n) => {
      const [, s] = v();
      const e = {
        gt: s
      };
      const c = t ? o : p;
      if (s) {
        !n && c(e);
      }
      return e;
    };
    const onHostMutation = (t, n, o) => {
      const s = {
        xt: n
      };
      if (n) {
        !o && p(s);
      } else if (!f) {
        updateViewportAttrsFromHost(t);
      }
      return s;
    };
    const [b, y, m] = a || !g ? createTrinsicObserver(l, onTrinsicChanged) : [ noop, noop, noop ];
    const [S, $] = !f ? createSizeObserver(l, onSizeChanged, {
      Lt: true,
      It: true
    }) : [ noop, noop ];
    const [x, C] = createDOMObserver(l, false, onHostMutation, {
      Pt: Vt,
      Mt: Vt.concat(kt)
    });
    const O = f && d && new d(onSizeChanged.bind(0, {
      ht: true
    }));
    O && O.observe(l);
    updateViewportAttrsFromHost();
    return [ () => {
      b();
      S();
      c && c[0]();
      O && O.disconnect();
      x();
    }, () => {
      $();
      y();
    }, () => {
      const t = {};
      const n = C();
      const o = m();
      const s = c && c[1]();
      if (n) {
        assignDeep(t, onHostMutation.apply(0, push(n, true)));
      }
      if (o) {
        assignDeep(t, onTrinsicChanged.apply(0, push(o, true)));
      }
      if (s) {
        assignDeep(t, onContentMutation.apply(0, push(s, true)));
      }
      return t;
    }, t => {
      const [n] = t("update.ignoreMutation");
      const [o, r] = t("update.attributes");
      const [l, u] = t("update.elementEvents");
      const [d, _] = t("update.debounce");
      const h = u || r;
      const ignoreMutationFromOptions = t => isFunction(n) && n(t);
      if (h) {
        if (c) {
          c[1]();
          c[0]();
        }
        c = createDOMObserver(a || i, true, onContentMutation, {
          Pt: w.concat(o || []),
          Mt: w.concat(o || []),
          Dt: l,
          Rt: Dt,
          Bt: (t, n) => {
            const {target: o, attributeName: s} = t;
            const e = !n && s && !f ? liesBetween(o, Dt, Rt) : false;
            return e || !!closest(o, `.${G}`) || !!ignoreMutationFromOptions(t);
          }
        });
      }
      if (_) {
        p.m();
        if (isArray(d)) {
          const t = d[0];
          const n = d[1];
          s = isNumber(t) && t;
          e = isNumber(n) && n;
        } else if (isNumber(d)) {
          s = d;
          e = false;
        } else {
          s = false;
          e = false;
        }
      }
    } ];
  };
  const jt = {
    x: 0,
    y: 0
  };
  const Yt = {
    Z: {
      t: 0,
      r: 0,
      b: 0,
      l: 0
    },
    bt: false,
    M: {
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0
    },
    Ct: jt,
    Ot: jt,
    $t: {
      x: "hidden",
      y: "hidden"
    },
    Et: {
      x: false,
      y: false
    },
    ft: false,
    vt: false
  };
  const createStructureSetup = (t, n) => {
    const o = createOptionCheck(n, {});
    const s = createState(Yt);
    const [e, c, r] = createEventListenerHub();
    const [l] = s;
    const [i, a, u] = createStructureSetupElements(t);
    const d = createStructureSetupUpdate(i, s);
    const triggerUpdateEvent = (t, n, o) => {
      const s = keys(t).some((n => t[n]));
      if (s || !isEmptyObject(n) || o) {
        r("u", [ t, n, o ]);
      }
    };
    const [f, _, h, g] = createStructureSetupObservers(i, s, (t => {
      triggerUpdateEvent(d(o, t), {}, false);
    }));
    const v = l.bind(0);
    v.Vt = t => {
      e("u", t);
    };
    v.jt = () => {
      const {W: t, K: n} = i;
      const o = scrollLeft(t);
      const s = scrollTop(t);
      _();
      a();
      scrollLeft(n, o);
      scrollTop(n, s);
    };
    v.Yt = i;
    return [ (t, o) => {
      const s = createOptionCheck(n, t, o);
      g(s);
      triggerUpdateEvent(d(s, h(), o), t, !!o);
    }, v, () => {
      c();
      f();
      u();
    } ];
  };
  const {round: qt} = Math;
  const getClientOffset = t => ({
    x: t.clientX,
    y: t.clientY
  });
  const getScale = t => {
    const {width: n, height: o} = getBoundingClientRect(t);
    const {w: s, h: e} = offsetSize(t);
    return {
      x: qt(n) / s || 1,
      y: qt(o) / e || 1
    };
  };
  const continuePointerDown = (t, n, o) => {
    const s = n.scrollbars;
    const {button: e, isPrimary: c, pointerType: r} = t;
    const {pointers: l} = s;
    return 0 === e && c && s[o] && (l || []).includes(r);
  };
  const createRootClickStopPropagationEvents = (t, n) => on(t, "mousedown", on.bind(0, n, "click", stopPropagation, {
    C: true,
    $: true
  }), {
    $: true
  });
  const createDragScrollingEvents = (t, n, o, s, e, c) => {
    const {B: r} = getEnvironment();
    const {qt: l, Ft: i, Gt: a} = o;
    const u = `scroll${c ? "Left" : "Top"}`;
    const d = `${c ? "x" : "y"}`;
    const f = `${c ? "w" : "h"}`;
    const createOnPointerMoveHandler = (t, n, o) => _ => {
      const {Ot: h} = e();
      const g = (getClientOffset(_)[d] - n) * o;
      const v = offsetSize(i)[f] - offsetSize(l)[f];
      const w = g / v;
      const p = w * h[d];
      const b = directionIsRTL(a);
      const y = b && c ? r.n || r.i ? 1 : -1 : 1;
      s[u] = t + p * y;
    };
    return on(l, "pointerdown", (o => {
      if (continuePointerDown(o, t, "dragScroll")) {
        const t = on(n, "selectstart", (t => preventDefault(t)), {
          S: false
        });
        const e = on(l, "pointermove", createOnPointerMoveHandler(s[u] || 0, getClientOffset(o)[d], 1 / getScale(s)[d]));
        on(l, "pointerup", (n => {
          t();
          e();
          l.releasePointerCapture(n.pointerId);
        }), {
          C: true
        });
        l.setPointerCapture(o.pointerId);
      }
    }));
  };
  const createScrollbarsSetupEvents = (t, n) => (o, s, e, c, r, l) => {
    const {Gt: i} = o;
    const [a, u] = selfCancelTimeout(333);
    const d = !!r.scrollBy;
    let f = true;
    return runEachAndClear.bind(0, [ on(i, "pointerenter", (() => {
      s(tt, true);
    })), on(i, "pointerleave pointercancel", (() => {
      s(tt);
    })), on(i, "wheel", (t => {
      const {deltaX: n, deltaY: o, deltaMode: e} = t;
      if (d && f && 0 === e && parent(i) === c) {
        r.scrollBy({
          left: n,
          top: o,
          behavior: "smooth"
        });
      }
      f = false;
      s(st, true);
      a((() => {
        f = true;
        s(st);
      }));
      preventDefault(t);
    }), {
      S: false,
      $: true
    }), createRootClickStopPropagationEvents(i, e), createDragScrollingEvents(t, e, o, r, n, l), u ]);
  };
  const {min: Ft, max: Gt, abs: Nt, round: Xt} = Math;
  const getScrollbarHandleLengthRatio = (t, n, o, s) => {
    if (s) {
      const t = o ? "x" : "y";
      const {Ot: n, Ct: e} = s;
      const c = e[t];
      const r = n[t];
      return Gt(0, Ft(1, c / (c + r)));
    }
    const e = o ? "w" : "h";
    const c = offsetSize(t)[e];
    const r = offsetSize(n)[e];
    return Gt(0, Ft(1, c / r));
  };
  const getScrollbarHandleOffsetRatio = (t, n, o, s, e, c) => {
    const {B: r} = getEnvironment();
    const l = c ? "x" : "y";
    const i = c ? "Left" : "Top";
    const {Ot: a} = s;
    const u = Xt(a[l]);
    const d = Nt(o[`scroll${i}`]);
    const f = c && e;
    const _ = r.i ? d : u - d;
    const h = f ? _ : d;
    const g = Ft(1, h / u);
    const v = getScrollbarHandleLengthRatio(t, n, c);
    return 1 / v * (1 - v) * g;
  };
  const createScrollbarsSetupElements = (t, n, o) => {
    const {Y: s} = getEnvironment();
    const {scrollbars: e} = s();
    const {slot: c} = e;
    const {ct: r, W: l, J: i, K: a, lt: u, ot: d} = n;
    const {scrollbars: f} = u ? {} : t;
    const {slot: _} = f || {};
    const g = dynamicInitializationElement([ l, i, a ], (() => i), c, _);
    const scrollbarStructureAddRemoveClass = (t, n, o) => {
      const s = o ? addClass : removeClass;
      each(t, (t => {
        s(t.Gt, n);
      }));
    };
    const scrollbarsHandleStyle = (t, n) => {
      each(t, (t => {
        const [o, s] = n(t);
        style(o, s);
      }));
    };
    const scrollbarStructureRefreshHandleLength = (t, n, o) => {
      scrollbarsHandleStyle(t, (t => {
        const {qt: s, Ft: e} = t;
        return [ s, {
          [o ? "width" : "height"]: `${(100 * getScrollbarHandleLengthRatio(s, e, o, n)).toFixed(3)}%`
        } ];
      }));
    };
    const scrollbarStructureRefreshHandleOffset = (t, n, o) => {
      const s = o ? "X" : "Y";
      scrollbarsHandleStyle(t, (t => {
        const {qt: e, Ft: c, Gt: r} = t;
        const l = getScrollbarHandleOffsetRatio(e, c, d, n, directionIsRTL(r), o);
        const i = l === l;
        return [ e, {
          transform: i ? `translate${s}(${(100 * l).toFixed(3)}%)` : ""
        } ];
      }));
    };
    const v = [];
    const w = [];
    const p = [];
    const scrollbarsAddRemoveClass = (t, n, o) => {
      const s = isBoolean(o);
      const e = s ? o : true;
      const c = s ? !o : true;
      e && scrollbarStructureAddRemoveClass(w, t, n);
      c && scrollbarStructureAddRemoveClass(p, t, n);
    };
    const refreshScrollbarsHandleLength = t => {
      scrollbarStructureRefreshHandleLength(w, t, true);
      scrollbarStructureRefreshHandleLength(p, t);
    };
    const refreshScrollbarsHandleOffset = t => {
      scrollbarStructureRefreshHandleOffset(w, t, true);
      scrollbarStructureRefreshHandleOffset(p, t);
    };
    const generateScrollbarDOM = t => {
      const n = t ? X : U;
      const s = t ? w : p;
      const e = isEmptyArray(s) ? Q : "";
      const c = createDiv(`${G} ${n} ${e}`);
      const l = createDiv(W);
      const a = createDiv(J);
      const u = {
        Gt: c,
        Ft: l,
        qt: a
      };
      appendChildren(c, l);
      appendChildren(l, a);
      push(s, u);
      push(v, [ removeElements.bind(0, c), o(u, scrollbarsAddRemoveClass, r, i, d, t) ]);
      return u;
    };
    const b = generateScrollbarDOM.bind(0, true);
    const y = generateScrollbarDOM.bind(0, false);
    const appendElements = () => {
      appendChildren(g, w[0].Gt);
      appendChildren(g, p[0].Gt);
      h((() => {
        scrollbarsAddRemoveClass(Q);
      }), 300);
    };
    b();
    y();
    return [ {
      Nt: refreshScrollbarsHandleLength,
      Xt: refreshScrollbarsHandleOffset,
      Ut: scrollbarsAddRemoveClass,
      Wt: {
        Jt: w,
        Kt: b,
        Zt: scrollbarsHandleStyle.bind(0, w)
      },
      Qt: {
        Jt: p,
        Kt: y,
        Zt: scrollbarsHandleStyle.bind(0, p)
      }
    }, appendElements, runEachAndClear.bind(0, v) ];
  };
  const createScrollbarsSetup = (t, n, o) => {
    let s;
    let e;
    let c;
    let r;
    let l;
    let i = 0;
    const a = createState({});
    const [u] = a;
    const [d, f] = selfCancelTimeout();
    const [_, h] = selfCancelTimeout();
    const [g, v] = selfCancelTimeout(100);
    const [w, p] = selfCancelTimeout(100);
    const [b, y] = selfCancelTimeout((() => i));
    const [m, S, $] = createScrollbarsSetupElements(t, o.Yt, createScrollbarsSetupEvents(n, o));
    const {J: x, K: C, ot: O, st: E, it: A, U: T} = o.Yt;
    const {Wt: z, Qt: I, Ut: L, Nt: H, Xt: M} = m;
    const {Zt: P} = z;
    const {Zt: D} = I;
    const styleScrollbarPosition = t => {
      const {Gt: n} = t;
      const o = A && !T && parent(n) === C && n;
      return [ o, {
        transform: o ? `translate(${scrollLeft(O)}px, ${scrollTop(O)}px)` : ""
      } ];
    };
    const manageScrollbarsAutoHide = (t, n) => {
      y();
      if (t) {
        L(ot);
      } else {
        const hide = () => L(ot, true);
        if (i > 0 && !n) {
          b(hide);
        } else {
          hide();
        }
      }
    };
    const onHostMouseEnter = () => {
      r = e;
      r && manageScrollbarsAutoHide(true);
    };
    const R = [ v, y, p, h, f, $, on(x, "pointerover", onHostMouseEnter, {
      C: true
    }), on(x, "pointerenter", onHostMouseEnter), on(x, "pointerleave", (() => {
      r = false;
      e && manageScrollbarsAutoHide(false);
    })), on(x, "pointermove", (() => {
      s && d((() => {
        v();
        manageScrollbarsAutoHide(true);
        w((() => {
          s && manageScrollbarsAutoHide(false);
        }));
      }));
    })), on(E, "scroll", (() => {
      _((() => {
        M(o());
        c && manageScrollbarsAutoHide(true);
        g((() => {
          c && !r && manageScrollbarsAutoHide(false);
        }));
      }));
      A && P(styleScrollbarPosition);
      A && D(styleScrollbarPosition);
    })) ];
    const k = u.bind(0);
    k.Yt = m;
    k.jt = S;
    return [ (t, r, a) => {
      const {Tt: u, zt: d, At: f, wt: _} = a;
      const h = createOptionCheck(n, t, r);
      const g = o();
      const {Ot: v, $t: w, vt: p} = g;
      const [b, y] = h("scrollbars.theme");
      const [m, S] = h("scrollbars.visibility");
      const [$, x] = h("scrollbars.autoHide");
      const [C] = h("scrollbars.autoHideDelay");
      const [O, E] = h("scrollbars.dragScroll");
      const [A, z] = h("scrollbars.clickScroll");
      const I = u || d || _ || r;
      const P = f || S || r;
      const setScrollbarVisibility = (t, n) => {
        const o = "visible" === m || "auto" === m && "scroll" === t;
        L(K, o, n);
        return o;
      };
      i = C;
      if (y) {
        L(l);
        L(b, true);
        l = b;
      }
      if (x) {
        s = "move" === $;
        e = "leave" === $;
        c = "never" !== $;
        manageScrollbarsAutoHide(!c, true);
      }
      if (E) {
        L(ct, O);
      }
      if (z) {
        L(et, A);
      }
      if (P) {
        const t = setScrollbarVisibility(w.x, true);
        const n = setScrollbarVisibility(w.y, false);
        const o = t && n;
        L(Z, !o);
      }
      if (I) {
        H(g);
        M(g);
        L(nt, !v.x, true);
        L(nt, !v.y, false);
        L(N, p && !T);
      }
    }, k, runEachAndClear.bind(0, R) ];
  };
  const OverlayScrollbars = (t, n, o) => {
    const {F: s, j: e} = getEnvironment();
    const c = getPlugins();
    const r = isHTMLElement(t);
    const l = r ? t : t.target;
    const i = getInstance(l);
    if (n && !i) {
      let i = false;
      const a = c[ht];
      const validateOptions = t => {
        const n = t || {};
        const o = a && a.O;
        return o ? o(n, true) : n;
      };
      const u = assignDeep({}, s(), validateOptions(n));
      const [d, f, _] = createEventListenerHub(o);
      const [h, g, v] = createStructureSetup(t, u);
      const [w, p, b] = createScrollbarsSetup(t, u, g);
      const update = (t, n) => {
        h(t, !!n);
      };
      const y = e(update.bind(0, {}, true));
      const destroy = t => {
        removeInstance(l);
        y();
        b();
        v();
        i = true;
        _("destroyed", [ m, !!t ]);
        f();
      };
      const m = {
        options(t) {
          if (t) {
            const n = getOptionsDiff(u, validateOptions(t));
            if (!isEmptyObject(n)) {
              assignDeep(u, n);
              update(n);
            }
          }
          return assignDeep({}, u);
        },
        on: d,
        off: (t, n) => {
          t && n && f(t, n);
        },
        state() {
          const {Ct: t, Ot: n, $t: o, Et: s, Z: e, bt: c, vt: r} = g();
          return assignDeep({}, {
            overflowEdge: t,
            overflowAmount: n,
            overflowStyle: o,
            hasOverflow: s,
            padding: e,
            paddingAbsolute: c,
            directionRTL: r,
            destroyed: i
          });
        },
        elements() {
          const {W: t, J: n, Z: o, K: s, tt: e, ot: c, st: r} = g.Yt;
          const {Wt: l, Qt: i} = p.Yt;
          const translateScrollbarStructure = t => {
            const {qt: n, Ft: o, Gt: s} = t;
            return {
              scrollbar: s,
              track: o,
              handle: n
            };
          };
          const translateScrollbarsSetupElement = t => {
            const {Jt: n, Kt: o} = t;
            const s = translateScrollbarStructure(n[0]);
            return assignDeep({}, s, {
              clone: () => {
                const t = translateScrollbarStructure(o());
                w({}, true, {});
                return t;
              }
            });
          };
          return assignDeep({}, {
            target: t,
            host: n,
            padding: o || s,
            viewport: s,
            content: e || s,
            scrollOffsetElement: c,
            scrollEventElement: r,
            scrollbarHorizontal: translateScrollbarsSetupElement(l),
            scrollbarVertical: translateScrollbarsSetupElement(i)
          });
        },
        update(t) {
          update({}, t);
          return m;
        },
        destroy: destroy.bind(0)
      };
      g.Vt(((t, n, o) => {
        w(n, o, t);
      }));
      each(keys(c), (t => {
        const n = c[t];
        if (isFunction(n)) {
          n(OverlayScrollbars, m);
        }
      }));
      if (cancelInitialization(!r && t.cancel, g.Yt)) {
        destroy(true);
        return m;
      }
      g.jt();
      p.jt();
      addInstance(l, m);
      _("initialized", [ m ]);
      g.Vt(((t, n, o) => {
        const {ht: s, wt: e, _t: c, Tt: r, zt: l, At: i, gt: a, xt: u} = t;
        _("updated", [ m, {
          updateHints: {
            sizeChanged: s,
            directionChanged: e,
            heightIntrinsicChanged: c,
            overflowEdgeChanged: r,
            overflowAmountChanged: l,
            overflowStyleChanged: i,
            contentMutation: a,
            hostMutation: u
          },
          changedOptions: n,
          force: o
        } ]);
      }));
      return m.update(true);
    }
    return i;
  };
  OverlayScrollbars.plugin = addPlugin;
  OverlayScrollbars.valid = t => {
    const n = t && t.elements;
    const o = isFunction(n) && n();
    return isPlainObject(o) && !!getInstance(o.target);
  };
  OverlayScrollbars.env = () => {
    const {k: t, I: n, T: o, B: s, V: e, L: c, N: r, X: l, Y: i, q: a, F: u, G: d} = getEnvironment();
    return assignDeep({}, {
      scrollbarsSize: t,
      scrollbarsOverlaid: n,
      scrollbarsHiding: o,
      rtlScrollBehavior: s,
      flexboxGlue: e,
      cssCustomProperties: c,
      staticDefaultInitialization: r,
      staticDefaultOptions: l,
      getDefaultInitialization: i,
      setDefaultInitialization: a,
      getDefaultOptions: u,
      setDefaultOptions: d
    });
  };
  t.OverlayScrollbars = OverlayScrollbars;
  t.scrollbarsHidingPlugin = $t;
  t.sizeObserverPlugin = pt;
  Object.defineProperties(t, {
    tn: {
      value: true
    },
    [Symbol.toStringTag]: {
      value: "Module"
    }
  });
  return t;
}({});
//# sourceMappingURL=overlayscrollbars.browser.es6.js.map
