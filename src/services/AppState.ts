import Log from 'knight-log'

let log = new Log('AppState.ts')

/**
 * You can use this class to application wide state.
 */
export default class AppState {

  dataFetched: boolean = false

}
