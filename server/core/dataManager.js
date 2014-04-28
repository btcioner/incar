/**
 * Created by LM on 14-3-10.
 */
var convert=require('iconv-lite');
var myDataBuffer;
var myOffset=0;
exports.init=function(inBuffer,inOffset){
    if (Buffer.isBuffer(inBuffer))
        myDataBuffer=inBuffer;
    else
        myDataBuffer = new Buffer(inBuffer);
    myOffset=inOffset;
    return myDataBuffer;
};
exports.writeByte=function(data){
    myDataBuffer.writeUInt8(data,myOffset);
    myOffset+=1;
};
exports.writeWord=function(data){
    myDataBuffer.writeUInt16BE(data,myOffset);
    myOffset+=2;
};
exports.writeShort=function(data){
    myDataBuffer.writeInt16BE(data,myOffset);
    myOffset+=2;
};
exports.writeLong=function(data){
    myDataBuffer.writeInt32BE(data,myOffset);
    myOffset+=4;
};
exports.writeDoubleWord=function(data){
    myDataBuffer.writeUInt32BE(data,myOffset);
    myOffset+=4;
};
exports.writeString=function(str){
    var gbkStr=convert.encode(str,"gbk");
    for(var i=0;i<gbkStr.length;i++){
        myDataBuffer.writeUInt8(gbkStr.readUInt8(i),myOffset);
        myOffset+=1;
    }
    myDataBuffer.writeUInt8(0x00,myOffset);
    myOffset+=1;
};
exports.nextByte=function(){
    var content= myDataBuffer.readUInt8(myOffset);
    myOffset+=1;
    return content;
};
exports.nextWord=function(){
    var content= myDataBuffer.readUInt16BE(myOffset);
    myOffset+=2;
    return content;
};
exports.nextShort=function(){
    var content= myDataBuffer.readInt16BE(myOffset);
    myOffset+=2;
    return content;
};
exports.nextLong=function(){
    var content= myDataBuffer.readInt32BE(myOffset);
    myOffset+=4;
    return content;
};
exports.nextDoubleWord=function(){
    var content= myDataBuffer.readUInt32BE(myOffset);
    myOffset+=4;
    return content;
};
exports.nextString=function(){
    var strOffset=myOffset;
    while(strOffset<myDataBuffer.length){
        if(myDataBuffer.readUInt8(strOffset)===0x00){
            var content=  convert.decode(myDataBuffer.slice(myOffset,strOffset),"gbk");
            myOffset=strOffset+1;
            return content;
        }else{
            strOffset+=1;
        }
    }
    return null;
};
exports.getBuffer=function(){
    return myDataBuffer.slice(0,myOffset);
};
exports.getOffset=function(){
    return myOffset
};
exports.setOffset=function(ofs){
    myOffset=ofs;
};
exports.toString0X=function(dataBuffer){
    var dataString="";
    for(var i=0;i<dataBuffer.length;i++){
        var intVal=dataBuffer.readUInt8(i);
        if(intVal<0x10){
            dataString+="0"+intVal+" ";
        }
        else{
            dataString+=intVal.toString(16).toUpperCase()+" ";
        }
    }
    return dataString;
};