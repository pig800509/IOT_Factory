import React from "react";
import { Input, AutoComplete, Icon } from "antd";
import { MachineContextConsumer } from "./MachineProvider";
// import _ from "lodash";

//Search 的元件, AutoComplete, 還原註解即可調用 AutoComplete 選單
const SearchAuto = () => (
  <MachineContextConsumer>
    {context => {
      return (
        <AutoComplete
          className="plsearch"
          style={{ width: "200px" }}
          //dataSource={_.map(context.secondColumns, "title").map(renderOption)}
          placeholder="try to type"
          filterOption={(inputValue, option) =>
            option.props.children.indexOf(inputValue) !== -1
          }
          onSearch={context.onSearch}
          onSelect={context.onSearch}
        >
          <Input                 //Search 輸入
            className="searchColor"
            style={{ width: "200px" }}
            suffix={<Icon type="search" />}
          />
        </AutoComplete>
      );
    }}
  </MachineContextConsumer>
);
// const renderOption = item => {
//   return (
//     <AutoComplete.Option key={item} className="pl-search-list">
//       {item}
//     </AutoComplete.Option>
//   );
// };
export default SearchAuto;
