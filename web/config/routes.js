
'use strict';

var siteCommon = require('../sitecommon');
var msite = require('./msite');
var wsite = require('./wsite');
//var wsCar=require('../wservice/car');
var wsOBD=require('../wservice/obd');
var obdMessage=require('../wservice/obdMessage');
var wservice = require('../wservice/motor');
var mservice = require('../mservice/mservice');
var tagService=require('../tag/tag');
/** 
 *  Application routes
 */
module.exports = function(app) {
    //车辆相关
    /*app.get('/wservice/car', wsCar.list);
    app.get('/wservice/car/:id', wsCar.get);
    app.delete('/wservice/car/:id', wsCar.delete);
    app.post('/wservice/car', wsCar.add);
    app.put('/wservice/car/:id', wsCar.update);*/
    //OBD绑定/注册
    app.put('/wservice/obd/work/:channel', wsOBD.bindOBD);
    //短信
    app.post('/wservice/message/obdTestSend/:obdCode', obdMessage.obdTestSend);
    app.post('/wservice/message/obdTestReceive/:obdCode', obdMessage.obdTestReceive);

    // Routes for wsite service
    var authCheck = [wservice.CheckAuthority];
   // app.get('/wservice/hello', wservice.HelloAPI);
    app.post('/wservice/upload', wservice.UploadFile);
    app.post('/wservice/login', wservice.Login);
    app.get('/wservice/logout', wservice.Logout);

    app.get('/wservice/staff', authCheck, wservice.GetStaffInCar);

    app.get('/wservice/obd', authCheck, wservice.GetCarwith4S);
    app.post('/wservice/obd', authCheck, wservice.AddCarAsOBDOnly);
    app.get('/wservice/obd/:obd_code', authCheck, wservice.GetCarExtraByOBD);
    app.put('/wservice/obd/:obd_code', authCheck, wservice.ModifyCarByOBD);
    app.delete('/wservice/obd/:obd_code', authCheck, wservice.DeleteCarByOBD);

    app.get('/wservice/4s', authCheck, wservice.Get4S);
    app.post('/wservice/4s', authCheck, wservice.Add4S);
    app.get('/wservice/4s/:s4_id', authCheck, wservice.Get4SById);
    app.put('/wservice/4s/:s4_id', authCheck, wservice.Modify4S);

    app.post('/wservice/4s/:s4_id/login', wservice.Login);
    app.get('/wservice/4s/:s4_id/logout', wservice.Logout);

    app.get('/wservice/4s/:s4_id/staff', authCheck, wservice.GetStaff);
    app.post('/wservice/4s/:s4_id/staff', authCheck, wservice.AddStaff);
    app.get('/wservice/4s/:s4_id/staff/:staff_id', authCheck, wservice.GetStaffById);
    app.put('/wservice/4s/:s4_id/staff/:staff_id', authCheck, wservice.ModifyStaff);

    app.get('/wservice/4s/:s4_id/cust', authCheck, wservice.GetCustomer);
    app.post('/wservice/4s/:s4_id/cust', authCheck, wservice.AddCustomer);
    app.get('/wservice/4s/:s4_id/cust/:cust_id', authCheck, wservice.GetCustomerById);
    app.put('/wservice/4s/:s4_id/cust/:cust_id', authCheck, wservice.ModifyCustomer);
    app.delete('/wservice/4s/:s4_id/cust/:cust_id', authCheck, wservice.DeleteCustomer);

    app.get('/wservice/4s/:s4_id/cust/:cust_id/car', authCheck, wservice.GetCarByCustomerId);
    app.post('/wservice/4s/:s4_id/cust/:cust_id/car', authCheck, wservice.AddCarToCustomer);
    app.get('/wservice/4s/:s4_id/cust/:cust_id/car/:car_id', authCheck, wservice.GetCarByIdForCustomer);
    app.put('/wservice/4s/:s4_id/cust/:cust_id/car/:car_id', authCheck, wservice.ModifyCarForCustomer);
    app.delete('/wservice/4s/:s4_id/cust/:cust_id/car/:car_id', authCheck, wservice.DeleteCarForCustomer);

    app.get('/wservice/4s/:s4_id/car', authCheck, wservice.GetCar);
    app.post('/wservice/4s/:s4_id/car', authCheck, wservice.AddCar);
    app.get('/wservice/4s/:s4_id/car/:car_id', authCheck, wservice.GetCarById);
    app.put('/wservice/4s/:s4_id/car/:car_id', authCheck, wservice.ModifyCar);
    app.delete('/wservice/4s/:s4_id/car/:car_id', authCheck, wservice.DeleteCar);
    app.get('/wservice/4s/:s4_id/car/:car_id/cust', authCheck, wservice.GetCustomerByCarId);

    app.get('/tag/tagList/:brand',tagService.tagList);
    app.get('/tag/buildTags',tagService.buildTags);

    app.get('/wservice/cmpx/4s', authCheck, wservice.Get4SwithAdmin); // app.get('/wservice/organization', wservice.GetOrganization);
    app.post('/wservice/cmpx/4s', authCheck, wservice.Add4SwithAdmin); // app.post('/wservice/organization', wservice.AddOrganization);
    // app.put('/wservice/organization/:org_id', wservice.ModifyOrganization);
    app.get('/wservice/cmpx/carowner', wservice.GetCarwithOwner); // app.get('/wservice/carowner', wservice.GetCarOwnerAll);
    // app.get('/wservice/carowner/:acc_id', wservice.GetCarOwner);
    // app.put('/wservice/carowner/:acc_id', wservice.ModifyCarOwner);
    // app.delete('/wservice/carowner/:acc_id', wservice.DeleteCarOwner);
    app.get('/wservice/cmpx/drive_info', wservice.GetDriveInfoAll);
    app.get('/wservice/cmpx/drive_detail/:obd_code/:drive_id', wservice.GetDriveDetail);

    app.get('/wservice/organization/:org_id/promotionslot', wservice.GetPromotionSlotAllInOrg);
    app.post('/wservice/organization/:org_id/promotionslot', wservice.AddPromotionSlotToOrg);
    app.get('/wservice/organization/:org_id/promotionslot/:slot_id', wservice.GetPromotionSlotInOrg);
    app.put('/wservice/organization/:org_id/promotionslot/:slot_id', wservice.ModifyPromotionSlotInOrg);
    app.delete('/wservice/organization/:org_id/promotionslot/:slot_id', wservice.DeletePromotionSlotInOrg);

    app.get('/wservice/organization/:org_id/work/:work', wservice.GetWorkAll);
    app.post('/wservice/organization/:org_id/work/:work', wservice.CreateWork);
    app.get('/wservice/organization/:org_id/work/:work/:work_id', wservice.GetWork);
    app.put('/wservice/organization/:org_id/work/:work/:work_id', wservice.UpdateWork);

    app.get('/wservice/organization/:org_id/care', wservice.GetCareInOrg);
    app.get('/wservice/organization/:org_id/care_tel_rec', wservice.GetCareTeleRecordInOrg);

    app.get('/wservice/manual', wservice.GetManualAll);
    app.post('/wservice/manual', wservice.AddManual);
    app.get('/wservice/manual/:id', wservice.GetManual);
    app.post('/wservice/manual/:id', wservice.ModifyManual);
    app.delete('/wservice/manual/:id', wservice.DeleteManual);

    app.get('/wservice/brand', wservice.GetAllBrand);
    app.get('/wservice/brand/:brand_id/series', wservice.GetBrandSeries);
    app.get('/wservice/brand/:brand_id/series/:series_id', wservice.GetSeries);

    app.get('/wservice/4s/:s4_id/template', authCheck, wservice.GetTemplates);
    app.get('/wservice/4s/:s4_id/template/:tpl_id/activity', authCheck, wservice.GetActivitiesByTemplate);
    app.post('/wservice/4s/:s4_id/template/:tpl_id/activity', authCheck, wservice.CreateActivity);
    app.get('/wservice/4s/:s4_id/activity', authCheck, wservice.GetActivities);
    app.get('/wservice/4s/:s4_id/activity/:act_id', authCheck, wservice.GetActivity);
    app.put('/wservice/4s/:s4_id/activity/:act_id', authCheck, wservice.ModifyActivity);
    app.delete('/wservice/4s/:s4_id/activity/:act_id', authCheck, wservice.DeleteActivity);
    app.get('/wservice/4s/:s4_id/activity/:act_id/cust', authCheck, wservice.GetActivityMembers);
    app.get('/wservice/4s/:s4_id/activity/:act_id/cust/:acc_id', authCheck, wservice.GetActivityMember);

    app.get('/wservice', wservice.html);

    // Routes for msite service
    app.get('/mservice/html', siteCommon.staticFile('mservice/html/mservice.html'));
    app.get('/mservice/html/*', siteCommon.staticFolder('mservice/html'));
    app.all('/mservice', siteCommon.fileNotFound());
    app.all('/mservice/*', mservice.entrance);

    // Common routes for web sites
    app.get('/components/*', siteCommon.staticFolder('components'));
    app.get('/data/*', siteCommon.staticFolder('data'));

    // Routes for mini-site
    app.get('/msite/mpartials/*', msite.routeCallback.partials);
    app.get('/msite', msite.middleware.setUserCookie, msite.routeCallback.index);
    app.get('/msite/*', msite.middleware.setUserCookie, msite.routeCallback.pageApp);

    // Routes for wsite backend
    app.get('/4sStore/partials/*', wsite.routeCallback.partials);
    app.get('/4sStore/*', wsite.middleware.setUserCookie, wsite.routeCallback.pageApp);
    app.get('/admin/partials/*', wsite.routeCallback.partials);
    app.get('/admin/*', wsite.middleware.setUserCookie, wsite.routeCallback.pageApp);
    app.get('/*', wsite.middleware.setUserCookie, wsite.routeCallback.index);
};


