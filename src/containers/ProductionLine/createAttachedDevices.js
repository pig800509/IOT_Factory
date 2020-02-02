import React  from 'react';
import { Modal, Form, Table } from 'antd';
import CheckError from '../../component/handleErrors';
import {   plApiUrl } from '../../config';
import _ from 'lodash';

const FormItem = Form.Item;
const columns = [{
  title: 'Device Name',
  dataIndex: 'device_name',
  className:'classcolor',
}, {
  title: 'Model Name',
  className:'classcolor',
  dataIndex: 'model_name',
}, {
  title: 'MAC Address',
  className:'classcolor',
  dataIndex: 'mac_addr',
}];



const createAttachedDevices = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      console.log(props.token,'CREATE ATTACHED');

      this.state = {  
        token : props.token, 
  
        creatAttacheddevices: false,
        device_list:'',
        cheakboxlist:this.props.cheakboxlist,
        selectedRowKeys: [],
        array:[],
        machine_id:'',
      };
    }
    componentDidMount() { 
     
      fetch(`${plApiUrl}/machines/availableDeviceList/${this.state.machine_id}`, this.state.token)
      .then(CheckError.resCheck)
      .then((data) => {
        console.log(data,'createAttached DEvices');
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
        
       

        fetch(`${plApiUrl}/machines/availableDeviceList/${nextProps.machine_id}`, this.state.token)
      
        .then(CheckError.resCheck)
        .then((data) => {
          console.log(data,'createAttachedDEvices');
          this.setState({ device_list:data.device_list });
        })
      }
    }

    onSelectChange = (selectedRowKeys,selectedRows) => {
      this.setState({ selectedRowKeys });
      this.setState({array:selectedRows})
    }
    onCreate() {
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
      const { visible, onCancel, form } = this.props;
      const dataSource = [...this.state.device_list];
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="Create Attached Devices"
          okText="OK"
          onCancel={onCancel}
          // onOk={(onCreate)}
          onOk={this.onCreate.bind(this)}
          width={691}
        >
          <Form>
            <FormItem label="Name">
              {getFieldDecorator('selectedRowKeys')(<Table  columns={columns} dataSource={dataSource} pagination={false} rowSelection={rowSelection} rowKey={data => data.device_id} className="popuprow"/>)}
              {/* <Table  columns={columns} dataSource={dataSource} pagination={false} rowSelection={rowSelection} rowKey={data => data.device_id}/> */}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
);
export default createAttachedDevices;