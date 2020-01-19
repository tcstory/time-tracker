import * as React from "react";
import {ChangeEvent} from "react";
import {BehaviorSubject, Subject} from "rxjs";
import {startOfToday, endOfToday, endOfDay, getTime, format, startOfYear} from "date-fns";

import HistoryItem from './HistoryItem';
import SearchBar from "./SearchBar";
import {Footer} from "./Footer";
import {ActionType} from "../../typings/Action";
import {
  HISTORY_VISITS_DELETE, HISTORY_VISITS_DELETE_INFO,
  HistoryItemType,
  historyStore
} from "../../services/history";

const styles = require('./index.scss');


export interface ExtendHistoryItemType extends HistoryItemType {
  isChecked: boolean;
  endOfDay: number;
}

interface MenuItemType {
  label: string;
  value: number;
}

interface StateType {
  historyItems: ExtendHistoryItemType[];
  menuItems: MenuItemType[];
}

const HISTORY_PAGE_VISIT_SEARCH = 'history_page_visit_search';
const ADD_TO_READY_TO_DELETED_HISTORY_VISITS = 'add_to_ready_to_deleted_history_items';


function convertHistoryItems(historyItems: HistoryItemType[]) {
  let menuItems = [] as MenuItemType[];
  let curValue = -1;
  let newHistoryItems = [] as ExtendHistoryItemType[];

  historyItems.forEach(function (item) {
    let newItem = {
      ...item,
      isChecked: false,
      endOfDay: getTime(endOfDay(item.lastVisitTime)),
    };
    
    
    if (curValue !== newItem.endOfDay) {
      menuItems.push({
        label: format(newItem.lastVisitTime, 'yyyy-MM-dd'),
        value: curValue = newItem.endOfDay,
      });
    }

    newHistoryItems.push(newItem);
  });

  return {menuItems, historyItems: newHistoryItems};

}

class HistoryPanel extends React.Component<{}, StateType> {
  subject$: Subject<ActionType>;
  readyToBeDeletedHistoryItems$: BehaviorSubject<string[]>;

  constructor(props: any) {
    super(props);

    this.handleConfirmDeleteHistory = this.handleConfirmDeleteHistory.bind(this);
    this.handleSelectDeletedHistoryVisit = this.handleSelectDeletedHistoryVisit.bind(this);
    this.handleSearchHistory = this.handleSearchHistory.bind(this);


    this.state = {
      historyItems: [],
      menuItems: [],
      timeRage: [
        {label: '1个小时以前', value: 'an_hour_ago'},
        {label: '7天内', value: 'within_7_days'},
        {label: '7天内', value: 'within_7_days'},
      ]
    };

    this.subject$ = new Subject<ActionType>();
    this.readyToBeDeletedHistoryItems$ = new BehaviorSubject<string[]>([]);
  }

  handleSelectDeletedHistoryVisit(data: { lastVisitTime: number; checked: boolean }) {
    this.subject$.next({
      type: ADD_TO_READY_TO_DELETED_HISTORY_VISITS,
      payload: data
    });
  }

  handleConfirmDeleteHistory() {
    this.subject$.next({
      type: HISTORY_VISITS_DELETE,
      payload: this.state.historyItems.filter(function (item) {
        return item.isChecked;
      })
    });
  }

  handleSearchHistory(text: string) {
    this.subject$.next({
      type: HISTORY_PAGE_VISIT_SEARCH,
      payload: {
        text,
        startTime: getTime(startOfYear(Date.now())),
        endTime: getTime(endOfToday()),
        maxResults: Number.MAX_SAFE_INTEGER,
      }
    });
  }

  componentDidMount() {
    this.subject$.subscribe((action) => {
      if (action.type === HISTORY_PAGE_VISIT_SEARCH) {
        historyStore.getPageVisits(action.payload).then( (payload) =>{
          let {historyItems, menuItems} = convertHistoryItems(payload);

          this.setState({
            historyItems,
            menuItems,
          });
        });
      }

      if (action.type === ADD_TO_READY_TO_DELETED_HISTORY_VISITS) {
        this.setState({
          historyItems: this.state.historyItems.map(function (item) {
            if (item.lastVisitTime === action.payload.lastVisitTime) {
              return {...item, isChecked: action.payload.checked};
            } else {
              return item;
            }
          })
        });
      }

      if (action.type === HISTORY_VISITS_DELETE) {
        historyStore.deleteVisits(action.payload.map(function (item) {
          return item.lastVisitTime;
        })).then(() => {
          this.setState({
            historyItems: this.state.historyItems.filter(function (item) {
              return !item.isChecked;
            })
          });
        });
      }
    });

    this.subject$.next({
      type: HISTORY_PAGE_VISIT_SEARCH,
      payload: {text: '', startTime: getTime(startOfToday()), endTime: getTime(endOfToday())}
    });
  }

  componentWillUnmount(): void {
    this.subject$.complete();
  }

  render() {
    const {historyItems, menuItems} = this.state;

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
              <div className={styles['op-col']}></div>
            </div>
            <div>
              {
                menuItems.map( (menuItem) =>{
                  let subItems = historyItems
                    .filter(historyItems => historyItems.endOfDay === menuItem.value)
                    .map((historyItem) => {
                      return <HistoryItem key={historyItem.lastVisitTime} {...historyItem}
                        handleSelectDeletedHistoryVisit={this.handleSelectDeletedHistoryVisit}/>;
                    });
                  
                  return (
                    <React.Fragment key={menuItem.value}>
                      <div className={styles['date-row']} key={menuItem.value}>{menuItem.label}</div>
                      {subItems}
                    </React.Fragment>
                  );
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