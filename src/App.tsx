import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

/**
 * State declaration for <App />
 */
interface IState {
  data: ServerRespond[],
  showGraph: boolean,
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      // data saves the server responds.
      // We use this state to parse data down to the child element (Graph) as element property
      data: [],
      showGraph: false,
    };
  }

  /**
   * Render Graph react component with state.data parse as property data
   */
  renderGraph() {
    if (this.state.showGraph) {
      return (<Graph data={this.state.data}/>)
    }
  } 

  /**
   * Get new data from server and update the state with the new data
   */
  // This function is designed to continuously fetch data from the server at regular intervals 
  // (every 100 milliseconds) and update the component's state with the new data. 
  // It stops after running 1000 times.
  getDataFromServer() {
    // init a counter var (x) to keep track of the number of intervals
    let x = 0;

    // declare a new interval that will execute the provuded function ever 100 ms.
    const interval = setInterval(() => {

      // Call the getData method from DataStreamer, which fetches data from the server
      // The getData method takes a callback function that processes the server response
      DataStreamer.getData((serverResponds: ServerRespond[]) => {
        
        // In the callback function, update the component's state with the new data from the server
        // The new state consists of the data from the server and sets showGraph to true
        this.setState({ 
          data: serverResponds,
          showGraph: true,
        });
      });

      // Increment the counter variable to track how many times the interval has run
      x++;

      // Check if the counter variable has exceeded 1000 (meaning the interval has run 1000 times)
      if (x > 1000) {
        // If so, clear the interval to stop fetching data
        clearInterval(interval);
      }
    }, 100); // The interval is set to 100 milliseconds
  }

  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            // when button is click, our react app tries to request
            // new data from the server.
            // As part of your task, update the getDataFromServer() function
            // to keep requesting the data every 100ms until the app is closed
            // or the server does not return anymore data.
            onClick={() => {this.getDataFromServer()}}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
