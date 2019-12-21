import * as React from "react";
import {connect} from 'react-redux';

import {ping} from '../../redux/reducers/pingReducer';

const style = require('./index.css');

class HistoryPanel extends React.Component<{ isPinging: boolean }, {}> {
  constructor(...args: any) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    super(...args);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    // @ts-ignore
    this.props.ping();
  }

  render() {
    console.log('===>', this.props)
    return <p className={style['is-red']}>
      status:
      {this.props.isPinging ? 'true' : 'false'}

      <button onClick={this.onClick}>click me</button>
    </p>;
  }
}

export default connect(
  function (state) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return {isPinging: state.ping.isPinging};
  },
  {ping}
)(HistoryPanel);