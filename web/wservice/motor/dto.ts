
module Service{
    export module DTO{

        export class staff_account{
            id : number;
            name : string;
            pwd: string;
            nick : string;
            email: string;
            phone: string;
            last_login_ip: string;
            last_login_time: Date;
            status: number;
        }

        export class staff_org{
            id:number;
            name:string;
            class:string;
            status: number;
            prov: string;
            city: string;
        }

        export class device_obd {
            obd_code:string;
            sim_number:string;
            comment:string;
            created_date:Date;
        }

        export class obd_drive {
            id                : number;
            obdCode           : string;
            vin               : string;
            brand             : number;
            series            : number;
            modelYear         : number;
            firingVoltage     : string;
            runTime           : string;
            currentMileage    : string;
            currentAvgOilUsed : string;
            speedingTime      : string;
            speedUp           : number;
            speedDown         : number;
            sharpTurn         : number;
            flameVoltage      : string;
            avgOilUsed        : string;
            mileage           : string;
            voltageAfter      : string;
            carStatus         : number;
            fireTime          : Date;
            flameoutTime      : Date;
        }

        export class drive_detial{
            id           : number;
            obdCode      : string;
            obdDriveId   : number;
            faultCode    : string;
            avgOilUsed   : string;
            mileage      : string;
            carCondition : string;
            createTime   : Date;
        }
    }
}
