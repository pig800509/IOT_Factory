import React  from 'react';
import { Modal, Form,  Input } from 'antd';
import _ from 'lodash';
import CheckError from '../../component/handleErrors';
import {plApiUrl} from '../../config';
const FormItem = Form.Item;


const createProductionLine = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {    
        creatAttacheddevices: false,
        device_list:'',
        cheakboxlist:this.props.cheakboxlist,
        selectedRowKeys: [],
        array:[],
        machine_id:'',
      };
    }
    componentDidMount() { 
    
      
      fetch(`${plApiUrl}/machines/availableDeviceList/${this.state.machine_id}`,this.state.token)
      .then(CheckError.resCheck)
      .then((data) => {
        
        if(_.isEmpty(data)) return this.setState({ device_list:[] });
          
        this.setState({ device_list:data.device_list });
      })
      .catch((error) => {
        console.error(error)
      }) 
    } 
    componentWillReceiveProps(nextProps) {
      // You don't have to do this check first, but it can help prevent an unneeded render
      console.log(nextProps,'create attached DEvaaaaanextProps');
      if (nextProps.machine_id !== this.state.machine_id) {
        this.setState({ machine_id: nextProps.machine_id });
        
        fetch(`${plApiUrl}/machines/availableDeviceList/${nextProps.machine_id}`,this.state.token)
        .then(CheckError.resCheck)
        .then((data) => {
          console.log(data,'createProductionLine');
          this.setState({ device_list:data.device_list });
        })
      }
    }
 
    onCreate() {
      console.log("this.state.array",this.state.array);
      this.props.onCreate(this.state.array);
      this.props.form.resetFields();
    }

    render() {
      
      const { selectedRowKeys } = this.state;
      const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange,
        className:'classcolor',
        
      };
      const { visible, onCancel, onCreate, form } = this.props;
      const dataSource = [...this.state.device_list];
      // const { getFieldDecorator } = form;
      const { getFieldDecorator } = this.props.form;
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 14 },
        },
      };
      return (
        
        <Modal title="Create Production Line" width={640} visible={this.state.showCreateProLineModal} onOk={(evt) => this.modifyProLine(evt,'POST')} onCancel={this.onCancelBtnClick}>
 
        < FormItem { ...formItemLayout} label = "Name" >
          {getFieldDecorator('pl_name', {rules: [{
                // required: true,
                message: 'Please input your name!'
              }],
            } ,  {initialValue: this.state.proLineData.pl_name})( <Input />)}
        </FormItem>
        < FormItem { ...formItemLayout} label = "Line Number"  >
          {getFieldDecorator('description', {rules: [{
                // required: true,
                message: 'Please input your line number!'
              }],
            },  {initialValue: this.state.proLineData.description})( <Input />)} 
        </FormItem>
 
      </Modal>
      );
    }
  }
);


export default createProductionLine;