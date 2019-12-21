import {createStore, applyMiddleware} from 'redux';
import {createEpicMiddleware} from 'redux-observable';

import { rootEpic, rootReducer } from './root';

export default () => {
  const epicMiddleware = createEpicMiddleware();

  const store = createStore(
    rootReducer,
    applyMiddleware(epicMiddleware)
  );

  epicMiddleware.run(rootEpic);

  return store;
};