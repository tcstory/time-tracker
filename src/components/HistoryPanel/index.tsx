import * as React from "react";

import {HistoryItemType, historyStore} from "../../modals/history";

const style = require('./index.css');

class HistoryPanel extends React.Component<{}, { historyItems: HistoryItemType[] }> {
  constructor(props: any) {
    super(props);

    this.state = {
      historyItems: [],
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    historyStore.search({text: ''});
  }

  componentDidMount() {
    historyStore.historyItems$.subscribe((payload) => {
      this.setState({
        historyItems: payload
      });
    });

    historyStore.search({text: ''});
  }

  render() {
    return (
      <div className={style['is-red']}>
        <ul>
          {this.state.historyItems.map((item) => {
            return <li key={item.id}>{item.title}</li>;
          })}
        </ul>
        <button onClick={this.onClick}>click me!!!!</button>
      </div>
    );
  }
}

export default HistoryPanel;