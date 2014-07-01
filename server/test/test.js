'use strict';
var obd={engineDisplacement:4.08,engineType:'T'};
var edNum=Math.round(parseFloat(obd.engineDisplacement)*10)/10;
var ed=edNum.toString().split(".");
var edStr='0.0';
if(ed&&ed.length===1){
    edStr = ed[0]+".0";
}
else if(ed.length>1){
    edStr=edNum.toString();
}
console.log(edStr+obd.engineType);