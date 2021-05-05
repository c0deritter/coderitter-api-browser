import { Changes } from 'knight-change'
import Log from 'knight-log'

let log = new Log('EventBus.ts')

/**
 * Contains on* and emit* methods for every possible event.
 */
export default class EventBus {

  subscribers: { subscriber: any, id: number }[] = []
  handlers: {[ eventName: string ]: {[ subscriberId: number ]: Function }} = {}
  idCounter = 0

  private getSubscriberId(subscriber: any): number|undefined {
    for (let subscribed of this.subscribers) {
      if (subscribed.subscriber == subscriber) {
        return subscribed.id
      }
    }
  }

  private createSubscriberId(subscriber: any): number {
    let subscriberId = this.getSubscriberId(subscriber)

    if (subscriberId != undefined) {
      return subscriberId
    }

    this.subscribers.push({ subscriber: subscriber, id: this.idCounter++ })
    return this.idCounter - 1
  }

  subscribe(subscriber: any, eventName: string, handler: Function) {
    let id = this.createSubscriberId(subscriber)
    
    if (this.handlers[eventName] == undefined) {
      this.handlers[eventName] = {}
    }

    this.handlers[eventName][id] = handler
  }

  unsubscribe(subscriber: any) {
    let subscriberId = this.getSubscriberId(subscriber)

    if (subscriberId == undefined) {
      return
    }

    for (let eventName in this.handlers) {
      delete this.handlers[eventName][subscriberId]
    }
  }

  emit(eventName: string, ...args: any[]) {
    if (this.handlers[eventName] == undefined) {
      return
    }

    for (let subscriberId in this.handlers[eventName]) {
      this.handlers[eventName][subscriberId](...args)
    }
  }

  onChanges(subscriber: any, handler: (changes: Changes) => void) {
    this.subscribe(subscriber, 'Changes', handler)
  }

  emitChanges(changes: Changes) {
    this.emit('Changes', changes)
  }

  /**
   * Listen to the event when the data was initially fetched from the server and completely
   * stored in the object database.
   * 
   * @param subscriber Any JavaScript object or value
   * @param handler The handler function which will be called when the event was emitted.
   */
  onEverythingFetched(subscriber: any, handler: () => void) {
    this.subscribe(subscriber, 'EverythingFetched', handler)
  }

  /**
   * Emit the event which signalizes that the whole data set was initially fetched from the server 
   * and successfuly stored into the object database.
   */
  emitEverythingFetched() {
    this.emit('EverythingFetched')
  }

  /**
   * Listen to the event when WebSocket switches its state to online.
   * 
   * @param subscriber Any JavaScript object or value
   * @param handler The handler function which will be called when the event was emitted.
   */
  onWebSocketOnline(subscriber: any, handler: () => void) {
    this.subscribe(subscriber, 'WebSocketOnline', handler)
  }

  /**
   * Emit the event which signalizes that the WebSocket changed its state to online.
   */
  emitWebSocketOnline() {
    this.emit('WebSocketOnline')
  }

  /**
   * Listen to the event when WebSocket switches its state to offline.
   * 
   * @param subscriber Any JavaScript object or value
   * @param handler The handler function which will be called when the event was emitted.
   */
   onWebSocketOffline(subscriber: any, handler: () => void) {
    this.subscribe(subscriber, 'WebSocketOffline', handler)
  }

  /**
   * Emit the event which signalizes that the WebSocket changed its state to offline.
   */
   emitWebSocketOffline() {
    this.emit('WebSocketOffline')
  }
}