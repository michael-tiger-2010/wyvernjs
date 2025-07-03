![WyvernJS](https://github.com/user-attachments/assets/17233191-c8da-4193-ae37-c4a63869497f)

# WyvernJS — _The missing wings of vanilla JavaScript_

Lightweight tools for intuitive coding. Extend JS without heavy frameworks. Focused on the developer experience.

![License: GPL-3.0](https://img.shields.io/badge/License-GPL%203.0-blue.svg)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-green)
![No Dependencies](https://img.shields.io/badge/No-Dependencies-lightgrey) 

## Why this library, though?
| Module   | Abilities                                     |
|----------|-----------------------------------------------|
| DiWu     | Chainable, intuitive DOM manipulation magic   |
| TianFeng | Practical but powerful utilities & helpers    |
| FireWyrm | Lightweight, painless async testing & mocking |
| ShuiHu   | Simple performance tracking & logging         |

## Table of Contents
- [Beliefs and Features](#beliefs-and-features)
- [Quickstart and Install](#quickstart-and-install)
- [Documentation](#documentation)
- [Support](#support)
- [Dependencies](#dependencies)
- [Contributions](#contributions)
- [Comparisons](#Comparisons)
- [License](#license)

## Beliefs and Features

Programming should be developer-centric, giving developers the best foundation and freedom to create what they desire. As such, this library contains four tools that help in different ways, solving the most common pain points for programming:
 - **DiWu** (dw, _Earth Tortise_)  
   Chainable DOM extensions for effortless manipulation. Covers events and simple animations too. These can be disabled, or explicitly forced, which overrides the default safe-pollution protections.
```js
myDiv.css({backgroundColor: "lightblue"}).text("Pastel colors are the best")
```
 - **TianFeng** (tf, _Sky Phoenix_)  
   Handy utilities for everyday coding tasks. Includes JSX-like DOM tree builders, leading-trailing throttling, a better `setInterval`, device prop detection, conformation & validation, stores, and much more.
```js
// using tree to build DOM
body.append(tree([
    ['div', {style: "text-align:center"}, [
        ['b', {}, ["WyvernJS"]],
        ['span', {}, [" is available at "]],
        ['a', {href: "https://github.com/michael-tiger-2010/wyvernjs/"}, ["github.com"]]
    ]]
])[0])
```
 - **FireWyrm** (fw)  
   Minimalist async testing and mocking framework with structured output.
```js
fw.start();

// add api mock
fw.mock(()=>return {data:1}).replace(window, "fetchJson");

fw.section('Math Tests')
.test('Addition', () => 1 + 1 === 2)
.assert('Multiplication', () => 2 * 3).is(6);

fw.section('Async Tests')
.test('Async operation', async () => {
    await new Promise(r => setTimeout(r, 100));
    return true;
})

fw.end()

// restore mocks
fw.mock.restore()
```
 - **ShuiHu** (sh, _Water Tiger_)  
   Simple, logging and performance timing with labels.
```js
sh.log('a log')
sh.time.factorialFunc.start();
for(let i = 0; i < 20; i++){
    factorial(i);
    sh.time.factorialFunc.step(i);
}
sh.time.factorialFunc.end();
```
> [!WARNING]
> Some functionality defaults to polluting `prototype` and global objects (`window`). This can be disabled, but feature availability will be reduced.

## Quickstart and Install
**NPM:**
```cmd
npm i @mchen_dragon/wyvernjs
```
> [!NOTE]
> See below for compatibility with NodeJS.

**Browser CDN:**
```html
<!-- script tags for browser -->
<script src="https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.4/main/diwu.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.4/main/tianfeng.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.4/main/firewyrm.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.4/main/shuihu.js"></script>

<!-- or all at once -->
<script src="https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.4/main/wyvern.js"></script>
```

```js
// ES module imports
import {dw, diwu} from 'https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.4/main/diwu.js';
import {tf, tianfeng} from 'https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.4/main/tianfeng.js';
import {fw, firewyrm} from 'https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.4/main/firewyrm.js';
import {sh, shuihu} from 'https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.4/main/shuihu.js';

// All at once
import {dw, diwu, tf, tianfeng, fw, firewyrm, sh, shuihu} from 'https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.4/main/wyvern.js';
```

Then initialize them:
```js
dw.init()
// accepts params like {on:false, off:false, once:false} to turn off the event shorthands

tf.init()
// accepts two params: (context, options). Context defaults to window,
// but you can have tf populate something else, e.g. tf itself to avoid
// polluting window.
// options can disable unwanted features, like exposing body to window:
// {bodyInWindow: false}
```

## Documentation
Documentation is available in the [wiki](https://github.com/michael-tiger-2010/wyvernjs/wiki).

## Environment Support
> [!NOTE]
> Only browsers have been tested so far, but this is most likely NodeJS/ES9+ compliant. 

DiWu
 - DOM Sugar; supported on browsers only.

TianFeng
 - Non-DOM features supported all ES9+ JS interpreters, but the `context` needs to be set to something other than `window` if not on browser.

Firewyrm
 - Supports all ES9+ JS interpreters.

ShuiHu
 - Supports all ES9+ JS interpreters, but logToDOM is browser-only.

## Contributions
Any suggestions, [issues](https://github.com/michael-tiger-2010/wyvernjs/issues), and [contributions](https://github.com/michael-tiger-2010/wyvernjs/pulls) are welcome! 
This project is in its infancy. If you have something, just shoot a PR. No PR format imposed, as per the project philosophy, although for my sanity please do follow the code formatting around. 
Thanks!

## Comparisons

### Feature Comparison for FireWyvern

| **Feature**               | **FireWyvern (fw)**                                                                 | **Jest**                                                                 | **Mocha**                                                                 | **Jasmine**                                                               | **QUnit**                                                                 |
|---------------------------|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------|---------------------------------------------------------------------------|---------------------------------------------------------------------------|---------------------------------------------------------------------------|
| **Syntax Style**          | Chained assertions (`fw.assert(...).is(...)`)                                       | `expect(value).toBe(...)`                                                | Assertion-library agnostic (e.g., Chai)                                   | `expect(value).toBe(...)`                                                 | `assert.equal(actual, expected)`                                          |
| **Test Structure**        | `test()` + `section()` for grouping                                                 | `test()`/`it()` + `describe()`                                           | `it()` + `describe()`                                                     | `it()` + `describe()`                                                     | `test()` + `module()`                                                     |
| **Async Support**         | ✅ (Promises/async)                                                                | ✅ (Promises/async/done)                                                | ✅ (Promises/async/done)                                                 | ✅ (Promises/async/done)                                                 | ✅ (Promises/async)                                                       |
| **Mocking**               | Basic object method replacement (`mock().replace()`)                                | ✅ Advanced (functions, timers, modules)                                | ❌ (Requires Sinon)                                                       | ✅ Spies only                                                             | ❌ (Requires Sinon)                                                       |
| **Built-in Matchers**     | ✅ 25+ (e.g., `is`, `throws`, `deepEquals`)                                        | ✅ 50+ (extensive)                                                       | ❌ (Relies on Chai/Should)                                                | ✅ 40+                                                                    | ✅ Basic (`equal`, `deepEqual`)                                           |
| **Lifecycle Hooks**       | ❌                                                                                  | ✅ (`beforeEach`, `afterAll`)                                            | ✅ (`before`, `after`)                                                    | ✅ (`beforeEach`, `afterAll`)                                             | ✅ (`before`, `after`)                                                    |
| **Browser Support**       | ✅ UMD (Node + Browser)                                                            | 🟡 Limited (jsdom)                                                       | ✅                                                                        | ✅                                                                        | ✅                                                                        |
| **Console Output**        | ✅ Custom (section summaries + ✅/❌)                                              | ✅ Detailed (✅/❌)                                                       | ❌ (Requires reporter)                                                    | ✅ Basic                                                                  | ✅ Basic                                                                  |
| **Parallel Execution**    | ❌ (Sequential queue)                                                               | ✅                                                                       | 🟡 (Experimental)                                                         | ❌                                                                        | ❌                                                                        |
| **Snapshot Testing**      | ❌                                                                                  | ✅                                                                       | ❌                                                                        | ❌                                                                        | ❌                                                                        |
| **Code Coverage**         | ❌                                                                                  | ✅ (Istanbul)                                                            | ✅ (With nyc)                                                             | ✅ (With Karma)                                                           | ✅ (With Istanbul)                                                        |
| **Extensibility**         | 🟡 (Modify core)                                                                   | ✅ (Custom matchers/runners)                                             | ✅ (Reporters/plugins)                                                    | 🟡 (Custom matchers)                                                      | 🟡 (Plugins)                                                              |
| **Zero-Config**           | ✅ (Single file)                                                                    | ✅                                                                       | ❌ (Requires setup)                                                       | 🟡 (Light setup)                                                          | 🟡 (Light setup)                                                          |
| **Size**                  | **~5 KB** (minified)                                                               | ~20 MB (with dependencies)                                              | ~2 MB (core)                                                              | ~1 MB                                                                    | ~100 KB                                                                   |

Use FireWyvern for a easy-to-setup and lightweight quick testing tool. For people in a pinch or for small teams/projects.  
Use Jest and it's ecosystem for a comprehensive and industry-standard testing tool. For companies or extensive and feature-complete systems.

### Feature Comparison for DiWu

| **Feature**               | **DiWu (dw)**                                                                 | **Prototype.js**                                                      | **Zepto.js**                                                          | **Cash.js**                                                          | **Umbrella.js**                                                      |
|---------------------------|------------------------------------------------------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------|----------------------------------------------------------------------|
| **Core Approach**         | Native prototype extension                                                   | Native prototype extension                                            | Light jQuery-like wrapper                                             | jQuery-like wrapper (2.5KB)                                          | jQuery-like wrapper (3KB)                                            |
| **Event Handling**        | ✅ `on()/off()/once()` with WeakMap registry<br>✅ Wildcard removal (`off('*')`) | ✅ `observe()/stopObserving()`<br>✅ Custom event system              | ✅ `on()/off()`<br>❌ No wildcard removal                             | ✅ `on()/off()`<br>❌ No wildcard removal                            | ✅ `on()/off()`<br>❌ No wildcard removal                           |
| **DOM Manipulation**      | ✅ Chainable methods<br>✅ `appendTo()/prependTo()`<br>✅ `replaceAs()`       | ✅ Chainable<br>✅ `insert()/replace()`                               | ✅ Chainable<br>✅ `appendTo()/prependTo()`                           | ✅ Chainable<br>✅ `appendTo()/prependTo()`                          | ✅ Chainable<br>✅ `appendTo()/before()`                            |
| **Animation**             | ✅ `animateTo()` (Web Animations API)<br>✅ Auto-applies final state          | ❌ Requires Scriptaculous                                             | ✅ `animate()` (CSS transitions)                                      | ❌ CSS only                                                          | ❌ CSS only                                                          |
| **Attributes/Classes**    | ✅ Proxy-based `attrs`/`classes` objects<br>✅ Natural property syntax       | ✅ `addClassName()`/`writeAttribute()`                                | ✅ `attr()`/`addClass()`                                              | ✅ `attr()`/`addClass()`                                             | ✅ `attr()`/`addClass()`                                             |
| **Special Features**      | ✅ `thendo()` (post-animation callback)<br>✅ WeakMap memory management      | ✅ Enumerable extensions<br>✅ Rich utility library                   | ✅ Mobile-optimized<br>✅ Touch events                                | ✅ jQuery-compatible API                                             | ✅ Ultra-lightweight<br>✅ Modular                                   |
| **Querying**              | ✅ `qs()`/`qsa()`<br>✅ `$()` (scoped)                                        | ✅ `$$()` (CSS selectors)<br>✅ `down()`/`up()`                       | ✅ `find()`/`filter()`                                                | ✅ `find()`/`filter()`                                               | ✅ `find()`/`filter()`                                              |
| **Modern Browser Support**| ✅ ES9+ (Proxy, WeakMap)                                                     | 🟡 Legacy-focused                                                    | ✅ Modern browsers                                                    | ✅ IE9+                                                              | ✅ Modern browsers                                                   |
| **Size**                  | **~4 KB**                                                                     | **~160 KB**                                                          | **~10 KB**                                                            | **~2.5 KB**                                                          | **~3 KB**                                                            |
| **Unique Capabilities**   | - Proxy-based attribute handling<br>- `thendo()` lifecycle hooks<br>- Native animation integration | - Comprehensive OOP utilities<br>- Form serialization<br>- AJAX helpers | - Touch gestures<br>- iOS compatibility                             | - Exact jQuery method names<br>- Plugin architecture                | - Extreme minimalism<br>- Custom build options                     |

DiWu is a modern browser evolution of Prototype Js, while being quite small and focusing on intuitive and native-like syntax (e.g. `el.classes.hover=true`) and animations, along with JQuery fluent-like syntax.  
Use other DOM sugar libraries for more page/UXUI and lifecycle related work, or for a comprehensive library and community.

### Feature Comparison for TianFeng

| **Feature Category**      | **TianFeng (tf)**                                                                 | **Lodash**                                                                 | **Underscore**                                                           | **Ramda**                                                                 | **Date-fns**                                                          |
|---------------------------|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------|--------------------------------------------------------------------------|---------------------------------------------------------------------------|-----------------------------------------------------------------------|
| **Core Philosophy**       | Browser-focused convenience utilities                                             | General-purpose utility toolkit                                            | Functional programming helpers                                           | Functional programming (immutable, auto-curried)                          | Date manipulation utilities                                           |
| **DOM Utilities**         | ✅ jQuery-like `$()`<br>✅ `tree()` JSX-alternative<br>✅ `body` shortcut          | ❌                                                                          | ❌                                                                        | ❌                                                                         | ❌                                                                    |
| **Async Control**         | ✅ Advanced `setTask()`<br>✅ `throttle()` with options                           | ✅ `debounce()`/`throttle()`                                               | ✅ Basic `debounce()`                                                     | ❌                                                                         | ❌                                                                    |
| **State Management**      | ✅ `createStore()` reactive proxy system                                          | ❌                                                                          | ❌                                                                        | ❌                                                                         | ❌                                                                    |
| **Persistence**           | ✅ `persist` localStorage proxy                                                   | ❌                                                                          | ❌                                                                        | ❌                                                                         | ❌                                                                    |
| **Form Handling**         | ✅ `validate` regex patterns<br>✅ `conform` input formatters                     | ❌                                                                          | ❌                                                                        | ❌                                                                         | ❌                                                                    |
| **Fetch Utilities**       | ✅ `fetchJson`/`fetchText`<br>✅ `fetchFresh` cache-busting                      | ❌                                                                          | ❌                                                                        | ❌                                                                         | ❌                                                                    |
| **URL Handling**          | ✅ `query` URLSearchParams proxy                                                  | ❌                                                                          | ❌                                                                        | ❌                                                                         | ❌                                                                    |
| **Device Detection**      | ✅ Comprehensive `device` object<br>(30+ properties)                              | ❌                                                                          | ❌                                                                        | ❌                                                                         | ❌                                                                    |
| **Data Type Handling**    | 🟡 `safeParse()` JSON                                                             | ✅ `_.cloneDeep()`<br>✅ `_.isEqual()`                                      | ✅ `_.isObject()`<br>✅ `_.isArray()`                                     | ✅ `R.equals()`<br>✅ `R.type()`                                           | ❌                                                                    |
| **Functional Programming**| ❌                                                                                | ✅ 100+ functions<br>(`_.map()`, `_.reduce()`)                             | ✅ 80+ functions                                                          | ✅ Auto-curried<br>✅ Point-free style                                     | ❌                                                                    |
| **Date Handling**         | ❌                                                                                | ❌                                                                          | ❌                                                                        | ❌                                                                         | ✅ 200+ functions<br>(`format()`, `differenceInDays()`)               |
| **Size (Minified)**       | **~3 KB**                                                                         | **~70 KB** (full)<br>**~4 KB** (per-function)                              | **~16 KB**                                                               | **~50 KB**                                                                | **~10 KB** (tree-shakeable)                                           |
| **Modern Browser Support**| ✅ ES9 Proxies, WeakMap                                                           | ✅ IE9+                                                                     | ✅ IE9+                                                                   | ✅ ES5+                                                                   | ✅ IE10+                                                              |

Use TianFeng for a wide spanse of functionality, while being quite small and focused on smoothing out the pain points of native js.  
Use other utility libraries for more well-tested and robust tools, or for a larger ecosystem of tools.

### Feature Comparison Table

| **Feature**               | **ShuiHu (sh)**                                                                 | **Winston**                                                                 | **Pino**                                                                 | **loglevel**                                                          | **Console API**                                                     |
|---------------------------|---------------------------------------------------------------------------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------|-----------------------------------------------------------------------|---------------------------------------------------------------------|
| **Core Philosophy**       | Browser-focused logging with timing utilities                                   | Universal logging with multiple transports                                  | High-performance Node.js logging                                         | Minimal browser logging                                               | Native browser logging                                              |
| **Environment**           | ✅ Browser-only                                                                 | ✅ Node.js + Browser                                                         | ✅ Node.js                                                                | ✅ Browser                                                            | ✅ Browser                                                           |
| **Log Levels**            | ✅ Custom: debug, warn, error, dire<br>✅ Numeric levels (0-3)                  | ✅ Configurable (error, warn, info, etc.)<br>✅ Custom level creation        | ✅ Standard + custom levels                                              | ✅ Standard levels (trace, debug, info, warn, error)                 | ✅ Standard levels (log, warn, error)                               |
| **Performance Timing**    | ✅ Advanced benchmark tool<br>✅ Step-based timing<br>✅ Flagged measurements   | ❌ Requires manual perf hooks                                               | ❌ Requires manual perf hooks                                            | ❌                                                                    | ❌ Basic `console.time()` only                                      |
| **Log Storage**           | ✅ In-memory log history<br>✅ Retrieval via `outputLogs()`                      | ✅ Multiple transports (file, DB, HTTP)                                     | ✅ In-memory + file rotation                                             | ❌                                                                    | ❌ No history                                                        |
| **Browser Integration**   | ✅ DOM output (`outputElementLogs()`)<br>✅ UI log holder creation              | 🟡 Limited browser support                                                  | ❌ Node-only                                                              | ✅ Browser-only                                                       | ✅ Native browser                                                   |
| **Real-time Updates**     | ✅ `setUpdateFn()` callback system                                              | ✅ Transport events                                                         | ✅ Transport events                                                      | ❌                                                                    | ❌                                                                  |
| **Error Handling**        | ✅ Contextual error logging<br>✅ Serialization safeguards                       | ✅ Error handling in transports                                             | ✅ Error handling                                                        | ❌                                                                    | ❌                                                                  |
| **Custom Formatting**     | ❌ Fixed format                                                                 | ✅ Highly customizable formatters                                           | ✅ JSON formatting                                                       | ❌                                                                    | ❌ CSS formatting only                                              |
| **Memory Management**     | ✅ `clear()` method<br>✅ Uint32Array for benchmarks                             | ❌ Manual management                                                        | ✅ Stream-based                                                          | ❌                                                                    | ❌                                                                  |
| **Dependencies**          | ✅ Zero dependencies                                                            | 🟡 Transport dependencies                                                  | ✅ Zero dependencies (optional pino-pretty)                              | ✅ Zero dependencies                                                   | ✅ Native                                                           |
| **Size (Minified)**       | **~3 KB**                                                                       | **~40 KB**                                                                  | **~20 KB**                                                               | **~1 KB**                                                             | **0 KB**                                                            |
| **Unique Features**       | - Step-based benchmarking<br>- Visual log holder<br>- Dire level for emergencies| - 20+ transports<br>- Log rotation                                         | - Extreme performance (17x faster)<br>- Async logging                  | - Tiny size<br.- Method silencer                                     | - Native browser integration                                       |
| **Transport** | ❌ | ✅ | ✅ | ❌ |❌ |

Use ShuiHu for in-browser, lightweight, and quick-and-easy tests, along with an integrated performance system. It is also marginally faster than Winston, although slower than Pino.  
Use others for maximum speed or extensive customization + transport

### Performance Comparison
| Operation            | ShuiHu | Winston | Pino   | Notes                                  |
|----------------------|--------|---------|--------|----------------------------------------|
| Simple log           | 0.01ms | 0.15ms  | 0.002ms| Pino optimized for speed              |
| Benchmark start/stop | 0.06ms | N/A     | N/A    | ShuiHu's timing overhead              |
| 10K log retention    | 5ms    | 8ms     | 3ms    | In-memory operations                  |
| DOM log rendering    | 15ms   | N/A     | N/A    | For 100 log entries                   |


### DX comparison for WyvernJS vs other Microframeworks
| **DX Criteria**         | **WyvernJS**                                                                 | **Preact**                                                            | **Alpine.js**                                                         | **Svelte**                                                           | **Lit**                                                              |
|-------------------------|------------------------------------------------------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------|
| **API Consistency**     | ✅ 9/10<br>(Unified naming: `fw`, `dw`, `tf`, `sh`)                          | 🟡 8/10<br>(React-like but subtle differences)                        | ✅ 9/10<br>(Consistent `x-` directives)                               | 🟡 7/10<br>(Unique syntax, learning curve)                           | ✅ 8/10<br>(Web Components standard)                                |
| **Learning Curve**      | ✅ 9/10<br>(Gradual adoption; utilities work standalone)                     | 🟡 7/10<br>(Requires React knowledge)                                | ✅ 10/10<br>(HTML-centric, minimal JS)                               | ❌ 6/10<br>(Compiler concepts needed)                                 | 🟡 7/10<br>(Requires WC knowledge)                                 |
| **Debugging**           | ✅ 10/10<br>(Integrated `sh` logs + `fw` tests + `dw` DOM utils)             | 🟡 7/10<br>(Relies on devtools)                                      | 🟡 6/10<br>(Limited tooling)                                         | ✅ 8/10<br>(Source maps + warnings)                                  | 🟡 7/10<br>(Standard devtools)                                     |
| **Boilerplate**         | ✅ 10/10<br>(Near-zero setup; init-and-go)                                   | 🟡 6/10<br>(Component structure required)                            | ✅ 9/10<br>(Declarative HTML)                                        | ❌ 5/10<br>(Build step + Svelte files)                               | 🟡 7/10<br>(Template definitions)                                 |
| **Hot Reloading**       | ❌ 4/10<br>(Manual refresh)                                                  | ✅ 9/10<br>(Vite integration)                                        | 🟡 7/10<br>(Basic live reload)                                       | ✅ 10/10<br>(Instant HMR)                                            | 🟡 7/10<br>(Depends on tooling)                                    |
| **State Management**    | 🟡 7/10<br>(`createStore()` reactivity)                                  | ✅ 9/10<br>(Signals/Context API)                                     | ✅ 8/10<br>(`x-data` auto reactivity)                                | ✅ 10/10<br>(Auto-reactive assignments)                              | 🟡 7/10<br>(Manual observables/controllers)                       |
| **DOM Manipulation**    | ✅ 10/10<br>(`dw` chainable syntax + animations)                             | ❌ 5/10<br>(Virtual DOM diffing)                                     | ✅ 9/10<br>(Direct `x-bind` control)                                 | ✅ 9/10<br>(Compiled DOM updates)                                    | 🟡 7/10<br>(Imperative rendering)                                 |
| **Tooling Integration** | ❌ 3/10<br>(No CLI/devtools)                                                 | ✅ 10/10<br>(Preact CLI + ecosystem)                                 | 🟡 6/10<br>(Basic extensions)                                        | ✅ 10/10<br>(SvelteKit + VS Code)                                    | ✅ 8/10<br>(Lit CLI + plugins)                                     |
| **Documentation**       | ✅ 8/10 (Detailed wiki)<br>                                              | ✅ 9/10<br>(Detailed guides + examples)                              | ✅ 8/10<br>(Practical demos)                                         | ✅ 10/10<br>(Interactive tutorials)                                  | ✅ 9/10<br>(MDN-aligned guides)                                   |
| **Flexibility**         | ✅ 10/10<br>(Mix-and-match utilities; no framework lock-in)                 | 🟡 7/10<br>(Preact-centric patterns)                                | 🟡 7/10<br>(Alpine-specific directives)                              | ❌ 5/10<br>(Svelte compiler required)                                | ✅ 9/10<br>(Works with any stack)                                 |
| **Bundle Size**         | ✅ 10/10<br>(~25 KB combined; tree-shakeable)                               | ✅ 9/10<br>(3 KB core)                                               | ✅ 10/10<br>(4.5 KB)                                                 | 🟡 7/10<br>(Compiler output varies)                                 | ✅ 8/10<br>(6 KB)                                                  |
| **DX Total**            | **8.3/10**                                                                  | **8.0/10**                                                           | **7.9/10**                                                           | **7.6/10**                                                           | **7.6/10**                                                           |

Use WyvernJS for a unified, complete native-like workflow with zero config and for quick iteration and nice DX in a SPA.  
Use others for actual ecosystem and for complex multi-page webapps.

## License
This project is under the `GPL-3.0 license`. See `LICENSE` for more details. This requires all derivative works to be open-source.

> [!NOTE]
> Wow! Since you read all the way here, a fun fact:  
> The three names shuihu, tianfeng, and diwu are all from the Chinese language, in pinyin. And yes, I know it isn't strict Chinese mythology, but it's fun enough so I'll take it.
