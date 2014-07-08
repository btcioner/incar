// angularjs declare
declare var angular:{
    module: (moduleName:string, dependes:Array<any>)=>{
        controller: (ctrlName:string, init:Array<any>)=>any;
        config:any;
        filter:(name:string, factory:()=>any)=>any;
    };
    injector: (dependencies:Array<any>)=>any;
    element: (arg:any)=>any;
    bootstrap: (element:any, modules:Array<any>, config?:any)=>any;
    isUndefined: (value:any)=>boolean;
    isDefined: (value:any)=>boolean;
    forEach: (value:any, cb:(obj:any)=>any)=>any;
};

// jquery declare
declare var $:any;
// requirejs declare
declare var requirejs:any;