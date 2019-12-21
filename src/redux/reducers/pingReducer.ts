import {ActionType} from "../../typings/Action";

export const ping = function () {
  return {
    type: 'PING',
  };
};

export const pong = function () {
  return {
    type: 'PONG',
  };
};

export const pingReducer = (state = { isPinging: false }, action: ActionType) => {
  switch (action.type) {
  case 'PING':
    return { isPinging: true };
    
  case 'PONG':
    return { isPinging: false };
    
  default:
    return state;
  }
};


