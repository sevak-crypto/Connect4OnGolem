var util = require('util'),
    requireReload = require('require-reload')(require),
    LLog = require('levenlabs-log'),
    Log = require('../log.js'),
    lastWrite = '',
    log, logNew;

LLog.instance = new LLog('info', {
    write: function(str) {
        lastWrite = str;
    }
});

util.debuglog = function(name) {
    return function(level, string) {
        lastWrite = [name, level, string].join(':');
    };
};

log = Log('modulelog');
logNew = Log('modulelog');

exports.discard = function(test) {
    var oldLog = console.log;
    console.log = function(string) {
        lastWrite = string;
    };
    log.setClass('discard');
    lastWrite = '';
    log.error('test');
    console.log = oldLog;
    test.equal(lastWrite, '');
    test.done();
};

exports.console = function(test) {
    var oldWarn = console.warn;
    console.warn = function(string) {
        lastWrite = string;
    };
    log.setClass('console');
    log.warn('testConsole1');
    test.equal(lastWrite, 'testConsole1');

    log.setClass(console);
    log.warn('testConsole2');
    test.equal(lastWrite, 'testConsole2');

    console.warn = oldWarn;
    test.done();
};

exports.require = function(test) {
    log.setClass('levenlabs-log');
    log.warn('testLLog1');
    test.ok(lastWrite.indexOf('WARN -- testLLog1') > -1);

    log.setClass('levenlabs-log');
    log.debug('testLLog2');
    test.ok(lastWrite.indexOf('WARN -- testLLog1') > -1);

    test.done();
};

exports.debug = function(test) {
    log.setClass('debuglog');
    log.warn('testDebug1');
    test.equal(lastWrite, 'modulelog:WARN::testDebug1');

    var log2 = log.new('modulelog2');
    log2.debug('testDebug2');
    test.equal(lastWrite, 'modulelog2:DEBUG::testDebug2');
    test.done();
};

exports.acrossModules = function(test) {
    log.setClass('levenlabs-log');
    lastWrite = '';
    logNew.setLevel('error');
    log.warn('testDebug1');
    test.equal(lastWrite, '');
    logNew.setLevel('warn');
    log.warn('testDebug1');
    test.notEqual(lastWrite, '');
    test.done();
};

exports.setClassStatic = function(test) {
    Log.setClass('debuglog');
    log.warn('testDebug3');
    test.equal(lastWrite, 'modulelog:WARN::testDebug3');

    var log2 = log.new('modulelog3');
    log2.debug('testDebug4');
    test.equal(lastWrite, 'modulelog3:DEBUG::testDebug4');
    Log.setClass('levenlabs-log');
    Log.setLevel('debug');
    lastWrite = '';
    log2.debug('testLLog3');
    test.ok(lastWrite.indexOf('DEBUG -- testLLog3') > -1);
    test.done();
};
