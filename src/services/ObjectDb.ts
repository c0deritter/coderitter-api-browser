import { Change, Changes } from 'knight-change'
import Log from 'knight-log'
import { ObjectDb as MegaNiceObjectDb } from 'knight-object-db'
import { schema } from '../Schema'
import AppState from './AppState'
import EventBus from './EventBus'

let log = new Log('ObjectDb.ts')

/**
 * The object database will mirror the data from the server. It enables offline capabilities and
 * fast contineous and asynchronous UI updates.
 */
export default class ObjectDb extends MegaNiceObjectDb {

  appState!: AppState
  eventBus!: EventBus

  version?: number

  constructor() {
    super(schema)
  }

  /**
   * Initially fetches every data from the server to mirror its state.
   */
  async fetchAll(): Promise<void> {
    let l = log.mt('fetchAll')

    // Here you need to fetch your initial data
    // let result = await ...

    // Then you assign the current version you received with your result to this.version
    // this.version = result.version

    // And then you integrate the received data into the object database
    // this.integrate(result.read) <- replace read with the corresponding property of your defined result

    this.appState.dataFetched = true

    // Emit the everything fetched event on which the UI might stop to show a loading spinner and start
    // to render the real UI
    this.eventBus.emitEverythingFetched()
  }

  /**
   * This method processes all the changes found in a Changes object.
   * 
   * @param changes A Changes object coming from the server.
   * @returns A Changes object containing all the changes that were made to the object database made 
   * while integrating the data.
   */
  handleChanges(changes: Changes): Changes {
    let l = log.mt('handleChanges')
    l.param('changes', changes)

    let combinedChanges = new Changes

    l.dev('Handling every change...')
    for (let change of changes.changes) {
      l.dev('Handling change', change)

      l.dev('Calling this.handleChange...')
      let detailedChanges = this.handleChange(change)
      l.returning('Returning from call of this.handleChange for change', change)

      l.dev('Received detailed changes from this.handleChange', detailedChanges)
      l.dev('Combining changes...')
      combinedChanges.changes = combinedChanges.changes.concat(detailedChanges.changes)
    }

    return combinedChanges
  }

  /**
   * Handles a particular change. In case if the change method was create or update
   * it will integrate those changes into the object database. If the change method
   * was delete then it will remove the corresponding objects from the object database.
   * 
   * @param change A Change object coming from the server.
   * @returns A Changes object containing the changes that were made to the object
   * database while integrating or removing objects based on the given Change object.
   */
  handleChange(change: Change): Changes {
    let l = log.mt('handleChange')
    l.user('change', change)

    let entityName = change.entityName
    let entity = change.entity

    let changes

    if (change.containsMethod('delete')) {
      l.user('Change method is delete. Removing entity from database...')
      changes = this.remove(entityName, entity)
    }
    else {
      l.user('Change method is create or update. Integreating entity into database...')
      changes = this.integrate(entityName, entity)
    }

    this.version = (change as any).version
    return changes
  }
}
