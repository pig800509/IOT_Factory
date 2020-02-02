import React  from 'react';
import { Modal, Form, Table, Button, Switch, message } from 'antd';
import CreateDataProcessRule from './createDataProcessRule';
import EditDataProcessRule from './editDataProcessRule';
import {  dataApiUrl } from '../../config';
import CheckError from '../../component/handleErrors';

import _ from 'lodash';
const confirmModal = Modal.confirm;
let delconform;

const listDataProcessRule = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {  
        token : props.token, 
        machine_id: props.machine_id,
        createDataProcessRule: false,
        editDataProcessRule: false,
        rule_list:'',
        editDataProcessRule_data:'',
        editDataProcessRulebyruleid:'',
        nowState:''
      };
    }
   
    componentDidUpdate() { 
      if(this.props.editDataProcessRule_data!==this.state.editDataProcessRule_data){
        this.setState({ editDataProcessRule_data:this.props.editDataProcessRule_data });
        let url=`${dataApiUrl}/deviceData/dataProcessRules?device_id=${this.props.editDataProcessRule_data}`
       
        fetch(url,this.state.token).then(CheckError.resCheck)
        .then((data) => {this.setState({rule_list:data.rule_list}) })
        .catch((error) => {console.error(error)}) 
      }  
    } 
     /*Create  Data Process Rule start*/
        showCreateDataProcessRule(){
            this.setState({createDataProcessRule:true});
        }
        cancelCreateDataProcessRule = () => {
            const form = this.formRef.props.form;
            form.resetFields();
            this.setState({ createDataProcessRule: false });
        }
        submitCreateDataProcessRule = (propsvalue,value2,dataRuleSetting,transformCheck) => {
            
            const form = this.formRefcreate.props.form;
            form.validateFields((err, values) => {
              if (err) {
                return;
              }
              let dataRuleSettingState=dataRuleSetting?"1":"0"
              let transformCheckState=transformCheck?"1":"0"

              let mailData=[];
              for(var i=0;i<value2.length;i++){
                mailData.push({'action':value2[i].number,"settings":{"title" :value2[i].title,"message" :value2[i].message,}})
                // console.log(mailData)
              }
              // const filterDate= _.filter(mailData, { 'action': 'Normal_mail' });
              // const filterDate_Warning= _.filter(mailData, { 'action': 'Warning_mail' });
              // const filterDate_Critical= _.filter(mailData, { 'action': 'Critical_mail' });

              const filterDateLast=_.last( _.filter(mailData, { 'action': 'Normal_mail' }));
              const filterDate=[]
              filterDate.push(filterDateLast)
              const filterDate_WarningLast=_.last( _.filter(mailData, { 'action': 'Warning_mail' }));
              const filterDate_Warning=[]
              filterDate_Warning.push(filterDate_WarningLast)
              const filterDate_CriticalLast=_.last( _.filter(mailData, { 'action': 'Critical_mail' }));
              const filterDate_Critical=[]
              filterDate_Critical.push(filterDate_CriticalLast)
             
          
                let criteria_items_value=[]
                let condition_type=[]
                if(values.normal==='range'){
                    condition_type.push({
                      "operator_id" : values.normal?values.normal:'',
                      "min" : values.normal_min_value?values.normal_min_value:'',
                      "max" : values.normal_max_value?values.normal_max_value:''      
                    })
                  }else{
                    condition_type.push({
                      "operator_id" : values.normal?values.normal:'',
                      "value" : values.normal_min_value?values.normal_min_value:''    
                    })
                  }
                  criteria_items_value.push(
                    {
                                
                      "data_event_type" : "Normal",
                      "active_status" : "1",
                      "condition" : condition_type[0],
                      "action" : {
                          "action_id" : values.normal_action?values.normal_action:'',
                          "settings" : filterDate[0]?filterDate[0].settings:{'action':'Normal_mail',"settings":{"title":'',"message" :''}}
                      }
                  }
                )


                if(values.warning==='range'){
                  condition_type.push({
                    "operator_id" : values.warning?values.warning:'',
                    "min" : values.warning_min_value?values.warning_min_value:'',
                    "max" : values.warning_max_value?values.warning_max_value:''      
                  })
                }else{
                  condition_type.push({
                    "operator_id" : values.warning?values.warning:'',
                    "value" : values.warning_min_value?values.warning_min_value:''    
                  })
                }
                criteria_items_value.push(
                  {            
                    "data_event_type" : "Warning",
                    "active_status" : "1",
                    "condition" : condition_type[1],
                    "action" : {
                         "action_id" : values.warning_action?values.warning_action:'',
                         "settings" : filterDate_Warning[0]?filterDate_Warning[0].settings:{'action':'Warning_mail',"settings":{"title":'',"message" :''}}
                    }
                 }
                )

                if(values.critical==='range'){
                  condition_type.push({
                    "operator_id" : values.critical?values.critical:'',
                    "min" : values.critical_min_value?values.critical_min_value:'',
                    "max" : values.critical_max_value?values.critical_max_value:''      
                  })
                }else{
                  condition_type.push({
                    "operator_id" : values.critical?values.critical:'',
                    "value" : values.critical_min_value?values.critical_min_value:''    
                  })
                }
                criteria_items_value.push(
                {
                              
                    "data_event_type" : "Critical",
                    "active_status" : "1",
                    "condition" : condition_type[2],
                    "action" : {
                         "action_id" : values.critical_action?values.critical_action:'',
                         "settings" : filterDate_Critical[0]?filterDate_Critical[0].settings:{'action':'Critical_mail',"settings":{"title":'',"message" :''}}
                    }
                 }
                )

              
              let str=values.attribute_name.split('/')
             
              const data=
              {
                "rule_name" : values.rule_name,
                "description" : values.description,
                "device_id" : this.props.editDataProcessRule_data,
                "machine_id" : localStorage.machineId,
                "machine_type_id" : localStorage.machineTypeId,
                "pl_id" : localStorage.plId,
                "attribute_id" : str[0],
                "attribute_name":str[1],
                "attribute_unit" : str[2],
                "data_type" : values.data_type,
                "data_key" : values.data_key,
                "transform_settings" : {
                     "enable" : transformCheckState,
                    //  "transform_id" :  transformCheckState==='0'?'':values.functions,
                    "transform_id" :  values.functions,
                     "transform_params" : {
                          "data_key" : values.data_key,
                          "coef" : propsvalue.coef?propsvalue.coef:'',
                          "offset" : propsvalue.offset?propsvalue.offset:''
                     },
                    //  "transform_result" : values.result
                     "transform_result" :str[1]
                },
                "datacriteria_settings" : {
                      "enable" : dataRuleSettingState,
                      // "target" : values.result,
                      "target" : str[1],
                      "criteria_items" : criteria_items_value
                }
              };
              
              let url=`${dataApiUrl}/deviceData/dataProcessRules`;
             
              fetch(url,{
                ...this.state.token,
                method: 'POST',
                body: JSON.stringify(data)
              }).then(CheckError.resCheck).then((response) => {
      
                let url=`${dataApiUrl}/deviceData/dataProcessRules?device_id=${this.props.editDataProcessRule_data}`
                fetch(url,this.state.token).then(CheckError.resCheck)
                .then((data) => {this.setState({rule_list:data.rule_list}) })
                .catch((error) => {console.error(error)})                 
              })
              form.resetFields();
              this.setState({ createDataProcessRule: false }); 
            })
            // form.resetFields();
            // this.setState({ createDataProcessRule: false });
        }
        saveCreateDataProcessRuleFormRef = (formRefcreate) => {
            this.formRefcreate = formRefcreate;
        }
    /*Create Data Process Rule end*/
    /*Edit  Data Process Rule start*/
      showEditDataProcessRule(value,active_status){
         
          this.setState({nowState:active_status});
          this.setState({editDataProcessRule:true});
          this.setState({editDataProcessRulebyruleid:value});
      }
      canceleditDataProcessRule = () => {
          const form = this.formRef.props.form;
          form.resetFields();
          this.setState({ editDataProcessRule: false });
      }
      submiteditDataProcessRule = (propsvalue,functionData,ruleId,dataRuleSetting,transformCheck) => {
      
          const form = this.formRef.props.form;
          form.validateFields((err, values) => {
            if (err) {
              return;
            }
            let dataRuleSettingState=dataRuleSetting?"1":"0"
            let transformCheckState=transformCheck?"1":"0"
           
            if(propsvalue[0].condition.operator_id==='range'){propsvalue[0].condition.max=values.normal_max_value;propsvalue[0].condition.min=values.normal_min_value}
            else{propsvalue[0].condition.value=values.normal_min_value}
            if(propsvalue[1].condition.operator_id==='range'){propsvalue[1].condition.max=values.warning_max_value;propsvalue[1].condition.min=values.warning_min_value;}
            else{propsvalue[1].condition.value=values.warning_min_value}
            if(propsvalue[2].condition.operator_id==='range'){propsvalue[2].condition.max=values.critical_max_value;propsvalue[2].condition.min=values.critical_min_value;}
            else{propsvalue[2].condition.value=values.critical_min_value}
            
            // let str=values.attribute_name.split('/')

            const data=
            {
              "rule_name" : values.rule_name,
              "description" : values.description,
            
              "data_type" : values.data_type,
              "data_key" : values.data_key,
              "transform_settings" : {
                    "enable" : transformCheckState,
                    "transform_id" : values.functions,
                    "transform_params" : {
                        "data_key" : values.data_key,
                        "coef" : functionData.coef?functionData.coef:'',
                        "offset" : functionData.offset?functionData.offset:''
                    },
                
              },
              "datacriteria_settings" : {
                    "enable" : dataRuleSettingState,
                  
                    "criteria_items" : propsvalue
              },
            
            };

            let url=`${dataApiUrl}/deviceData/dataProcessRules/${ruleId}`;
     
              fetch(url,{
                ...this.state.token,
                method: 'PUT',
                body: JSON.stringify(data)
              }).then(CheckError.resCheck).then((response) => {  
                let url=`${dataApiUrl}/deviceData/dataProcessRules?device_id=${this.props.editDataProcessRule_data}`
                fetch(url,this.state.token).then(CheckError.resCheck)
                .then((data) => {this.setState({rule_list:data.rule_list}) })
                          
              })  
            
          })
          form.resetFields();
          this.setState({ editDataProcessRule: false });
      }
      saveEditDataProcessRuleFormRef = (formRef) => {
          this.formRef = formRef;
      }
    /*Edit Data Process Rule end*/
    showdeleteDataprossrule(value){
      delconform=confirmModal({
        title:'Are you sure you want to remove this device ?',
        okText: 'OK',
        cancelText: 'Cancel',
        visible:true,
        onOk:(e) => this.deleteFunction(value) ,
      });
    }
    deleteFunction(value){
      let url = `${dataApiUrl}/deviceData/dataProcessRules/${value}`;
      fetch(url, {...this.state.token,method: 'DELETE'}).then(CheckError.resCheck)
        .then((response) => {
          delconform.destroy();
          message.success('Deleted!',2);
        })
        .catch((error) => {
          console.error(error)
        }).then(()=>{
          let url=`${dataApiUrl}/deviceData/dataProcessRules?device_id=${this.props.editDataProcessRule_data}`
          fetch(url,this.state.token).then(CheckError.resCheck)
          .then((data) => {this.setState({rule_list:data.rule_list}) })
          .catch((error) => {console.error(error)})  
      }) 
    }
    showeditDataprossrule(){
      this.setState({createDataProcessRule:true});
    }
    onStatusChange(rule_id,e) {
    
      const num= (e) ? 1:0
      const stateObj={"active_status" : num}
      const url=`${dataApiUrl}/deviceData/dataProcessRules/actions/active/${rule_id}`
      
      fetch(url,{
        ...this.state.token,
        method: 'PUT',
        body: JSON.stringify(stateObj)
      }).then(CheckError.resCheck)
      .then(()=>{
        let url=`${dataApiUrl}/deviceData/dataProcessRules?device_id=${this.props.editDataProcessRule_data}`
        fetch(url,this.state.token).then(CheckError.resCheck)
        .then((data) => {this.setState({rule_list:data.rule_list}) })
        .catch((error) => {console.error(error)}) 
      })
    }
    render() {
      const { visible, onCancel, onCreate } = this.props;
      const dataSource = [...this.state.rule_list];
      const columns = [{
        title: 'Rule Name',
        dataIndex: 'rule_name',
        className:'classcolor',

      }, {
        title: 'Attribute name',
        dataIndex: 'attribute_name',
        className:'classcolor',
      }, {
        title: 'Data Type',
        dataIndex: 'data_type',
        className:'classcolor',
 
      }, {
          title: 'Data Key',
          dataIndex: 'data_key',
          className:'classcolor',
   
      }, {
          title: 'Transform Functions',
          dataIndex: 'transform_functions',
          className:'classcolor',
     
          render:(text, record)=>{
            if(record.transform_settings.enable!=='0'){
              if(record.transform_settings.transform_id==='TF_AIOPress'){ return  (<span>AIO Press/ Oxygen Concentration</span>)}
              else if(record.transform_settings.transform_id==='TF_CycleTime'){return  (<span>Cycle Time</span>)}
              else if(record.transform_settings.transform_id==='TF_CopyData'){return  (<span>CopyData</span>)}
              else{return  (<span></span>)}
            } else{
              return  (<span></span>)
            }
          }
      }, {
          title: 'Data Criteria Settings',
          dataIndex: 'datarule_settings',
          className:'classcolor',
         
          render:(text, record)=>{
            return  (<span>{record.datacriteria_settings.enable==='1'||record.datacriteria_settings.enable===1?"V":"X"}</span>)
          }
      }, {
          title: 'Active Status',
          dataIndex: 'active_status',
          className:'classcolor',
          

          render:(text, record)=>{
            // return (<div><Switch   /></div>)
            const status=(text===1) ? true:false     
            return (<Switch checked={ status}  onChange={(e) => this.onStatusChange(record.rule_id,e)}  />)}
      }, {
          title: 'Action',
          dataIndex: 'action',
          className:'classcolor',
         
          render: (text, record) => {
            const status=(record.active_status===1)?true:false
          
            return(
              <span>
                <Button shape="circle" icon="edit" className="actionbtn" onClick={() => this.showEditDataProcessRule(record.rule_id,record.active_status)}/>
                <Button shape="circle" icon="delete" className="actionbtn" onClick={() => this.showdeleteDataprossrule(record.rule_id)} disabled={status}/>
              </span>
            )
          },
      }];
      return (
        <Modal
          visible={visible}
          title="Data Process Rule"
          okText="OK"
          onCancel={onCancel}
          onOk={onCreate}
          width={1300}
        >
          
          <Button shape="circle" icon="plus" className="actionbtn" style={{float:'right',marginBottom:'5px',zIndex:"2"}} onClick={() => this.showCreateDataProcessRule()}/>  
          <Table  columns={columns} dataSource={dataSource} pagination={false} rowKey={data => data._id} className="popuprow"/>
          <CreateDataProcessRule
            wrappedComponentRef={this.saveCreateDataProcessRuleFormRef}
            visible={this.state.createDataProcessRule}
            onCancel={this.cancelCreateDataProcessRule}
            onCreate={(value,value2,dataRuleSetting,transformCheck) => this.submitCreateDataProcessRule(value,value2,dataRuleSetting,transformCheck)}
            machine_id={this.state.machine_id}
            token={this.state.token}
          />
          <EditDataProcessRule
            wrappedComponentRef={this.saveEditDataProcessRuleFormRef}
            visible={this.state.editDataProcessRule}
            onCancel={this.canceleditDataProcessRule}
            // onCreate={() => this.submiteditDataProcessRule()}
            editDataProcessRulebyruleid={this.state.editDataProcessRulebyruleid}
            onCreate={(value,value2,ruleId,dataRuleSetting,transformCheck) => this.submiteditDataProcessRule(value,value2,ruleId,dataRuleSetting,transformCheck)}
            token={this.state.token}
            nowState={this.state.nowState}
          />
        </Modal>
      );
    }
  }
);
export default listDataProcessRule;