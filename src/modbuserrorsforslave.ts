import { ImodbusSpecification } from "@modbus2mqtt/specification.shared"
import { ImodbusError, ImodbusErrorsForSlave } from "./types"

export class ModbusErrorsForSlave{
  modbusErrors:ImodbusErrorsForSlave
  constructor(private slaveid: number, modbusErrorForSlave?:ImodbusErrorsForSlave){
    if(!modbusErrorForSlave)
      this.modbusErrors = {    
        errors: [],
        totalErrorCount: 0,
        errorsSinceLastSuccessful: 0,
        lastErrorTime: 0,
        allEntitiesFailed: false,
        lastAllEntitiesFailedTime : 0,
        lastSuccessfulIdentifiedTime: 0,
        notIdentifiedEntities: [], 
        lastAllEntitiesFailedSinceLastSuccessful: 0, 
        lastIdentifiedSinceLastSuccessful:0
    }
    else
      this.modbusErrors = modbusErrorForSlave
  }

  static getModbusErrors(mSpec: ImodbusSpecification): ImodbusError[] {
    let count: ImodbusError[] = []
    mSpec.entities.forEach((ent) => {
      if (ent.modbusError) {
        count.push({ entityId: ent.id
          , message: ent.modbusError} )
      }
    })
    return count
  }
  setErrors( spec:ImodbusSpecification){
    let errors = ModbusErrorsForSlave.getModbusErrors(spec)
    let now = Date.now()
    if(errors.length > 0){
      if( errors.length > 0)
        this.modbusErrors.errorsSinceLastSuccessful++;        
      this.modbusErrors.lastErrorTime = now
      this.modbusErrors.errors = errors
      this.modbusErrors.allEntitiesFailed  = ( errors.length == spec.entities.length)
      if(this.modbusErrors.allEntitiesFailed )
      {
        this.modbusErrors.lastAllEntitiesFailedSinceLastSuccessful++
        this.modbusErrors.lastAllEntitiesFailedTime = now

      }
      this.modbusErrors.totalErrorCount++
    }else{
      this.modbusErrors.lastAllEntitiesFailedSinceLastSuccessful = 0
      this.modbusErrors.allEntitiesFailed = false
      this.modbusErrors.errorsSinceLastSuccessful = 0;
      this.modbusErrors.errors = []
    }
    if( spec.identified ){
      this.modbusErrors.lastSuccessfulIdentifiedTime = now
      this.modbusErrors.lastIdentifiedSinceLastSuccessful = 0
    }
    else{
      this.modbusErrors.lastIdentifiedSinceLastSuccessful++   
      this.modbusErrors.notIdentifiedEntities = errors.map(e=>e.entityId)
    }
      
  }
  get():ImodbusErrorsForSlave{
    return this.modbusErrors
  }
}

