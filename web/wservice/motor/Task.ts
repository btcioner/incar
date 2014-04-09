/// <reference path="references.ts" />

module Service{
    // 任务异常
    export class TaskException{
        // 错误消息
        status = "ok";
        // 错误代码,0代表正常
        code = 0;
        // 内部错误
        innerTaskException : TaskException;

        constructor(errCode:number, msg:string, ex:TaskException){
            this.code = errCode;
            this.status = msg;
            if(ex) this.innerTaskException = ex;
            else this.innerTaskException = null;
        }
    }
}
