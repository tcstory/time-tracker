import {Subject, Observable} from 'rxjs';

import {ActionType} from "../typings/Action";
import {debounceTime, timestamp} from "rxjs/operators";

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

export interface PageVisitItemType {
  lastVisitTime: number;
  transition: string;
  url: string;
  title: string;
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

export const HISTORY_VISITS_DELETE = 'history_visits_delete';
export const HISTORY_VISITS_DELETE_INFO = 'history_visits_delete_info';

class HistoryStore {
  search(query: QueryType): Promise<HistoryItemType[]> {
    return browser.history.search(query);
  }

  getPageVisits(query: QueryType): Promise<HistoryItemType[]> {
    return browser.history.search(query).then(function (results) {
      let p = [];

      for (let historyItem of results) {
        p.push(
          browser.history.getVisits({url: historyItem.url}).then(function (visitItems: VisitItemType[]): PageVisitItemType[] {
            let temp = [];
            for (let visitItem of visitItems) {
              let meetCriterion = false;

              if (query.startTime && query.endTime) {
                meetCriterion = visitItem.visitTime >= query.startTime && visitItem.visitTime <= query.endTime;
              } else if (query.startTime) {
                meetCriterion =  visitItem.visitTime >= query.startTime;
              } else if (query.endTime) {
                meetCriterion = visitItem.visitTime <= query.endTime;
              } else {
                meetCriterion = true;
              }

              if (meetCriterion) {
                temp.push({
                  lastVisitTime: visitItem.visitTime,
                  transition: visitItem.transition,
                  url: historyItem.url,
                  // I can't get the title of the time of that visit, because VisitItem doesn't have that field,
                  // so I can only use the title of the latest visit which historyItem supply
                  title: historyItem.title,
                });
              }
            }

            return temp;
          })
        );
      }

      return Promise.all(p);
    }).then(function (results: (PageVisitItemType[])[]) {
      let ret = [];

      for (let item of results) {
        ret = ret.concat(item);
      }

      return ret.sort(function (a,b) {
        return b.lastVisitTime - a.lastVisitTime;
      });
    });
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

  deleteVisits(query: number[]) {
    return Promise.all(query.map(function (timestamp) {
      return browser.history.deleteRange({
        startTime: timestamp,
        endTime: timestamp + 1,
      }).then(function (results) {
        return results;
      });
    }));
  }
}

export const historyStore = new HistoryStore();

