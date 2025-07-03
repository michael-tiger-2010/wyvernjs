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


// Universal export setup
if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    // CommonJS/Node.js environment
    module.exports = {
        diwu,
        dw  
    };
}
else if (typeof define === 'function' && define.amd) {
    // AMD/RequireJS environment
    define([], () => ({ diwu, dw }));
}
else if (typeof window !== 'undefined') {
    // Browser global environment
    window.diwu = diwu;
    window.dw = dw; 
}

