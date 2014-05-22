/**
 * Created by zhoupeng on 14-5-15.
 */


'use strict';



exports = module.exports = function(service) {
    service.post.getOpenid = getOpenid;
}

function getOpenid(req, res) {
    var postData = req.body;
    var code=postData.code;
    var myurl=postData.url;

    var http=require('./nodegrass');
    http.get(myurl, function(data) {

             console.log(data);
            //process.stdout.write(d);
               res.send(data);
        });
    }




