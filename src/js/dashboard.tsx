import * as React from "react";
import * as ReactDOM from "react-dom";

import HistoryPanel from './components/HistoryPanel/';

require('../css/reset.css');
require('../css/dashboard.css');
require('../icons/icon-34.png');

ReactDOM.render(
  <main>
    <HistoryPanel/>
  </main>,
  document.getElementById("root")
);

