import * as React from "react";
import * as ReactDOM from "react-dom";

require('./css/mystyles.scss');
import HistoryPanel from './components/HistoryPanel';

require('./css/dashboard.scss');
require('./icons/icon-34.png');

ReactDOM.render(
  <main>
    <HistoryPanel/>
  </main>,
  document.getElementById("root")
);

