/// <reference path="references.ts" />

module Service{
    export class ActSaveGas extends Activity{
        constructor(dto){
            super(dto);
        }

        public DTO():DTO.activity{
            var dto:DTO.activity = super.DTO();

            if(dto.tm_start){
                dto["month"] = (dto.tm_start.getMonth() + 1) + "月";
            }

            return dto;
        }
    }
}