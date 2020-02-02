import React  from 'react';
import { Modal, Form, Input} from 'antd';
const FormItem = Form.Item;
const { TextArea } = Input;
const mailSetting = Form.create()(
  class extends React.Component {
    
    constructor(props) {
      super(props);
      this.state = {    
        mailsettingNumber:'',
        mailSettingValue:{"title":" ","message":" "}
      };
    }
    componentWillReceiveProps(nextProps){

      // nextProps.mailSettingValue?this.setState({ mailSettingValue:nextProps.mailSettingValue }):""
      if(nextProps.mailSettingValue){
        this.setState({ mailSettingValue:nextProps.mailSettingValue })
      }
    }
    componentDidUpdate() {
      if(this.props.mailsettingNumber!==this.state.mailsettingNumber){
          this.setState({ mailsettingNumber:this.props.mailsettingNumber });
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
      return (
        <Modal
          visible={visible}
          title="Setting Mail"
          okText="OK"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form>
            <FormItem label="Title" {...formItemLayout}>
              {getFieldDecorator('title',{initialValue:this.state.mailSettingValue.title}, {rules: [{required: true}]})(<Input />)}
            </FormItem>
            <FormItem {...formItemLayout} label="Message">
              {getFieldDecorator('message',{initialValue:this.state.mailSettingValue.message}, {rules: [{required: true}]})(<TextArea rows={4} />)} 
            </FormItem>
            <FormItem {...formItemLayout} label="number" style={{display:'None'}}>
              {getFieldDecorator('number', {initialValue:this.state.mailsettingNumber})(<Input />)} 
            </FormItem>
          </Form>
    
        </Modal>
      );
    }
  }
);
export default mailSetting;