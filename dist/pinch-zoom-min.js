var PinchZoom = (function() {
    'use strict';
    let t, e;
    class i {
        constructor(t) {
            (this.id = -1),
                (this.nativePointer = t),
                (this.pageX = t.pageX),
                (this.pageY = t.pageY),
                (this.clientX = t.clientX),
                (this.clientY = t.clientY),
                self.Touch && t instanceof Touch ? (this.id = t.identifier) : n(t) && (this.id = t.pointerId);
        }
        getCoalesced() {
            return 'getCoalescedEvents' in this.nativePointer
                ? this.nativePointer.getCoalescedEvents().map(t => new i(t))
                : [this];
        }
    }
    const n = t => self.PointerEvent && t instanceof PointerEvent,
        s = () => {};
    class r {
        constructor(t, e) {
            (this._element = t), (this.startPointers = []), (this.currentPointers = []);
            const { start: i = () => !0, move: n = s, end: r = s } = e;
            (this._startCallback = i),
                (this._moveCallback = n),
                (this._endCallback = r),
                this.xPos,
                this.yPos,
                this.verticalDir,
                this.horizontalDir,
                (this._pointerStart = this._pointerStart.bind(this)),
                (this._touchStart = this._touchStart.bind(this)),
                (this._move = this._move.bind(this)),
                (this._triggerPointerEnd = this._triggerPointerEnd.bind(this)),
                (this._pointerEnd = this._pointerEnd.bind(this)),
                (this._touchEnd = this._touchEnd.bind(this)),
                self.PointerEvent
                    ? this._element.addEventListener('pointerdown', this._pointerStart)
                    : (this._element.addEventListener('mousedown', this._pointerStart),
                      this._element.addEventListener('touchstart', this._touchStart),
                      this._element.addEventListener('touchmove', this._move),
                      this._element.addEventListener('touchend', this._touchEnd));
        }
        _triggerPointerStart(t, e) {
            return !!this._startCallback(t, e) && (this.currentPointers.push(t), this.startPointers.push(t), !0);
        }
        _pointerStart(t) {
            0 === t.button &&
                this._triggerPointerStart(new i(t), t) &&
                (n(t)
                    ? (this._element.setPointerCapture(t.pointerId),
                      this._element.addEventListener('pointermove', this._move),
                      this._element.addEventListener('pointerup', this._pointerEnd))
                    : (window.addEventListener('mousemove', this._move),
                      window.addEventListener('mouseup', this._pointerEnd)));
        }
        _touchStart(t) {
            for (const e of Array.from(t.changedTouches)) this._triggerPointerStart(new i(e), t);
        }
        _move(n) {
            const s = n.pageX,
                r = n.pageY;
            if (s <= 0 || r <= 0) return;
            if (s === this.xPos || r === this.yPos) return;
            this.xPos > s ? (e = 'right') : this.xPos < s && (e = 'left'),
                this.yPos > r ? (t = 'up') : this.yPos < r && (t = 'down'),
                (this.xPos = s),
                (this.yPos = r);
            const o = this.currentPointers.slice(),
                h = 'changedTouches' in n ? Array.from(n.changedTouches).map(t => new i(t)) : [new i(n)],
                a = [];
            for (const t of h) {
                const e = this.currentPointers.findIndex(e => e.id === t.id);
                -1 !== e && (a.push(t), (this.currentPointers[e] = t));
            }
            0 !== a.length && this._moveCallback(o, a, n);
        }
        _triggerPointerEnd(t, e) {
            const i = this.currentPointers.findIndex(e => e.id === t.id);
            return (
                -1 !== i &&
                (this.currentPointers.splice(i, 1), this.startPointers.splice(i, 1), this._endCallback(t, e), !0)
            );
        }
        _pointerEnd(t) {
            if (this._triggerPointerEnd(new i(t), t))
                if (n(t)) {
                    if (this.currentPointers.length) return;
                    this._element.removeEventListener('pointermove', this._move),
                        this._element.removeEventListener('pointerup', this._pointerEnd);
                } else
                    window.removeEventListener('mousemove', this._move),
                        window.removeEventListener('mouseup', this._pointerEnd);
        }
        _touchEnd(t) {
            for (const e of Array.from(t.changedTouches)) this._triggerPointerEnd(new i(e), t);
        }
    }
    !(function(t, e) {
        void 0 === e && (e = {});
        var i = e.insertAt;
        if (t && 'undefined' != typeof document) {
            var n = document.head || document.getElementsByTagName('head')[0],
                s = document.createElement('style');
            (s.type = 'text/css'),
                'top' === i && n.firstChild ? n.insertBefore(s, n.firstChild) : n.appendChild(s),
                s.styleSheet ? (s.styleSheet.cssText = t) : s.appendChild(document.createTextNode(t));
        }
    })(
        'pinch-zoom {\n  display: block;\n  overflow: hidden;\n  touch-action: none;\n  --scale: 1;\n  --x: 0;\n  --y: 0;\n}\n\npinch-zoom > * {\n  transform: translate(var(--x), var(--y)) scale(var(--scale));\n  transform-origin: 0 0;\n  will-change: transform;\n}\n'
    );
    const o = 'min-scale',
        h = 'max-scale';
    function a(t, e) {
        return e ? Math.sqrt((e.clientX - t.clientX) ** 2 + (e.clientY - t.clientY) ** 2) : 0;
    }
    function l(t, e) {
        return e ? { clientX: (t.clientX + e.clientX) / 2, clientY: (t.clientY + e.clientY) / 2 } : t;
    }
    function c(t, e) {
        return 'number' == typeof t ? t : t.trimRight().endsWith('%') ? (e * parseFloat(t)) / 100 : parseFloat(t);
    }
    let d;
    function u() {
        return d || (d = document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    }
    function f() {
        return u().createSVGMatrix();
    }
    function g() {
        return u().createSVGPoint();
    }
    const m = 0.01,
        p = 0.01;
    class _ extends HTMLElement {
        constructor() {
            super(),
                (this._transform = f()),
                new MutationObserver(() => this._stageElChange()).observe(this, { childList: !0 });
            const t = new r(this, {
                start: (e, i) => !(2 === t.currentPointers.length || !this._positioningEl) && (i.preventDefault(), !0),
                move: e => {
                    this._onPointerMove(e, t.currentPointers);
                }
            });
            this.addEventListener('wheel', t => this._onWheel(t));
        }
        static get observedAttributes() {
            return [o, h];
        }
        attributeChangedCallback(t, e, i) {
            t === o && this.scale < this.minScale && this.setTransform({ scale: this.minScale }),
                t === h && this.scale > this.maxScale && this.setTransform({ scale: this.maxScale });
        }
        get minScale() {
            const t = this.getAttribute(o);
            if (!t) return m;
            const e = parseFloat(t);
            return Number.isFinite(e) ? Math.max(m, e) : m;
        }
        set minScale(t) {
            this.setAttribute(o, String(t));
        }
        get maxScale() {
            const t = this.getAttribute(h);
            if (!t) return p;
            const e = parseFloat(t);
            return Number.isFinite(e) ? Math.max(p, e) : p;
        }
        set maxScale(t) {
            this.setAttribute(h, String(t));
        }
        connectedCallback() {
            this._stageElChange();
        }
        get x() {
            return this._transform.e;
        }
        get y() {
            return this._transform.f;
        }
        get scale() {
            return this._transform.a;
        }
        scaleTo(t, e = {}) {
            let { originX: i = 0, originY: n = 0 } = e;
            const { relativeTo: s = 'content', allowChangeEvent: r = !1 } = e,
                o = 'content' === s ? this._positioningEl : this;
            if (!o || !this._positioningEl) return void this.setTransform({ scale: t, allowChangeEvent: r });
            const h = o.getBoundingClientRect();
            if (((i = c(i, h.width)), (n = c(n, h.height)), 'content' === s)) (i += this.x), (n += this.y);
            else {
                const t = this._positioningEl.getBoundingClientRect();
                (i -= t.left), (n -= t.top);
            }
            this._applyChange({ allowChangeEvent: r, originX: i, originY: n, scaleDiff: t / this.scale });
        }
        setTransform(t = {}) {
            const { scale: e = this.scale, allowChangeEvent: i = !1 } = t;
            let { x: n = this.x, y: s = this.y } = t;
            if (!this._positioningEl) return void this._updateTransform(e, n, s, i);
            const r = this.getBoundingClientRect(),
                o = this._positioningEl.getBoundingClientRect();
            if (!r.width || !r.height) return void this._updateTransform(e, n, s, i);
            let h = g();
            (h.x = o.left - r.left), (h.y = o.top - r.top);
            let a = g();
            (a.x = o.width + h.x), (a.y = o.height + h.y);
            const l = f()
                .translate(n, s)
                .scale(e)
                .multiply(this._transform.inverse());
            (h = h.matrixTransform(l)),
                (a = a.matrixTransform(l)),
                h.x > r.width ? (n += r.width - h.x) : a.x < 0 && (n += -a.x),
                h.y > r.height ? (s += r.height - h.y) : a.y < 0 && (s += -a.y),
                this._updateTransform(e, n, s, i);
        }
        _updateTransform(t, e, i, n) {
            if (t < this.minScale || t > this.maxScale) return;
            if (t === this.scale && e === this.x && i === this.y) return;
            const s = this.offsetWidth,
                r = this.children[0].offsetWidth * t.toFixed(2),
                o = this.offsetHeight,
                h = this.children[0].offsetHeight * t.toFixed(2),
                a = this.children[0].offsetWidth / 4;
            if (
                ((this._transform.e = e),
                (this._transform.f = i),
                this._transform.e < s - r + a && (this._transform.e = s - r + a),
                this._transform.f < o - h && (this._transform.f = o - h),
                this._transform.f > 0 && (this._transform.f = 0),
                this._transform.e > a && (this._transform.e = a),
                (this._transform.d = this._transform.a = t),
                this.style.setProperty('--x', this.x + 'px'),
                this.style.setProperty('--y', this.y + 'px'),
                this.style.setProperty('--scale', t.toFixed(2) + ''),
                n)
            ) {
                const t = new Event('change', { bubbles: !0 });
                this.dispatchEvent(t);
            }
        }
        _stageElChange() {
            (this._positioningEl = void 0),
                0 !== this.children.length &&
                    ((this._positioningEl = this.children[0]),
                    this.children.length > 1 && console.warn('<pinch-zoom> must not have more than one child.'),
                    this.setTransform({ allowChangeEvent: !0 }));
        }
        _onWheel(t) {
            if (!this._positioningEl) return;
            t.preventDefault();
            const e = this._positioningEl.getBoundingClientRect();
            let { deltaY: i } = t;
            const { ctrlKey: n, deltaMode: s } = t;
            1 === s && (i *= 15);
            const r = 1 - i / (n ? 100 : 300);
            this._applyChange({
                scaleDiff: r,
                originX: t.clientX - e.left,
                originY: t.clientY - e.top,
                allowChangeEvent: !0
            });
        }
        _onPointerMove(t, e) {
            if (!this._positioningEl) return;
            const i = this._positioningEl.getBoundingClientRect(),
                n = l(t[0], t[1]),
                s = l(e[0], e[1]),
                r = n.clientX - i.left,
                o = n.clientY - i.top,
                h = a(t[0], t[1]),
                c = a(e[0], e[1]),
                d = h ? c / h : 1;
            this._applyChange({
                originX: r,
                originY: o,
                scaleDiff: d,
                panX: s.clientX - n.clientX,
                panY: s.clientY - n.clientY,
                allowChangeEvent: !0
            });
        }
        _applyChange(t = {}) {
            const {
                    panX: e = 0,
                    panY: i = 0,
                    originX: n = 0,
                    originY: s = 0,
                    scaleDiff: r = 1,
                    allowChangeEvent: o = !1
                } = t,
                h = f()
                    .translate(e, i)
                    .translate(n, s)
                    .translate(this.x, this.y)
                    .scale(r)
                    .translate(-n, -s)
                    .scale(this.scale);
            this.setTransform({ allowChangeEvent: o, scale: h.a, x: h.e, y: h.f });
        }
    }
    return customElements.define('pinch-zoom', _), _;
})();
