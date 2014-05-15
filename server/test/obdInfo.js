/**
 * Created by LM on 14-2-27.
 */
//OBD基本信息
//-----基本信息
var obdCode;            //OBD设备号
var tripId;             //tripId
var vin;                //vin码(车辆身份证)
//-----模块信息
var hardwareVersion;    //硬件版本号
var firmwareVersion;    //固件版本号
var softwareVersion;    //软件版本号
var diagnosisType;      //诊断类型
//-----动作信息
var actionCount;        //执行动作数量(0x00或0x02)
var initCode;           //恢复出厂设置序列号
var isCodeClear;        //是否清码
//-----车辆信息
var carUpdateCount;     //车辆信息更新数量(0x00或0x05)
var vid;                //vid
var brand;              //品牌
var series;             //系列
var modelYear;          //年款
var engineDisplacement; //发动机排量
//-----上传数据网络配置
var serverConfigCount;  //网络参数更新数量(0x00-0x05)
var addressParam;       //获取参数数据地址
var portParam;          //获取参数数据端口
var addressUpload;      //主动上传数据地址
var portUpload;         //主动上传数据端口
var addressAlarm;       //报警数据上传地址
var portAlarm;          //报警数据上传端口
var addressMessage;     //短信回复数据地址
var portMessage;        //短信回复数据端口
var addressLocation;    //定位数据地址
var portLocation;       //定位数据端口
//-----定位信息
var locationCount;      //定位信息更新数量(0x00或0x03)
var metrePerLocation;   //每行驶多少米定位一次
var secondsPerLocation; //每过多少秒定位一次
var locationModel;      //定位模式/距离与时间的关系(0x00与关系，两者同时满足时定位;0x01或关系，两者有一个满足时定位)
//-----报警信息
var alarmCount;         //报警信息更新数量(0x00或0x04)
var overSpeed;          //超速临界值(单位km/h，超过此值被判定为超速，默认120km/h)
var overSpeedTime;      //超速持续时间(单位秒，超速持续多少秒时报警，默认6秒)
var waterTemperatureAlarm;//水温报警值(单位℃，默认110℃)
var voltageAlarm;       //报警电压(单位0.1V，默认132，即13.2V)
//-----熄火后信息
var fireOffCount;       //熄火后信息更新数量(0x00或0x03)
var criticalVoltage;    //关机临界电压
var closeAfterFlameOut; //熄火后关闭时间点
var voltageThreshold=[];//熄火后电池电压阀值
//-----运行中数据
var runtimeCount;       //运行中数据更新数量(0x00或0x02，暂时只支持0x00)
var uploadInterval;     //行驶中上传数据间隔时间
var uploadParamId=[];   //行驶中上传数据参数Id，参考4.01和4.02
//-----其他信息
var updateId;           //软件升级ID
var createTime;         //创建日期
var lastUpdateTime;     //最后更新日期

//OBD行车信息(从发动机打火到熄火这段时间称之为一次驾驶)
//-----OBD基本信息
//var obdCode;          //OBD设备号
//var tripId;           //tripId
//var vid;              //vid
//var vin;              //vin码
var receiveTime;        //接收数据时间
//--点火
var fireTime;           //点火时间
var firingVoltage;      //点火电压
//-----点火定位信息
var fireSpeed;          //点火车速
var fireTravelDistance; //点火时行驶距离
var fireLongitude;      //点火时经度
var fireLatitude;       //点火时纬度
var fireDirection;      //点火时方向
var fireLocationTime;   //点火时定位时间
var fireLocationType;   //点火时定位方式(1-基站定位,2-GPS定位)
//--熄火
//-----本次行程数据小计
var runTime;            //发动机运行时间
var currentMileage;     //本次驾驶行驶里程
var currentAvgOilUsed;  //本次驾驶平均油耗
var mileage;            //累计行驶里程
var avgOilUsed;         //累计平均油耗
//-----本行程车速分组统计
var speedGroup;         //本行程车速分组统计(JSON)
//-----驾驶习惯统计
var speedingTime;       //超速行驶时间
var speedUp;            //急加速次数
var speedDown;          //急减速次数
var sharpTurn;          //急转弯次数
var speedMax;           //最高车速
//-----熄火定位信息
var flameOutSpeed;          //熄火车速
var flameOutTravelDistance; //熄火时行驶距离
var flameOutLongitude;      //熄火时经度
var flameOutLatitude;       //熄火时纬度
var flameOutDirection;      //熄火时方向
var flameOutLocationTime;   //熄火时定位时间
var flameOutLocationType;   //熄火时定位方式(1-基站定位,2-GPS定位)
//--熄火后
var flameOutVoltage;        //熄火时蓄电池电压
//--其他
var carStatus;          //车辆当前状态(启动、行驶、熄火、完成、异常)12345
var flameOutTime;       //熄火时间

//OBD行车详细信息(存放行驶过程中车辆实时信息)
//var obdCode;          //OBD设备号
var obdDriveId;         //行驶编号(外键)
var faultCode;          //故障码
var avgOilUsed;         //累计平均油耗
var mileage;            //累计行驶里程
var carCondition;       //车况信息
var createTime;         //创建日期
//OBD报警信息
//var obdCode;          //OBD设备号
//var tripId;           //tripId
//var vid;              //vid
//var vin;              //vin码
var alarmType;          //报警类型
//--定位信息
var speed;              //车速
var travelDistance;     //行驶距离
var longitude;          //经度
var latitude;           //纬度
var direction;          //方向
var locationTime;       //定位时间
var locationType;       //定位方式(1-基站定位,2-GPS定位)
var faultInfo;          //故障信息
var createTime;         //创建日期


var dao = require('./dao');
dao.initDB();
//dao.findBySql("select * from t_obd_info");