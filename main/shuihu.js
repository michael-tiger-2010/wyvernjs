
/* ShuiHu (sh)
 * Logging and Timing
 * Check docs for how to use
 */


// btw shuihu means water-tiger, which is diametric to firewyvern

window.shuihu = window.sh = (function(){
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
    time = new Proxy({},{
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
        outputLogs(label, serialize, lastAmount){
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
