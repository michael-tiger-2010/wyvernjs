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
Just download the files in `/main` include whichever features you like (no need for all four) as either `ES modules` or just plain `<script>` tags.

**NPM:**
```cmd
npm i @mchen_dragon/wyvernjs
```
> [!NOTE]
> See below for compatibility with NodeJS.

**Browser CDN:**
```html
<!-- script tags for browser -->
<script src="https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.0/main/diwu.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.0/main/tianfeng.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.0/main/firewyrm.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.0/main/shuihu.js"></script>

<!-- or all at once -->
<script src="https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.0/main/wyvern.js"></script>
```

```js
// ES module imports
import {dw, diwu} from 'https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.0/main/diwu.js';
import {tf, tianfeng} from 'https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.0/main/tianfeng.js';
import {fw, firewyrm} from 'https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.0/main/firewyrm.js';
import {sh, shuihu} from 'https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.0/main/shuihu.js';

// All at once
import {dw, diwu, tf, tianfeng, fw, firewyrm, sh, shuihu} from 'https://cdn.jsdelivr.net/npm/@mchen_dragon/wyvernjs@1.0.0/main/wyvern.js';
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

## License
This project is under the `GPL-3.0 license`. See `LICENSE` for more details.

> [!NOTE]
> Wow! Since you read all the way here, a fun fact:  
> The three names shuihu, tianfeng, and diwu are all from the Chinese language, in pinyin. And yes, I know it isn't strict Chinese mythology, but it's fun enough so I'll take it.
