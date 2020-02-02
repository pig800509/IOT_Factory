import React  from 'react';
import { Modal, Form, Input, Select, Divider, Checkbox, Col, Row, Button } from 'antd';
import FunctionSetting from './functionSetting';
import MailSetting from './mailSetting';
import {transformData,dataApiUrl,plApiUrl} from '../../config';
import CheckError from '../../component/handleErrors';
const { TextArea } = Input;

const FormItem = Form.Item;
const Option = Select.Option;
const createDataProcessRule = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {    
        functionsetting: false,
        mailsetting: false,
        lockinput:true ,
        dataruleinput:true,
        functionListupdate:{},
        editDataProcessRulebyruleid:'',
        editData:{
            transform_settings:{
               
            },
            datacriteria_settings:{
                criteria_items:[{condition:{}}]
            }
        },
        transForm:{
            "enable": '1',
            "transform_id": "",
            "transform_params": {
                "data_key": "",
                "coef": "",
                "offset": ""
            },
            "transform_result": ""
        },
        ruleSettingNormal:{
            "data_event_type": "Normal",
                "active_status": "1",
                "condition": {
                    "operator_id": "",
                    "value": ""
                },
                "action": {
                    "action_id": "email",
                    "settings": {
                        "title": "",
                        "message": ""
                }
            },
        },
        ruleSettingWarning:{
            "data_event_type": "Warning",
                "active_status": "1",
                "condition": {
                    "operator_id": "",
                    "value": ""
                },
                "action": {
                    "action_id": "email",
                    "settings": {
                        "title": "",
                        "message": ""
                }
            },
        },
        ruleSettingCritical:{
            "data_event_type": "Critical",
                "active_status": "1",
                "condition": {
                    "operator_id": "",
                    "value": ""
                },
                "action": {
                    "action_id": "email",
                    "settings": {
                        "title": "",
                        "message": ""
                }
            },
        },
        editTramsform:[],
        functionList:[],
        selectedData:'',
        functionListName:'',
        functionListSelected:'',
        // functionListupdate:{},
        mailsettingNumber:'',
        dataAttribute:[],
        transformCheck:false,
        dataRuleSetting:false,
        active_status:false,
        actionNormal:'block',
        actionWarning:'block',
        actionCritical:'block',
        mailSettingValue:{ 
            "settings": {"title": "","message": ""}}
        }
        
    }
    componentDidMount(){  
       
        fetch(`${dataApiUrl}/deviceData/transformFunctions`,this.state.token).then(CheckError.resCheck)
        .then((data) => {
          this.setState({functionList:data.TRANS_CONFIG.function_list,}) 
        })
        .catch((error) => {
          console.error(error)
        }) 

        let machineTypeId=localStorage.getItem("machineTypeId");
        let url=`${plApiUrl}/machineTypes/attributes/byMachineType/${machineTypeId}`
        fetch(url,this.state.token).then(CheckError.resCheck)
        .then((data) => {
            this.setState({dataAttribute:data.attribute_list,}) 
        })
        .catch((error) => {
            console.error(error)
        }) 
        
    }
    componentWillReceiveProps= (nextProps) => {
        
        if(nextProps.editDataProcessRulebyruleid){
    
            let url=`${dataApiUrl}/deviceData/dataProcessRules/${nextProps.editDataProcessRulebyruleid}`
            fetch(url,this.state.token).then(CheckError.resCheck)
            .then((data) => {
                const nowstates=(data.active_status===1)?true:false 
                
                this.setState({active_status:nowstates})
                
                this.setState({editData:data})
   
            })

            let machineTypeId=localStorage.getItem("machineTypeId");
            let urlAttribute=`${plApiUrl}/machineTypes/attributes/byMachineType/${machineTypeId}`
            fetch(urlAttribute,this.state.token).then(CheckError.resCheck)
            .then((data) => {
                this.setState({dataAttribute:data.attribute_list,}) 
            })
            .catch((error) => {
                console.error(error)
            }) 
        }
        
        if(nextProps.nowState===0 || nextProps.nowState===1){
            
            const nowstates=(nextProps.nowState===1)?true:false 
            
            let transformCheckEnable = this.state.transformCheck
            let datacriteriaEnable = this.state.dataRuleSetting
            
            if(nowstates===true){
                this.setState({dataruleinput:true})
                this.setState({lockinput:true})
            }else{
               
                if(datacriteriaEnable===true){this.setState({dataruleinput:false})}
                else{this.setState({dataruleinput:true})}

                if(transformCheckEnable===true){this.setState({lockinput:false})}
                else{this.setState({lockinput:true})}
            }
            
        } 
        
    }

    componentDidUpdate(prevState) {

        if(this.props.editDataProcessRulebyruleid!==this.state.editDataProcessRulebyruleid){

            this.setState({ editDataProcessRulebyruleid:this.props.editDataProcessRulebyruleid });
            let url=`${dataApiUrl}/deviceData/dataProcessRules/${this.props.editDataProcessRulebyruleid}`
            fetch(url,this.state.token).then(CheckError.resCheck)
            .then((data) => {
 
                const nowstates=this.state.active_status
               
                
                //判斷checkbox是否有勾選，有勾選的要移除disable
                let datacriteriaEnable = data.datacriteria_settings.enable==='0'||data.datacriteria_settings.enable===0?false:true
                let transformCheckEnable = data.transform_settings.enable==='0' ||  data.transform_settings.enable===0?false:true

                if(nowstates===true){
                    this.setState({dataruleinput:true})
                    this.setState({lockinput:true})
                }else{
                    if(datacriteriaEnable===true){
                        this.setState({dataruleinput:false})
                    }else{
                        this.setState({dataruleinput:true})
                    }
                    if(transformCheckEnable===true){
                        this.setState({lockinput:false})
                    }else{
                        this.setState({lockinput:true})
                    }
                }

                this.setState({ transformCheck:transformCheckEnable,dataRuleSetting:datacriteriaEnable})
                this.setState({editData:data})
                let criteriaItemsData=data.datacriteria_settings.criteria_items
                this.setState({editTramsform:data.transform_settings})
                this.setState({functionListupdate:data.transform_settings?data.transform_settings.transform_params:{}})
                this.setState({functionListName:data.transform_settings.transform_id });
                for(let i=0;i<criteriaItemsData.length;i++){
        
                    if(criteriaItemsData[i].data_event_type==='Normal'){
                        this.setState({ruleSettingNormal:criteriaItemsData[i]})
                    }else if(criteriaItemsData[i].data_event_type==='Warning'){
                        this.setState({ruleSettingWarning:criteriaItemsData[i]})
                    }else if(criteriaItemsData[i].data_event_type==='Critical'){
                        this.setState({ruleSettingCritical:criteriaItemsData[i]})
                    }
                   
                }
                this.setState({selectedData:data.transform_settings.transform_id})  
                
                let actionIdNormal=data.datacriteria_settings?data.datacriteria_settings.criteria_items[0].action.action_id:''
                if(actionIdNormal==='email'){this.setState({actionNormal:'block'})}else{this.setState({actionNormal:'none'})}
                let actionIdWarning=data.datacriteria_settings?data.datacriteria_settings.criteria_items[1].action.action_id:''
                if(actionIdWarning==='email'){this.setState({actionWarning:'block'})}else{this.setState({actionWarning:'none'})}
                let actionIdCritical=data.datacriteria_settings?data.datacriteria_settings.criteria_items[2].action.action_id:''
                if(actionIdCritical==='email'){this.setState({actionCritical:'block'})}else{this.setState({actionCritical:'none'})}
               
  
            })
            .catch((error) => {console.error(error)}) 
    
        }  
        
    } 
    /*Function setting start*/
        showfunctionSetting(){
            this.setState({functionsetting:true});
        }
        cancelfunctionSetting = () => {
            const form = this.formReffunctionSetting.props.form;
            form.resetFields();
            this.setState({ functionsetting: false });
        }
        submitfunctionSetting = () => {
            const form = this.formReffunctionSetting.props.form;
            form.validateFields((err, values) => {
                this.setState({ functionListupdate: values });
            })
            form.resetFields();
            this.setState({ functionsetting: false });
        }
        savefunctionSettingRuleFormRef = (formReffunctionSetting) => {
            this.formReffunctionSetting = formReffunctionSetting;
        }
    /*Function setting end*/ 
    /*Mail setting start*/
        showmailSetting(value){
            if(value==='Normal_mail'){this.setState({ mailSettingValue: this.state.ruleSettingNormal.action.settings });}
            else if(value==='Warning_mail'){this.setState({ mailSettingValue: this.state.ruleSettingWarning.action.settings });}
            else if(value==='Critical_mail'){this.setState({ mailSettingValue: this.state.ruleSettingCritical.action.settings });}
            this.setState({mailsettingNumber:value});
            this.setState({mailsetting:true});
        }
        cancemailsetting = () => {
            const form = this.formRefmail.props.form;
            form.resetFields();
            this.setState({ mailsetting: false });
        }
        submitmailsetting = () => {
            const form = this.formRefmail.props.form;
            form.validateFields((err, values) => {
            if (err) {
                return;
            }
            
            //    if(values.number==='Normal_mail'){this.state.ruleSettingNormal.action.settings.title=values.title;this.state.ruleSettingNormal.action.settings.message=values.message}
            //    else if(values.number==='Warning_mail'){this.state.ruleSettingWarning.action.settings.title=values.title;this.state.ruleSettingWarning.action.settings.message=values.message}
            //    else if(values.number==='Critical_mail'){this.state.ruleSettingCritical.action.settings.title=values.title;this.state.ruleSettingCritical.action.settings.message=values.message}
            if(values.number==='Normal_mail'){
                let Normal = {...this.state.ruleSettingNormal};
                Normal.action.settings.title = values.title;  
                Normal.action.settings.message = values.message;                     
                this.setState({ruleSettingNormal:Normal});
            }
            else if(values.number==='Warning_mail'){
                let Warning = {...this.state.ruleSettingWarning};
                Warning.action.settings.title = values.title;  
                Warning.action.settings.message = values.message;                     
                this.setState({ruleSettingWarning:Warning});
            }
            else if(values.number==='Critical_mail'){
                let Critical = {...this.state.ruleSettingCritical};
                Critical.action.settings.title = values.title;  
                Critical.action.settings.message = values.message;                     
                this.setState({ruleSettingCritical:Critical});
            }    
            form.resetFields();
                this.setState({ mailsetting: false });
            });
        }
        savemailsettingRuleFormRef = (formRefmail) => {
            this.formRefmail = formRefmail;
        }
    /*Mail setting end*/ 

        lockinput = (e) => {
            // this.state.editData.datacriteria_settings.enable=!this.state.lockinput
            // this.state.lockinput===true?"":""
            // const newCheck=!this.state.lockinput?1:0
            // this.state.editData.transform_settings.enable=newCheck
            this.setState({
                lockinput:!this.state.lockinput,
                transformCheck:!this.state.transformCheck,
            })
        }
        lockdataruleinput = (e) => {
            
  
            this.setState({
                dataruleinput:!this.state.dataruleinput,
                dataRuleSetting:!this.state.dataRuleSetting,
            })
        }

       
        functionChange=(changedValue)=>{
            this.setState({functionListName:changedValue})
        }
        normal_change = (changedValue) => {
            // this.state.ruleSettingNormal.condition.operator_id=changedValue
            let Normal = {...this.state.ruleSettingNormal};
            Normal.condition.operator_id = changedValue;                  
            this.setState({ruleSettingNormal:Normal});
        }
        warning_change= (changedValue) => {
           
            // this.state.ruleSettingWarning.condition.operator_id=changedValue
            let Warning = {...this.state.ruleSettingWarning};
            Warning.condition.operator_id = changedValue;                  
            this.setState({ruleSettingWarning:Warning});
        }
        critical_change= (changedValue) => {
            
            // this.state.ruleSettingCritical.condition.operator_id=changedValue
            let Critical = {...this.state.ruleSettingCritical};
            Critical.condition.operator_id = changedValue;                  
            this.setState({ruleSettingCritical:Critical});
        }
        changeActionNormal=(value)=>{  
            // this.state.ruleSettingNormal.action.action_id=value
            let Normal = {...this.state.ruleSettingNormal};
            Normal.action.action_id = value;                  
            this.setState({ruleSettingNormal:Normal});
            if(value==='email'){this.setState({actionNormal:'block'})}else{this.setState({actionNormal:'none'})}
        }
        changeActionWarning=(value)=>{
            // this.state.ruleSettingWarning.action.action_id=value
            let Warning = {...this.state.ruleSettingWarning};
            Warning.action.action_id = value;                  
            this.setState({ruleSettingWarning:Warning});
            if(value==='email'){this.setState({actionWarning:'block'})}else{this.setState({actionWarning:'none'})}
        }
        changeActionCritical=(value)=>{
            // this.state.ruleSettingCritical.action.action_id=value
            let Critical = {...this.state.ruleSettingCritical};
            Critical.action.action_id = value;                  
            this.setState({ruleSettingCritical:Critical});
            if(value==='email'){this.setState({actionCritical:'block'})}else{this.setState({actionCritical:'none'})}
        }
        onCreate(e) {
            e.preventDefault();
            this.props.form.validateFields((err, values) => {
                if (!err) {
            
                    const criteria_items=[this.state.ruleSettingNormal,this.state.ruleSettingWarning,this.state.ruleSettingCritical]
                    this.props.onCreate(criteria_items,this.state.functionListupdate,this.state.editDataProcessRulebyruleid,this.state.dataRuleSetting,this.state.transformCheck);
                    this.props.form.resetFields();
                }   
            })
            
        }
  
    render() {  

      const formItemLayout = {
          labelCol: {
            xs: { span: 24 },
            sm: { span: 4 },
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 19 },
          },
      };  
      const { visible, onCancel, form } = this.props;
      const { getFieldDecorator } = form;
      const functionOptions= transformData.Transform.map((value,key)=>
        <Option key={value.Transform_id}>{value.Transform_name}</Option>
      ); 

      let attributeOptions=[]
      if(this.state.dataAttribute){
            this.state.dataAttribute.map((value,key)=>
                attributeOptions.push(<Option key={key} value={value.attribute_id+'/'+value.attribute_name+'/'+value.attribute_unit}>{value.attribute_name}</Option>)
            ) 
      }else{
        attributeOptions.push(<Option key='1'>123</Option>)
      }
      
      return (
        <Modal
          visible={visible}
          title="Edit Data Process Rule"
          okText="OK"
          onCancel={onCancel}
          width={997}
          footer={[
            <Button key="submit"   onClick={onCancel}>
              Cancel
            </Button>,
            <Button key="back" type="primary" onClick={this.onCreate.bind(this)} style={{display:this.state.active_status===true?"none":""}}>OK</Button>,
          ]}
        >
          <Form>
          
            <Divider orientation="left">Device Rule</Divider>
            <Row>
                <Col span={20}>
                    <FormItem label="Rule Name" {...formItemLayout}>
                    {getFieldDecorator('rule_name',{rules: [ {required: true}],initialValue:this.state.editData.rule_name})(<Input disabled={this.state.active_status}/>)}
                    </FormItem>
                </Col>
            </Row>
            <Row>
                <Col span={20}>
                    <FormItem {...formItemLayout} label="Description">
                    {getFieldDecorator('description',{initialValue:this.state.editData.description})(<TextArea rows={4} disabled={this.state.active_status}/>)} 
                    </FormItem>
                </Col>
            </Row>
            <Row>
                <Col span={20}>
                    <FormItem label="Attribute Name" {...formItemLayout}>
                    {getFieldDecorator('attribute_name',{rules: [ {required: true}],initialValue:this.state.editData.attribute_name?this.state.editData.attribute_id+'/'+this.state.editData.attribute_name+'/'+this.state.editData.attribute_unit:""})(
                        <Select style={{ width: '100%' }} disabled>
                            {attributeOptions}
                        </Select>
                    )}
                    </FormItem>
                </Col>
            </Row>
            <Divider orientation="left">Data Collection</Divider>
            <Row>
                <Col span={20}>
                    <FormItem {...formItemLayout} label="Data Type">
                        {getFieldDecorator('data_type',{rules: [ {required: true}],initialValue:this.state.editData.data_type})(<Input disabled={this.state.active_status}/>)} 
                    </FormItem>
                </Col>
            </Row>
            <Row>
                <Col span={20}>
                    <FormItem {...formItemLayout} label="Data Key ">
                        {getFieldDecorator('data_key',{rules: [ {required: true}],initialValue:this.state.editData.data_key})(<Input disabled={this.state.active_status}/>)} 
                    </FormItem>
                </Col>
            </Row>
            <Divider orientation="left"><Checkbox style={{marginRight:'5px'}} onChange={this.lockinput} checked={this.state.transformCheck} disabled={this.state.active_status}/>Data Transform</Divider>
            <Row>
                <Col span={20} >
                    <FormItem {...formItemLayout} label="Functions" >
                    {getFieldDecorator('functions',{initialValue:this.state.editData.transform_settings?this.state.editData.transform_settings.transform_id:''})(
                        <Select style={{ width: '100%' }} disabled={this.state.lockinput} onChange={this.functionChange} >
                            {functionOptions}
                        </Select>
                    )}
                    </FormItem>
                </Col>
                { this.state.functionListName === 'TF_AIOPress' ?
                    <Col span={3}><Button  className="actionbtn" onClick={() => this.showfunctionSetting()} disabled={this.state.lockinput}>Setting</Button>  </Col>
                :''}
            </Row>
            <Divider orientation="left"><Checkbox style={{marginRight:'5px'}}  onChange={this.lockdataruleinput} checked={this.state.dataRuleSetting}  disabled={this.state.active_status}/>Data Criteria Settings</Divider>
            <Row>
                <Col span={4} offset={2}>
                    <FormItem  label="Normal" labelCol={{span: 11}} wrapperCol={{span: 13}}>
                        {getFieldDecorator('normal',{initialValue:this.state.ruleSettingNormal.condition.operator_id} )( 
                            <Select style={{ width: '100%' }} disabled={this.state.dataruleinput} onChange={this.normal_change}>
                                <Option value="greater_than">&gt;</Option>
                                <Option value="less_than">&lt;</Option>
                                <Option value="equal_to">=</Option>
                                <Option value="greater_than_or_equal_to">&ge;</Option>
                                <Option value="less_than_or_equal_to">&le;</Option>
                                <Option value="range">range</Option>
                                <Option value="not_equal_to">!=</Option>
                            </Select>
                        )}
                    </FormItem>    
                </Col>
                { this.state.ruleSettingNormal.condition.operator_id === 'range' ? 
                    <div>
                        <Col span={4}>
                            <FormItem  label="Max Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('normal_max_value',{initialValue:this.state.ruleSettingNormal.condition.max})(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                        <Col span={4}>
                            <FormItem  label="Min Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('normal_min_value',{initialValue:this.state.ruleSettingNormal.condition.min} )(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                    </div> : 
                        <Col span={4}>
                            <FormItem  label="Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('normal_min_value',{initialValue:this.state.ruleSettingNormal.condition.value})(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                }
                <Col span={1}>
                   <div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgba(34, 208, 105, 1)'}}></div>
                </Col>
                <Col span={5}>
                    <FormItem  label="then Action" labelCol={{span: 10}} wrapperCol={{span: 13}}>
                        {getFieldDecorator('normal_action',{initialValue:this.state.ruleSettingNormal.action.action_id})(
                            <Select style={{ width: '100%' }} disabled={this.state.dataruleinput} onChange={this.changeActionNormal}>
                                <Option value="email">Email</Option>
                                <Option value="none">None</Option>
                            </Select>)}
                    </FormItem>
                </Col>
                <Col span={3} offset={1}>
                    <Button className="actionbtn" onClick={() => this.showmailSetting('Normal_mail',this.state.ruleSettingWarning.action.settings)} disabled={this.state.dataruleinput}  style={{display:this.state.actionNormal}}>Setting</Button>  
                </Col>
            </Row>
            <Row>
                <Col span={4} offset={2}>
                    <FormItem  label="Warning" labelCol={{span: 11}} wrapperCol={{span: 13}}>
                        {getFieldDecorator('warning',{initialValue:this.state.ruleSettingWarning.condition.operator_id})( 
                            <Select style={{ width: '100%' }} disabled={this.state.dataruleinput} onChange={this.warning_change}>
                                <Option value="greater_than">&gt;</Option>
                                <Option value="less_than">&lt;</Option>
                                <Option value="equal_to">=</Option>
                                <Option value="greater_than_or_equal_to">&ge;</Option>
                                <Option value="less_than_or_equal_to">&le;</Option>
                                <Option value="range">range</Option>
                                <Option value="not_equal_to">!=</Option>
                            </Select>
                        )}
                    </FormItem>    
                </Col>
                { this.state.ruleSettingWarning.condition.operator_id === 'range' ? 
                    <div>
                        <Col span={4}>
                            <FormItem  label="Max Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('warning_max_value',{initialValue:this.state.ruleSettingWarning.condition.max} )(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                        <Col span={4}>
                            <FormItem  label="Min Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('warning_min_value',{initialValue:this.state.ruleSettingWarning.condition.min} )(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                    </div> : 
                        <Col span={4}>
                            <FormItem  label="Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('warning_min_value',{initialValue:this.state.ruleSettingWarning.condition.value} )(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                }
                <Col span={1}>
                   <div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgba(255, 195, 0, 1)'}}></div>
                </Col>
                <Col span={5}>
                    <FormItem  label="then Action" labelCol={{span: 10}} wrapperCol={{span: 13}}>
                        {getFieldDecorator('warning_action',{initialValue:this.state.ruleSettingWarning.action.action_id})(
                            <Select style={{ width: '100%' }} disabled={this.state.dataruleinput} onChange={this.changeActionWarning}>
                                <Option value="email">Email</Option>
                                <Option value="none">None</Option>
                            </Select>)}
                    </FormItem>
                </Col>
                <Col span={3} offset={1}>
                    <Button className="actionbtn" onClick={() => this.showmailSetting('Warning_mail')} disabled={this.state.dataruleinput} style={{display:this.state.actionWarning}}>Setting</Button>  
                </Col>
            </Row>
            <Row style={{paddingBottom:'120px'}}>
                <Col span={4} offset={2}>
                    <FormItem  label="Critical" labelCol={{span: 11}} wrapperCol={{span: 13}}>
                        {getFieldDecorator('critical',{initialValue: this.state.ruleSettingCritical.condition.operator_id} )( 
                            <Select style={{ width: '100%' }} disabled={this.state.dataruleinput} onChange={this.critical_change}>
                                <Option value="greater_than">&gt;</Option>
                                <Option value="less_than">&lt;</Option>
                                <Option value="equal_to">=</Option>
                                <Option value="greater_than_or_equal_to">&ge;</Option>
                                <Option value="less_than_or_equal_to">&le;</Option>
                                <Option value="range">range</Option>
                                <Option value="not_equal_to">!=</Option>
                            </Select>
                        )}
                    </FormItem>    
                </Col>
                { this.state.ruleSettingCritical.condition.operator_id === 'range' ? 
                    <div>
                        <Col span={4}>
                            <FormItem  label="Max Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('critical_max_value',{initialValue: this.state.ruleSettingCritical.condition.max})(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                        <Col span={4}>
                            <FormItem  label="Min Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('critical_min_value',{initialValue: this.state.ruleSettingCritical.condition.min})(<Input disabled={this.state.dataruleinput }/>)}
                            </FormItem>
                        </Col>
                    </div> : 
                        <Col span={4}>
                            <FormItem  label="Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('critical_min_value',{initialValue: this.state.ruleSettingCritical.condition.value})(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                }
                <Col span={1}>
                   <div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgba(227, 20, 70, 1)'}}></div>
                </Col>
                <Col span={5}>
                    <FormItem  label="then Action" labelCol={{span: 10}} wrapperCol={{span: 13}}>
                        {getFieldDecorator('critical_action',{initialValue: this.state.ruleSettingCritical.action.action_id})(
                            <Select style={{ width: '100%' }} disabled={this.state.dataruleinput} onChange={this.changeActionCritical}>
                                <Option value="email">Email</Option>
                                <Option value="none">None</Option>
                            </Select>)}
                    </FormItem>
                </Col>
                <Col span={3} offset={1}>
                    <Button className="actionbtn" onClick={() => this.showmailSetting('Critical_mail')} disabled={this.state.dataruleinput} style={{display:this.state.actionCritical}}>Setting</Button>  
                </Col>
            </Row>
          </Form>
          <FunctionSetting
            wrappedComponentRef={this.savefunctionSettingRuleFormRef}
            visible={this.state.functionsetting}
            onCancel={this.cancelfunctionSetting}
            onCreate={() => this.submitfunctionSetting()}
            functionListSelected={this.state.selectedData}   
            editTramsform={this.state.editTramsform}
            functionListupdate={this.state.functionListupdate} 
          />
          <MailSetting
            wrappedComponentRef={this.savemailsettingRuleFormRef}
            visible={this.state.mailsetting}
            onCancel={this.cancemailsetting}
            onCreate={() => this.submitmailsetting()}
            mailSettingValue={this.state.mailSettingValue}
            mailsettingNumber={this.state.mailsettingNumber}
          />      
        </Modal>
      );
    }
  }
);
export default createDataProcessRule;