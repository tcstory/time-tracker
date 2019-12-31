import * as React from "react";
import {ChangeEvent} from "react";
import { format } from 'date-fns';


import {ExtendHistoryItemType} from "../index";

const styles = require('./index.scss');

interface PropsType extends ExtendHistoryItemType {
  handleSelectDeletedHistoryItem: (data: {url: string;checked: boolean}) => void;
}

export default class HistoryItem extends React.PureComponent<PropsType> {
  constructor(props: any) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(event: ChangeEvent<HTMLInputElement>) {
    this.props.handleSelectDeletedHistoryItem({
      url: this.props.url,
      checked: event.target.checked,
    });
  }

  render() {
    return (
      <div className={`${styles['cols']}`}>
        <div className={styles['visit-time-item']}>{format(this.props.lastVisitTime,'H:mm:ss')}</div>
        <div className={styles['title-item']}>{this.props.title}</div>
        <div className={styles['url-item']}>{this.props.url}</div>
        <div className={styles['visit-count-item']}>{this.props.visitCount}</div>
        <div className={styles['op-item']}>
          <label className="checkbox">
            <input type="checkbox" onChange={this.onChange} checked={this.props.isChecked}></input>
          </label>
        </div>
      </div>
    );
  }
}