/**
 * Created by Jesse Qu on 3/19/14.
 */
'use strict';

var weixin = require('./weixin');
weixin.API = require('./common');
weixin.OAuth = require('./oauth');
weixin.TickTasks = require('./util').TickTasks;

exports = module.exports = weixin;



