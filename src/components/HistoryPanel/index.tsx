import * as React from "react";

import {HistoryItemType, historyStore} from "../../modals/history";

const styles = require('./index.scss');

import HistoryItem from './HistoryItem';

interface StateType {
  historyItems: HistoryItemType[];
  menuItems: { label: string }[];
}

class HistoryPanel extends React.Component<{}, StateType> {
  constructor(props: any) {
    super(props);

    this.state = {
      historyItems: [],
      menuItems: [
        {label: '星期二, 2019年12月17日(今天)'},
        {label: '星期一, 2019年12月16日'},
      ]
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    historyStore.search({text: ''});
  }

  componentDidMount() {
    historyStore.historyItems$.subscribe((payload) => {
      console.log('length=', payload.length);
      this.setState({
        historyItems: payload
      });
    });

    historyStore.search({text: ''});
  }

  render() {
    const {menuItems, historyItems} = this.state;

    let titles: React.ReactNode[] = [];
    let urls: React.ReactNode[] = [];

    historyItems.forEach(function (item) {
      titles.push(<div>{item.title}</div>);
      urls.push(<div>{item.url}</div>);
    });

    return (
      <section className={styles['panel']}>
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
        <div className={styles['title-col']}>
          <div className={styles['title']}>标题</div>
          {titles}
        </div>
        <div className={styles['url-col']}>
          <div className={styles['title']}>地址</div>
          {urls}
        </div>
        <button className="button is-primary">Primary</button>
      </section>
    );
  }
}

export default HistoryPanel;