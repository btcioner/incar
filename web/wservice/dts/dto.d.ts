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

        export class activity{
            id:number;
            s4_id:number;
            template_id:number;
            title:string;
            brief:string;
            awards:string;
            status:number;
            logo_url:string;
            tm_announce:Date;
            tm_start:Date;
            tm_end:Date;
            tm_publish:Date;
            status_name:string;
        }

        export class activity_template{
            id:number;
            s4_id:number;
            name:string;
            template:string;
            title:string;
            brief:string;
            awards:string;
        }

        export class activity_member{
            act_id:number;
            cust_id:number;
            status:number;
            ref_car_id:number;
            ref_tags:string;
            ref_tag_tm:Date;
            status_name:string;
        }
    }
}
