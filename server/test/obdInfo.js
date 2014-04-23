/**
 * Created by LM on 14-2-27.
 */
//OBD基本信息
var obdCode;            //OBD设备号
var vin;                //vin码(车辆身份证)
var hardwareVersion;    //硬件版本号
var firmwareVersion;    //固件版本号
var softwareVersion;    //软件版本号
var diagnosisType;      //诊断类型
var initCode;           //恢复出厂设置序列号
var isCodeClear;        //是否清码
var brand;              //品牌
var series;             //系列
var modelYear;          //年款
var addressParam;       //获取参数数据地址
var portParam;          //获取参数数据端口
var addressUpload;      //主动上传数据地址
var portUpload;         //主动上传数据端口
var addressAlarm;       //报警数据上传地址
var portAlarm;          //报警数据上传端口
var addressMessage;     //短信回复数据地址
var portMessage;        //短信回复数据端口
var criticalVoltage;    //关机临界电压
var uploadInterval;     //行驶中上传数据间隔时间
var voltageThreshold=[];//熄火后电池电压阀值
var closeAfterFlameOut; //熄火后关闭时间点
var updateId;           //软件升级ID
var createTime;         //创建日期
var lastUpdateTime;     //最后更新日期
//OBD行车信息(从发动机打火到熄火这段时间称之为一次驾驶)
//var obdCode;          //OBD设备号
//var vin;              //vin码
//var brand;            //品牌
//var series;           //系列
//var modelYear;        //年款
var firingVoltage;      //点火电压
var runTime;            //发动机运行时间
var currentMileage;     //行驶里程
var currentAvgOilUsed;  //本次驾驶平均油耗
var speedingTime;       //超速行驶时间(>120km/h)
var speedUp;            //急加速次数
var speedDown;          //急减速次数
var sharpTurn;          //急转弯次数
var flameVoltage;       //熄火电压
var avgOilUsed;         //累计平均油耗
var mileage;            //累计行驶里程
var voltageAfter;       //熄火后电压
var carStatus;          //车辆当前状态(启动、行驶、熄火、完成、异常)12345
var fireTime;           //点火时间
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
//var vin;              //vin码
//var brand;            //品牌
//var series;           //系列
//var modelYear;        //年款
var alarmType;          //报警类型
var faultCode;          //故障码
var createTime;         //创建日期


var dao = require('./dao');
dao.initDB();
//dao.findBySql("select * from t_obd_info");