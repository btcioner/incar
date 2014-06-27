// 辅助声明
declare var angular:{
    module: (moduleName:string, dependes:Array<any>)=>{
        controller: (ctrlName:string, init:Array<any>)=>any;
        config:any;
    };
    isUndefined: (value:any)=>boolean;
    isDefined: (value:any)=>boolean;
    forEach: (value:any, cb:(obj:any)=>any)=>any;
};
