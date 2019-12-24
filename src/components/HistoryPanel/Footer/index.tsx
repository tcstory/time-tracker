import * as React from "react";

const styles = require('./index.scss');

interface PropsType {
  handleConfirmDeleteHistory: () => void;
}

interface StateType {
  showDelBtn: boolean;
  showConfirmModal: boolean;
}

export class Footer extends React.PureComponent<PropsType, StateType> {
  constructor(props: any) {
    super(props);

    this.onDelBtnClick = this.onDelBtnClick.bind(this);
    this.onCancelBtnClick = this.onCancelBtnClick.bind(this);
    this.handleConfirmDeleteHistory = this.handleConfirmDeleteHistory.bind(this);

    this.state = {
      showDelBtn: false,
      showConfirmModal: false,
    };
  }

  onDelBtnClick() {
    this.setState({
      showConfirmModal: true,
    });
  }

  onCancelBtnClick() {
    this.setState({
      showConfirmModal: false,
    });
  }

  handleConfirmDeleteHistory() {
    this.props.handleConfirmDeleteHistory();
    this.onCancelBtnClick();
  }

  render() {
    const {showConfirmModal} = this.state;

    let confirmModalEl = (
      <div className="modal is-active">
        <div className="modal-background"></div>
        <div className="modal-content">
          <article className="message is-danger">
            <div className="message-header">
              <p>警告</p>
            </div>
            <div className="message-body">
              <p className={styles['del-msg']}>确定删除选中的历史记录?</p>
              <div className={styles['btn-wrap']}>
                <button className={`button is-info is-small ${styles['confirm-btn']}`}
                  onClick={this.handleConfirmDeleteHistory}>确认
                </button>
                <button className="button is-small" onClick={this.onCancelBtnClick}>取消</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    );

    return (
      <div className={styles['footer']}>
        <button className="button is-danger is-small"
          onClick={this.onDelBtnClick}>
          删除
        </button>
        {showConfirmModal ? confirmModalEl : null}
      </div>
    );
  }
}