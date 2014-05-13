declare module Service{
    export module DTO {
        export class S4{
            id:number;
            status:number;
            status_name:string;
            wx_login:string;
            wx_pwd:string;
        }

        export class staff{
            id:number;
            s4_id:number;
            name:string;
            pwd:string;
            nick:string;
            status:number;
            status_name:string;
            email:string;
            phone:string;
        }

        export class account{
            id:number;
            s4_id:number;
            pwd:string;
            tel_pwd:string;
            status:number;
            status_name:string;
            sex:number;
            sex_name:string;
        }

        export class car{
            id:number;
            s4_id:number;
            license:string;
            obd_code:string;
            act_type:number;
            act_type_name:string;
            sim_number:string;
            brand:number;
            series:number;
            modelYear:number;
            disp:number;
            mileage:number;
            age:number;
            comment:string;
            created_date:Date;
            user_type:number;
            user_type_name:string;
        }
    }
}
