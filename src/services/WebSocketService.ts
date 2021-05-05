import { Changes } from 'knight-change'
import { fromJsonObj } from 'knight-json'
import Log from 'knight-log'
import instantiator from '../../../server/src/Instantiator'
import EventBus from './EventBus'
import ObjectDb from './ObjectDb'

let log = new Log('WebSocketService.ts')

/**
 * This services continuously receives the changes that happened through create, update or delete
 * operations on the server.
 */
export default class WebSocketService {

  url: string
  webSocket?: WebSocket
  objectDb!: ObjectDb
  eventBus!: EventBus

  /**
   * The services uses list of Changes objects as queue. It prevents from losing messages and it
   * serialized the processing of the messages to get a consistent object db.
   */
  changesQueue: Changes[] = []
  processingChanges = false
  timeout?: any
  
  get offline(): boolean {
    return this.webSocket ? (this.webSocket.readyState == 2 || this.webSocket.readyState == 3) : true
  }

  constructor(url: string) {
    this.url = url
    this.connect()
  }

  connect() {
    let l = log.mt('connect')
    l.user('this.offline', this.offline)

    if (this.offline) {
      l.user('We are offline. Reconnecting...')
      this.webSocket = new WebSocket(this.url)

      this.webSocket.onopen = (event: Event) => {
        let l = log.fn('onopen')
        l.user('event', event)

        this.heartbeat()

        this.eventBus.emitWebSocketOnline()

        if (this.objectDb.version != undefined) {
          l.user('Sending version to server...', this.objectDb.version)
          this.webSocket!.send(this.objectDb.version.toString())
        }
        else {
          l.user('No version available. Not sending version to server...')
        }
      }

      this.webSocket.onmessage = async (event: MessageEvent) => {
        let l = log.fn('onmessage')
        l.user('event', event)

        if (event.data == 'ping') {
          l.user('Received ping')
          l.user('Renewing heartbeat...')
          this.heartbeat()
          l.user('Sending pong...')
          this.webSocket!.send('pong')
          return
        }
        
        l.user('Received change')

        if (this.objectDb.version == undefined) {
          l.user('We do not have any data right now thus this change is not useful for us. Returning...')
          return
        }
  
        let json = event.data
        l.user('json', json)
  
        let obj = JSON.parse(json)
        l.user('obj', obj)
  
        let changes: Changes = fromJsonObj(obj, { instantiator: instantiator })
        l.var('changes', changes)

        if (changes.constructor.name != 'Changes') {
          l.returning('Received object is not of instance Changes. Returning...')
          return
        }

        if (changes.changes == undefined || changes.changes.length == 0) {
          l.returning('Received changes object does not contain any change. Returning...')
          return 
        }

        let latestVersion
        if (this.changesQueue.length > 0) {
          let latestChanges = this.changesQueue[this.changesQueue.length - 1]
          latestVersion = (latestChanges.changes[0] as any).version!
        }
        else {
          latestVersion = this.objectDb.version
        }

        l.user('latestVersion', latestVersion)

        if ((changes.changes[0] as any).version! - latestVersion == 1) {
          l.user('Version gap is exactly 1. Pushing into queue and starting to process changes...')
          this.changesQueue.push(changes)
          this.processChanges()            
        }
        else {
          l.user('Sending version to server...', this.objectDb.version)
          this.webSocket!.send(this.objectDb.version.toString())
        }
      }

      this.webSocket.onclose = (event: CloseEvent) => {
        let l = log.fn('onclose')
        log.user('event', event)

        l.user('Clearing heartbeat timeout...')
        clearTimeout(this.timeout)
        l.user('Emitting offline event...')
        this.eventBus.emitWebSocketOffline()
      }

      this.webSocket.onerror = (event: Event) => {
        let l = log.fn('onerror')
        l.user('event', event)

        if (this.offline) {
          l.user('We are offline. Emitting event...')
          this.eventBus.emitWebSocketOffline()
        }
      }
    }
    else {
      l.user('We are still online. Doing nothing...')
    }
  }

  /**
   * There are occasions were a broken WebSocket connection cannot be detected. To work around that there is 
   * a ping-pong message exchange going on between the client and the server. Every 30 seconds, the client
   * expects a pong message from the server. If it received one, it will send a ping message back to it.
   * If it received none it will assume that the connection is broken and it will try to reconnect.
   */
  heartbeat() {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      let l = log.fn('onHeartbeatTimeout')
      l.user('Timeout kicked in. Closing dead WebSocket connection...')
      if (this.webSocket) {
        this.webSocket.close()
        this.webSocket = undefined
      }
    }, 30000 + 1000) // 1 second more so that the pong message has 1 second to travel
  }

  /**
   * Here the queue gets processed in a serialized manner.
   */
  async processChanges() {
    let l = log.mt('processChanges')
    l.var('this.processingChanges', this.processingChanges)

    try {
      if (! this.processingChanges) {
        l.user('Processing changes...')

        this.processingChanges = true
        let changes: Changes|undefined = undefined

        // collect all changes and then send them all as one to minimize ui updates
        let combinedChanges = new Changes
        combinedChanges.changes = []
  
        while (changes = this.changesQueue.shift()) {
          l.user('Processing changes...', changes)

          l.user('Calling this.objectDb.handleChange...')
          let detailedChanges = this.objectDb.handleChanges(changes)
          l.returning('Returning from ObjectDb.handleChanges...')

          l.user('Adding changes to changes', changes)
          for (let change of detailedChanges.changes) {
            combinedChanges.changes.push(change)
          }
        }

        l.user('Calling this.eventBus.emitChanges...', combinedChanges)
        this.eventBus.emitChanges(combinedChanges)
      }
    }
    finally {
      this.processingChanges = false
    }
  }
}