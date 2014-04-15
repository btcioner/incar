
'use strict';

var siteCommon = require('../sitecommon');
var msite = require('./msite');
var wsite = require('./wsite');
var wsCar=require('../wservice/car');
// var wsOBD=require('../wservice/obd');
var wservice = require('../wservice/motor');
var mservice = require('../mservice/mservice');

/** 
 *  Application routes
 */
module.exports = function(app) {
    //车辆相关
    app.get('/wservice/car', wsCar.list);
    app.get('/wservice/car/:id', wsCar.get);
    app.delete('/wservice/car/:id', wsCar.delete);
    app.post('/wservice/car', wsCar.add);
    app.put('/wservice/car/:id', wsCar.update);
    //OBD数据相关
    // app.get('/wservice/obd/checkCar/:obdCode', wsOBD.checkOBDbyCar);
    // app.put('/wservice/obd/work/:channel', wsOBD.bindOBD);
    // Routes for wsite service
    app.get('/wservice/organization', wservice.GetOrganization);
    app.post('/wservice/organization', wservice.AddOrganization);
    app.put('/wservice/organization/:org_id', wservice.ModifyOrganization);
  
    app.get('/wservice/organization/:org_id/account', wservice.GetAccountByOrg);
    app.post('/wservice/organization/:org_id/account', wservice.AddAccountToOrg);
    app.get('/wservice/organization/:org_id/account/:acc_id', wservice.GetAccountByIdInOrg);
    app.put('/wservice/organization/:org_id/account/:acc_id', wservice.ModifyAccountByIdInOrg);
    app.delete('/wservice/organization/:org_id/account/:acc_id', wservice.DeleteAccountByIdInOrg);
    app.get('/wservice/organization/:org_id/account/:acc_id/role', wservice.GetRole);
    app.post('/wservice/organization/:org_id/account/:acc_id/role', wservice.AddRole);
    app.get('/wservice/organization/:org_id/account/:acc_id/role/:role', wservice.HasRole);
    app.put('/wservice/organization/:org_id/account/:acc_id/role/:role', wservice.ModifyRole);
    app.delete('/wservice/organization/:org_id/account/:acc_id/role/:role', wservice.DeleteRole);

    app.get('/wservice/organization/:org_id/promotionslot', wservice.GetPromotionSlotAllInOrg);
    app.post('/wservice/organization/:org_id/promotionslot', wservice.AddPromotionSlotToOrg);
    app.get('/wservice/organization/:org_id/promotionslot/:slot_id', wservice.GetPromotionSlotInOrg);
    app.put('/wservice/organization/:org_id/promotionslot/:slot_id', wservice.ModifyPromotionSlotInOrg);
    app.delete('/wservice/organization/:org_id/promotionslot/:slot_id', wservice.DeletePromotionSlotInOrg);

    app.get('/wservice/carowner', wservice.GetCarOwnerAll);
    app.post('/wservice/carowner', wservice.AddCarOwner);
    app.get('/wservice/carowner/:acc_id', wservice.GetCarOwner);
    app.put('/wservice/carowner/:acc_id', wservice.ModifyCarOwner);
    app.delete('/wservice/carowner/:acc_id', wservice.DeleteCarOwner);

    app.get('/wservice/organization/:org_id/obd', wservice.GetOBDByOrg);
    app.get('/wservice/obd', wservice.GetAllOBDDevices)
    app.get('/wservice/obd/:obd_code', wservice.GetOBDByCode);
    app.put('/wservice/obd/:obd_code', wservice.ModifyOBD);

    app.get('/wservice/manual', wservice.GetManualAll);
    app.post('/wservice/manual', wservice.AddManual);
    app.get('/wservice/manual/:id', wservice.GetManual);
    app.post('/wservice/manual/:id', wservice.ModifyManual);
    app.delete('/wservice/manual/:id', wservice.DeleteManual);

    app.get('/wservice', wservice.html);
    app.all('/wservice/*', wservice.main);

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


