import React, { Fragment } from "react";
import { Table, Tabs, Icon, Spin, Popover } from "antd";
import _ from "lodash";
import { MachineContextConsumer } from "./MachineProvider";
const TabPane = Tabs.TabPane;

const MachineDashboardTable = () => (              //MachineDashboard的 Table
  <MachineContextConsumer>                         
    {context => {                                  //在頁面中的context 取得State
      return (
        <div className="main">
          <Spin spinning={context.TableLoading}>
            <Tabs
              className="tabs"
              activeKey={null}
              defaultActiveKey="0"
              animated={false}
            >
              {!context.itemList                            //table上面的slider
                ? context.itemList
                : _.uniqBy(context.itemList, "machine_type_name").map(
                    (obj, i) => (
                      <TabPane
                        tab={
                          <Fragment>
                            <img
                              width="80px"
                              height="80px"
                              src={"http://" + obj.photo_preview_url}
                              alt=""
                            />
                            <br />
                            <span>{obj.machine_type_name}</span>
                          </Fragment>
                        }
                        key={i}
                      />
                    )
                  )}
            </Tabs>

            <div className="table-body">
              <Table
                className="linebar"
                rowClassName={(_, index) => {
                  if (index === 0) return "statusbar";
                  else return "even-row";
                }}
                columns={getPopOver()}
                dataSource={context.firstDataSource}
                pagination={false}
                rowKey={(_, index) => index}
                
                bordered
              />
              <div className="pl-arrow" onClick={handleLeftClick}>
                <Icon className="arrow-icon" type="left" />
              </div>
              <Table
                className="prodlines"
                columns={
                  context.searchText
                    ? context.searchText
                    : context.secondColumns
                }
                dataSource={context.secondDataSource}
                pagination={false}
                rowClassName={(_, index) => {
                  if (index === 0) return "statusbar";
                  else if (index % 2 === 1) return "odd-row";
                  else if (index % 2 === 0) return "even-row";
                  else return null;
                }}
                rowKey={(_, index) => index}
                bordered
              />
              <div
                style={{ marginLeft: "auto" }}
                className="pl-arrow"
                onClick={handleLeftClick}
              >
                <Icon className="arrow-icon" type="right" />
              </div>
            </div>
          </Spin>
        </div>
      );
    }}
  </MachineContextConsumer>
);
const handleLeftClick = e => {             //左右按鍵控制Table content的view
  //"anticon-left" is defined by antd, dont change it
  let isLeft = e.target.children[0]        //用點擊到的目標判斷是左還是右
    ? e.target.children[0].classList[1] === "anticon-left"
    : e.target.classList[1] === "anticon-left";
  let leftButton = document.getElementsByClassName(
    "ant-table-wrapper prodlines"
  )[0];
  let sleft = leftButton.scrollLeft;
  leftButton.scrollTo({
    top: 0,
    left: isLeft ? sleft - 300 : sleft + 300,
    behavior: "smooth"
  });
};

const getPopOver = () => {                //在一個Table的內容 顯示 popover ,非事件
  return [{ title: "Line", dataIndex: "Line", key: "123123",
  render:(text,record)=>{
    const normal = _.find(record.criteria_items,{data_event_type:"Normal"});
    const warning = _.find(record.criteria_items,{data_event_type:"Warning"});
    const critical = _.find(record.criteria_items,{data_event_type:"Critical"});
    return text!=="Status"?<Popover className="popover" content={<div className="popup">
      { normal?<p className="text-normal"><span>Normal :</span>{conditionText(normal.condition)}</p>:null}
      { warning?<p className="text-warning"><span>Warning :</span>{conditionText(warning.condition)}</p>:null}
      { critical?<p className="text-critical"><span>Critical :</span>{conditionText(critical.condition)}</p>:null}
    </div>} title={<p className="popup-title">Criteria Settings</p>}><div><span>{text}</span></div></Popover>
    :text
  }
  }];
}
const conditionText = (condition) => {     //popover 的內容  ,非事件
  switch(condition.operator_id) {
    case "equal_to":
      return " value = " + condition.value;
    case "less_than":
      return " value < " + condition.value;
    case "range":
      return " " + condition.min + " <= value <= " + condition.max;
    case "greater_than":
      return " value > " + condition.value;
    case "not_equal_to":
      return " value != " + condition.value;
    case "greater_than_or_equal_to":
      return " value >= " + condition.value;
    case "less_than_or_equal_to":
      return " value <= " + condition.value;
    default :
      return "...";
  }
}

export default MachineDashboardTable;
