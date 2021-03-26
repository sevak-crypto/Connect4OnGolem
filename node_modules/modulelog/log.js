var util = require('util'),
    debugContexts = new WeakMap(),
    noop = function() {},
    DiscardLogger = {
        info: noop,
        debug: noop,
        warn: noop,
        error: noop
    },
    DebugLogger = {
        getLoggerForContext: function(ctx) {
            return debugContexts.get(ctx);
        }
    };

function wrapDebug(debug) {
    var callDebug = function(prefix) {
        return function() {
            debug.apply(null, [prefix].concat(Array.prototype.slice.call(arguments)));
        };
    };
    return {
        info: callDebug('LOG:'),
        debug: callDebug('DEBUG:'),
        warn: callDebug('WARN:'),
        error: callDebug('ERROR:')
    };
}

function Logger(logClass) {
    if (typeof logClass !== 'object' && typeof logClass !== 'function') {
        throw new Error('Invalid logging class passed');
    }
    this.backer = logClass;
    this.level = '';
}

// this is pretty ghetto but we want to make sure that every module has the
// same instance
function setInstance(inst) {
    if (typeof global !== 'undefined') {
        global.MODULELOG_INST = inst;
    } else {
        MODULELOG_INST = inst;
    }
}
function getInstance() {
    var inst;
    if (typeof global !== 'undefined') {
        inst = global.MODULELOG_INST;
    } else if (typeof MODULELOG_INST == 'undefined') {
        inst = MODULELOG_INST;
    }
    if (!inst) {
        inst = new Logger(DiscardLogger);
        setInstance(inst);
    }
    return inst;
}

Logger.prototype.log = function(ctx, type, args) {
    //allow ctx to be optional
    if (arguments.length < 3 && typeof ctx === 'string') {
        args = type;
        type = ctx;
    }
    var backer = this.backer;
    if (typeof backer.getLoggerForContext === 'function') {
        backer = backer.getLoggerForContext(ctx);
    }
    if (!backer || backer[type] === undefined) {
        return false;
    }
    backer[type].apply(this.backer, args);
    return true;
};

Logger.prototype.exit = function() {
    if (typeof process !== 'undefined' && typeof process.exit === 'function') {
        process.exit(1);
    }
};

Logger.prototype.setLevel = function(level) {
    this.level = level;
    if (typeof this.backer.setLevel !== 'function') {
        return;
    }
    this.backer.setLevel(level);
};

function ModuleLogger(name) {
    if (!(this instanceof ModuleLogger)) {
        return new ModuleLogger(name);
    }
    this.name = name;
    debugContexts.set(this, wrapDebug(util.debuglog(name)));
}

ModuleLogger.setClass = ModuleLogger.prototype.setClass = function(name) {
    var inst = DiscardLogger;
    if (name === 'console') {
        inst = console;
    } else if (name === 'default' || name === 'debuglog' || name === undefined) {
        inst = DebugLogger;
    } else if (typeof name === 'object' || typeof name === 'function') {
        inst = name;
    } else if (name !== '' && name !== 'discard') {
        inst = require(name);
    }
    //see if its a class that we have to instantiate
    if (typeof inst === 'function' && inst.info === undefined && inst.error === undefined) {
        inst = new inst();
    }
    var oldInstance = getInstance();
    setInstance(new Logger(inst));
    //if they changed the log level then keep that same level
    if (oldInstance.level !== '') {
        getInstance().setLevel(oldInstance.level);
    }
};

ModuleLogger.setLevel = ModuleLogger.prototype.setLevel = function(level) {
    getInstance().setLevel(level);
};

ModuleLogger.prototype.debug = function() {
    getInstance().log(this, 'debug', Array.prototype.slice.call(arguments));
};

ModuleLogger.prototype.info = ModuleLogger.prototype.log = function() {
    if (!getInstance().log(this, 'info', Array.prototype.slice.call(arguments))) {
        getInstance().log(this, 'log', Array.prototype.slice.call(arguments));
    }
};

ModuleLogger.prototype.warn = function() {
    getInstance().log(this, 'warn', Array.prototype.slice.call(arguments));
};

ModuleLogger.prototype.error = function() {
    getInstance().log(this, 'error', Array.prototype.slice.call(arguments));
};

ModuleLogger.prototype.fatal = function() {
    if (!getInstance().log(this, 'fatal', Array.prototype.slice.call(arguments))) {
        getInstance().log(this, 'error', Array.prototype.slice.call(arguments));
    }
    getInstance().exit();
};

ModuleLogger.prototype.new = function(name) {
    return new ModuleLogger(name);
};

module.exports = ModuleLogger;
