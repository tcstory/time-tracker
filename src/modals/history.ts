import {Subject, BehaviorSubject, Observable} from 'rxjs';

import {ActionType} from "../typings/Action";
import {debounceTime} from "rxjs/operators";

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

  visitItems?: VisitItemType[];
}

export interface VisitItemType {
  id: string;
  visitId: string;
  visitTime?: number;
  referringVisitId: string;
  transition: string;
}

export interface RemoveInfoType {
  allHistory: boolean;
  urls: string[];
}

const TransitionType = {
  "link": "link",
  "typed": "typed",
  "auto_bookmark": "auto_bookmark",
  "auto_subframe": "auto_subframe",
  "manual_subframe": "manual_subframe",
  "generated": "generated",
  "auto_toplevel": "auto_toplevel",
  "form_submit": "form_submit",
  "reload": "reload",
  "keyword": "keyword",
  "keyword_generated": "keyword_generated",
};


interface StoreType {
  historyItems: HistoryItemType[];
  visitItems: VisitItemType[];
}

export const HISTORY_ITEM_SEARCH = 'history_item_search';
export const HISTORY_ITEM_SEARCH_FULFILLED = 'history_item_search_fulfilled';
export const HISTORY_ITEM_SEARCH_REJECTED = 'history_item_search_rejected';

export const VISIT_ITEMS_GET = 'visit_items_get';
export const VISIT_ITEMS_GET_FULFILLED = 'visit_items_get_fulfilled';
export const VISIT_ITEMS_GET_REJECTED = 'visit_items_get_rejected';

export const HISTORY_ITEM_DELETE = 'visit_item_delete';
export const HISTORY_ITEM_DELETE_FULFILLED = 'visit_item_delete_fulfilled';
export const HISTORY_ITEM_DELETE_REJECTED = 'visit_item_delete_rejected';
export const HISTORY_ITEM_DELETE_INFO = 'visit_item_delete_info';

export const HISTORY_ITEMS_DELETE = 'visit_items_delete';
export const HISTORY_ITEMS_DELETE_FULFILLED = 'visit_items_delete_fulfilled';
export const HISTORY_ITEMS_DELETE_REJECTED = 'visit_items_delete_rejected';
export const HISTORY_ITEMS_DELETE_INFO = 'visit_items_delete_info';

class HistoryStore {
  historyItems$: BehaviorSubject<HistoryItemType[]>;
  visitItems$: BehaviorSubject<VisitItemType[]>;
  subject$: Subject<ActionType>;

  constructor() {
    this.subject$ = new Subject();
    this.historyItems$ = new BehaviorSubject([] as HistoryItemType[]);
    this.visitItems$ = new BehaviorSubject([] as VisitItemType[]);

    this.subject$.subscribe({
      next: this.handleAction.bind(this),
    });

    new Observable(function (observer) {
      browser.history.onVisitRemoved.addListener(function (removeInfo: RemoveInfoType) {
        if (removeInfo.allHistory) {
          observer.next({
            type: HISTORY_ITEM_DELETE_INFO,
            payload: removeInfo,
          });
        }
      });
    }).subscribe(this.subject$);

    let myAction = {
      type: HISTORY_ITEMS_DELETE_INFO,
      payload: {allHistory: false, urls: [] as string[]}
    };

    new Observable(function (observer) {
      browser.history.onVisitRemoved.addListener(function (removeInfo: RemoveInfoType) {
        if (!removeInfo.allHistory) {
          myAction.payload.urls = myAction.payload.urls.concat(removeInfo.urls);
          observer.next(myAction);
        }
      });
    }).pipe(
      debounceTime(300)
    ).subscribe( (action: ActionType) => {
      myAction = {
        type: HISTORY_ITEMS_DELETE_INFO,
        payload: {allHistory: false, urls: []}
      };

      this.subject$.next(action);
    });

  }

  private handleAction(action: ActionType): void {
    switch (action.type) {
      case HISTORY_ITEM_SEARCH_FULFILLED:
        this.historyItems$.next(action.payload);
        break;
      case VISIT_ITEMS_GET_FULFILLED:
        this.visitItems$.next(action.payload);
      default:
    }
  }

  search(query: QueryType): void {
    browser.history.search(query).then((historyItems: HistoryItemType) => {
      this.subject$.next({type: HISTORY_ITEM_SEARCH_FULFILLED, payload: historyItems});
    }).catch((err: Error) => {
      this.subject$.next({type: HISTORY_ITEM_SEARCH_REJECTED, payload: err});
    });
  }

  getVisits(query: { url: string }) {
    browser.history.getVisits(query).then( (visitItems: VisitItemType[]) => {
      this.subject$.next({type: VISIT_ITEMS_GET_FULFILLED, payload: visitItems});
    }).catch((err: Error) => {
      this.subject$.next({type: VISIT_ITEMS_GET_REJECTED, payload: err});
    });
  }

  deleteUrl(query: { url: string }) {
    browser.history.deleteUrl(query).then( () => {
      this.subject$.next({type: HISTORY_ITEM_DELETE_FULFILLED, payload: null});
    }).catch((err: Error) => {
      this.subject$.next({type: HISTORY_ITEM_DELETE_REJECTED, payload: err});
    });
  }

  deleteUrls(query: { urls: string[] }) {
    console.log(query);

    Promise.all(query.urls.map(function (url) {
      return browser.history.deleteUrl({url,});
    })).then( () => {
      this.subject$.next({type: HISTORY_ITEMS_DELETE_FULFILLED, payload: null});
    }).catch((err: Error) => {
      this.subject$.next({type: HISTORY_ITEMS_DELETE_REJECTED, payload: err});
    });
  }
}

export const historyStore = new HistoryStore();

