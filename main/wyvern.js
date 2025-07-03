
/* ShuiHu (sh)
 * Logging and Timing
 * Check docs for how to use
 */


// btw shuihu means water-tiger, which is diametric to firewyvern

const shuihu = (function(){
    let levels = {debug: 0, benchmark: 0, warn: 1, error: 2, dire: 3} // no info - just use debug, unneded. dire only if needed.
    let allLogs = [];
    let benchTests = {};
    let updateFunction = undefined;

    // record, timestamp, + format the log, then push it to the logs object
    function _log(statement, context='none', label){
        const now = new Date();

        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        // time string for timestamp yay
        const timestamp = hours+':'+minutes+';'+seconds+'.'+milliseconds; //faster than template literal
        let logObject = {statement, context, label, timestamp};
        console[["log","warn","error"][Math.min(levels[label],2)]](timestamp, "["+label+"] "+statement, context=='none'?'':context);
        allLogs.push(logObject);
        if(updateFunction){
            updateFunction();
        }

    }
 
    // Timing Function:
    // time.label.start() 
    // time.label.step(flag)
    // time.label.stop()
    // that sends a 'time' label to the logger, with the real starttime, delta steptimes, and delta stoptime.

    // TIME THOUGHTS: 
    // proxy adds 0.02ms overhead
    // performance.now is negligable
    // using Object is 0.05ms overhead
    // using Uint32 is negligable
    // total: ~0.06ms overhead
    // acceptable for standard performance
    // syntax sugar is my top priority
    // speed is second
    let time = new Proxy({},{
        get(target, prop){
            let label = prop;
            return {
                start(){
                    //check if name is already used
                    if(prop in benchTests){
                        // don't question my error reporting style
                        // it's a ">" after every conditional split/call chain

                        sh.error('sh>time>start was called with a currently used label');
                        return null;
                    }
                    // if not record starttime
                    let perf = Math.round(performance.now() * 10) / 10;
                    benchTests[prop] = {data: new Uint32Array(1000), index:0, startTime: perf}
                },
                step(flag){
                    //add a step flag

                    //flags need to be numbers
                    if(typeof flag !== 'number'){
                        sh.error('sh>time>step>flag needs to be a number');
                        return null;
                    }

                    // get current time
                    let perf = Math.round(performance.now() * 10) / 10;
                    let ct = benchTests[prop];
                    // check if the test exists
                    if(!ct){
                        sh.error('sh>time>step>ct does not exist, benchmark does not exist');
                        return null;
                    }
                    // check if the test's over the unit32 array limit
                    if(ct.index>998){
                        sh.error('sh>time>step>ct.index over 998, max step creation is 1000 steps');
                        return null;
                    }
                    ct.data[ct.index] = perf-ct.startTime;
                    ct.data[ct.index+1] = flag;
                    ct.index = ct.index + 2;
                },
                stop(){
                    //stop benchmark and log

                    // get total time
                    let perf = Math.round(performance.now() * 10) / 10;
                    let ct = benchTests[prop];

                    // check if the benchmark exists or not
                    if(!ct){
                        sh.error('sh>time>stop>ct does not exist, benchmark does not exist');
                        return null;
                    }
                    // if so, make a string of the recorded data
                    let string = `benchmark: ${prop}\nStart: ${ct.startTime}\nEnd: ${perf}\nDiff: ${perf-ct.startTime}\nSteps:\n`;
                    for(let i = 0; i < ct.index; i=i+2){
                        string = string + `${(i/2)+1} f${ct.data[i+1]}: ${ct.data[i]}\n`;
                    }

                    delete benchTests[prop]

                    // log the data
                    _log(string, undefined, 'benchmark');
                },
                cancel(){
                    // check if it's a thing
                    if(!benchTests[prop]){
                        sh.error('sh>time>cancel>benchTests[prop] does not exist, benchmark does not exist');
                        return null;
                    }
                    // if not, remove it!
                    delete benchTests[prop];
                }
            }
        }
    })

    // stringify with checking
    function safeStringify(obj) {
        try {
            return JSON.stringify(obj);
        } catch (e) {
            return '[Unserializable object]';
        }
    }

    return {

        //give all the log funcs
        debug(statement, context){_log(statement, context, 'debug')},
        log(statement, context){_log(statement, context, 'debug')},
        warn(statement, context){_log(statement, context, 'warn')},
        error(statement, context){_log(statement, context, 'error')},
        dire(statement, context){_log(statement, context, 'dire')},
        time,
        outputLogs(label = "debug", serialize = true, lastAmount = Infinity){
            // filter by label
            let logs = allLogs.filter(e=>levels[e.label]>=levels[label]).slice(-lastAmount);

            // output the logs
            let output = [];
            for(let i = 0; i < logs.length; i++){
                // performance overhead from template overhead is 90M ops per sec, which should be fast enough ig
                output.push({});
                output[i].msg = `[${logs[i].label}] ${logs[i].statement}`;
                output[i].label = logs[i].label
                if(serialize){
                    output[i].context = safeStringify(logs[i].context);
                }else{
                    output[i].context = logs[i].context;
                }
            }
            return output;
        },
        /*
STYLE:
div.logholder{
font-size:0px;
}
div.log{
border-bottom:1px solid grey;
display:inline-block;
font-size:13px;
font-family:monospace;
color:white;
}
div.l1{
background-color:rgba(120,120,0.2);
}
div.l2{
background-color:rgba(200,80,0,0.2);
}
div.l3{
background-color:rgba(255,0,0,0.4);
}
        */

        //output logs into an element
        outputElementLogs(label, lastAmount=100){
            // there is an additional library this is normally included in.
            // translate this to normal JS if out of library.

            // REQUIRES TIANFENG
            let opts = sh.outputLogs(label, false, lastAmount);
            let children = [];
            for(var i of opts){
                let contextString = Object.entries(i.context).map(e=>e[0]+': '+safeStringify(e[1])+'\n');
                children.push(
                    document.createElement('div')
                            .text(i.msg+'\n'+contextString)
                            .setClasses(["log", "l"+levels[i.label]])
                );
            }
            return children;
        },

        //create the element
        createLogHolder(parent = window.document.body){

            parent.appendChild(
                document.createElement('div')
                        .css({position:"fixed", bottom:"0px", top:"0px", width:"20vw", height:"100vh", backgroundColor: "rgba(0,0,0,0.3)"})
                        .setClasses('logholder')
            )
        },
        // set the function to call on update
        setUpdateFn(fn){
            this.updateFunction = fn;
        },
        //clear logs
        clear(){
            allLogs = [];
        }

    }
})()

const sh = shuihu;


/* DiWu (dw)
 * DOM sugar
 * See docs for usage inst
 */


const dw = (()=>{
    const objectIdMap = new WeakMap();
    let idCounter = 0;

    function getObjectId(obj) {
        if (!objectIdMap.has(obj)) {
            objectIdMap.set(obj, ++idCounter);
        }
        return objectIdMap.get(obj);
    }
    const __eventRegistry = new Map();

    function ensureRegistryEntry(id) {
        if (!__eventRegistry.has(id)) {
            __eventRegistry.set(id, new Map());
        }
        return __eventRegistry.get(id);
    }

    return {
        methods: {
            // Event handling methods
            on: {
                parent: EventTarget.prototype,
                func: function(eventType, listener, options) {
                    const id = getObjectId(this);
                    const registry = ensureRegistryEntry(id);
                    const addListener = (type) => {
                        if (!registry.has(type)) {
                            registry.set(type, new Map());
                        }
                        const listeners = registry.get(type);
                        if (!listeners.has(listener)) {
                            listeners.set(listener, options);
                            this.addEventListener(type, listener, options);
                        }
                    };
                    if (typeof eventType === 'string') {
                        addListener(eventType);
                    } else if (Array.isArray(eventType)) {
                        eventType.forEach(addListener);
                    }
                    return this;
                }
            },
            
            once: {
                parent: EventTarget.prototype,
                func: function(eventType, listener, options) {
                    const id = getObjectId(this);
                    const registry = ensureRegistryEntry(id);
                    const wrappedListener = function(...args) {
                        // .apply is magic
                        // lesser magic than the dark secrets of Proxies, though
                        listener.apply(this, args); 
                        this.off(eventType, wrappedListener); 
                    };
                
                    if (!registry.has(eventType)) {
                        registry.set(eventType, new Map());
                    }
                    registry.get(eventType).set(wrappedListener, options);
                    this.addEventListener(eventType, wrappedListener, { ...options, once: true });
                    return this;
                }
            },

            promiseMeOnce: {
                parent: EventTarget.prototype,
                func: function(eventType, listener, options) {
                    const id = getObjectId(this);
                    const registry = ensureRegistryEntry(id);
                    let wrappedListener = undefined;
                    let promise = new Promise((res)=>{
                        wrappedListener = function(...args) {
                            res();
                            listener.apply(this, args); 
                            this.off(eventType, wrappedListener); 
                        };
                    })
                    if (!registry.has(eventType)) {
                        registry.set(eventType, new Map());
                    }
                    registry.get(eventType).set(wrappedListener, options);
                    this.addEventListener(eventType, wrappedListener, { ...options, once: true });
                    return promise;
                }
            },
            
            off: {
                parent: EventTarget.prototype,
                func: function(eventType = '*', listener) {
                    const id = getObjectId(this);
                    if (!__eventRegistry.has(id)) return this;
                    const registry = __eventRegistry.get(id);
                    const removeListeners = (type) => {
                        if (registry.has(type)) {
                            const listeners = registry.get(type);
                            if (listener) {
                                // assasinate a listener
                                const options = listeners.get(listener);
                                if (options !== undefined) {
                                    this.removeEventListener(type, listener, options);
                                    listeners.delete(listener);
                                }
                            } else {
                                // delete an entire type
                                listeners.forEach((options, l) => {
                                    this.removeEventListener(type, l, options);
                                });
                                registry.delete(type);
                            }
                        }
                    };
                    if (eventType === '*') {
                        // *exterminate* *wildcard*
                        registry.forEach((_, type) => removeListeners(type));
                        __eventRegistry.delete(id);
                    } else if (Array.isArray(eventType)) {
                        eventType.forEach(removeListeners);
                    } else {
                        removeListeners(eventType);
                    }
                    return this;
                }
            },
            
            // Animation methods
            animateTo: {
                parent: HTMLElement.prototype,
                func: function(animation, duration, easing = "linear(0,1)", iterations = 1) {
                    const opts = { duration, easing, iterations };
                    const keyframes = Array.isArray(animation) ? animation : [animation];
                    const anim = this.animate(keyframes, opts);
                    
                    anim.addEventListener('finish', () => {
                        const finalState = Array.isArray(animation) ? animation.at(-1) : animation;
                        this.css(finalState);
                    });
                    
                    return this; // for chaining
                }
            },
            
            // DOM manipulation methods
            addChildren: {
                parent: HTMLElement.prototype,
                func: function(children) {
                    if (Array.isArray(children)) {
                        for (var i of children) {
                            this.appendChild(i);
                        }
                        return this;
                    } else {
                        throw new Exception(`addChildren should have array, not ${typeof(children)}`);
                        return;
                    }
                }
            },
            
            appendTo: {
                parent: HTMLElement.prototype,
                func: function(parent) {
                    parent.appendChild(this);
                    return this;
                }
            },
            
            prependTo: {
                parent: HTMLElement.prototype,
                func: function(parent) {
                    parent.prepend(this);
                    return this;
                }
            },
            
            replaceAs: {
                parent: HTMLElement.prototype,
                func: function(el) {
                    this.replaceWith(el);
                    return el;
                }
            },
            
            empty: {
                parent: HTMLElement.prototype,
                func: function() {
                    this.innerHTML = '';
                    return this;
                }
            },
            
            prepend: {
                parent: HTMLElement.prototype,
                func: function(node) {
                    if (typeof node === 'string') {
                        this.prependChild(document.createTextNode(node));
                    } else if (Array.isArray(node)) {
                        for (var i of node.reverse()) {
                            this.prepend(i);
                        }
                    } else {
                        this.prependChild(node);
                    }
                    return this;
                }
            },
            
            append: {
                parent: HTMLElement.prototype,
                func: function(node) {
                    if (typeof node === 'string') {
                        this.appendChild(document.createTextNode(node));
                    } else if (Array.isArray(node)) {
                        for (var i of node) {
                            this.appendChild(i);
                        }
                    } else {
                        this.appendChild(node);
                    }
                    return this;
                }
            },
            
            // Content methods
            text: {
                parent: HTMLElement.prototype,
                func: function(text) {
                    this.textContent = text;
                    return this;
                }
            },
            
            html: {
                parent: HTMLElement.prototype,
                func: function(html) {
                    this.innerHTML = html;
                    return this;
                }
            },
            
            // Attribute and class methods
            setAttrs: {
                parent: HTMLElement.prototype,
                func: function(attrs, value) {
                    if (typeof attrs === 'string') {
                        this.attrs[attrs] = value;
                    } else {
                        for (const [key, value] of Object.entries(attrs)) {
                            this.attrs[key] = value;
                        }
                    }
                    return this;
                }
            },
            
            setClasses: {
                parent: HTMLElement.prototype,
                func: function(clas) {
                    if (typeof clas === 'string') {
                        this.classList.add(clas);
                    } else {
                        for (const i of clas) {
                            this.classList.add(i);
                        }
                    }
                    return this;
                }
            },
            
            removeClasses: {
                parent: HTMLElement.prototype,
                func: function(clas) {
                    if (typeof clas === 'string') {
                        this.classList.remove(clas);
                    } else {
                        for (const i of clas) {
                            this.classList.remove(i);
                        }
                    }
                    return this;
                }
            },
            
            // Query selector methods
            qs: {
                parent: Element.prototype,
                func: function(selector) {
                    return this.querySelector(selector);
                }
            },
            
            qsa: {
                parent: Element.prototype,
                func: function(selector) {
                    return this.querySelectorAll(selector);
                }
            },
            
            $: {
                parent: Element.prototype,
                func: function(selector) {
                    return this.document.getElementById(selector);
                }
            },
            
            // Styling methods
            css: {
                parent: Element.prototype,
                func: function(styles) {
                    for (const [prop, value] of Object.entries(styles)) {
                        this.style[prop] = value;
                    }
                    return this; // allows chaining
                }
            },
            
            thendo: {
                parent: Element.prototype,
                func: function(callback) {
                    if (typeof callback !== 'function') return this;
                    const endEvents = [
                        'transitionend',    // CSS transitions
                        'animationend',     // CSS animations
                        'ended',            // Media playback (audio/video)
                        'loadend',          // Media load completion
                        'complete'          // Some images (legacy)
                    ];
                    const runOnce = (event) => {
                        if (event.target !== this) return;
                        for (const evt of endEvents) {
                            this.removeEventListener(evt, runOnce);
                        }
                        callback.call(this, this);
                    };
                    for (const evt of endEvents) {
                        this.addEventListener(evt, runOnce);
                    }
                    return this;
                }
            },
            
            // Visibility methods
            hide: {
                parent: HTMLElement.prototype,
                func: function() {
                    // data- is your friend, saving stuff to the element
                    if (this.style.display !== 'none') {
                        this.dataset.originalDisplay = this.style.display || getComputedStyle(this).display;
                    }
                    this.style.display = 'none';
                    return this; // *chaining* magic
                }
            },
            
            show: {
                parent: HTMLElement.prototype,
                func: function(displayType = undefined) {
                    // Use the provided displayType, fall back to the original, or default to 'block'
                    const display = displayType || this.dataset.originalDisplay || 'block';
                    this.style.display = display;
                    return this; // *chain*
                }
            },
            
            toggle: {
                parent: HTMLElement.prototype,
                func: function(displayType = undefined) {
                    if (this.style.display === 'none') {
                        this.show(displayType); // piping stuff around is fun
                    } else {
                        this.hide(); //hehe using my own funcs
                    }
                    return this; // *ch*
                }
            },

            wait: {
                parent: Promise.prototype,
                func: function (ms) {
                    return this.then(
                        result => new Promise(res => setTimeout(() => res(result), ms))
                    )
                }
            }
        },
        
        // Special properties that need different handling
        properties: {
            siblings: {
                parent: HTMLElement.prototype,
                descriptor: {
                    get() {
                        const siblings = [];
                        if (this.parentNode) {
                            for (const child of this.parentNode.children) {
                                if (child !== this) {
                                    siblings.push(child);
                                }
                            }
                        }
                        return siblings;
                    }
                }
            },
            
            classes: {
                parent: HTMLElement.prototype,
                descriptor: {
                    get: function() {
                        const element = this;
                        return new Proxy({}, {
                            get: function(target, prop) {
                                if (!element.classList.contains(prop)) {
                                    return false;
                                }
                                return true;
                            },
                            set: function(target, prop, value) {
                                if (value) {
                                    element.classList.add(prop);
                                } else {
                                    element.classList.remove(prop);
                                }
                                return value;
                            }
                        });
                    }
                }
            },
            
            attrs: {
                parent: HTMLElement.prototype,
                descriptor: {
                    get: function() {
                        const element = this;
                        return new Proxy({}, {
                            get: function(target, prop) {
                                if (!element.hasAttribute(prop)) {
                                    return undefined;
                                }
                                return element.getAttribute(prop);
                            },
                            set: function(target, prop, value) {
                                if (!value) {
                                    element.removeAttribute(prop);
                                } else {
                                    element.setAttribute(prop, value);
                                }
                                return value;
                            }
                        });
                    }
                }
            }
        },
        
        // Special setup for methods that need to be added to multiple prototypes
        multiTargetMethods: {
            qs: [Element.prototype, Document.prototype, DocumentFragment.prototype],
            qsa: [Element.prototype, Document.prototype, DocumentFragment.prototype],
            $: [Element.prototype, Document.prototype, DocumentFragment.prototype]
        },
        
        init(params = {}) {
            // Handle regular methods
            for (let methodName of Object.keys(this.methods)) {
                // if it's turned off, don't add it
                if (params[methodName] === false) continue;
                
                const method = this.methods[methodName];
                
                // Handle multi-target methods
                if (this.multiTargetMethods[methodName]) {
                    for (const target of this.multiTargetMethods[methodName]) {
                        //exit
                        if ((!!target[methodName]) && params[methodName] !== 'force') continue;
                        target[methodName] = method.func;
                    }
                } else {
                    // if the method exists (and param isn't "force" to override) nope outta this
                    if ((!!method.parent[methodName]) && params[methodName] !== 'force') continue;
                    method.parent[methodName] = method.func;
                }
            }
            
            // Handle properties (getters/setters)
            for (let propName of Object.keys(this.properties)) {
                // if it's turned off, don't add it
                if (params[propName] === false) continue;
                
                const prop = this.properties[propName];
                
                // if the property exists (and param isn't "force" to override) nope outta this
                if (prop.parent.hasOwnProperty(propName) && params[propName] !== 'force') continue;
                
                Object.defineProperty(prop.parent, propName, prop.descriptor);
            }
            
            // Handle special case for prepend override
            if (params.prepend !== false) {
                HTMLElement.prototype.prependChild = HTMLElement.prototype.prepend;
            }
        }
    };
})();

const diwu = dw;

/* TianFeng (tf)
* init() will populate window be default. Change to tf to populate tf with methods instead.
* See docs for usage.
*/

const tf = {
    init(context=window, options={}){
        if (options.selector || options.selector==undefined) {
            // jquery but not actually jquery
            // like i want $('id') to work, but also $('.class')
            context['$'] = (selector) => {
                if (selector.endsWith('+')) return document.querySelectorAll(selector.slice(0, -1));
                return document.getElementById(selector) || document.querySelector(selector);
            };
        }
        
        if (options.setTask || options.setTask==undefined) {
            // oh god i needed this a long time ago
            // A better setInterval

            // the task parking lot where they hang out
            const __taskRegistry = {};

            context.setTask = (fn, delay = 0, args = [], iterations = Infinity)=>{
                const id = Symbol("task"); //didn't even know this existed, but ok

                const task = {
                    id,
                    delay,
                    iterations,
                    count: 0,
                    cancelled: false,
                    timeoutId: null,
                };

                function wrapper() {
                    if (task.cancelled || task.count >= task.iterations) return;

                    // now you don't need a global variable with the id to stop it
                    // just call this.stop()
                    // SOO MUCH BETTER
                    const control = {
                        stop: () => {
                            task.cancelled = true;
                            clearTimeout(task.timeoutId);
                        },
                        iterations: task.iterations
                    };

                    fn.apply(control, args); // ah, .apply, my old friend
                    task.count++;

                    if (!task.cancelled && task.count < task.iterations) {
                        task.timeoutId = setTimeout(wrapper, task.delay);
                    }
                }

                // although still need to use timeouts
                // timeouts were better anyway
                task.timeoutId = setTimeout(wrapper, task.delay);

                // hey, task, go to the registry!
                __taskRegistry[id] = task;

                return id;
            }

            context.clearTask = (id) => {
                // Check if the task exists in the registry
                if (__taskRegistry[id]) {
                    // Cancel the task
                    __taskRegistry[id].cancelled = true;
                    clearTimeout(__taskRegistry[id].timeoutId);
                    
                    // Remove the task from the registry
                    delete __taskRegistry[id];
                } else {
                    console.warn(`Task with id ${id.toString()} not found in registry`);
                }
            };
            // i don't think i'll use this, but
            // it _could_ be useful.
            context.changeTask = (id, { delay })=>{
                const task = __taskRegistry[id];
                if (task && typeof delay === 'number') {
                    task.delay = delay;
                }
            }
        }

        if (options.persist || options.persist==undefined) {
            // And now, you don't have to worry about localstorage persistance
            // it makes a persist prop/obj in window that you can just assign stuff to
            // and it'll work! It's like a "continous/persistant" variable through page loads
            
            const persistedValues = JSON.parse(localStorage.getItem('persist')) || {};
            

            // Create the persist object
            context.persist = new Proxy({},{
                set: function(target, prop, value) {
                    persistedValues[prop] = value;
                    localStorage.setItem('persist', JSON.stringify(persistedValues));
                    return value;
                },
                get: function(target, prop) {
                    return persistedValues[prop];
                }
            });
        }

        if (options.bodyInWindow || options.bodyInWindow==undefined) {
            //fight me (jk this is super controversal)
            context['body']=window.document.body; //ahh, painful times
        }

        if (options.query || options.query==undefined) {
            context['urlQuery'] = new URLSearchParams(window.location.search);
                        
            // making this easier too
            context["query"] = new Proxy({},{
                get: (target, key) => urlQuery.get(key),
                set: (target, key, value) => {
                    if(value===undefined){
                        urlQuery.delete(key);
                    }else{
                        urlQuery.set(key, value);
                    }
                    history.replaceState(null, '', '?' + urlQuery.toString());
                }
            });
        }

        if (options.validate || options.validate==undefined) {
                        
            context['validate'] = {};

            const validationRules = {
                required: /^.+$/,
                email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                phone: /^[\d\s\+\-\(\)]{7,15}$/,
                alphabetic: /^[a-zA-Z]+$/,
                numeric: /^[0-9]+$/,
                password: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                url: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
                creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|(?:2131|1800|35\d{3})\d{11})$/,
                zipCode: /^\d{5}$/
            };

            // Populate the validate object dynamically, so I don't repeat code
            // the regex was annoying to find and check, especially creditCard. Why is a credit card so complex?
            for (const [type, regex] of Object.entries(validationRules)) {
                context['validate'][type] = function(input) {
                    return regex.test(input);
                };
                document.querySelectorAll('[data-validate-'+type).forEach((type=>e=>{
                    e.addEventListener('input',function(){
                        
                        if(!context.validate[type](this.value)){
                            this.setCustomValidity(this.dataset.validityError||'Form needs to fit '+type+' form');
                        }else{
                            this.setCustomValidity('');
                        }
                    })
                })(type))
            }

            context['validate'].date = function(input) {
                const date = new Date(input);
                return !isNaN(date.getTime());
            }
        }

        if (options.conform || options.conform==undefined) {
            
            // ugh form input validation ugh
            context['conform'] = {};

            context['conform'].phone = function(input) {
                const digits = input.replace(/\D/g, '');
                if (digits.length < 10) return false;
                if (digits.length > 10) {
                    return `+${digits.slice(0, digits.length - 10)}-${digits.slice(digits.length - 10, digits.length - 7)}-${digits.slice(digits.length - 7, digits.length - 4)}-${digits.slice(digits.length - 4)}`;
                }
                return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            };

            context['conform'].date = function(input) {
                const date = new Date(input);
                if (isNaN(date.getTime())) return false;
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            context['conform'].url = function(input) {
                if (/^https?:\/\//i.test(input)) return input;
                return `http://${input}`;
            };

            context['conform'].email = function(input) {
                const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
                if (!regex.test(input)) return false;
                return input.toLowerCase();
            };

            context['conform'].alphabetic = function(input) {
                const regex = /^[a-zA-Z]+$/;
                if (!regex.test(input)) return false;
                return input.toUpperCase();
            };

            context['conform'].alphabeticSpace = function(input) {
                const regex = /^[a-zA-Z ]+$/; //it's literally a space
                if (!regex.test(input)) return false;
                return input.toUpperCase();
            };
            

            context['conform'].creditCard = function(input) {
                const digits = input.replace(/\D/g, '');
                if (digits.length !== 16) return false;
                return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12)}`;
            };

            context['conform'].simplePhone = window['conform'].simpleCreditCard = function(input) {
                return input.replace(/\D/g, '');
            };

        }

        if (options.fetchhelp || options.fetchhelp==undefined) {
            
            context["fetchJson"] = async function(url, ops) {
                try {
                    const response = await fetch(url, ops);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error('Error fetching JSON (fetchJSON):', error);
                    throw error; // Rethrow or handle as needed
                }
            }

            context["fetchText"] = async function(url, ops) {
                try {
                    const response = await fetch(url, ops);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const text = await response.text();
                    return text;
                } catch (error) {
                    console.error('Error fetching text (fetchText):', error);
                    throw error; 
                }
            }

            context["fetchFresh"] = async function(url, ops) {
                try {
                    const urlSplit = new URL(url);
                    const searchParams = new URLSearchParams(urlSplit.search);
                    searchParams.set('refresh', String(Date.now()));
                    const response = await fetch(urlSplit.origin+urlSplit.pathname+'?'+searchParams.toString(), ops);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const text = await response.text();
                    return text;
                } catch (error) {
                    console.error('Error fetching text (fetchFresh):', error);
                    throw error; 
                }
            }

        }

        if (options.safeJSON || options.safeJSON==undefined) {
            context["safeParse"] = function(json) {
                let result = ''
                try {
                    result = JSON.parse(json);
                    return result;
                } catch (error) {
                    return '[Unparseable JSON]';
                    //haha uncaught error (gets murdered)
                }
            }
        }

        if(options.throttle || options.throttle==undefined){

            // for onscroll, but I made it available for everyone (both meanings)
            // pretty nice, leading/trailing covered
            context["throttle"] = (fn, delay = 10, options = {}) => {
                let lastCall = 0;
                let timeout = null;
                let lastArgs = null;
                let lastThis = null;
                
                // options
                // some small part of my brain remembered this type of JSON expansion is a thing
                // and somehow used it 
                const { leading = true, trailing = true } = options;

                return function(...args) {
                    const now = Date.now();
                    const remaining = delay - (now - lastCall);
                    lastArgs = args;
                    lastThis = this;

                    if (remaining <= 0) {
                        // Time has passed since last call
                        if (timeout) {
                            clearTimeout(timeout);
                            timeout = null;
                        }
                        
                        lastCall = now;
                        if (leading) {
                            fn.apply(lastThis, lastArgs);
                        }
                    } else if (!timeout && trailing) {
                        // have the trailing activate in time so we can cover the trailing
                        timeout = setTimeout(() => {
                            lastCall = Date.now();
                            timeout = null;
                            if (trailing && lastArgs) { //double checking for trailing
                                fn.apply(lastThis, lastArgs);
                            }
                        }, remaining);
                    }
                };
            };
        }

        if(options.device || options.device == undefined){
                        
            //some nice ones
            //DETECT ALL (jk)
            context["device"] = {
                // Touch capabilities _extended_ 
                isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
                touchPoints: navigator.maxTouchPoints || 0,

                // to not flashbang dark mode users
                isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
                isLightMode: window.matchMedia('(prefers-color-scheme: light)').matches,

                // finally we have networking tools
                isOffline: !navigator.onLine,
                connection: navigator.connection ? {
                    effectiveType: navigator.connection.effectiveType,
                    saveData: navigator.connection.saveData,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt
                } : null,

                // Some quick detection for mobile
                isMobile: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
                isDesktop: !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent),

                // Browser testing
                browser: {
                    isChrome: /Chrome/i.test(navigator.userAgent),
                    isFirefox: /Firefox/i.test(navigator.userAgent),
                    isSafari: /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent),
                    isEdge: /Edg/i.test(navigator.userAgent),
                    isIE: /Trident/i.test(navigator.userAgent)
                },

                // Now for some more info collection, your os
                os: {
                    isWindows: /Windows/i.test(navigator.userAgent),
                    isMac: /Macintosh|Mac OS X/i.test(navigator.userAgent),
                    isLinux: /Linux/i.test(navigator.userAgent),
                    isiOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
                    isAndroid: /Android/i.test(navigator.userAgent)
                },

                // Now some screen information
                screen: {
                    width: window.screen.width,
                    height: window.screen.height,
                    orientation: window.screen.orientation ? window.screen.orientation.type : 'portrait-primary',
                    pixelRatio: window.devicePixelRatio || 1
                },

                // some viewport data
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },

                // battery from init
                battery: null,

                // allow more stalking? Sure!
                hasGeolocation: 'geolocation' in navigator,
            };
            // gimme the battery
            if ('getBattery' in navigator) {
                navigator.getBattery().then(battery => {
                    this.battery = {
                        level: battery.level,
                        charging: battery.charging,
                        chargingTime: battery.chargingTime,
                        dischargingTime: battery.dischargingTime
                    };
                });
            }

            // change stuff if needed
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                this.isDarkMode = e.matches;
                this.isLightMode = !e.matches;
            });

            window.addEventListener('online', () => this.isOffline = false);
            window.addEventListener('offline', () => this.isOffline = true);

            if (navigator.connection) {
                navigator.connection.addEventListener('change', () => {
                    this.connection = {
                        effectiveType: navigator.connection.effectiveType,
                        saveData: navigator.connection.saveData,
                        downlink: navigator.connection.downlink,
                        rtt: navigator.connection.rtt
                    };
                });
            }
        }

        if(options.tree || options.tree==undefined){
            // so JSX but it's arrays
            // setAttribute was used before, wasn't a good idea
            // append can happen directly now!
            window["tree"] = (definition, parent) => {
                const create = ([tag, props = {}, children = []]) => {
                    const el = document.createElement(tag);
                    Object.entries(props).forEach(([k, v]) => el.setAttribute(k,v));
                    let childrenArr = [];
                    if(typeof childern === 'string'){
                        childrenArr = [children];
                    }else{
                        childrenArr = [...(children || [])];
                    }
                    childrenArr.forEach(child => {
                        // now, child, what are you? 
                        if (Array.isArray(child)) {
                            el.appendChild(create(child));
                        } else if (child instanceof Node) {
                            el.appendChild(child);
                        } else {
                            el.appendChild(document.createTextNode(child));
                        }
                    });
                    return el;
                };

                const defs = Array.isArray(definition[0]) ? definition : [definition];
                const elements = defs.map(create);
                // for being nice:
                if (parent) elements.forEach(el => parent.appendChild(el));
                return elements;
            }
        }

        if(options.stores || options.stores==undefined){
            
            // creating stores
            // and then triggering them
            // used for state stuff ig
            // i don't really use it tho that much
            // since i use global variables a lot
            // but for gamestate management 
            // it's GOLD
            window.createStore = (init) => {
                function deepProxy(value, path=[]){
                    if(typeof value !== "object" || value === null) return value;
                    for(let i of Object.keys(value)){
                        value[i] = deepProxy(value[i], path.concat([i]));
                    }
                    
                    let listeners = {};
                    return new Proxy(value, {
                        get(target, prop, receiver){
                            if(prop=='when'){
                                return function(wprop){
                                    return{
                                        tell(listener){
                                            if(!Object.keys(listeners).includes(wprop)){
                                                listeners[wprop] = [];
                                            }
                                            listeners[wprop].push(listener);
                                        }
                                    }
                                }
                            }
                            let t = typeof(prop)=='string' || Number(prop);
                            if(!prop.includes('.') && !isNaN(t)){
                                //is array index-like
                                if(Array.isArray(target) && t < 0){
                                    return target[target.length + t];
                                }
                                return target[t];
                            }
                            return Reflect.get(target, prop, receiver);
                        },
                        set(target, prop, val, receiver){
                            if(typeof val === 'object' && val !== null){
                                val = deepProxy(val, path.concat([prop]));
                            }
                            if(Object.keys(listeners).includes('*')){
                                listeners['*'].forEach(e=>{
                                    e(prop, val, target);
                                })
                            }
                            if(Object.keys(listeners).includes(prop)){
                                listeners[prop].forEach(e=>{
                                    e(val, target);
                                })
                            }
                            let t = typeof(prop)=='string' || Number(prop);
                            if(!prop.includes('.') && !isNaN(t)){
                                if(Array.isArray(target) && t < 0){
                                    target[target.length + t] = val;
                                    return true;
                                }
                                target[t] = val;
                                return true;
                            }
                            return Reflect.set(target, prop, val, receiver);
                        },
                        has(target, prop) {
                            let t = typeof(prop)=='string' || Number(prop);
                            if (!prop.includes('.') && !isNaN(t)) {
                                
                                if (Array.isArray(target)) {
                                    return t >= -target.length && t < target.length;
                                }
                                
                                return t in target;
                            }
                            
                            return Reflect.has(target, prop);
                        }
                    })
                }
                return deepProxy(init);
            }
        }

        if(options.async || options.async==undefined){
            //yay
            context["wait"] = function(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            };

            // Wait until a specific time idk this seemed useful
            context["waitUntil"] = function(targetTime) {
                const target = targetTime instanceof Date ? targetTime.getTime() : targetTime;
                const now = Date.now();
                return context.wait(Math.max(0, target - now));
            };

            // oooooo finally none of my setTimeout(()=>{}) hacks
            context["waitFrame"] = function() {
                return new Promise(resolve => 
                    setTimeout(resolve, 0)
                );
            };

            // retry with the time thing that gmail uses
            // exponetial backoff it's called
            context["retry"] = async function(action, { 
                retries = 3, 
                delay = 1000, 
                backoff = 2,
                shouldRetry = () => true 
            } = {}) {
                for (let attempt = 1; attempt <= retries + 1; attempt++) {
                    try {
                        return await action();
                    } catch (error) {
                        if (attempt > retries || !shouldRetry(error)) throw error;
                        
                        const waitTime = delay * Math.pow(backoff, attempt - 1);
                        await context.wait(waitTime);
                    }
                }
            };

            // parallel execution! and you can define threadcount
            context["parallel"] = async function(tasks, { concurrency = 5 } = {}) {
                const results = [];
                const executing = new Set();

                for (const [i, task] of tasks.entries()) {
                    if (executing.size >= concurrency) {
                        await Promise.race(executing);
                    }

                    const p = Promise.resolve().then(() => task());
                    executing.add(p);
                    p.then(() => executing.delete(p));
                    
                    results[i] = p;
                }

                return Promise.all(results);
            };

            // one by one
            // through fun reduce functions
            context["sequence"] = function(tasks) {
                return tasks.reduce((promise, task) => 
                    promise.then(prevResults => 
                        task().then(result => [...prevResults, result])
                    ), 
                    Promise.resolve([])
                );
            };
        }
    }
}

const tianfeng = tf;



/* FireWyvern (fw)
 * Test and Mocks
 * See Docs for usage notes
 */


const firewyrm = (function() {
    // setup local variables
    const queue = [];
    let isProcessing = false;
    let currentSection = null;
    let testCount = 0;
    let passCount = 0;
    const logs = [];
    let sectionLogs = [];
    let sectionTestCount = 0;
    let sectionPassCount = 0;
    let onProgressCallback = null;
    let runningTest = false;
    let mocks = [];

    //add task to queue
    const enqueue = (task) => {
        queue.push(task);
        if (!isProcessing) processQueue();
    };

    // process the queue
    const processQueue = async () => {
        if (isProcessing) return;
        isProcessing = true;
        
        while (queue.length > 0) {
            const task = queue.shift();
            await task();
        }
        
        isProcessing = false;
    };

    // log messages
    const log = (message) => {
        const output = message.replace(/\n/g, '\n  ');
        
        // Buffer the logs for ordered output
        if (currentSection) {
            sectionLogs.push(`  ${output}`);
        } else {
            logs.push(output);
        }

    };

    // render a section
    const flushSection = () => {
        if (currentSection && sectionLogs.length > 0) {
            logs.push(`\n‎===‎ ${currentSection} ‎===`);
            logs.push(...sectionLogs);
            logs.push(`SECTION RESULTS: ${sectionPassCount}/${sectionTestCount} passed`);
            logs.push(sectionPassCount==sectionTestCount? '‎ ‎✅ Passed' : '‎ ‎❌ Failed');
            sectionLogs = [];
            sectionTestCount = 0;
            sectionPassCount = 0;
            currentSection = null;
        }
    };

    // create a test
    const createTest = (statement, testFunc) => {
        return async () => {
            const testNumber = ++testCount;
            const sectionNumber = sectionTestCount++;
            const prefix = currentSection ? `${currentSection} ${sectionNumber}` : `Test ${testNumber}`;
            
            log(`‎ ${prefix}: ${statement || 'unnamed test'}`);
            
            try {
                const result = await (typeof testFunc === 'function' ? testFunc() : testFunc);
                const success = !!result;
                if (success) {
                    passCount++;
                    sectionPassCount++;
                }
                log(success ? '‎ ‎ ✅ Passed' : '‎ ‎ ❌ Failed');
                return success;
            } catch (error) {
                log(`‎ ‎ ❌ Failed: ${error.message}`);
                return false;
            }
        };
    };

    // create an assertion
    const createAssertion = (statement, testValue, runningTest) => {
        // define assertion system
        const assertion = (assertionFn) => {
            const test = async () => {
                try {
                    const value = await (typeof testValue === 'function' ? testValue() : testValue);
                    return await assertionFn(value);
                } catch (error) {
                    log(`‎ ‎ ❌ Assertion error: ${error.message}`);
                    return false;
                }
            };

            enqueue(createTest(statement, test));
            if(!runningTest){
                fw.end(false);
            }

            return fw;
        };

        // return a list of valid assertions to chain
        return {
            closeTo: (expected) => assertion(async (v) => v == expected),
            is: (expected) => assertion(async (v) => v === expected),
            isFalsey: () => assertion(async (v) => !v),
            isTruthy: () => assertion(async (v) => !!v),
            throws: () => assertion(async (fn) => {
                if (typeof fn !== 'function') return false;
                try { await fn(); return false; } 
                catch { return true; }
            }),
            throwsWith: (...args) => assertion(async (fn) => {
                if (typeof fn !== 'function') return false;
                try { await fn(...args); return false; } 
                catch { return true; }
            }),
            contains: (expected) => assertion(async (v) => {
                if (!v || !v.includes) throw new Error('Value is not containable');
                return v.includes(expected);
            }),
            isNull: () => assertion(async (v) => v === null),
            isUndefined: () => assertion(async (v) => v === undefined),
            isDefined: () => assertion(async (v) => v !== undefined),
            isNaN: () => assertion(async (v) => isNaN(v)),
            isNumber: () => assertion(async (v) => typeof v === 'number'),
            isString: () => assertion(async (v) => typeof v === 'string'),
            isBool: () => assertion(async (v) => typeof v === 'boolean'),
            greaterThan: (expected) => assertion(async (v) => v > expected),
            greaterThanOrEqual: (expected) => assertion(async (v) => v >= expected),
            lessThan: (expected) => assertion(async (v) => v < expected),
            lessThanOrEqual: (expected) => assertion(async (v) => v <= expected),
            between: (min, max) => assertion(async (v) => v >= min && v <= max),
            isInstanceOf: (expected) => assertion(async (v) => v instanceof expected),
            hasProperty: (prop) => assertion(async (v) => v != null && prop in v),
            hasLength: (expected) => assertion(async (v) => v?.length === expected),
            matches: (regex) => assertion(async (v) => regex.test(v)),
            isArray: () => assertion(async (v) => Array.isArray(v)),
            isObject: () => assertion(async (v) => typeof v === 'object' && v !== null && !Array.isArray(v)),
            isEmpty: () => assertion(async (v) => {
                if (v == null) return true;
                if (Array.isArray(v)) return v.length === 0;
                if (typeof v === 'object') return Object.keys(v).length === 0;
                if (typeof v === 'string') return v.length === 0;
                return false;
            }),
            isFunction: () => assertion(async (v) => typeof v === 'function'),
            deepEquals: (expected) => assertion(async (v) => JSON.stringify(v) === JSON.stringify(expected)),
            resolvesTo: (expected) => assertion(async (promise) => {
                const result = await promise;
                return result === expected;
            }),
            failsWith: (expectedError) => assertion(async (promise) => {
                try {
                    await promise;
                    return false;
                } catch (err) {
                    return err instanceof expectedError;
                }
            }),
            isDate: () => assertion(async (v) => v instanceof Date),
            isEven: () => assertion(async (v) => typeof v === 'number' && v % 2 === 0),
            isOdd: () => assertion(async (v) => typeof v === 'number' && v % 2 !== 0),
            isPositive: () => assertion(async (v) => typeof v === 'number' && v > 0),
            isNegative: () => assertion(async (v) => typeof v === 'number' && v < 0),
            isInteger: () => assertion(async (v) => Number.isInteger(v)),
            isFinite: () => assertion(async (v) => Number.isFinite(v)),
            isSymbol: () => assertion(async (v) => typeof v === 'symbol'),
            isPromise: () => assertion(async (v) => v != null && typeof v.then === 'function'),
            isRegExp: () => assertion(async (v) => v instanceof RegExp)
        };
    };


    // mock something
    function mock(fn){
        const mock = {
            fn: fn || (()=>{}),
            obj: undefined,
            prop: undefined,
            original: undefined
        }
        mocks.push(mock);

        return {
            replace(obj, prop){
                mock.obj = obj;
                mock.prop = prop;
                mock.original = obj[prop];
                obj[prop] = mock.fn;
                return mock;
            }
        }

    }

    // restore a mock
    mock.restore = function(select = undefined){
        for(mock of mocks){
            if(select!=undefined && mock.prop!=select) continue;
            mock.obj[mock.prop] = mock.original;
        }
        mocks = [];
    }

    //main fw functions to IIFE
    return {
        loggingfunc: console.log,
        // start firewyrm (fw.start())
        start() {
            this.runningTest = true;
            enqueue(() => {
                logs.push('🔥🐲 FIREWYRM TESTING 🔥🐲');
                logs.push('==========================\n')
            });
            return this
        },


        
        // create a section (fw.section("name"))
        section(name) {
            enqueue(() => {
                flushSection();
                currentSection = name;
                sectionTestCount = 0;
                sectionPassCount = 0;
            });
            return this;
        },

        mock, //mocks (fw.mock(()=>{}}).replace(window, fetch))

        // test (fw.test('Is this true?', ()=>true))
        test(statement, testFunc) {
            enqueue(createTest(statement, testFunc));
            if(!this.runningTest){
                fw.end(false);
            }
            return this;
        },

        // assert (fw.assert('Math Operations', ()=>double(2)).is(4))
        assert(statement, testValue) {
            return createAssertion(statement, testValue, this.runningTest);
        },

        // end, run tests, and log output
        end(verbose=true) {
            return new Promise(resolve => {
                enqueue(async () => {
                    flushSection();
                    
                    // Add progress reporting
                    const reportProgress = (message) => {
                        if (onProgressCallback && typeof onProgressCallback === 'function') {
                            onProgressCallback(message);
                        }
                    };
                    if(verbose){
                        reportProgress('\n=== FINAL RESULTS ===');
                        logs.push('\n=== FINAL RESULTS ===');
                        
                        reportProgress(`Total tests: ${testCount}`);
                        logs.push(`Total tests: ${testCount}`);
                        
                        reportProgress(`Passed: ${passCount}`);
                        logs.push(`Passed: ${passCount}`);
                        
                        reportProgress(`Failed: ${testCount - passCount}`);
                        logs.push(`Failed: ${testCount - passCount}`);
                    }
                    // Output all logs in order
                    for (const message of logs) {

                        this.loggingfunc(message);
                    }
                    
                    // Reset state
                    logs.length = 0;
                    testCount = 0;
                    passCount = 0;
                    this.runningTest = false;

                    reportProgress('Testing complete');
                    resolve();
                });
            });
        },

        onprogress: null,  // This will be set by ppl
        set onprogress(callback) {
            onProgressCallback = callback;
        },
        get onprogress() {
            return onProgressCallback;
        }
    };
})();

const fw = firewyrm;


// Universal export setup
if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    // CommonJS/Node.js environment
    module.exports = {
        firewyrm,
        fw  // Export both names as properties
    };
}
else if (typeof define === 'function' && define.amd) {
    // AMD/RequireJS environment
    define([], () => ({ firewyrm, fw }));
}
else if (typeof window !== 'undefined') {
    // Browser global environment
    window.firewyrm = firewyrm;
    window.fw = fw; // Expose the shorthand alias
}


// Universal export setup
if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    // CommonJS/Node.js environment
    module.exports = {
        firewyrm,
        fw  // Export both names as properties
    };
}
else if (typeof define === 'function' && define.amd) {
    // AMD/RequireJS environment
    define([], () => ({ firewyrm, fw }));
}
else if (typeof window !== 'undefined') {
    // Browser global environment
    window.firewyrm = firewyrm;
    window.fw = fw; // Expose the shorthand alias
}


// Universal export setup
if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    // CommonJS/Node.js environment
    module.exports = {
        tianfeng,
        tf,
        shuihu,
        sh,
        firewyrm,
        fw,
        diwu,
        dw
    };
}
else if (typeof define === 'function' && define.amd) {
    // AMD/RequireJS environment
    define([], () => ({ tianfeng, tf, shuihu, sh, firewyrm, fw, diwu, dw }));
}
else if (typeof window !== 'undefined') {
    // Browser global environment
    window.tianfeng = tianfeng;
    window.tf = tf; // Expose the shorthand alias
    window.shuihu = shuihu;
    window.sh = sh;
    window.firewyrm = firewyrm;
    window.fw = fw;
    window.diwu = diwu;
    window.dw = dw; 
}