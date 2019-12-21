import {Subject, BehaviorSubject} from 'rxjs';

import {ActionType} from "../typings/Action";

export interface QueryType {
  text: string;
  startTime?: number | string | Date;
  endTime?: number | string | Date;
  maxResults?: number;
}

export interface HistoryItemType {
  id: string;
  url?: string;
  title?: string;
  lastVisitTime?: number;
  visitCount?: number;
  typedCount?: number;
}

interface StoreType {
  historyItems: HistoryItemType[];
}

export const HISTORY_ITEM_SEARCH = 'history_item_search';
export const HISTORY_ITEM_FULFILLED = 'history_Item_fulfilled';
export const HISTORY_ITEM_REJECTED = 'history_Item_rejected';

class HistoryStore {
  historyItems$: BehaviorSubject<HistoryItemType[]>;
  error$: Subject<ActionType>;

  private subject$: Subject<ActionType>;
  private store: StoreType;

  constructor() {
    this.store = {historyItems: []};
    this.subject$ = new Subject();

    this.error$ = new Subject<ActionType>();
    this.historyItems$ = new BehaviorSubject([] as HistoryItemType[]);

    this.subject$.subscribe({
      next: this.handleAction.bind(this),
    });
  }

  private handleAction(action: ActionType): void {
    switch (action.type) {
      case HISTORY_ITEM_FULFILLED:
        this.store.historyItems = action.payload;
        this.historyItems$.next(this.store.historyItems);
        break;
      default:
    }
  }

  search(query: QueryType): void {
    browser.history.search(query).then((historyItems: HistoryItemType) => {
      this.subject$.next({type: HISTORY_ITEM_FULFILLED, payload: historyItems});
    }).catch((err: Error) => {
      this.error$.next({type: HISTORY_ITEM_REJECTED, payload: err});
    });
  }
}

export const historyStore = new HistoryStore();


console.log('跑了几次?');

