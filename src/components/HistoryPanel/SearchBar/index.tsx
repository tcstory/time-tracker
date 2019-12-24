import * as React from "react";
import {ChangeEvent, KeyboardEvent, RefObject} from "react";

const styles = require('./index.scss');

interface StateType {
  placeholder: string;
  value: string;
}

interface PropsType {
  handleSearchHistory: (key: string) => void;
}

export default class SearchBar extends React.PureComponent<PropsType, StateType> {
  inputEl: RefObject<HTMLInputElement>;

  constructor(props: any) {
    super(props);

    this.inputEl = React.createRef();

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);

    this.state = {
      placeholder: '搜索',
      value: '',
    };
  }

  onKeyDown(ev: KeyboardEvent<HTMLInputElement>) {
    if (ev.key === 'Enter') {
      this.props.handleSearchHistory(this.inputEl.current.value);
    }
  }

  onChange(ev: ChangeEvent<HTMLInputElement>) {
    this.setState({
      value: ev.target.value,
    });
  }

  onClick() {
    this.setState({
      value: ''
    });
  }

  render() {
    const {placeholder, value} = this.state;

    let clearBtn = null;

    if (value) {
      clearBtn = <a onClick={this.onClick} className={`delete is-small ${styles['clear-btn']}`}></a>;
    }

    return (
      <div className={styles['search-bar']}>
        <div className={styles['input-wrap']}>
          <input className="input is-small" type="text" ref={this.inputEl} value={this.state.value}
            placeholder={placeholder} onKeyDown={this.onKeyDown} onChange={this.onChange}></input>
          {clearBtn}
        </div>
      </div>
    );
  }  
}