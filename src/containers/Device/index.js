import React, { Component } from 'react';
import {  Layout,  Tabs, Button, Input, Modal, Form, Select , Tooltip} from 'antd';
import '../../App.css';
import './App.css';
import MenuBar from '../../component/Menu';
import Title from '../../component/Title';
import Footer from '../../component/Footer';
import ModelTab from './Model';
import ListTab from './List';

import CheckError from '../../component/handleErrors';
import {provinceData,agentData,registertypeData,devApiUrl} from '../../config';
import debounce from 'lodash/debounce';
import _ from 'lodash';
 
const { TextArea } = Input;

const TabPane = Tabs.TabPane;
const Search = Input.Search;
const { Header, Content } = Layout;
const FormItem = Form.Item;
const Option = Select.Option;

const CollectionCreateForm = Form.create()(

  class extends React.Component {
    
    constructor(props) {
      const userData =  props.userData;
      super(props);
      
      this.state = {
        token:{"headers":{"Authorization":_.get(userData, 'token',false)}},
        platform: agentData[provinceData[0]],
        agent: agentData[provinceData[0]],
        registertype: registertypeData[agentData[provinceData[0]][0]],
        fetching: false,
        createDevice:false,
  
      }
    }
    
    handleProvinceChange = (value) => {
      this.setState({
        platform: agentData[value],
        agent: agentData[value],
        registertype:registertypeData[agentData[value][0]]
      });
    }

    onagentChange = (value) => {
      this.setState({
        agent: agentData[provinceData[0]],
        registertype:registertypeData[value]
      });
    }

    handleChange = (value) => {
      this.setState({
        value,
        data: [],
        fetching: false,
      });
    }
    componentDidUpdate(prevProps, prevState, snapshot){
        if (this.props.visible !== prevProps.visible) {
            this.setState({registertype:registertypeData['NO'],agent:agentData["Linux"]})
        }
    }
    
    render() {
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 14 },
        },
      };
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      const provinceOptions = provinceData.map(province => <Option key={province}>{province}</Option>);
      const cityOptions = this.state.agent.map(city => <Option key={city}>{city}</Option>);
      const registertypeOptions = this.state.registertype.map(registertype => <Option key={registertype}>{registertype}</Option>);
    
      return (
        <Modal
          visible={visible}
          title="Create Device Model"
          okText="OK"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form>
            <FormItem label="Model Name" {...formItemLayout}>
              {getFieldDecorator('model_name', {
                rules: [{ required: true, message: 'Please input the Model Name!' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={(<span>Platform</span>)}>
              {getFieldDecorator('platform', {rules: [{
                  required: true,
                }],initialValue: 'Linux'
              })(
                  <Select  style={{ width: '100%' }} onChange={this.handleProvinceChange}>
                    {provinceOptions}
                  </Select>
                )} 
            </FormItem>
            <FormItem {...formItemLayout} label={(<span>Agent</span>)}>
              {getFieldDecorator('agent', {rules: [{
                  required: true,
                }],initialValue: this.state.agent[0]
              })(
                <Select  style={{ width: '100%' }} onChange={this.onagentChange}>
                    {cityOptions}
                </Select>
                )} 
            </FormItem>
            <FormItem {...formItemLayout} label={(<span>Register Type</span>)}>
              {getFieldDecorator('register_type', {rules: [{
                  required: true,
                }],initialValue: this.state.registertype[0]
              })(
                  <Select   style={{ width: '100%' }} >
                    {registertypeOptions}
                  </Select>
                )} 
            </FormItem>
            <FormItem label="Description" {...formItemLayout}>
              {getFieldDecorator('description')(<TextArea rows={4} />)}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);
const CollectionListForm = Form.create()(
  class extends React.Component {

    constructor(props) {
      super(props);
      this.lastFetchId = 0;
      this.fetchModel = debounce(this.fetchModel, 800);
    }
  
    state = {

      data: [],
      value: [],
      fetching: false,
      modelList:[],
      modelOptions:{}
    }
    componentDidMount() {

      fetch(`${devApiUrl}/deviceModels`,this.state.token)
      .then(CheckError.resCheck)
      .then((data) => {
    
        const modelOptions = data.devicemodel_list.map((model) =>(
          <Option key={model.model_id}>{model.model_name}</Option>

        ))
        
        this.setState({
          modeList:data.devicemodel_list,
          modelOptions:modelOptions
        }) 
        
      })
    }
    componentWillReceiveProps(nextProps){
      console.log(nextProps,"NEXTTTTTTPRSE" );
      fetch(`${devApiUrl}/deviceModels`,this.state.token)
      .then(CheckError.resCheck)
      .then((data) => {
        const modelOptions = data.devicemodel_list.map((model) =>(
          <Option key={model.model_id}>{model.model_name}</Option>
        ))
        this.setState({
          modeList:data.devicemodel_list,
          modelOptions:modelOptions
        }) 
        
      })
    }
  
    fetchModel = (value) => {
      console.log('fetching user', value);
      this.lastFetchId += 1;
      const fetchId = this.lastFetchId;
      this.setState({ data: [], fetching: true });
      fetch(`${devApiUrl}/deviceModels`,this.state.token)
        .then(CheckError.resCheck)
        .then((body) => {
          if (fetchId !== this.lastFetchId) { // for fetch callback order
            return;
          }
          const data = body.devicemodel_list.map(user => (
            
            {
            text: `${user.model_name}`,
            value: user.model_id,
          }));

          this.setState({ data, fetching: false });
        });
    }
  
    handleChange = (value) => {
      this.setState({
        value,
        data: [],
        fetching: false,
      });
    }

    render() {
 
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 14 },
        },
      };
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="Create Device"
          okText="OK"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form>
            <FormItem label="Device Name" {...formItemLayout}>
              {getFieldDecorator('device_name', {
                rules: [{ required: true, message: 'Please input the Device Name!' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label={(<span>Device Model</span>)}>
              {getFieldDecorator('model_id', {rules: [{
                  required: true,
                }]
              })(
                <Select  style={{ width: '100%' }}>
                  {this.state.modelOptions}

                  {/* <Option value="20180823053503">model003</Option> */}
                </Select>
                )} 
            </FormItem>
            {/* <FormItem {...formItemLayout} label={(<span>Device Model</span>)}>
              {getFieldDecorator('model_id', {rules: [{
                  required: true,
                }]
              })(
                <Select
                  labelInValue
                  value={value}
                  placeholder="Select users"
                  notFoundContent={fetching ? <Spin size="small" /> : null}
                  filterOption={false}
                  onSearch={this.fetchModel}
                  onChange={this.handleChange}
                  style={{ width: '100%' }}
                >
                  {data.map(d => <Option key={d.value}>{d.text}</Option>)}
              </Select>
                )} 
            </FormItem> */}
            <FormItem label="MAC Address" {...formItemLayout}>
              {getFieldDecorator('mac_addr', {
                rules: [{ required: true, message: 'Please input the Model Name!' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="Description" {...formItemLayout}>
              {getFieldDecorator('description')(<TextArea rows={4} />)}

            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);

class App extends Component {
  constructor(props) {
    super(props);  
    const userData =  props.userData;

    this.state = {
      userData :  userData,
      token:{"headers":{"Authorization":_.get(props.userData, 'token',false)}},
      Machine_Type_Management_Create: (props.userData.permission_settings.EquipmentManagement.Machine_Type_Management_Create === 1) ? true : false,

      tabTitle: true,
      visible: false,
      visible_list: false, 
      searchvalue:'',
      create:false,
      // list:''
    };
    this.handleToggleClick = this.handleToggleClick.bind(this);
  }
  componentDidMount() {
      
      fetch(`${devApiUrl}/deviceModels`,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        this.setState({
          list:data.devicemodel_list,
        }) 
      })
  } 
 
  handleToggleClick() {
    this.setState(prevState => ({
      tabTitle: !prevState.tabTitle
    }));
  }


  showModal = () => {
    const tabTitleStyle=this.state.tabTitle;
    if(tabTitleStyle===true){
      this.setState({
        visible: true,
      });
    }else{
      this.setState({
        visible_list: true,
      });
    }
  }

  handleCancel = () => {
      const form = this.formRef.props.form;
      form.resetFields();
      this.setState({ visible: false,visible_list: false });

  }

  handleCreate = () => {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
     
      if(values.agent==='No'|| values.agent==='NO'){
        values.agent="0"
      }else if(values.agent==='YES'){
        values.agent="1"
      }

      if(values.register_type==='None'){
        values.register_type="0"
      }else if(values.register_type==='By Security Key'){
        values.register_type="1"
      }else if(values.register_type==='By Mac Address'){
        values.register_type="2"
      }
      
      var url=`${devApiUrl}/deviceModels`;
      fetch(url,{
        ...this.state.token,
        method: 'POST',
        body: JSON.stringify(values)
      }).then(CheckError.resCheck)
      .then(()=>{  
        this.setState({
          create:!this.state.create,
        })   
         
      })

      form.resetFields();
      this.setState({ visible: false,visible_list: false  });
    });
  }

  addDevice = () => {
    const form = this.formRef_list.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log(values,'valuesss')

      var url=`${devApiUrl}/devices`;
      fetch(url,{
        ...this.state.token,
        method: 'POST',
        body: JSON.stringify(values)
      }).then(CheckError.resCheck)
      .then((data)=>{ 
        console.log(data,'addDevice data')  
        

        this.setState({ visible: false,visible_list: false, createDevice:!this.state.createDevice, });
        form.resetFields();

      })

    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }
  saveFormRef_list = (formRef_list) => {
    this.formRef_list = formRef_list;
  }
  search = (value) => {
    
    const tabTitleStyle=this.state.tabTitle;

    if(tabTitleStyle===true&& this.state.searchvalue!==value){
      let v;
      if(value===''){
        v='null'
      }else{
        v=value
      }
      this.setState({
        searchvalue: v,
      });
    }else{

      let deviceSearchValue=(value==='')?'null':value
      this.setState({
        searchDevice: deviceSearchValue,
      });
      console.log('visible_list+++++++++++++++++')
    }
    
  }
  render() { 
    const operations = <div><Tooltip trigger={(this.state.Machine_Type_Management_Create)?"hover":"false"} title="Add"><Button disabled={ !this.state.Machine_Type_Management_Create }  shape="circle" style={{float:"right"}} onClick={this.showModal}  icon="plus" className="addColor"></Button></Tooltip><Search onSearch={(value) => this.search(value)} style={{ width: 200, float:"right" }} className="searchColor"/> </div> ;
                      
    const min=window.innerHeight-211+'px';
    return (
      <Layout className="layout" style={{height:"100vh",overflowY:"scroll"}}>
          <Header>
              <MenuBar defaultSelectedKeys='4'/>
          </Header>
          <Content style={{ padding: '0 50px',background:'#222731' }}>
              <Title linkName="Device" titlename={this.state.tabTitle ? 'Device Model' : 'Device List'} />
              <div className="contentStyle accountStyle" style={{minHeight:min}}>
                  <Tabs defaultActiveKey="1"  onChange={this.handleToggleClick} tabBarExtraContent={operations}>
                    <TabPane tab="Model" key="1">
                      <ModelTab userData={this.state.userData} searchvalue={this.state.searchvalue}   create={this.state.create}/>
                    </TabPane>
                    <TabPane tab="List" key="2">
                      <ListTab userData={this.state.userData}  searchvalue={this.state.searchDevice}    create={this.state.createDevice}/>
                    </TabPane>
                  </Tabs>
                  <CollectionCreateForm
                    wrappedComponentRef={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate} 
                    token={this.state.token}
                    />
                  <CollectionListForm
                    wrappedComponentRef={this.saveFormRef_list}
                    visible={this.state.visible_list}
                    onCancel={this.handleCancel}
                    onCreate={this.addDevice}
                    token={this.state.token}
                    />
              </div>
          </Content>
          <Footer />
      </Layout>
    );
  }
}

export default App;
