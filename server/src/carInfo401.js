/**
 * Created by LM on 14-5-16.
 */
var byteCmd=[0xFE01,0xFE04,0xFE16,0xFE17,0xFE19];
var wordCmd=[0xFE06,0xFE08,0xFE0A,0xFE0C,0xFE0D,0xFE0E,0xFE0F,0xFE11,0xFE12,0xFE1A];
var longCmd=[0xFE03,0xFE14];
exports=module.exports=function(dataManager){
    var getValueByID=function(id){
        if(wordCmd.indexOf(id)>=0){
            return dataManager.nextWord();
        }
        if(byteCmd.indexOf(id)>=0){
            return dataManager.nextByte();
        }
        if(longCmd.indexOf(id)>=0){
            return dataManager.nextLong();
        }
        if(id===0xFE00){
            var faultCode=[];
            var fcCount=dataManager.nextByte();               //故障码个数
            for(var i=0;i<fcCount;i++){
                var code=dataManager.nextString();             //故障码
                var status=dataManager.nextString();           //故障码属性
                var desc=dataManager.nextString();             //故障码描述
                faultCode.push({code:code,status:status,desc:desc});
            }
            return faultCode;
        }
        if(id===0xFE10){
            var interval=[];
            for(i=0;i<dataManager.nextByte();i++){
                interval.push(dataManager.nextWord());
            }
            return interval;
        }
        if(id===0xFE15){
            var voltage=[];
            for(i=0;i<dataManager.nextWord();i++){
                voltage.push(dataManager.nextByte());
            }
            return voltage;
        }
        return dataManager.nextString();
    };
    var setValueByID=function(id,value){
        if(id<0xFE03||id==0xFE13||id==0xFE14||id>0xFE1A)return;

        if(wordCmd.indexOf(id)>=0){
            dataManager.writeWord(value);
            return;
        }
        if(byteCmd.indexOf(id)>=0){

            dataManager.writeByte(value);
            return;
        }
        if(longCmd.indexOf(id)>=0){
            dataManager.writeLong(value);
            return;
        }
        if(id===0xFE10){
            dataManager.writeByte(value.length);
            for(var i=0;i<value.length;i++){
                dataManager.writeWord(value[i]);
            }
            return;
        }
        if(id===0xFE15){
            dataManager.writeWord(value.length);
            for(i=0;i<value.length;i++){
                dataManager.writeByte(value[i]);
            }
            return;
        }
        dataManager.writeString(value);
    };
};
