import React  from 'react';
import { Modal, Form, Input } from 'antd';
const FormItem = Form.Item;


const createAttribute = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {    
        showCreateModal: false,
      };
    }
    
    onCreate = (e) => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          this.props.onCreate();
          this.props.form.resetFields();
        }
      });
     
    }
    

    onCreateBtnClick = () => {
      this.setState({
        showCreateModal: true,
      });
    }
    render() {
      
   
      const { visible, onCancel } = this.props;
      const { getFieldDecorator } = this.props.form;
      
      
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
      };
      return (
        
        <Modal
          visible={visible}
          title="Create Attribute"
          okText="OK"
          onCancel={onCancel}
          onOk={this.onCreate.bind(this)}
        >
          <Form >

            <FormItem {...formItemLayout} label="Attribute Name">
                {getFieldDecorator('attribute_name', {rules: [{required: true}]})(<Input />)}
            </FormItem>
            <FormItem {...formItemLayout} label="Description">
                {getFieldDecorator('description', {rules: [{required: true}]})(<Input />)}
            </FormItem>
            <FormItem {...formItemLayout} label="Unit">
                {getFieldDecorator('attribute_unit', {rules: [{required: true}]})(<Input />)}
            </FormItem>  
         
          </Form>
        </Modal>
      );
    }
  }
);


export default createAttribute;