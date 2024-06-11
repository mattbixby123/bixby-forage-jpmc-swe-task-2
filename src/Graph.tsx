import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.

      // Add more Perspective configurations here.
      elem.load(this.table);
      // 'view' is the graph type and 'y_line' is used since we want a continuous line graph
      elem.setAttribute('view', 'y_line');
      // 'column-pivots' is what allows us to distinguish stock ABC from DEF (using '["stock"]' as the value)
      elem.setAttribute('column-pivots', '["stock"]');
      // handles/allows for the x axis and allows us to map each datapoint by timestamp
      elem.setAttribute('row-pivots', '["timestamp"]');
      // allows us to focus on a particular part of a stock's data (top_ask_price) - if excluded,
      // the graph would plot top_ask_price, top_bid_price, stock, and timestamp (all data points)
      elem.setAttribute('columns', '["top_ask_price"]');
      // aggregates allow us to handle duplicate data. the duplicates arent deleted, 
      // they're consolidated into a single data point. (avg the top_bid_prices and the top_ask_prices)
      // a data point is only unique if it has a unique name/timestamp ( i.e. "stock":/"timestamp": below)
      elem.setAttribute('aggregates', `
        {"stock":"distinct count",
        "top_ask_price":"avg",
        "top_bid_price":"avg",
        "timestamp":"distinct count"}`);
    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(this.props.data.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;
