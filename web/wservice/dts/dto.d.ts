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
    }
}
