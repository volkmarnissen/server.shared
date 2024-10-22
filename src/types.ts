import { IClientOptions } from 'mqtt'
import {
  ISpecificationTexts,
  IbaseSpecification,
  IdentifiedStates,
  IimageAndDocumentUrl,
  ImodbusEntityIdentification,
  SpecificationStatus,
} from '@modbus2mqtt/specification.shared'

export enum HttpErrorsEnum {
  OK = 200,
  OkCreated = 201,
  OkAccepted = 202,
  OkNonAuthoritativeInformation = 203,
  OkNoContent = 204,
  ErrBadRequest = 400,
  ErrUnauthorized = 401,
  ErrForbidden = 403,
  ErrNotFound = 404,
  ErrNotAcceptable = 406,
  ErrRequestTimeout = 408,
  ErrInvalidParameter = 422,
  SrvErrInternalServerError = 500,
}
export enum RoutingNames {
  login = 'login',
  register = 'register',
  configure = 'configure',
  busses = 'busses',
  specifications = 'specifications',
  slaves = 'slaves',
  specification = 'specification',
}
export enum PollModes{
  intervall =0,
  trigger  = 1,
  intervallAndTrigger = 2
}
export interface ImqttClient extends IClientOptions {
  mqttserverurl?: string
  ssl?: boolean
}

export interface IRTUConnection {
  serialport: string
  baudrate: number
  timeout: number
}
export interface ITCPConnection {
  host: string
  port: number
  timeout: number
}

export type IModbusConnection = IRTUConnection | ITCPConnection

export interface Iconfiguration {
  hassiotoken?: string
  password?: string
  username?: string
  githubPersonalToken?: string
  version: string
  fakeModbus: boolean
  mqttbasetopic: string
  mqttdiscoveryprefix: string
  mqttdiscoverylanguage: string
  mqttusehassio?: boolean
  mqttconnect: ImqttClient
  mqttcaFile?: string
  mqttkeyFile?: string
  mqttcertFile?: string
  filelocation?: string
  httpport: number
  rootUrl?: string
}
export enum AuthenticationErrors {
  EnvironmentVariableSecretNotSet = 1,
  HashError = 2,
  InvalidUserPasswordCombination = 3,
  InvalidParameters = 4,
  SignError = 5,
}

export interface IUserAuthenticationStatus {
  registered: boolean
  hassiotoken: boolean
  hasAuthToken: boolean
  authTokenExpired: boolean
  mqttConfigured: boolean
  preSelectedBusId?: number
}
export interface IBus {
  busId: number
  connectionData: IModbusConnection
  slaves: Islave[]
}
export function getConnectionName(connection: IModbusConnection): string {
  if ((connection as IRTUConnection).baudrate) {
    let c = connection as IRTUConnection
    return 'RTU: ' + c.serialport + '(' + c.baudrate + ') t: ' + c.timeout
  } else {
    let c = connection as ITCPConnection
    return 'TCP: ' + c.host + ':' + c.port + ' t: ' + (c.timeout ? c.timeout : 100)
  }
}

export interface Islave {
  slaveid: number
  specificationid?: string
  name?: string
  polInterval?: number
  pollMode?: PollModes
  specification?: IbaseSpecification
  durationOfLongestModbusCall?: number
  modbusTimout?: number
  evalTimeout?: boolean
  detectSpec?: boolean // Will be set when creating a slave. If true, modbus2mqtt will set a specification matching to the modbusdata if there is one
}

export interface IidentificationSpecification {
  filename: string
  stateTopic?:string
  statePayload?:string
  triggerPollTopic?:string
  status: SpecificationStatus
  entities: ImodbusEntityIdentification[]
  files: IimageAndDocumentUrl[]
  i18n: ISpecificationTexts[]
  identified: IdentifiedStates
  configuredSlave?: Islave
}
