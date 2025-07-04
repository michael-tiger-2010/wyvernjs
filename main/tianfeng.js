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
            

            context.createStore = (init) => {
                let listeners = {};
                function deepProxy(value, path=[]){
                    if(typeof value !== "object" || value === null) return value;
                    for(let i of Object.keys(value)){
                        value[i] = deepProxy(value[i], path.concat([i]));
                    }
                    
                    return new Proxy(value,{
                        get(target, prop, receiver){
                            if(prop=='when'){
                                return function(wprop='*'){
                                    return{
                                        tell(listener){
                                            wprop = `${path.concat(['']).join('.')}${wprop}`;
                                            if(!Object.keys(listeners).includes(wprop)){
                                                listeners[wprop] = [];
                                            }
                                            listeners[wprop].push(listener);
                                        }
                                    }
                                }
                            }
                            // Handle Symbol.iterator for arrays
                            if (Array.isArray(target) && prop === Symbol.iterator) {
                                return target[Symbol.iterator].bind(target);
                            }
                            
                            // Handle array methods
                            if (Array.isArray(target) && typeof prop !== 'symbol') {
                                const index = Number(prop);
                                if (!isNaN(index)) {
                                    return index >= -target.length && index < target.length 
                                        ? target[index]
                                        : undefined;
                                }
                            }
                            
                            // Default behavior
                            return Reflect.get(target, prop, receiver);
                        },
                        set(target, prop, val, receiver){
                            if(typeof val === 'object' && val !== null){
                                val = deepProxy(val, path.concat([prop]));
                            }
                            setTimeout(()=>{
                                let full = path.concat([prop]);
                                for(let i = 0; i < full.length; i++){
                                    let wildCard = full.slice(0,i).concat(['*']).join('.');
                                    if(Object.keys(listeners).includes(wildCard)){
                                        listeners[wildCard].forEach(e=>{
                                            e(prop, val, target);
                                        })
                                    }
                                    let propAdr = full.slice(0,i+1).join('.');
                                    if(Object.keys(listeners).includes(propAdr)){
                                        listeners[propAdr].forEach(e=>{
                                            e(val, target);
                                        })
                                    }
                                }
                            }, 0)
                            let t = typeof(prop)==='string'?Number(prop):prop;
                            if(typeof prop === 'string' && !prop.includes('.') && !isNaN(t)){
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
                            let t = typeof(prop)==='string'?Number(prop):prop;
                            if (typeof prop === 'string' && !prop.includes('.') && !isNaN(t)) {
                                
                                if (Array.isArray(target)) {
                                    return t >= -target.length && t < target.length;
                                }
                                
                                return t in target;
                            }
                            
                            return Reflect.has(target, prop);
                        }
                    })
                }
                let proxiedStore = deepProxy(init);

                return proxiedStore;
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



// Universal export setup
if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    // CommonJS/Node.js environment
    module.exports = {
        tianfeng,
        tf
    };
}
else if (typeof define === 'function' && define.amd) {
    // AMD/RequireJS environment
    define([], () => ({ tianfeng, tf }));
}
else if (typeof window !== 'undefined') {
    // Browser global environment
    window.tianfeng = tianfeng;
    window.tf = tf; // Expose the shorthand alias
}
