/* FireWyvern (fw)
 * Test and Mocks
 * See Docs for usage notes
 */


window.firewyrm = window.fw = (function() {
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
    mock.restore = function(){
        for(mock of mocks){
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

