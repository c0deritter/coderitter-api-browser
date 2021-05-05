import React from 'react'
import AppState from './services/AppState'
import EventBus from './services/EventBus'
import ObjectDb from './services/ObjectDb'
import WebSocketService from './services/WebSocketService'
import Translations from './translations/Translations'

/**
 * This class contains every application wide service which it also initializes when
 * the application starts up.
 * 
 * Its singleton instance can be attached to any React component like so:
 * 
 * ReactComponentClassName.contextType = Services.context
 * 
 * Put this line at the end of a React component file, after the class definition of the 
 * component. You should also add a getter property to the React component class to
 * provide type safe access to the Services object, like so:
 * 
 * get services(): Services {
 *   return this.context.services
 * }
 */
export default class Services {

  /**
   * The singleton Services instance.
   */
  private static instance: Services = new Services

  /**
   * The React context which can be attached to any React component.
   */
  public static context = React.createContext({ services: Services.instance })

  /**
   * A static get method to access the Services instance outside of React components.
   */
  static get(): Services {
    return this.instance
  }

  webSocketService!: WebSocketService

  appState = new AppState
  translations = new Translations
  eventBus = new EventBus
  objectDb = new ObjectDb

  /**
   * Is called at the start of the application and initializes every service.
   */
  start() {
    this.webSocketService = new WebSocketService('wss://...')

    this.webSocketService.objectDb = this.objectDb
    this.webSocketService.eventBus = this.eventBus

    this.objectDb.appState = this.appState
    this.objectDb.eventBus = this.eventBus
  }
}
