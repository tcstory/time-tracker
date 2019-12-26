import {Subject, Observable} from 'rxjs';

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

export const HISTORY_ITEM_DELETE = 'visit_item_delete';
export const HISTORY_ITEM_DELETE_FULFILLED = 'visit_item_delete_fulfilled';
export const HISTORY_ITEM_DELETE_REJECTED = 'visit_item_delete_rejected';
export const HISTORY_ITEM_DELETE_INFO = 'visit_item_delete_info';

export const HISTORY_ITEMS_DELETE = 'visit_items_delete';
export const HISTORY_ITEMS_DELETE_FULFILLED = 'visit_items_delete_fulfilled';
export const HISTORY_ITEMS_DELETE_REJECTED = 'visit_items_delete_rejected';
export const HISTORY_ITEMS_DELETE_INFO = 'visit_items_delete_info';

class HistoryStore {
  subject$: Subject<ActionType>;

  constructor() {
    this.subject$ = new Subject();

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

  search(query: QueryType): Promise<HistoryItemType[]> {
    return browser.history.search(query);
  }

  getVisits(query: { url: string }) {
    return browser.history.getVisits(query);
  }

  deleteUrl(query: { url: string }) {
    return browser.history.deleteUrl(query);
  }

  deleteUrls(query: { urls: string[] }) {
    return Promise.all(query.urls.map(function (url) {
      return browser.history.deleteUrl({url,});
    }));
  }
}

export const historyStore = new HistoryStore();

