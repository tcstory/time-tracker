import * as React from "react";
import {HistoryItemType} from "../../../modals/history";


export default class HistoryItem extends React.Component<HistoryItemType, {}> {
  render() {
    return (
      <div>
        <div></div>
        {this.props.title}
      </div>
    );
  }
}