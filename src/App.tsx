import Log from 'knight-log'
import * as React from 'react'
import * as ReactDom from 'react-dom'
import './loglevels'
import Services from './Services'

let log = new Log('App.tsx')

/**
 * This is the starting point of the React application.
 */
class App extends React.Component {

  constructor(props: any) {
    super(props)
  }

  /**
   * This getter property provides a typed access to the services object.
   */
  get services(): Services {
    return this.context.services
  }

  render() {
    this.services.start()

    return (
      <div>
      </div>
    )
  }

  componentDidMount() {
    // If the application window gets focused we reconnect to the WebSocket API provided by server
    // which we might have lost the connection to
    window.addEventListener('focus', () => {
      let l = log.fn('onFocus')
      this.services.webSocketService.connect()
    })
  }
}

// Sets the global and singleton services object
App.contextType = Services.context

// Renders this App component into the app hook in the HTML
ReactDom.render(<App></App>, document.getElementById('app'))