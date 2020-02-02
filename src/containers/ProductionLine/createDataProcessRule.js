import React  from 'react';
import { Modal, Form, Input, Select, Divider, Checkbox, Col, Row, Button } from 'antd';
import FunctionSetting from './functionSetting';
import MailSetting from './mailSetting';
import CheckError from '../../component/handleErrors';
import {transformData,dataApiUrl,plApiUrl} from '../../config';
import _ from 'lodash';


const FormItem = Form.Item;
const Option = Select.Option;
const createDataProcessRule = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {  
        token : props.token,   
        machine_id: '',
        functionsetting: false,
        mailsetting: false,
        lockinput:true ,
        dataruleinput:true,
        normalChange:'greater_than',
        warningchangedValue:'greater_than',
        criticalchangedValue:'greater_than',
        functionList:[],
        functionListSelected:'',
        selectedData:[],
        functionListupdate:{},
        mailsettingNumber:'',
        mailsettingData:[],
        editTramsform:[],
        dataAttribute:[],
        dataType:'',
        dataKey:'',
        transformCheck:false,
        dataRuleSetting:false,
        normalMinValue:'',
        warningMinValue:'',
        criticalMinValue:'',
        normalSettingMail:{},
        warningSettingMail:{},
        criticalSettingMail:{},
        mailSettingValue:{},
        actionNormal:'block',
        actionWarning:'block',
        actionCritical:'block',
      };
    }
    componentDidMount(){  
      fetch(`${dataApiUrl}/deviceData/transformFunctions`,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        this.setState({functionList:transformData.Transform,}) 
        this.setState({selectedData:transformData.Transform[0].Transform_id,}) 
        this.setState({functionListSelected:transformData.Transform[0].Transform_id,}) 

      })
      .catch((error) => {
        console.error(error)
      }) 

    }
    componentDidUpdate() {
        if(this.state.machine_id!==localStorage.getItem("machineTypeId")){
            this.setState({machine_id:localStorage.getItem("machineTypeId")})
            let url=`${plApiUrl}/machineTypes/attributes/byMachineType/${localStorage.getItem("machineTypeId")}`
            fetch(url,this.state.token).then(CheckError.resCheck)
            .then((data) => {
                this.setState({dataAttribute:data.attribute_list,}) 
                this.attribute(data.attribute_list[0]?data.attribute_list[0].attribute_id+'/'+data.attribute_list[0].attribute_name+'/'+data.attribute_list[0].attribute_unit:'')
               
            })
            .catch((error) => {
                console.error(error)
            }) 
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
                console.log(values);
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
            if(value==='Normal_mail'){this.setState({ mailSettingValue: this.state.normalSettingMail });}
            else if(value==='Warning_mail'){this.setState({ mailSettingValue: this.state.warningSettingMail });}
            else if(value==='Critical_mail'){this.setState({ mailSettingValue: this.state.criticalSettingMail });}
            this.setState({mailsetting:true});
            this.setState({mailsettingNumber:value});
        }
        cancemailsetting = () => {
            const form = this.formRefmail.props.form;
            form.resetFields();
            this.setState({ mailsetting: false });
        }
        submitmailsetting = (e) => {
            const form = this.formRefmail.props.form;
            form.validateFields((err, values) => {
            if (err) {
                return;
            }
            if(values.number==='Normal_mail'){ 
                this.setState({normalSettingMail:{"title" : values.title,"message" : values.title}})
            }else if(values.number==='Warning_mail'){
                this.setState({warningSettingMail:{"title" : values.title,"message" : values.title}})
            }else{
                this.setState({criticalSettingMail:{"title" : values.title,"message" : values.title}})
            }
                this.state.mailsettingData.push(values)
                form.resetFields();
                this.setState({ mailsetting: false });
            });
        }
        savemailsettingRuleFormRef = (formRefmail) => {
            this.formRefmail = formRefmail;
        }
    /*Mail setting end*/ 

    lockinput = (e) => {
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
    normal_change = (changedValue) => {
        this.setState({normalChange:changedValue})
    }
    warning_change= (changedValue) => {
        this.setState({warningchangedValue:changedValue})
    }
    critical_change= (changedValue) => {
        this.setState({criticalchangedValue:changedValue})
    }
    functionChange=(changedValue)=>{
        const selectedData= _.filter(this.state.functionList, { 'Transform_id': changedValue }); 
        this.setState({selectedData:selectedData[0].Transform_id})
    }

    attribute=(value)=>{
        console.log(value);
        let str=value.split('/')
        if(str[1]==='CycleTime'){
            this.setState({dataKey:'CycleTime'})
            this.setState({dataType:'CycleTime'})
            this.setState({selectedData:'TF_CycleTime',}) 
            this.setState({functionListSelected:'TF_CycleTime',}) 
            this.setState({
                lockinput:false,
                transformCheck:true,
                dataRuleSetting:false,
                dataruleinput:true,
                normalChange:'greater_than',
                warningchangedValue:'greater_than',
                criticalchangedValue:'greater_than',
                normalMinValue:'',
                warningMinValue:'',
                criticalMinValue:'',
                normalSettingMail:{"title" : str[1],"message" : "CycleTime Is Normal"},
                warningSettingMail:{"title" : str[1],"message" : "CycleTime Is Warning"},
                criticalSettingMail:{"title" : str[1],"message" : "CycleTime Is Critical"}, 
                actionNormal:'block',
                actionWarning:'block',
                actionCritical:'block'
               
            })

            this.state.mailsettingData.push({"number":"Normal_mail","title" : "CycleTime","message" : "CycleTime Normal"})
            this.state.mailsettingData.push({"number":"Warning_mail","title" : "CycleTime","message" : "CycleTime Warning"})
            this.state.mailsettingData.push({"number":"Critical_mail","title" : "CycleTime","message" : "CycleTime Critical"})
            this.props.form.setFieldsValue({
                normal_min_value: '',
                warning_min_value:'',
                critical_min_value:'',
                normal:'greater_than',
                warning:'greater_than',
                critical:'greater_than',
                data_type:'CycleTime',
                data_key:'CycleTime',
                functions:'TF_CycleTime',
                normal_action:'email',
                warning_action:'email',
                critical_action:'email',
            });
            
        }else if(str[1]==='MultiColorLED'){
            this.setState({dataKey:'MultiColorLED'})
            this.setState({dataType:'MultiColorLED'})
            this.setState({selectedData:'TF_AIOPress',}) 
            this.setState({functionListSelected:'',}) 
            this.setState({
                lockinput:true,
                transformCheck:false,
                dataRuleSetting:true,
                dataruleinput:false,
                normalChange:'equal_to',
                warningchangedValue:'equal_to',
                criticalchangedValue:'equal_to',
                normalMinValue:'010',
                warningMinValue:'100',
                criticalMinValue:'001',
                actionNormal:'block',
                actionWarning:'block',
                actionCritical:'block',
                normalSettingMail:{"title" : "MultiColor","message" : "MultiColor Normal"},
                warningSettingMail:{"title" : "MultiColor","message" : "MultiColor Warning"},
                criticalSettingMail:{"title" : "MultiColor","message" : "MultiColor Critical"}, 
            })
            this.state.mailsettingData.push({"number":"Normal_mail","title" : "MultiColor","message" : "MultiColor Normal"})
            this.state.mailsettingData.push({"number":"Warning_mail","title" : "MultiColor","message" : "MultiColor Warning"})
            this.state.mailsettingData.push({"number":"Critical_mail","title" : "MultiColor","message" : "MultiColor Critical"})
            this.props.form.setFieldsValue({
                normal:'equal_to',
                warning:'equal_to',
                critical:'equal_to',
                normal_min_value:'010',
                warning_min_value:'100',
                critical_min_value:'001',
                data_type:'MultiColorLED',
                data_key:'MultiColorLED',
                functions:'TF_AIOPress',
                normal_action:'email',
                warning_action:'email',
                critical_action:'email'
            });
        }
        else{
            this.setState({dataKey:''})
            this.setState({dataType:''})
            this.setState({selectedData:'TF_AIOPress',}) 
            this.setState({
                lockinput:true,
                transformCheck:false,
                dataRuleSetting:false,
                dataruleinput:true,
                normalChange:'greater_than',
                warningchangedValue:'greater_than',
                criticalchangedValue:'greater_than',
                normalMinValue:'',
                warningMinValue:'',
                criticalMinValue:'',
                functions:'TF_AIOPress',
                normalSettingMail:{"title" : str[1],"message" : str[1]+" Is Normal"},
                warningSettingMail:{"title" : str[1],"message" : str[1]+" Is Warning"},
                criticalSettingMail:{"title" : str[1],"message" : str[1]+" Is Critical"}, 
                
            })
            this.state.mailsettingData.push({"number":"Normal_mail","title" : str[1],"message" : str[1]+" Is Normal"})
            this.state.mailsettingData.push({"number":"Warning_mail","title" : str[1],"message" : str[1]+" Is Warning"})
            this.state.mailsettingData.push({"number":"Critical_mail","title" : str[1],"message" : str[1]+" Is Critical"})
            this.props.form.setFieldsValue({
                normal:'greater_than',
                warning:'greater_than',
                critical:'greater_than',
                normal_min_value:'',
                warning_min_value:'',
                critical_min_value:'',
                data_type:'',
                data_key:'',
                functions:'TF_AIOPress',
                selectedData:'TF_AIOPress',
            });
        }
       
    }
    changeActionNormal=(value)=>{         
        if(value==='email'){this.setState({actionNormal:'block'})}else{this.setState({actionNormal:'none'})}
    }
    changeActionWarning=(value)=>{
        if(value==='email'){this.setState({actionWarning:'block'})}else{this.setState({actionWarning:'none'})}
    }
    changeActionCritical=(value)=>{
        if(value==='email'){this.setState({actionCritical:'block'})}else{this.setState({actionCritical:'none'})}
    }
    onCancel(e){
        this.props.form.resetFields();
        this.props.onCancel()
        this.setState({
            normalMinValue:'',
            warningMinValue:'',
            criticalMinValue:'',
            normalSettingMail:{},
            warningSettingMail:{},
            criticalSettingMail:{},
            mailsettingData:[],
            dataRuleSetting:false,
            transformCheck:true,
            dataruleinput:true,
            normalChange:'greater_than',
            warningchangedValue:'greater_than',
            criticalchangedValue:'greater_than',
            lockinput:false ,
            functionListupdate:{},
            actionNormal:'block',
            actionWarning:'block',
            actionCritical:'block',
            selectedData:'TF_CycleTime',
            data_type:'CycleTime',
            data_key:'CycleTime',
            functionListSelected:'TF_CycleTime',
        })
        this.props.form.setFieldsValue({
            normal:'greater_than',
            warning:'greater_than',
            critical:'greater_than',
            normal_min_value:'',
            warning_min_value:'',
            critical_min_value:'',
            data_type:'CycleTime',
            data_key:'CycleTime',
            selectedData:'TF_CycleTime',
            functionListSelected:'TF_CycleTime',
        });
               
    }
    onCreate(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
            this.props.onCreate(this.state.functionListupdate,this.state.mailsettingData,this.state.dataRuleSetting,this.state.transformCheck);
                this.props.form.resetFields();
                this.setState({
                    dataKey:'',
                    dataType:'',
                    normalMinValue:'',
                    warningMinValue:'',
                    criticalMinValue:'',
                    normalSettingMail:{},
                    warningSettingMail:{},
                    criticalSettingMail:{},
                    mailsettingData:[],
                    dataRuleSetting:false,
                    transformCheck:true,
                    dataruleinput:true,
                    normalChange:'greater_than',
                    warningchangedValue:'greater_than',
                    criticalchangedValue:'greater_than',
                    lockinput:false ,
                    functionListupdate:{},
                    actionNormal:'block',
                    actionWarning:'block',
                    actionCritical:'block',
                    data_type:'CycleTime',
                    data_key:'CycleTime',
                    selectedData:'TF_CycleTime',
                    functionListSelected:'TF_CycleTime',
                })
                this.props.form.setFieldsValue({
                    normal:'greater_than',
                    warning:'greater_than',
                    critical:'greater_than',
                    normal_min_value:'',
                    warning_min_value:'',
                    critical_min_value:'',
                    data_type:'CycleTime',
                    data_key:'CycleTime',
                    selectedData:'TF_CycleTime',
                    functionListSelected:'TF_CycleTime',
                });
            }
        });
        
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
      const { visible, form } = this.props;
      const { getFieldDecorator } = form;
      const functionOptions= transformData.Transform.map((value,key)=>
        <Option key={value.Transform_id}>{value.Transform_name}</Option>
      );  
   
      let attributeOptions=[]
      let stateAttribute=''

      if(this.state.dataAttribute){
            stateAttribute = this.state.dataAttribute[0]?this.state.dataAttribute[0].attribute_id+'/'+this.state.dataAttribute[0].attribute_name+'/'+this.state.dataAttribute[0].attribute_unit:''
            this.state.dataAttribute.map((value,key)=>
                attributeOptions.push(<Option key={key} value={value.attribute_id+'/'+value.attribute_name+'/'+value.attribute_unit}>{value.attribute_name}</Option>)
            ) 
      }else{
        attributeOptions.push(<Option key='1'></Option>)
      }
     
      return (
          
        <Modal
          visible={visible}
          title="Create Data Process Rule"
          okText="OK"
          onCancel={this.onCancel.bind(this)}
          onOk={this.onCreate.bind(this)}
          width={997}
        >
          <Form>
            <Divider orientation="left">Device Rule</Divider>
            <Row>
                <Col span={20}>
                    <FormItem label="Rule Name" {...formItemLayout}>
                    {getFieldDecorator('rule_name',{rules: [ {required: true}],})(<Input />)}
                    </FormItem>
                </Col>
            </Row>
            <Row>
                <Col span={20}>
                    <FormItem {...formItemLayout} label="Description">
                    {getFieldDecorator('description')(<Input />)} 
                    </FormItem>
                </Col>
            </Row>
            <Row>
                <Col span={20}>
                    <FormItem label="Attribute Name" {...formItemLayout}>
                    {getFieldDecorator('attribute_name',{rules: [ {required: true}],initialValue:stateAttribute})(
                        <Select style={{ width: '100%' }} onChange={this.attribute} >
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
                        {getFieldDecorator('data_type', {rules: [ {required: true}],initialValue:this.state.dataType})(<Input />)} 
                    </FormItem>
                </Col>
            </Row>
            <Row>
                <Col span={20}>
                    <FormItem {...formItemLayout} label="Data Key ">
                        {getFieldDecorator('data_key', {rules: [ {required: true}],initialValue:this.state.dataKey})(<Input />)} 
                    </FormItem>
                </Col>
            </Row>
            <Divider orientation="left"><Checkbox style={{marginRight:'5px'}} onChange={this.lockinput} checked={this.state.transformCheck}/>Data Transform</Divider>
            <Row>
                <Col span={20}>
                    <FormItem {...formItemLayout} label="Functions">
                    {getFieldDecorator('functions', {initialValue:this.state.functionListSelected})(
                        <Select style={{ width: '100%' }} disabled={this.state.lockinput} onChange={this.functionChange} >
                            {functionOptions}
                        </Select>
                    )}
                    </FormItem>
                </Col>
                { this.state.selectedData === 'TF_AIOPress' ?
                <Col span={3}><Button  className="actionbtn" onClick={() => this.showfunctionSetting()} disabled={this.state.lockinput}>Setting</Button>  </Col>
                :''}
            </Row>
            <Divider orientation="left"><Checkbox style={{marginRight:'5px'}}  onChange={this.lockdataruleinput} checked={this.state.dataRuleSetting}/>Data Criteria Settings</Divider>
            <Row>
                <Col span={4} offset={2}>
                    <FormItem  label="Normal" labelCol={{span: 11}} wrapperCol={{span: 13}}>
                        {getFieldDecorator('normal',{initialValue: this.state.normalChange,getFieldsValue:this.state.normalChange} )( 
                            <Select style={{ width: '100%' }} disabled={this.state.dataruleinput} onChange={this.normal_change} >
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
                { this.state.normalChange === 'range' ? 
                    <div>
                        <Col span={4}>
                            <FormItem  label="Max Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('normal_max_value' )(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                        <Col span={4}>
                            <FormItem  label="Min Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('normal_min_value' )(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                    </div> : 
                        <Col span={4}>
                            <FormItem  label="Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('normal_min_value')(<Input disabled={this.state.dataruleinput} />)}
                            </FormItem>
                        </Col>
                }
                <Col span={1}>
                   <div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgba(34, 208, 105, 1)'}}></div>
                </Col>
                <Col span={5}>
                    <FormItem  label="then Action" labelCol={{span: 10}} wrapperCol={{span: 13}}>
                        {getFieldDecorator('normal_action',{initialValue: 'email'})(
                            <Select style={{ width: '100%' }} disabled={this.state.dataruleinput} onChange={this.changeActionNormal}>
                                <Option value="email">Email</Option>
                                <Option value="none">None</Option>
                            </Select>)}
                    </FormItem>
                </Col>
                <Col span={3} offset={1}>
                    <Button className="actionbtn" onClick={() => this.showmailSetting('Normal_mail')} disabled={this.state.dataruleinput} style={{display:this.state.actionNormal}}>Setting</Button>  
                </Col>
            </Row>
            <Row>
                <Col span={4} offset={2}>
                    <FormItem  label="Warning" labelCol={{span: 11}} wrapperCol={{span: 13}}>
                        {getFieldDecorator('warning',{initialValue: this.state.warningchangedValue} )( 
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
                { this.state.warningchangedValue === 'range' ? 
                    <div>
                        <Col span={4}>
                            <FormItem  label="Max Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('warning_max_value' )(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                        <Col span={4}>
                            <FormItem  label="Min Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('warning_min_value' )(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                    </div> : 
                        <Col span={4}>
                            <FormItem  label="Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('warning_min_value',{initialValue: this.state.warningMinValue} )(<Input disabled={this.state.dataruleinput} />)}
                            </FormItem>
                        </Col>
                }
                <Col span={1}>
                   <div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgba(255, 195, 0, 1)'}}></div>
                </Col>
                <Col span={5}>
                    <FormItem  label="then Action" labelCol={{span: 10}} wrapperCol={{span: 13}}>
                        {getFieldDecorator('warning_action',{initialValue: 'email'})(
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
                        {getFieldDecorator('critical',{initialValue: this.state.criticalchangedValue} )( 
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
                { this.state.criticalchangedValue === 'range' ? 
                    <div>
                        <Col span={4}>
                            <FormItem  label="Max Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('critical_max_value' )(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                        <Col span={4}>
                            <FormItem  label="Min Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('critical_min_value' )(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                    </div> : 
                        <Col span={4}>
                            <FormItem  label="Value" labelCol={{span: 13, offset: 1}} wrapperCol={{span: 10}}>
                                {getFieldDecorator('critical_min_value' ,{initialValue: this.state.criticalMinValue})(<Input disabled={this.state.dataruleinput}/>)}
                            </FormItem>
                        </Col>
                }
                <Col span={1}>
                   <div style={{width:"12px",height:"12px",borderRadius:"999em",marginTop:"14px",marginLeft:"15px" ,background:'rgba(227, 20, 70, 1)'}}></div>
                </Col>
                <Col span={5}>
                    <FormItem  label="then Action" labelCol={{span: 10}} wrapperCol={{span: 13}}>
                        {getFieldDecorator('critical_action',{initialValue: 'email'})(
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