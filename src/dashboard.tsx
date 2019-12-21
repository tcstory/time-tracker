import * as React from "react";
import * as ReactDOM from "react-dom";
import {Provider} from 'react-redux';

import configureStore from './redux/configureStore';

import HistoryPanel from './components/HistoryPanel';

require('./css/reset.css');
require('./css/dashboard.css');
require('./icons/icon-34.png');

ReactDOM.render(
  <Provider store={configureStore()}>
    <main>
      <HistoryPanel/>
    </main>
  </Provider>,
  document.getElementById("root")
);

