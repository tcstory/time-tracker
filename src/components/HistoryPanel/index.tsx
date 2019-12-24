import * as React from "react";
import {BehaviorSubject, Subject} from "rxjs";

import {
  HISTORY_ITEM_DELETE,
  HISTORY_ITEM_SEARCH,
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

const ADD_TO_READY_TO_DELETED_HISTORY_ITEMS = 'add_to_ready_to_deleted_history_items';
const ADD_ALL_TO_READY_TO_DELETED_HISTORY_ITEMS = 'add_all_to_ready_to_deleted_history_items';


class HistoryPanel extends React.Component<{}, StateType> {
  subject$: Subject<ActionType>;
  readyToBeDeletedHistoryItems$: BehaviorSubject<string[]>;

  constructor(props: any) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.handleConfirmDeleteHistory = this.handleConfirmDeleteHistory.bind(this);
    this.handleSelectDeletedHistoryItem = this.handleSelectDeletedHistoryItem.bind(this);
    this.handleSelectAllHistoryItem = this.handleSelectAllHistoryItem.bind(this);


    this.state = {
      historyItems: [],
      menuItems: [
        {label: '星期二, 2019年12月17日(今天)'},
        {label: '星期一, 2019年12月16日'},
      ],
    };

    this.subject$ = new Subject<ActionType>();
    this.readyToBeDeletedHistoryItems$ = new BehaviorSubject<string[]>([]);
  }

  onClick() {
    this.subject$.next({
      type: HISTORY_ITEM_SEARCH,
      payload: {text: ''}
    });
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

  handleSearchHistory(key:string) {
    console.log('search', key)
  }

  componentDidMount() {
    historyStore.historyItems$.subscribe((payload) => {
      this.setState({
        historyItems: payload.map(function (item) {
          return {...item, isChecked: false};
        })
      });
    });

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
        historyStore.search(action.payload);
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
      payload: {text: ''}
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
          <div className={styles['date-col']}>
            <div className={styles['title']}>日期</div>
            {
              menuItems.map(function (item) {
                return <div className={styles['menu-item']} key={item.label}>
                  {item.label}
                </div>;
              })
            }
          </div>
          <div className={styles['content']}>
            <div className={styles['cols']}>
              <div className={styles['title-col']}>标题</div>
              <div className={styles['url-col']}>地址</div>
              <div className={styles['op-col']}>
                <label className="checkbox">
                  <input type="checkbox" onChange={this.handleSelectAllHistoryItem}></input>
                </label>
              </div>
            </div>
            <div>
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