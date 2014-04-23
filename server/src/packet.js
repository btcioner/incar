/**
 * Created by Jesse on 2/25/14.
 */

'use strict';
//通过数据包解析业务数据

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
