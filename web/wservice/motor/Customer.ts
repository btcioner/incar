/// <reference path="references.ts" />

module Service{
    export function GetCustomer(req, res){
        res.setHeader("Accept-Query", "page,pagesize,name,nick,email,phone,status");
        var page = new Pagination(req.query.page, req.query.pagesize);

        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetCustomer(page, req.query, (ex, total, customers)=>{
                if(ex) { res.json(ex); return; }
                var arrayCust = DTOBase.ExtractDTOs<DTO.account>(customers);
                arrayCust.forEach((cust:DTO.account)=>{
                    // 密码不应返回给客户,仅供内部使用
                    cust.pwd = undefined;
                    cust.tel_pwd = undefined;
                });
                res.json({status:"ok", totalCount:total, custs: arrayCust});
            });
        });
    }

    export function GetCustomerById(req, res){
        var repo4S = S4Repository.GetRepo();
        repo4S.Get4SById(req.params.s4_id, (ex, s4)=>{
            if(ex) { res.json(new TaskException(-1, "查询4S店失败", ex)); return; }
            s4.GetCustomerById(req.params.cust_id, (ex, cust)=>{
                if(ex) { res.json(ex); return; }
                // 密码不应返回给客户,仅供内部使用
                cust.dto.pwd = undefined;
                cust.dto.tel_pwd = undefined;
                res.json({status:"ok", cust:cust.DTO() });
            });
        });
    }

    export class Customer extends DTOBase<DTO.account>{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.account{
            var dto:DTO.account = super.DTO();

            if(dto.status === 0) dto.status_name = "禁用";
            else if(dto.status === 1) dto.status_name = "启用";

            if(dto.sex === 1) dto.sex_name = "男";
            else if(dto.status === 2) dto.sex_name = "女";
            else dto.sex_name = "未知";

            return dto;
        }
    }
}