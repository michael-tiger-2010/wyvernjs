![WyvernJS](https://github.com/user-attachments/assets/17233191-c8da-4193-ae37-c4a63869497f)

> "The missing wings of vanilla JavaScript"

Lightweight tools for intuitive coding. Extend JS without heavy frameworks. Focused on the developer experience.

![License: GPL-3.0](https://img.shields.io/badge/License-GPL%203.0-blue.svg)
![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-green)
![No Dependencies](https://img.shields.io/badge/No-Dependencies-lightgrey) 

## Why wyvernjs?
| Module   | Abilities                                     |
|----------|-----------------------------------------------|
| DiWu     | Chainable, intuitive DOM manipulation magic   |
| TianFeng | Practical but powerful utilities & helpers    |
| FireWyrm | Lightweight, painless async testing & mocking |
| ShuiHu   | Simple performance tracking & logging         |

## Beliefs and Features

Programming should be developer-centric to give them the best starting place and ability to create whatever they desire. As such, this library contains four tools that help in different ways, solving the most common pain points for programming:
 - **DiWu** (dw, _Earth Tortise_)  
   Chainable DOM extensions for effortless manipulation. Covers events and simple animations too. These can be disabled or forced (which overrides safe pollution).
```js
myDiv.css({backgroundColor: "lightblue"}).text("Pastel colors are the best")
```
 - **TianFeng** (tf, _Sky Pheonix_)
   Handy utilities for everyday coding tasks. Includes JSX-like DOM tree builders, leading-trailing throttling, a better `setInterval`, device prop detection, conformation & validation, stores, and much more.
```js
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
> Some functionality defaults to polluting `prototype` and global objects (`windoow`). This can be disabled, but feature availability will be reduce.

## Quickstart and Install
Just download the files in `/main` include whichever features you like as either `ES modules` or just plain `<script>` tags.

> [!NOTE]
> No CDNs are supported so far. Straight download is the only option currently.

```html
<!-- script tags for browser -->
<script src="diwu.js"></script>
<script src="tianfeng.js"></script>
<script src="firewyrm.js"></script>
<script src="shuihu.js"></script>
```

```js
// ES module imports
import {dw, diwu} from 'diwu.js';
import {tf, tianfeng} from 'tianfeng.js';
import {fw, firewyrm} from 'firewyrm.js';
import {sh, shuihu} from 'shuihu.js';
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
Documentation is coming to the wiki soon, as this project is migrating from V1 to V2.

## Support
> [!NOTE]
> Only browsers have been tested so far, but this is most likely NodeJS/ES9+ compliant. 

DiWu
 - DOM Sugar; supported on browsers only.

TianFeng
 - Supports all ES9+ JS interpreters, but the `context` needs to be set to something other than `window` if not on browser.

Firewyrm
 - Supports all ES9+ JS interpreters.

ShuiHu
 - Supports all ES9+ JS interpreters, but logToDOM is browser-only.

## Dependencies
No dependencies! Written in pure vanilla JS.

## Contributions
Any suggestions, (https://github.com/michael-tiger-2010/wyvernjs/issues)[issues], and (https://github.com/michael-tiger-2010/wyvernjs/pulls)[contributions] are welcome! 
This project is in its infancy. If you have something, just shoot a PR. No PR format imposed, as per the project philosophy, although for my sanity please do follow the code formatting around. 
Thanks!

## License
This project is under the `GPL-3.0 license`. See `LICENSE` for more details.
