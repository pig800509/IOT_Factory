import React from "react";
import _ from "lodash";
import GetDashboard from "./fetchLib";
import PropTypes from "prop-types";

const MachineContext = React.createContext();
//context Provider 負責餵資料給 Table, Search
class MachineProvider extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      itemList: null,           //從API抓來暫存的 State,用於第一個Table的datasource 轉換
      productionlines: null,    //從API抓來暫存的 State,用於第二個Table的datasource 轉換
      TableLoading: true,       //判斷Table是否處理完
      firstDataSource: null,    //結構轉換過的data 餵給 第一個Table datasource
      secondColumns: [{ title: "ProductionLines...", key: "no" }], //第二個Table的Column
      searchText: null,         //Search input 中的value
      secondDataSource: null    //結構轉換過的data 餵給 第二個Table datasource
    };
  }
  getDataSource = async () => {     //調用 fetchLib 並把data 存入State
    const itemObject = await GetDashboard.getAttributeAPI(
      _.get(this.props.token, "token", false)
    );
    let itemlist = itemObject.error
      ? this.state.itemList
      : itemObject.item_list;
    const prodObject = await GetDashboard.getLineAPI(
      _.get(this.props.token, "token", false)
    );
    let prodlist = prodObject.error
      ? this.state.productionlines
      : prodObject.productionlines;
    this.setState({
      TableLoading: false,
      itemList: itemlist,
      productionlines: prodlist,
      firstDataSource:
        itemlist !== this.state.firstDataSource
          ? GetDashboard.trasferLineSchema(itemlist)
          : this.state.firstDataSource,
      secondColumns:
        prodlist !== this.state.secondColumns && prodlist
          ? GetDashboard.trasferPLColumn(prodlist)
          : this.state.secondColumns,
      secondDataSource:
        !itemObject.error && !prodObject.error
          ? GetDashboard.trasferPLValueSchema(
              GetDashboard.trasferLineSchema(itemlist),
              prodlist,
              itemlist
            )
          : this.state.secondDataSource
    });
    this.setTimer(20000);  //每20秒抓一次並更新一次 State
  };
  setTimer = msec => {     //每次執行 getDataSource function
    const getDataFromAPI = this.getDataSource;
    if (this.timerHandle) return;
    this.timerHandle = setTimeout(() => {
      getDataFromAPI();
      this.timerHandle = 0;
    }, msec);
  };
  handleSearch = value => {  //當Search 有事件發生
    const allColumns = this.state.secondColumns;
    this.setState({
      searchText: _.filter(allColumns, function(item) {
        return item.title.indexOf(value) > -1;
      })
    });
  };
  componentDidMount() {
    this.getDataSource();
  }
  componentWillUnmount() {
    clearTimeout(this.timerHandle);
  }
  render() {
    return (
      <MachineContext.Provider
        value={{ ...this.state, onSearch: this.handleSearch }}
      >
        {this.props.children}
      </MachineContext.Provider>
    );
  }
}

MachineProvider.propTypes = {
  token: PropTypes.object.isRequired
};

export const MachineContextConsumer = MachineContext.Consumer;
export default MachineProvider;
