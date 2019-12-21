import { combineEpics } from 'redux-observable';
import { combineReducers } from 'redux';

import {pingReducer} from './reducers/pingReducer';
import pingEpic from './epics/pingEpic';

export const rootEpic = combineEpics(
  pingEpic,
);

export const rootReducer = combineReducers({
  ping: pingReducer,
});