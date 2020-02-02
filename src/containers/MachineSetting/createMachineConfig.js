import React  from 'react';
import { Modal, Form, Select, Divider, Table } from 'antd';
import _ from 'lodash'; 
import {dashboardApiUrl} from '../../config';
import CheckError from '../../component/handleErrors';
const FormItem = Form.Item;
const Option = Select.Option;

const createMachineConfig = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        token:props.token,    
        creatAttacheddevices: false,
        selectedRowKeys: [],
        array:[],
        provinceData:[],
        allData:[],
        machineTypeName: [],
        attributeName: [],
        machineTypes:[],
        nowMachineTypeId:'',
        nowAttributeName:'',
        rules:[]
      };
    }

    handleProvinceChange = (value) => {

      const machineTypeName=_.find(this.state.provinceData, { 'machine_type_id': value});
     
      this.setState({
        machineTypeName: this.state.allData[machineTypeName.machine_type_name],
        attributeName: this.state.allData[machineTypeName.machine_type_name][0]!==undefined?this.state.allData[machineTypeName.machine_type_name][0]:'',
        nowAttributeName:this.state.allData[machineTypeName.machine_type_name][0],
        nowMachineTypeId:value
      });
      
      const nowMachineTypeId=value
      const nowAttributeName=this.state.allData[machineTypeName.machine_type_name][0]

      let url=`${dashboardApiUrl}/dashboardConfigs/machineDashboard/dataProcessRules?machine_type_id=${nowMachineTypeId}&attribute_name=${nowAttributeName}`
      fetch(url,this.state.token).then(CheckError.resCheck)
        .then((data) => {
          this.setState({rules:data.rules}) 
        })
        .catch((error) => {
          console.error(error)
        }) 
      if(this.state.allData[machineTypeName.machine_type_name][0]===undefined){
        this.props.form.setFieldsValue({
          attribute_name: '',
        });
      }else{
        this.props.form.setFieldsValue({
          attribute_name:this.state.allData[machineTypeName.machine_type_name][0],
        });
      }
    }
  
    onattributeNameChange = (value) => {
      this.setState({
        attributeName: value,
        nowAttributeName:value
      });
      
      const nowMachineTypeId=this.state.nowMachineTypeId
      const nowAttributeName=value

      let url=`${dashboardApiUrl}/dashboardConfigs/machineDashboard/dataProcessRules?machine_type_id=${nowMachineTypeId}&attribute_name=${nowAttributeName}`
      fetch(url,this.state.token).then(CheckError.resCheck)
        .then((data) => {
          this.setState({rules:data.rules}) 
        })
        .catch((error) => {
          console.error(error)
        }) 
    }

    componentDidMount() { 

      
      let urlAttributeNames=`${dashboardApiUrl}/dashboardConfigs/machineDashboard/attributeNames/`
      fetch(urlAttributeNames,this.state.token).then(CheckError.resCheck)
        .then((data) => {
          this.setState({machineTypes:data.machineTypes}) 
         
          const dropDownList=data.machineTypes;
          let provinceData=[];
          let cityData={};
          dropDownList.map((value,key)=>{
            let newData=_.uniqBy(value.attributes, 'attribute_name');
            
            let cityDataNew=[];
            newData.map((machineValue)=>{
              return cityDataNew.push(machineValue.attribute_name)
            })     
            cityData[value.machine_type_name] = cityDataNew; 

            return provinceData.push({machine_type_id:value.machine_type_id,machine_type_name:value.machine_type_name})
          })
        
          
          this.setState({provinceData:provinceData})
          this.setState({allData:cityData})
          this.setState({machineTypeName:provinceData[0]?cityData[provinceData[0].machine_type_name]:[]})
          this.setState({attributeName:provinceData[0]?cityData[provinceData[0].machine_type_name][0]:[]})
          this.setState({nowMachineTypeId:provinceData[0]?provinceData[0].machine_type_id:''}) 
          this.setState({nowAttributeName:provinceData[0]?cityData[provinceData[0].machine_type_name][0]:''})
          const nowMachineTypeId=provinceData[0]?provinceData[0].machine_type_id:''
          const nowAttributeName=provinceData[0]?cityData[provinceData[0].machine_type_name][0]:''

          let url=`${dashboardApiUrl}/dashboardConfigs/machineDashboard/dataProcessRules?machine_type_id=${nowMachineTypeId}&attribute_name=${nowAttributeName}`
          fetch(url,this.state.token).then(CheckError.resCheck)
            .then((data) => {
              this.setState({rules:data.rules}) 
            })
            .catch((error) => {
              console.error(error)
            }) 
        })
        .catch((error) => {
          console.error(error)
        }) 
      
    } 
    
    onSelectChange = (selectedRowKeys,selectedRows) => {

      this.setState({ selectedRowKeys });
      this.setState({array:selectedRows})
      
    }
    
    onCreate = (e) => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          this.props.onCreate(this.state.array);
          this.props.form.resetFields();
        } 
      })
    }
    conditionFunction(value){
      if(value==='greater_than'){return <span>&gt;</span>}
      else if(value==='less_than'){return <span>&lt;</span>}
      else if(value==='equal_to'){return <span>=</span>}
      else if(value==='greater_than_or_equal_to'){return <span>&ge;</span>}
      else if(value==='less_than_or_equal_to'){return <span>&le;</span>}
      else if(value==='range'){return <span>range</span>}
      else if(value==='not_equal_to'){return <span>!=</span>}
    }
    render() {
      
      const { selectedRowKeys,provinceData } = this.state;
      const { visible, onCancel } = this.props;
      const { getFieldDecorator } = this.props.form;
      
      const columns = [{
        title: 'Rule name',
        dataIndex: 'rule_name',
        key: 'rule_name',
        className:'classcolor',
      }, {
        title: 'critical',
        dataIndex: 'critical',
        key: 'critical',
        className:'classcolor',
        render: (text, record) => {
          const condition=this.conditionFunction(record.datacriteria_settings.criteria_items[2].condition.operator_id)
          if(record.datacriteria_settings.criteria_items[2].condition.operator_id==='range'){
            return(<span>{record.datacriteria_settings.criteria_items[2].condition.min}&lt; ~ &lt;{record.datacriteria_settings.criteria_items[2].condition.max}</span>)
          }
          return(<div>{record.datacriteria_settings.criteria_items[2].condition.value?condition:''}<span>{record.datacriteria_settings.criteria_items[2].condition.value}</span></div>)
        } 
      }, {
        title: 'warring',
        dataIndex: 'warring',
        key: 'warring',
        className:'classcolor',
        render: (text, record) => {
          const condition=this.conditionFunction(record.datacriteria_settings.criteria_items[1].condition.operator_id)
          if(record.datacriteria_settings.criteria_items[1].condition.operator_id==='range'){
            return(<span>{record.datacriteria_settings.criteria_items[1].condition.min}&lt; ~ &lt;{record.datacriteria_settings.criteria_items[1].condition.max}</span>)
          }
          return(<div>{record.datacriteria_settings.criteria_items[1].condition.value?condition:''}<span>{record.datacriteria_settings.criteria_items[1].condition.value}</span></div>)
        } 
      }, {
        title: 'normal',
        dataIndex: 'normal',
        key: 'normal',
        className:'classcolor',
        render: (text, record) => {
          const condition=this.conditionFunction(record.datacriteria_settings.criteria_items[0].condition.operator_id)
          if(record.datacriteria_settings.criteria_items[0].condition.operator_id==='range'){
            return(<span>{record.datacriteria_settings.criteria_items[0].condition.min}&lt; ~ &lt;{record.datacriteria_settings.criteria_items[0].condition.max}</span>)
          }
          return(<div>{record.datacriteria_settings.criteria_items[0].condition.value?condition:''}<span>{record.datacriteria_settings.criteria_items[0].condition.value}</span></div>)
        } 
      }];
      
      
      const rowSelection = {
        type: 'radio',
        selectedRowKeys,
        onChange: this.onSelectChange,
        className:'classcolor',
        
      };
      const { machineTypeName } = this.state;
      
      return (
        
        <Modal
          visible={visible}
          title="Create"
          okText="Create"
          onCancel={onCancel}
          onOk={this.onCreate.bind(this)}
        >
          <Form layout="vertical">
            <FormItem label="Machine type">
              {getFieldDecorator('machine_type_id', {
                rules: [{ required: true}],initialValue: provinceData[0]?provinceData[0].machine_type_id:''
              })(
                <Select  onChange={this.handleProvinceChange} >
                  {provinceData.map((VALUE,key)=><Option key={key} value={VALUE.machine_type_id}>{VALUE.machine_type_name}</Option>)}
                </Select>
              )}
            </FormItem>
            <FormItem label="Data Attribute">
              {getFieldDecorator('attribute_name', {
                rules: [{ required: true}],initialValue: this.state.attributeName
              })(
                <Select  onChange={this.onattributeNameChange} > 
                  {machineTypeName.map(city => <Option key={city}>{city}</Option>)}
                </Select>
              )}
            </FormItem>
            <Divider orientation="left">Criterial Rule list</Divider>
            <FormItem >
              {getFieldDecorator('selectedRowKeys')(<Table  columns={columns} dataSource={this.state.rules} pagination={false} rowSelection={rowSelection} rowKey={data => data._id} className="popuprow"/>)}
            </FormItem>
            
          </Form>
        </Modal>
      );
    }
  }
);


export default createMachineConfig;