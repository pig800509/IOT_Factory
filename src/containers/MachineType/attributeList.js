import React  from 'react';
import { Modal, Form, Table, Button, Tooltip, Badge, message } from 'antd';
import CreateAttribute from './createAttribute';
import {plApiUrl} from '../../config';
import CheckError from '../../component/handleErrors';
const FormItem = Form.Item;
const  confirmModal = Modal.confirm; 
let delconform;


const attributeList = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {   
        token:props.token, 
        showCreateModal: false,
        machineTypeId:'',
        attribute_list:[]
      };
    }

    componentWillReceiveProps(nextprops){
      
      const typeId=nextprops.machineTypeId?nextprops.machineTypeId:''
      if(typeId===this.state.machineTypeId) return false
      this.setState({machineTypeId:typeId})
      
      let url=`${plApiUrl}/machineTypes/attributes/byMachineType/${typeId}`
      fetch(url,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        this.setState({attribute_list:data.attribute_list})
      })
      .catch((error) => {
        console.error(error)
      }) 
      
    }
    
    onCreate = () => {
      this.props.onCreate(this.state.array);
      this.props.form.resetFields();
    }
    
    showConfirm = (attribute_id) => {
        
        delconform=confirmModal({
          title:'Are you sure you want to delete this Attribute ?',
          okText: 'OK',
          cancelText: 'Cancel',
          visible:true,
          onOk:(e) => this.deleteFunction(attribute_id) ,
        }); 
    }
    
    deleteFunction(value){
      const url = `${plApiUrl}/machineTypes/attributes/${value}`;
      fetch(url, {
          ...this.state.token,
          method: 'DELETE',
        }).then(CheckError.resCheck)
        .then((response) => {
          delconform.destroy();
          message.success('Deleted!',2);
        })
        .catch((error) => {
          console.error(error)
        }).then(()=>{
          const url = `${plApiUrl}/machineTypes/attributes/byMachineType/${this.state.machineTypeId}`;
          fetch(url,this.state.token).then(CheckError.resCheck)
          .then((data) => {
            this.setState({attribute_list:data.attribute_list}) 
          })
          .catch((error) => {
            console.error(error)
          }) 
          
      }) 
    }

    onCreateBtnClick = () => {
      this.setState({
        showCreateModal: true,
      });
    }

    handleCancel = () => {
      this.setState({ showCreateModal: false });
    }
  
    handleCreate = (array) => {
      const form = this.formRef.props.form;
      form.validateFields((err, values) => {
        if (err) {
          return;
        }
        // console.log('Received values of form: ', values);
        let data=values;
        data['machine_type_id'] = this.state.machineTypeId
      
        const url = `${plApiUrl}/machineTypes/attributes`;
        fetch(url, {
            ...this.state.token,
            method: 'POST',
            body:JSON.stringify(data),
          })
          .then(CheckError.resCheck)
          .catch((error) => {console.error(error)})
          .then(()=>{
            const url  =`${plApiUrl}/machineTypes/attributes/byMachineType/${this.state.machineTypeId}`;
            fetch(url,this.state.token).then(CheckError.resCheck)
            .then((data) => {
              this.setState({attribute_list:data.attribute_list}) 
            })
            .catch((error) => {
              console.error(error)
            }) 
            
        }) 

        
        
        form.resetFields();
        this.setState({ showCreateModal: false });
      });
    }
    saveFormRef = (formRef) => {
      this.formRef = formRef;
    }
    render() {
      
   
      const { visible, onCancel } = this.props;
      const { getFieldDecorator } = this.props.form;
      
      const columns = [{
        title: 'NO.',
        dataIndex: 'no',
        key: 'no',
        className:'classcolor',
        render:(text, record, key)=>{
         
          return key+1
        }
      }, {
        title: 'Attribute Name',
        dataIndex: 'attribute_name',
        key: 'attribute_name',
        className:'classcolor'
      }, {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        className:'classcolor'
      }, {
        title: 'Unit',
        dataIndex: 'attribute_unit',
        key: 'attribute_unit',
        className:'classcolor'
      }, {
        title: 'Used',
        dataIndex: 'used',
        key: 'used',
        className:'classcolor',
        render:(text, record)=>{
            return (text)? <Badge  status="success" />:<Badge status="error" />
          }
      }, {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        className:'classcolor',
        render: (text, record) => (
            <span>
              <Tooltip placement="top" title="Delete">
              <Button shape="circle" onClick={() => this.showConfirm(record.attribute_id)} icon="delete" className="addColor"/>
              </Tooltip>
            </span>
          )
      }];
      
      return (
        
        <Modal
          visible={visible}
          title="Attribute List"
          okText="OK"
          onCancel={onCancel}
          onOk={this.onCreate.bind(this)}
          width={600}
        >
          <Form layout="vertical">
          <Tooltip placement="top" title="Add"><Button shape="circle" style={{  float:"right",zIndex:'9999' }}  onClick={this.onCreateBtnClick}  icon="plus" className="addColor"></Button></Tooltip>
            <FormItem >
              {getFieldDecorator('selectedRowKeys')(
                <Table  columns={columns} dataSource={this.state.attribute_list} pagination={false} rowKey={data => data.attribute_id} className="popuprow"/>
              )}
            </FormItem>
            
          </Form>
          <CreateAttribute
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.showCreateModal}
            onCancel={this.handleCancel}
            onCreate={(value) => this.handleCreate(value)}
          />
        </Modal>
      );
    }
  }
);


export default attributeList;