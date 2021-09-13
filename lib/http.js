"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createProxyController(manager) {
  var c = new ProxyController(manager.query, manager.exec, manager.execBatch);
  return c;
}
exports.createProxyController = createProxyController;
var ProxyController = (function () {
  function ProxyController(queryFn, execFn, execBatchFn, log) {
    this.queryFn = queryFn;
    this.execFn = execFn;
    this.execBatchFn = execBatchFn;
    this.log = log;
    this.query = this.query.bind(this);
    this.exec = this.exec.bind(this);
    this.execBatch = this.execBatch.bind(this);
  }
  ProxyController.prototype.query = function (req, res) {
    var _this = this;
    var s = req.body;
    if (Array.isArray(s)) {
      res.status(400).end('The request body cannot be an array');
    }
    else {
      var p = parseDate(s.params, s.dates);
      this.queryFn(s.query, p).then(function (r) {
        res.status(200).json(r);
      }).catch(function (err) { return handleError(err, res, _this.log); });
    }
  };
  ProxyController.prototype.exec = function (req, res) {
    var _this = this;
    var s = req.body;
    if (Array.isArray(s)) {
      res.status(400).end('The request body cannot be an array');
    }
    else {
      var p = parseDate(s.params, s.dates);
      this.execFn(s.query, p).then(function (r) {
        res.status(200).json(r);
      }).catch(function (err) { return handleError(err, res, _this.log); });
    }
  };
  ProxyController.prototype.execBatch = function (req, res) {
    var _this = this;
    var j = req.body;
    if (!Array.isArray(j)) {
      res.status(400).end('The request body must be an array');
    }
    else {
      var s = [];
      for (var _i = 0, j_1 = j; _i < j_1.length; _i++) {
        var x = j_1[_i];
        var p = parseDate(x.params, x.dates);
        var y = { query: x.query, params: p };
        s.push(y);
      }
      var field = req.query['master'];
      var master = false;
      if (field && field.toString() === 'master') {
        master = true;
      }
      this.execBatchFn(s, master).then(function (r) {
        res.status(200).json(r);
      }).catch(function (err) { return handleError(err, res, _this.log); });
    }
  };
  return ProxyController;
}());
exports.ProxyController = ProxyController;
function handleError(err, res, log) {
  var x = (typeof err === 'string' ? err : JSON.stringify(err));
  if (log) {
    log(x);
    res.status(500).end('Internal Server Error');
  }
  else {
    res.status(500).json(x).end();
  }
}
exports.handleError = handleError;
function parseDate(args, dates) {
  if (!args || !dates || args.length === 0 || dates.length === 0) {
    return args;
  }
  var l = args.length;
  var l2 = dates.length;
  for (var i = 0; i < l2; i++) {
    var j = dates[i];
    if (j >= l) {
      break;
    }
    var x = args[j];
    if (x) {
      var d = new Date(x);
      if (!(!(d instanceof Date) || d.toString() === 'Invalid Date')) {
        args[j] = d;
      }
    }
  }
  return args;
}
exports.parseDate = parseDate;
