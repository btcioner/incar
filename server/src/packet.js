/**
 * Created by Jesse on 2/25/14.
 */

'use strict';
function toString0X(dataBuffer){
    var dataString="";
    for(var i=0;i<dataBuffer.length;i++){
        var intVal=dataBuffer.readUInt8(i);
        if(intVal<0x10){
            dataString+="0"+intVal.toString(16).toUpperCase()+" ";
        }
        else{
            dataString+=intVal.toString(16).toUpperCase()+" ";
        }
    }
    return dataString;
};
//通过数据包解析业务数据
exports.packetResolve=function(datagram){
    var dataBuffer = null;
    var offset = 0;

    if (Buffer.isBuffer(datagram))
        dataBuffer = datagram;
    else
        dataBuffer = new Buffer(datagram);

    if (dataBuffer.length < 0x0a){
        console.log("数据包长度过短...");
        return null;
    }
    var packetLeading = dataBuffer.readUInt16BE(offset);
    offset += 2;
    if (packetLeading !== 0xAA55){
        console.log('数据包头'+packetLeading+'未知...');
        return null;
    }
    var packetLength = dataBuffer.readUInt16BE(offset);
    offset += 2;
    var packetLenNot = dataBuffer.readUInt16BE(offset);
    offset += 2;
    if ((packetLength | packetLenNot) !== 0xFFFF){
        console.log("数据包长度验证失败...");
        return null;
    }

    var packetId = dataBuffer.readUInt8(offset);
    offset += 1;
    var version = dataBuffer.readUInt8(offset);
    //offset += 1;

    var checksum = 0;
    var byteValue = 0;
    for (var i = 2; i < packetLength; i++) {
        byteValue = dataBuffer.readUInt8(i);
        checksum += byteValue;
    }

    offset = packetLength;
    var checksumInPacket = dataBuffer.readUInt16BE(offset);
    if (checksum !== checksumInPacket){
        console.log("数据包校验和验证失败,计算值："+checksum+",数据值："+checksumInPacket);
        return null;
    }

    var content= dataBuffer.slice(8, packetLength);
    return {
        leading:packetLeading,
        length:packetLength,
        lengthNot:packetLenNot,
        packetId:packetId,
        version:version,
        content:content,
        checksumInPacket:checksumInPacket
    };
};
exports.packetBuild=function(datagram,version){
    var datagramBuffer = null;
    var offset = 0;

    if (Buffer.isBuffer(datagram))
        datagramBuffer = datagram;
    else
        datagramBuffer = new Buffer(datagram);

    var dataBuffer = new Buffer(datagramBuffer.length + 0x000A);

    dataBuffer.writeUInt16BE(0xAA55, offset);
    offset += 2;
    dataBuffer.writeUInt16BE(datagramBuffer.length + 0x0008, offset);
    offset += 2;
    dataBuffer.writeUInt16BE((0xFFFF - (datagramBuffer.length + 0x0008)), offset);
    offset += 2;
    dataBuffer.writeUInt8(0x00, offset);
    offset += 1;
    dataBuffer.writeUInt8(version, offset);
    offset += 1;

    datagramBuffer.copy(dataBuffer, offset);
    offset += datagramBuffer.length;

    var checksum = 0;
    var byteValue = 0;
    for (var i = 2; i < offset; i++) {
        byteValue = dataBuffer.readUInt8(i);
        checksum += byteValue;
    }
    dataBuffer.writeUInt16BE(checksum, offset);

    return dataBuffer;
};
/*

exports.getPayload = function(datagram) {
    var dataBuffer = null;
    var offset = 0;

    if (Buffer.isBuffer(datagram))
        dataBuffer = datagram;
    else
        dataBuffer = new Buffer(datagram);

    if (dataBuffer.length < 0x0a)
        return null;

    var packetLeading = dataBuffer.readUInt16BE(offset);
    offset += 2;
    if (packetLeading !== 0xAA55)
        return null;

    var packetLength = dataBuffer.readUInt16BE(offset);
    offset += 2;
    var packetLenNot = dataBuffer.readUInt16BE(offset);
    //offset += 2;
    if ((packetLength | packetLenNot) !== 0xFFFF)
        return null;

    var checksum = 0;
    var byteValue = 0;
    for (var i = 2; i < packetLength; i++) {
        byteValue = dataBuffer.readUInt8(i);
        checksum += byteValue;
    }

    offset = packetLength;
    var checksumInPacket = dataBuffer.readUInt16BE(offset);
    if (checksum !== checksumInPacket)
        return null;

    console.log(dataBuffer.slice(0, packetLength+2));
    console.log(toString0X(dataBuffer));
    return dataBuffer.slice(8, packetLength);
};
//通过业务数据构建数据包
exports.getPacket = function(datagram) {

    var datagramBuffer = null;
    var offset = 0;

    if (Buffer.isBuffer(datagram))
        datagramBuffer = datagram;
    else
        datagramBuffer = new Buffer(datagram);

    var dataBuffer = new Buffer(datagramBuffer.length + 0x000A);

    dataBuffer.writeUInt16BE(0xAA55, offset);
    offset += 2;
    dataBuffer.writeUInt16BE(datagramBuffer.length + 0x0008, offset);
    offset += 2;
    dataBuffer.writeUInt16BE((0xFFFF - (datagramBuffer.length + 0x0008)), offset);
    offset += 2;
    dataBuffer.writeUInt8(0x00, offset);
    offset += 1;
    dataBuffer.writeUInt8(0x02, offset);
    offset += 1;

    datagramBuffer.copy(dataBuffer, offset);
    offset += datagramBuffer.length;

    var checksum = 0;
    var byteValue = 0;
    for (var i = 2; i < offset; i++) {
        byteValue = dataBuffer.readUInt8(i);
        checksum += byteValue;
    }
    dataBuffer.writeUInt16BE(checksum, offset);

    return dataBuffer;
};
*/
