/**
 * Created by Jesse Qu on 3/19/14.
 */
'use strict';

var TickTasks = function (ticker) {
    this.ticker = ticker;
    this.tasks = [];
};

TickTasks.prototype.enqueueTask = function (task) {
    this.tasks.push(task);
};

TickTasks.prototype.taskTicker = function () {
    if (this.tasks.length === 0) {
        return;
    }
    var task = this.tasks.splice(0, 1)[0];
    var that = this;
    this.ticker(function(){
        task();
        that.taskTicker.bind(that)();
    });
};

exports.TickTasks = TickTasks;

/*!
 * 对返回结果的一层封装，如果遇见微信返回的错误，将返回一个错误
 * 参见：http://mp.weixin.qq.com/wiki/index.php?title=返回码说明
 */
exports.wrapper = function (callback) {
  return function (err, data, res) {
    if (err) {
      err.name = 'WeixinAPI' + err.name;
      return callback(err, data, res);
    }
    if (data.errcode) {
      err = new Error(data.errmsg);
      err.name = 'WeixinAPIError';
      return callback(err, data, res);
    }
    callback(null, data, res);
  };
};

/*!
 * 对提交参数一层封装，当POST JSON，并且结果也为JSON时使用
 */
exports.postJSON = function (data) {
  return {
    dataType: 'json',
    type: 'POST',
    data: data,
    headers: {
      'Content-Type': 'application/json'
    }
  };
};
