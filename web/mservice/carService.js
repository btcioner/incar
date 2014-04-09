/**
 * Created by Jesse Qu on 3/23/14.
 */

'use strict';

exports = module.exports = function(service) {
    service.get.carData = carData;
}

function carData(req, res) {
    res.send('hello world!');
}
