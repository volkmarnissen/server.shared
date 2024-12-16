import { IbaseSpecification, Ientity, ImodbusEntity, ImodbusSpecification, Ispecification } from '@modbus2mqtt/specification.shared'
import { Islave, PollModes } from './types'
export interface IEntityCommandTopics {
  entityId:number,
  commandTopic:string,
  modbusCommandTopic?:string
}
export class Slave {
  constructor(
    private busid: number,
    private slave: Islave,
    private mqttBaseTopic: string
  ) {}
  getStateTopic(): string {
    return this.getBaseTopic() + '/state/'
  }
  hasRootTopic(): boolean {
    return this.slave.rootTopic != undefined
  }
  getBaseTopic():string{
    if (this.hasRootTopic()) return this.mqttBaseTopic + '/' + this.slave.rootTopic!
    else return this.mqttBaseTopic + '/' + this.busid + 's' + this.slave.slaveid 
  }

  getTriggerPollTopic(): string {
    return this.getBaseTopic() + '/triggerPoll/'
  }
  getEntityCommandTopic(entity?: Ientity ): IEntityCommandTopics | undefined {
    let commandTopic:string| undefined = undefined
    let modbusCommandTopic:string| undefined = undefined
    if (entity )
      if( !entity.readonly){
        commandTopic= this.getBaseTopic() + '/' + entity.mqttname + '/set/'
        if( entity.converter.name == "select")
          modbusCommandTopic = this.getBaseTopic() +  '/' + entity.mqttname + '/set/modbus/'
        return {
          entityId:entity.id,
          commandTopic:commandTopic?commandTopic:"error",
          modbusCommandTopic:modbusCommandTopic?modbusCommandTopic:"error"
        }
      }
    return undefined
  }

  getEntityCommandTopicFilter(): string {
    return this.getBaseTopic() + '/+/set/#'
  }
  
  getCommandTopic(): string | undefined{
    let commandTopic:string| undefined = undefined
    let modbusCommandTopic:string| undefined = undefined
    if (this.getSpecification()?.entities.find(e=> !e.readonly)){
        commandTopic= this.getBaseTopic() + '/set/'
        return commandTopic
      } 
    return undefined
  }
  getEntityFromCommandTopic(topic: String): Ientity | undefined {
    let commandTopic:string| undefined = undefined
    let modbusCommandTopic:string| undefined = undefined
    let start = this.getBaseTopic()!.length
    let idx = topic.indexOf('/', start +1 )

    let mqttname = topic.substring(start + 1,idx >=0? idx: undefined )
    let path = mqttname.split("/")
    if( path.length > 0 )
    {
      if( this.slave.specification && (this.slave.specification as ImodbusSpecification).entities){
        return (this.slave.specification as ImodbusSpecification).entities.find(e=>e.mqttname == path[0] )
      }
    }   
    return undefined
  }
  getAvailabilityTopic() {
    return this.getBaseTopic() +'/availability/'
  }
  getStatePayload(entities: ImodbusEntity[]): string {
    let o: any = {}
    for (let e of entities) {
      let entity = e as ImodbusEntity
      if (e.mqttname && e.mqttValue!= undefined && !e.variableConfiguration) {
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
  getBusId():number{
    return this.busid
  }
  getSlaveId():number{
    return this.slave.slaveid
  }
  getName():string| undefined{
    return this.slave.name
  }
  getQos():number| undefined{
    return this.slave.qos
  }
  getPollMode():PollModes| undefined{
    return this.slave.pollMode
  }
  static compareSlaves(s1:Slave, s2:Slave):number{
    let rc = s1.busid - s2.busid
    if( ! rc){
      rc = s1.slave.slaveid - s2.slave.slaveid
    }
    return rc
  }
  getKey():string{
    return this.busid + "s" + this.slave.slaveid
  }
  
  getSpecification():Ispecification| undefined {
    if(this.slave && this.slave.specification && (this.slave.specification as Ispecification).entities  )
      return this.slave.specification as Ispecification
    return undefined
  }

  setSpecification(spec:Ispecification| undefined){
    if(this.slave ){
      this.slave.specification = spec
    }
  }

  getSpecificationId(): string | undefined {
    if(this.slave && this.slave.specificationid  )
      return this.slave.specificationid 
    return undefined
  }
  clone():Slave{
    return new Slave(this.busid,structuredClone(this.slave),this.mqttBaseTopic)
  }
}
