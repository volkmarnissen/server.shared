import { Ientity, ImodbusEntity } from '@modbus2mqtt/specification.shared'
import { Islave } from './types'
export interface IEntityCommandTopics {
  entityId:number,
  commandTopic:String,
  modbusCommandTopic?:String }
export class Slave {
  constructor(
    private busid: number,
    private slave: Islave,
    private mqttBaseTopic: string
  ) {}
  getStateTopic(): string {
    if (this.hasRootTopic()) return this.slave.rootTopic + '/state/'
    else return this.mqttBaseTopic + '/' + this.busid + 's' + this.slave.slaveid + '/state/'
  }
  hasRootTopic(): boolean {
    return this.slave.rootTopic != undefined
  }
  getTriggerPollTopic(): string {
    if (this.hasRootTopic()) return this.slave.rootTopic + '/triggerPoll/'
    else return this.mqttBaseTopic + '/' + this.busid + 's' + this.slave.slaveid + '/triggerPoll/'
  }
  getEntityCommandTopic(entity: Ientity): IEntityCommandTopics | undefined {
    let commandTopic:string| undefined = undefined
    let modbusCommandTopic:string| undefined = undefined
    if (!entity.readonly){
      if (this.hasRootTopic()){
        commandTopic= this.slave.rootTopic + '/' + entity.mqttname + '/set/'
        if( entity.converter.name == "select")
          modbusCommandTopic = this.slave.rootTopic + '/' + entity.mqttname + '/setModbus/'
      } 
      else {
        commandTopic= this.mqttBaseTopic + '/' + this.busid + 's' + this.slave.slaveid + '/e' + entity.id + '/set/'
        if( entity.converter.name == "select")
          modbusCommandTopic = this.mqttBaseTopic + '/' + this.busid + 's' + this.slave.slaveid + '/e' + entity.id + '/setModbus/'
      }
      return {
        entityId:entity.id,
        commandTopic:commandTopic?commandTopic:"error",
        modbusCommandTopic:modbusCommandTopic?modbusCommandTopic:"error"
      }
    }
    return undefined
  }

  getAvailabilityTopic() {
    if (this.hasRootTopic()) return this.slave.rootTopic + '/availability/'
    else return this.mqttBaseTopic + '/' + this.busid + 's' + this.slave.slaveid + +'/availability/'
  }
  getStatePayload(entities: ImodbusEntity[]): string {
    let o: any = {}
    for (let e of entities) {
      let entity = e as ImodbusEntity
      if (e.mqttname && e.mqttValue && !e.variableConfiguration) {
        o[e.mqttname] = null // no data available
        if (e.modbusValue.length > 0) o[e.mqttname] = e.mqttValue
        if (e.converter.name == 'select') {
          if (o.modbusValues == undefined) o.modbusValues = {}
          o.modbusValues[e.mqttname] = e.modbusValue[0]
        }
      }
    }
    return JSON.stringify(o, null, '\t')
  }
}
