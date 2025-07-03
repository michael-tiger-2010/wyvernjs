![LogoTitle](https://github.com/user-attachments/assets/17233191-c8da-4193-ae37-c4a63869497f)

> "The missing wings of vanilla JavaScript"
Lightweight tools for intuitive coding. Extend JS without heavy frameworks. Focused on the developer experience.

## Why wyvernjs?
| Module   | Abilities                      |
|----------|--------------------------------|
| DiWu     | Chainable DOM magic            |
| TianFeng | Powerful utilities             |
| FireWyrm | Painless testing               |
| ShuiHu   | Performance tracking + Logging |

## Beliefs and Features

Programming should be developer-centric to give them the best ability to write what they want. Therefore, this library contains four tools that help in different ways:
 - **DiWu** (dw, earth-tortise) is a collection of prototype DOM extensions that can be enabled, disabled, or forced (override safe pollution).
```js
myDiv.css({backgroundColor: "lightblue"}).text("Pastel colors are the best")
```
 - **TianFeng** (tf, sky-pheonix) contains useful utilities that are often repeated or needed while programming.
```js
body.append(tree([
    ['div', {style: "text-align:center"}, [
        ['b', {}, ["WyvernJS"]],
        ['span', {}, [" is available at "]],
        ['a', {href: "https://github.com/michael-tiger-2010/wyvernjs/"}, ["github.com"]]
    ]]
])[0])
```
 - **FireWyrm** (fw) is an entire lightweight testing and mocking framework that accepts async and outputs in a structured manner.
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
 - **ShuiHu** (sh, water-tiger) is a performant logging and timing module. It has all expected features like logging levels and labels for timing.
```js
sh.log('a log')
sh.time.factorialFunc.start();
for(let i = 0; i < 20; i++){
    factorial(i);
    sh.time.factorialFunc.step(i);
}
sh.time.factorialFunc.end();
```

## Quickstart and Install
Just download the files in `/main` include whichever features you like as either `ES modules` or just plain `<script>` tags.

> [!NOTE]
> No CDNs are supported so far. Straight download is the only option currently.

Script Tags
```html
<script src="diwu.js"></script>
<script src="tianfeng.js"></script>
<script src="firewyrm.js"></script>
<script src="shuihu.js"></script>
```

ES Modules
```
import {dw, diwu} from 'diwu.js';
import {tf, tianfeng} from 'tianfeng.js';
import {fw, firewyrm} from 'firewyrm.js';
import {sh, shuihu} from 'shuihu.js';
```

Then initialize them:
```
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
Any suggestions are welcome! This project is in it's infancy. If you have something to contribute, just shoot a PR and it'll be checked over. Follow the programming style already present. No PR format imposed, as per the project philosophy. 

## License
This project is under the `GPL-3.0 license`. See `LICENSE` for more details.
