/* Theme Transition - 8-bit View Transition toggle
 *
 * Vanilla port of the React AnimatedThemeToggler with two reveal modes:
 *
 * 1. "dissolve" (default): chaotic random pixel takeover that radiates from
 *    the toggle button. Pixel blocks near the button appear first, then the
 *    frontier spreads outward in ragged, noisy order (distance-weighted
 *    random order with jitter, occasional dropouts, chunky 2x2 clusters),
 *    while a dithered pixel-grid overlay flickers.
 *
 * 2. "expand": the original geometric clip-path reveal (circle/square/...)
 *    expanded from the toggle button, also stepped in pixel blocks.
 *
 * Usage:
 *   window.ThemeTransition.run(applyThemeCallback, {
 *     button: document.getElementById('toggle-theme'),
 *     duration: 500,
 *     mode: 'dissolve' | 'expand',
 *     variant: 'square' | 'circle' | 'diamond' | 'hexagon' | 'triangle' | 'rectangle' | 'star',
 *     blockSize: 12,
 *     chaos: 0.4  // 0 = clean expanding ring, 1 = fully random order
 *   });
 *
 * Falls back to calling the callback directly when the View Transitions API
 * is unavailable or the user prefers reduced motion. Rapid toggling while a
 * transition is running is queued: the latest request replays immediately
 * after the current transition finishes, so no click is ever lost.
 */
(function () {
    'use strict';

    var BLOCK_SIZE = 12;   // px per 8-bit block
    var MIN_STEPS = 6;
    var MAX_STEPS = 60;

    var isTransitioning = false;
    var activeAnim = null;
    var overlayEl = null;
    var pendingRun = null; // latest [applyTheme, options] requested while busy

    /* Pixel-grid overlay: toggled synchronously inside the
     * startViewTransition callback so it is baked into the NEW snapshot and
     * shows inside the revealed region. Removed after the transition
     * finishes (its opacity animation has already reached 0, so no pop). */
    function getOverlay() {
        if (overlayEl && overlayEl.isConnected) return overlayEl;
        overlayEl = document.getElementById('theme-vt-overlay');
        if (!overlayEl) {
            overlayEl = document.createElement('div');
            overlayEl.id = 'theme-vt-overlay';
            overlayEl.setAttribute('aria-hidden', 'true');
            (document.body || document.documentElement).appendChild(overlayEl);
        }
        return overlayEl;
    }

    /* ------------------------------------------------------------------ */
    /* Pixel crawl dissolve (stochastic flood fill)                        */
    /* ------------------------------------------------------------------ */

    /* Builds a list of mask images (PNG data URLs) for stepped keyframes.
     *
     * Algorithm: randomized frontier expansion (the "infection"/ink-spread
     * crawl used by classic pixel-dissolve transitions). A single block
     * seeded at the origin (the toggle button) claims random cells from the
     * live frontier — the set of unclaimed cells adjacent to claimed ones —
     * so the takeover grows as one contiguous pixelated stain radiating from
     * the button. Because cells are only ever claimed through the frontier,
     * coverage reaches exactly 100% in crawl order: no leftover blocks can
     * pop at the last frame.
     *
     * `chaos` biases frontier selection: 0 = tournament favors the closest
     * cells (clean rounded crawl), 1 = purely random picks (ragged tendrils).
     * Occasional 2x2 clusters keep the edge chunky. Coverage follows an
     * ease-in-out curve so the crawl starts gently and settles smoothly. */
    function buildDissolveMaskFrames(w, h, blockSize, steps, originX, originY, chaos) {
        var SCALE = 2; // canvas px per sub-pixel (upscaled mask edges stay soft)
        var cols = Math.max(2, Math.ceil(w / blockSize));
        var rows = Math.max(2, Math.ceil(h / blockSize));
        var total = cols * rows;
        var chaosFactor = typeof chaos === 'number' ? Math.min(1, Math.max(0, chaos)) : 0.4;
        // Tournament size for frontier picks: more candidates = straighter,
        // more radial crawl; chaos raises randomness by shrinking it.
        var pickBias = Math.max(0, Math.round((1 - chaosFactor) * 3));

        // Smooth pacing: coverage fraction per frame follows ease-in-out.
        function easeInOut(t) {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }

        var cw = cols * SCALE;
        var ch = rows * SCALE;
        var canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';

        // 0 = unclaimed, 1 = on the frontier, 2 = claimed (visible block)
        var state = new Uint8Array(total);
        var frontier = [];
        var claimedCount = 0;

        function pushNeighbors(cell) {
            var cx = cell % cols;
            var cy = (cell / cols) | 0;
            if (cx > 0 && state[cell - 1] === 0) { state[cell - 1] = 1; frontier.push(cell - 1); }
            if (cx + 1 < cols && state[cell + 1] === 0) { state[cell + 1] = 1; frontier.push(cell + 1); }
            if (cy > 0 && state[cell - cols] === 0) { state[cell - cols] = 1; frontier.push(cell - cols); }
            if (cy + 1 < rows && state[cell + cols] === 0) { state[cell + cols] = 1; frontier.push(cell + cols); }
        }

        function claim(cell) {
            if (state[cell] === 2) return false;
            state[cell] = 2;
            var cx = cell % cols;
            var cy = (cell / cols) | 0;
            ctx.fillRect(cx * SCALE, cy * SCALE, SCALE, SCALE);
            claimedCount++;
            pushNeighbors(cell);
            return true;
        }

        // Pick a frontier cell: tournament selection between random frontier
        // members, scored by distance to the origin with noise for raggedness.
        var maxDist = Math.hypot(w, h) * 0.5;
        var dists = new Float32Array(total);
        for (var d = 0; d < total; d++) {
            var px = ((d % cols) + 0.5) * blockSize;
            var py = (((d / cols) | 0) + 0.5) * blockSize;
            dists[d] = Math.hypot(px - originX, py - originY) / maxDist;
        }
        function pickFrontier() {
            var n = 1 + pickBias;
            var bestIdx = -1;
            var bestScore = Infinity;
            for (var i = 0; i < n; i++) {
                var fi = (Math.random() * frontier.length) | 0;
                var score = dists[frontier[fi]] + Math.random() * 0.3;
                if (score < bestScore) {
                    bestScore = score;
                    bestIdx = fi;
                }
            }
            return bestIdx;
        }

        function claimNext() {
            if (!frontier.length) return false;
            var fi = pickFrontier();
            var cell = frontier[fi];
            // Swap-remove keeps the frontier array compact.
            frontier[fi] = frontier[frontier.length - 1];
            frontier.pop();
            var claimed = claim(cell);
            // Chunky 2x2 clusters for texture variety (free claims).
            if (claimed && Math.random() < 0.1) {
                var cx = cell % cols;
                var cy = (cell / cols) | 0;
                if (cx + 1 < cols) claim(cell + 1);
                if (cy + 1 < rows) claim(cell + cols);
                if (cx + 1 < cols && cy + 1 < rows) claim(cell + cols + 1);
            }
            return true;
        }

        // Seed: the block under the toggle button, so the crawl visibly
        // starts at the button itself.
        var oc = Math.min(cols - 1, Math.max(0, Math.floor(originX / blockSize)));
        var or = Math.min(rows - 1, Math.max(0, Math.floor(originY / blockSize)));
        claim(or * cols + oc);

        var frames = [];
        for (var s = 0; s < steps; s++) {
            var end = Math.min(total, Math.round(easeInOut((s + 1) / steps) * total));
            var budget = end - claimedCount;
            for (var c = 0; c < budget; c++) {
                if (!claimNext()) break;
            }
            frames.push(canvas.toDataURL('image/png'));
        }

        // Safety: guarantee full coverage on the last frame. With the crawl
        // this is already a no-op (the frontier drains exactly at 100%), so
        // nothing visibly "turns over" here.
        if (claimedCount < total) ctx.fillRect(0, 0, cw, ch);
        frames.push(canvas.toDataURL('image/png'));
        return frames;
    }

    /* ------------------------------------------------------------------ */
    /* Geometric stepped reveal (mode: 'expand')                           */
    /* ------------------------------------------------------------------ */

    function makeGeometry(variant, cx, cy, w, h) {
        var maxRadius = Math.hypot(
            Math.max(cx, w - cx),
            Math.max(cy, h - cy)
        );
        var toX = function (x) { return ((x / w) * 100) + '%'; };
        var toY = function (y) { return ((y / h) * 100) + '%'; };
        var pt = function (x, y) { return toX(x) + ' ' + toY(y); };
        var toRadius = function (r) {
            return ((r / (Math.hypot(w, h) / Math.SQRT2)) * 100) + '%';
        };

        var endVerts; // [[x, y], ...] for polygon variants

        switch (variant) {
            case 'square': {
                var halfSide = Math.max(
                    Math.max(cx, w - cx),
                    Math.max(cy, h - cy)
                ) * 1.05;
                endVerts = [
                    [cx - halfSide, cy - halfSide],
                    [cx + halfSide, cy - halfSide],
                    [cx + halfSide, cy + halfSide],
                    [cx - halfSide, cy + halfSide]
                ];
                break;
            }
            case 'triangle': {
                var scale = maxRadius * 2.2;
                var dx = (Math.sqrt(3) / 2) * scale;
                endVerts = [
                    [cx, cy - scale],
                    [cx + dx, cy + 0.5 * scale],
                    [cx - dx, cy + 0.5 * scale]
                ];
                break;
            }
            case 'diamond': {
                var R = maxRadius * Math.SQRT2;
                endVerts = [
                    [cx, cy - R], [cx + R, cy], [cx, cy + R], [cx - R, cy]
                ];
                break;
            }
            case 'hexagon': {
                var Rh = maxRadius * Math.SQRT2;
                endVerts = [];
                for (var i = 0; i < 6; i++) {
                    var a = -Math.PI / 2 + (i * Math.PI) / 3;
                    endVerts.push([cx + Rh * Math.cos(a), cy + Rh * Math.sin(a)]);
                }
                break;
            }
            case 'rectangle': {
                var halfW = Math.max(cx, w - cx);
                var halfH = Math.max(cy, h - cy);
                endVerts = [
                    [cx - halfW, cy - halfH],
                    [cx + halfW, cy - halfH],
                    [cx + halfW, cy + halfH],
                    [cx - halfW, cy + halfH]
                ];
                break;
            }
            case 'star': {
                var Rs = maxRadius * Math.SQRT2 * 1.03;
                var innerRatio = 0.42;
                endVerts = [];
                for (var j2 = 0; j2 < 5; j2++) {
                    var outerA = -Math.PI / 2 + (j2 * 2 * Math.PI) / 5;
                    endVerts.push([cx + Rs * Math.cos(outerA), cy + Rs * Math.sin(outerA)]);
                    var innerA = outerA + Math.PI / 5;
                    endVerts.push([
                        cx + Rs * innerRatio * Math.cos(innerA),
                        cy + Rs * innerRatio * Math.sin(innerA)
                    ]);
                }
                break;
            }
            case 'circle':
            default:
                return function (t) {
                    var r = t * maxRadius;
                    return 'circle(' + toRadius(r) + ' at ' + pt(cx, cy) + ')';
                };
        }

        return function (t) {
            var pts = endVerts.map(function (v) {
                return pt(cx + (v[0] - cx) * t, cy + (v[1] - cy) * t);
            });
            return 'polygon(' + pts.join(', ') + ')';
        };
    }

    function buildStepRadii(maxRadius, blockSize) {
        var steps = Math.ceil(maxRadius / blockSize);
        steps = Math.min(MAX_STEPS, Math.max(MIN_STEPS, steps));
        var radii = [];
        for (var i = 1; i < steps; i++) {
            var raw = (i * maxRadius) / steps;
            var quantized = Math.round(raw / blockSize) * blockSize;
            var r = quantized > (radii[radii.length - 1] || 0) ? quantized : raw;
            if (r < maxRadius) radii.push(r);
        }
        radii.push(maxRadius);
        return radii;
    }

    /* ------------------------------------------------------------------ */
    /* Runner                                                              */
    /* ------------------------------------------------------------------ */

    function run(applyTheme, options) {
        options = options || {};
        var button = options.button || null;
        var duration = typeof options.duration === 'number' ? options.duration : 1000;
        var mode = options.mode || 'dissolve';
        var variant = options.variant || 'square';
        var blockSize = typeof options.blockSize === 'number' ? options.blockSize : BLOCK_SIZE;

        if (
            isTransitioning ||
            document.documentElement.dataset.themeVt === 'active'
        ) {
            // Rapid toggling: remember only the latest request and replay it
            // as its own transition right after the current one finishes,
            // instead of dropping the click.
            pendingRun = [applyTheme, options];
            return;
        }

        var reduceMotion =
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (
            reduceMotion ||
            typeof document.startViewTransition !== 'function'
        ) {
            applyTheme();
            return;
        }

        // innerWidth/innerHeight (not visualViewport): percentages must
        // resolve against the snapshot reference box, which includes classic
        // scrollbars.
        var w = window.innerWidth;
        var h = window.innerHeight;

        var root = document.documentElement;
        var overlay = getOverlay();

        var keyframes;

        if (mode === 'dissolve') {
            // The takeover radiates from the toggle button (or the viewport
            // center when no button is given).
            var ox;
            var oy;
            if (button && button.getBoundingClientRect) {
                var rect = button.getBoundingClientRect();
                ox = rect.left + rect.width / 2;
                oy = rect.top + rect.height / 2;
            } else {
                ox = w / 2;
                oy = h / 2;
            }
            // ~8ms per frame — enough frames that the discrete block steps
            // read as one smooth crawl. Frames come from the pre-generated
            // pool, so this costs nothing at click time.
            var frameCount = Math.round(duration / 8);
            frameCount = Math.min(120, Math.max(40, frameCount));
            var masks = getDissolveFrames(
                w, h, blockSize, frameCount, ox, oy,
                typeof options.chaos === 'number' ? options.chaos : 0.4
            );
            keyframes = masks.map(function (url) {
                return {
                    maskImage: 'url("' + url + '")',
                    easing: 'steps(1, end)'
                };
            });
            // Pin the fully transparent mask so the new theme stays hidden
            // until the stepped animation takes over.
            root.style.setProperty(
                '--theme-vt-mask',
                'linear-gradient(transparent, transparent)'
            );
        } else {
            var x;
            var y;
            if (button && button.getBoundingClientRect) {
                var rect = button.getBoundingClientRect();
                x = rect.left + rect.width / 2;
                y = rect.top + rect.height / 2;
            } else {
                x = w / 2;
                y = h / 2;
            }
            var maxRadius = Math.hypot(
                Math.max(x, w - x),
                Math.max(y, h - y)
            );
            var geometry = makeGeometry(variant, x, y, w, h);
            var radii = buildStepRadii(maxRadius, blockSize);
            keyframes = radii.map(function (r) {
                return {
                    clipPath: geometry(r / maxRadius),
                    easing: 'steps(1, end)'
                };
            });
            // Pin the fully collapsed clip-path via CSS so the new theme
            // does not paint unclipped between snapshot and animation.
            root.style.setProperty('--theme-vt-clip', geometry(0));
        }

        isTransitioning = true;
        root.dataset.themeVt = 'active';
        root.style.setProperty('--theme-vt-duration', duration + 'ms');

        /* Chrome's view-transition layer resolves mid-transition hit tests to
         * the root element (e.target = html) and blocks the page during the
         * capture phase, so real pointer clicks never reach the button.
         * Listen at document level: a click inside the button's bounds during
         * the transition is re-routed through onIntercept (which lands in the
         * queue). Genuine button clicks pass through untouched. */
        var intercept = null;
        if (button) {
            intercept = function (e) {
                if (button.contains(e.target)) return;
                var r = button.getBoundingClientRect();
                if (
                    e.clientX >= r.left - 6 && e.clientX <= r.right + 6 &&
                    e.clientY >= r.top - 6 && e.clientY <= r.bottom + 6
                ) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (typeof options.onIntercept === 'function') {
                        options.onIntercept(e);
                    }
                }
            };
            document.addEventListener('click', intercept, true);
        }

        var finished = false;
        var cleanup = function () {
            if (finished) return;
            finished = true;
            isTransitioning = false;
            delete root.dataset.themeVt;
            root.style.removeProperty('--theme-vt-duration');
            root.style.removeProperty('--theme-vt-mask');
            root.style.removeProperty('--theme-vt-clip');
            document.body.classList.remove('theme-vt-active');
            if (intercept) {
                document.removeEventListener('click', intercept, true);
                intercept = null;
            }
            if (activeAnim) {
                activeAnim.cancel();
                activeAnim = null;
            }
            // Replay a toggle that arrived while this transition was running.
            var queued = pendingRun;
            pendingRun = null;
            if (queued) {
                requestAnimationFrame(function () {
                    run(queued[0], queued[1]);
                });
            }
        };

        var transition = document.startViewTransition(function () {
            // Class toggle is synchronous, so the View Transitions API
            // snapshots the overlay inside the new-theme snapshot.
            document.body.classList.add('theme-vt-active');
            applyTheme();
        });

        if (transition && transition.finished && typeof transition.finished.finally === 'function') {
            transition.finished.finally(cleanup).catch(function () { });
        } else {
            cleanup();
        }

        // Safety net: if rendering is stalled (e.g. occluded/minimized window
        // throttles the rendering opportunity the transition waits on), force
        // our state clean so the next toggle is not blocked forever.
        setTimeout(function () {
            if (isTransitioning) cleanup();
        }, duration + 2500);

        var ready = transition && transition.ready;
        if (ready && typeof ready.then === 'function') {
            ready.then(function () {
                // Array-of-keyframes form so each frame can carry its own
                // steps() easing for the chunky 8-bit jumps.
                var anim = document.documentElement.animate(keyframes, {
                    duration: duration,
                    fill: 'forwards',
                    pseudoElement: '::view-transition-new(root)'
                });
                activeAnim = anim;
            }).catch(function () { });
        }
    }

    /* Mask frame pool: pre-generated variants are rotated per toggle so
     * repeated toggles don't replay the identical pattern, and the click
     * path never pays the frame-generation cost. */
    var pool = { key: null, variants: [], next: 0 };

    function getDissolveFrames(w, h, blockSize, steps, originX, originY, chaos) {
        var key = [w, h, blockSize, steps, Math.round(originX), Math.round(originY), chaos].join('|');
        if (pool.key !== key) {
            pool.key = key;
            pool.variants = [];
            pool.next = 0;
        }
        if (pool.variants.length) {
            var frames = pool.variants[pool.next % pool.variants.length];
            pool.next++;
            return frames;
        }
        // Cache miss (toggle before prewarm finished): generate synchronously.
        var generated = buildDissolveMaskFrames(w, h, blockSize, steps, originX, originY, chaos);
        pool.variants.push(generated);
        pool.next++;
        return generated;
    }

    window.ThemeTransition = {
        run: run,
        /* Pre-generates dissolve mask frames on idle so the first (and every)
         * toggle is instant. Pass the same options as run(). */
        prewarm: function (options) {
            options = options || {};
            var delay = 50;
            var generateNext = function () {
                var w = window.innerWidth;
                var h = window.innerHeight;
                var duration = typeof options.duration === 'number' ? options.duration : 1000;
                var frameCount = Math.round(duration / 8);
                frameCount = Math.min(120, Math.max(40, frameCount));
                var blockSize = typeof options.blockSize === 'number' ? options.blockSize : BLOCK_SIZE;
                var ox = w / 2;
                var oy = h / 2;
                if (options.button && options.button.getBoundingClientRect) {
                    var r = options.button.getBoundingClientRect();
                    ox = r.left + r.width / 2;
                    oy = r.top + r.height / 2;
                }
                getDissolveFrames(
                    w, h, blockSize, frameCount, ox, oy,
                    typeof options.chaos === 'number' ? options.chaos : 0.4
                );
                if (pool.variants.length < 3) {
                    setTimeout(generateNext, delay);
                    delay *= 2;
                }
            };
            setTimeout(generateNext, delay);
        }
    };
})();
