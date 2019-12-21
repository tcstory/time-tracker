import {ofType} from 'redux-observable';
import {mapTo, delay} from "rxjs/operators";
import {Observable} from "rxjs";

import {ActionType} from '../../typings/Action';

const pingEpic = function (action$: Observable<ActionType>): Observable<ActionType> {
  return action$.pipe(
    ofType('PING'),
    delay(3000),
    mapTo({type: 'PONG'})
  );
};

export default pingEpic;