/// <reference path="references.ts" />

module Service {
    export class DTOBase<T> {
        // 辅助方法,HTTP请求最后返回时,很多只需要内部的DTO对象
        static ExtractDTOs<T>(src:DTOBase<T>[]):T[] {
            var dtos = new Array<T>();
            src.forEach((obj:DTOBase<T>)=> {
                dtos.push(obj.DTO());
            });
            return dtos;
        }

        // 数据库返回的对象
        public dto:T;

        constructor(dto:T) {
            this.dto = dto;
        }

        // 这是默认实现,派生类可以覆盖此方法,做些额外的处理工作
        public DTO():T {
            return this.dto;
        }
    }
}