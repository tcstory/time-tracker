import * as React from "react";
import {BehaviorSubject, Subject} from "rxjs";
import {startOfToday, endOfToday, endOfDay, getTime} from "date-fns";


import {
  HISTORY_ITEM_DELETE,
  HISTORY_ITEMS_DELETE, HISTORY_ITEMS_DELETE_INFO,
  HistoryItemType,
  historyStore
} from "../../modals/history";

const styles = require('./index.scss');

import HistoryItem from './HistoryItem';
import SearchBar from "./SearchBar";
import {Footer} from "./Footer";
import {ActionType} from "../../typings/Action";
import {ChangeEvent} from "react";

export interface ExtendHistoryItemType extends HistoryItemType {
  isChecked: boolean;
}

interface StateType {
  historyItems: ExtendHistoryItemType[];
  menuItems: { label: string }[];
}

const HISTORY_ITEM_SEARCH = 'history_item_search';
const ADD_TO_READY_TO_DELETED_HISTORY_ITEMS = 'add_to_ready_to_deleted_history_items';
const ADD_ALL_TO_READY_TO_DELETED_HISTORY_ITEMS = 'add_all_to_ready_to_deleted_history_items';


function mergeHistoryItems(historyItems: HistoryItemType[]) {
  let dateMap: {[key: string]: HistoryItemType[]} = {};


  for (let item of historyItems) {
    let time = getTime(endOfDay(item.lastVisitTime));

    if (dateMap[time]) {
      dateMap[time].push(item);
    } else {
      dateMap[time] = [item];
    }
  }

  console.log(dateMap);
}

class HistoryPanel extends React.Component<{}, StateType> {
  subject$: Subject<ActionType>;
  readyToBeDeletedHistoryItems$: BehaviorSubject<string[]>;

  constructor(props: any) {
    super(props);

    this.handleConfirmDeleteHistory = this.handleConfirmDeleteHistory.bind(this);
    this.handleSelectDeletedHistoryItem = this.handleSelectDeletedHistoryItem.bind(this);
    this.handleSelectAllHistoryItem = this.handleSelectAllHistoryItem.bind(this);
    this.handleSearchHistory = this.handleSearchHistory.bind(this);


    this.state = {
      historyItems: [],
    };

    this.subject$ = new Subject<ActionType>();
    this.readyToBeDeletedHistoryItems$ = new BehaviorSubject<string[]>([]);
  }


  handleSelectAllHistoryItem(event: ChangeEvent<HTMLInputElement>) {
    this.subject$.next({
      type: ADD_ALL_TO_READY_TO_DELETED_HISTORY_ITEMS,
      payload: {checked: event.target.checked}
    });
  }

  handleSelectDeletedHistoryItem(data: { url: string; checked: boolean }) {
    this.subject$.next({
      type: ADD_TO_READY_TO_DELETED_HISTORY_ITEMS,
      payload: data
    });
  }

  handleConfirmDeleteHistory() {
    this.subject$.next({
      type: HISTORY_ITEMS_DELETE,
      payload: this.state.historyItems.filter(function (item) {
        return item.isChecked;
      })
    });
  }

  handleSearchHistory(text: string) {
    this.subject$.next({
      type: HISTORY_ITEM_SEARCH,
      payload: {
        text, startTime: new Date(2019,0,1),
        endTime: endOfToday(),
        maxResults: 1000,
      }
    });
  }

  componentDidMount() {
    historyStore.subject$.subscribe({
      next: (action: ActionType) => {
        if (action.type === HISTORY_ITEMS_DELETE_INFO) {
          this.setState({
            historyItems: this.state.historyItems.filter(function (item) {
              return !item.isChecked;
            })
          });
        }
      }
    });

    this.subject$.subscribe((action) => {
      if (action.type === HISTORY_ITEM_SEARCH) {
        historyStore.search(action.payload).then( (payload) =>{
          this.setState({
            historyItems: payload.map(function (item) {
              return {...item, isChecked: false};
            })
          });
        });

        if (this.state.historyItems.length) {
          historyStore.getVisits({url: this.state.historyItems[0].url}).then(function (result) {
            console.log('result--->', result);
          });
        }
        mergeHistoryItems(this.state.historyItems);
      }

      if (action.type === ADD_TO_READY_TO_DELETED_HISTORY_ITEMS) {
        this.setState({
          historyItems: this.state.historyItems.map(function (item) {
            if (item.url === action.payload.url) {
              return {...item, isChecked: action.payload.checked};
            } else {
              return item;
            }
          })
        });
      }

      if (action.type === ADD_ALL_TO_READY_TO_DELETED_HISTORY_ITEMS) {
        this.setState({
          historyItems: this.state.historyItems.map(function (item) {
            return {
              ...item,
              isChecked: action.payload.checked,
            };
          }),
        });
      }

      if (action.type === HISTORY_ITEMS_DELETE) {
        historyStore.deleteUrls({urls: action.payload.map(function (item: ExtendHistoryItemType) {
          return item.url;
        })});
      }
    });

    this.subject$.next({
      type: HISTORY_ITEM_SEARCH,
      payload: {text: '', startTime: startOfToday(), endTime: endOfToday()}
    });
  }

  componentWillUnmount(): void {
    this.subject$.complete();
  }

  render() {
    const {menuItems, historyItems} = this.state;
    console.log(historyItems);

    let footer = null;

    if (historyItems.some(function (item) {
      return item.isChecked;
    })) {
      footer = <Footer handleConfirmDeleteHistory={this.handleConfirmDeleteHistory}/>;
    }

    return (
      <section className={`${styles['panel']} box`}>
        <SearchBar handleSearchHistory={this.handleSearchHistory}/>
        <div className={styles['content-wrap']}>
          <div className={styles['content']}>
            <div className={styles['cols']}>
              <div className={styles['date-col']}>日期</div>
              <div className={styles['title-col']}>标题</div>
              <div className={styles['url-col']}>地址</div>
              <div className={styles['visit-count-col']}>浏览量</div>
              <div className={styles['op-col']}>
                <label className="checkbox">
                  <input type="checkbox" onChange={this.handleSelectAllHistoryItem}></input>
                </label>
              </div>
            </div>
            <div>
              <div className={styles['date-row']}>星期五, 2019年12月26日</div>
              {
                historyItems.map((item) => {
                  return <HistoryItem key={item.id} {...item}
                    handleSelectDeletedHistoryItem={this.handleSelectDeletedHistoryItem}/>;
                })
              }
            </div>
          </div>
        </div>
        {footer}
      </section>
    );
  }
}

export default HistoryPanel;