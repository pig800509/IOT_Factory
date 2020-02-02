import React from "react";
import _ from "lodash";
import { notification } from "antd";
import { dashboardApiUrl } from "../../config";
import CheckError from "../../component/handleErrors";

const GetDashboard = {
  getAttributeAPI: async token => {            //取得第一個Table的API
    return await getDataFromAPI(
      dashboardApiUrl + "/dashboardData/machineData/machineItems",
      token
    );
  },
  getLineAPI: async token => {                 //取得第二個Table的API
    return await getDataFromAPI(
      dashboardApiUrl + "/dashboardData/machineData",
      token
    );
  },
  trasferLineSchema: arrayList => {           //轉換API資料給第一個Table datasource
    return [].concat.apply(
      [{ Line: "Status" }],
      Array.from(arrayList, v => {
        return Array.from(Array(v.max_count)).map((_, i) => {
          return {
            Line: v.machine_type_name + "(" + (i + 1) + ")" + v.attribute_name,
            machine_type_id: v.machine_type_id,                     //為了第二個Table傳遞attribute_name
            attribute_name: v.attribute_name,                       //為了第二個Table傳遞attribute_name
            criteria_items: v.datacriteria_settings.criteria_items  //為了顯示 popover
          };
        });
      })
    );
  },
  trasferPLColumn: prodlist => {                //轉換API資料給第二個Table Column
    return prodlist.map((obj, index) => {
      return {
        title: obj.pl_name,
        dataIndex: obj.pl_name,
        key: index,
        render: (text, _) => {
          const color_text = text.split("_");   // [0]是顏色, [1]是status or text, [2]是 value
          return {
            props: {
              className: color_text[1] + "-" + color_text[0].toLowerCase()  //color_text[1] 是型態 有分status, text
            },            //color_text[0] 是顏色
            children: <span>{color_text[2]}</span>    //color_text[2] 就是 value
          };
        }
      };
    });
  },
  trasferPLValueSchema: (first_column, prod_lines, item_list) => {  //轉換API資料給第二個Table datasource
    let tdBuffer = prod_lines;
    const resultTd = first_column.map((obj, index) => {
      return _.mapValues(_.keyBy(prod_lines, "pl_name"), o => {
        if (index === 0) {                                         //判斷是不是第一行,是的話 就是 status
          return (
            StatusColorChecker(o.machines_data, item_list) + "_status_status"   //ex:normal_status_status
          );
        } else {                                                  //不是第一行, 就是 text
          let found =                                       //ex:
                                                            //   {
                                                            //     "machine_type_id": "20181025033756",
                                                            //     "machine_type_name": "PT-1",
                                                            //     "machine_id": "20181025083814",
                                                            //     "machine_name": "PT-1c",
                                                            //     "machine_no_for_machine_type": 3,
                                                            //     "attribute_name": "PM",
                                                            //     "attribute_unit": "mm",
                                                            //     "value": "333"
                                                            // }
            _.find(o.machines_data, {
              machine_type_id: obj.machine_type_id,
              attribute_name: obj.attribute_name
            }) || undefined;
          if (found) {
            _.pull(tdBuffer[_.findIndex(tdBuffer, o)].machines_data, found);
            return (                                      //ex: Critical_text_333 bb
              TextColorChecker(found, item_list) +
              "_text_" +
              found.value +
              " " +
              found.attribute_unit
            );
          } else return "gray_text_--";
        }
      });
    });
    return resultTd;
  }
};
export default GetDashboard;

const StatusColorChecker = (machineDatas, item_list) => {     //用於給予第二個Table第一排 class 來改變顏色
  const final_colors = machineDatas.map(obj => {
    return TextColorChecker(obj, item_list);
  });
  const isCritical = _.find(final_colors, o => {
    return o === "Critical";
  });
  const isWarning = _.find(final_colors, o => {
    return o === "Warning";
  });
  const isNormal = _.find(final_colors, o => {
    return o === "Normal";
  });
  if (isCritical) return "critical";
  else if (isWarning) return "warning";
  else if (isNormal) return "normal";
  else return "gray";
};

const getDataFromAPI = async (url, token) => {  //共用API的方法
  const data = await fetch(url, {
    headers: {
      Authorization: token
    },
    method: "GET"
  })
    .then(CheckError.resCheck)
    .catch(err => {
      openNotificationWithIcon("error", "Server error", err + " " + url);
      return { error: err + " " + url };
    });
  return data;
};

const TextColorChecker = (machineObj, item_list) => {    //改變第二個Table中第二排之後欄位文字的顏色
  const standard = _.find(item_list, {
    machine_type_id: machineObj.machine_type_id,
    attribute_name: machineObj.attribute_name
  });
  const rule = standard ? standard.datacriteria_settings : undefined;
  const color = rule
    ? _.find(
        standard.datacriteria_settings.criteria_items.map(ob => {
          switch (ob.condition.operator_id) {
            case "equal_to":
              return parseInt(machineObj.value, 10) ===
                parseInt(ob.condition.value, 10)
                ? ob.data_event_type
                : null;
            case "less_than":
              return parseInt(machineObj.value, 10) <
                parseInt(ob.condition.value, 10)
                ? ob.data_event_type
                : null;
            case "range":
              return parseInt(machineObj.value, 10) >=
                parseInt(ob.condition.min, 10) &&
                parseInt(machineObj.value, 10) <= parseInt(ob.condition.max, 10)
                ? ob.data_event_type
                : null;
            case "greater_than":
              return parseInt(machineObj.value, 10) >
                parseInt(ob.condition.value, 10)
                ? ob.data_event_type
                : null;
            case "not_equal_to":
              return parseInt(machineObj.value, 10) !==
                parseInt(ob.condition.value, 10)
                ? ob.data_event_type
                : null;
            case "greater_than_or_equal_to":
              return parseInt(machineObj.value, 10) >=
                parseInt(ob.condition.value, 10)
                ? ob.data_event_type
                : null;
            case "less_than_or_equal_to":
              return parseInt(machineObj.value, 10) <=
                parseInt(ob.condition.value, 10)
                ? ob.data_event_type
                : null;
            default:
              return null;
          }
        }),
        null
      )
    : undefined;
  return color ? color : null;
};

const openNotificationWithIcon = (type, title, des) => {   //通知彈出事件
  notification[type]({
    message: title,
    description: des.toString()
  });
};
