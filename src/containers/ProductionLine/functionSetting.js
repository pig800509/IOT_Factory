import React  from 'react';
import { Modal, Form, Input, Divider, Col, Row } from 'antd';
import _ from 'lodash';
const FormItem = Form.Item;

const funvtionSetting = Form.create()(
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {    
        functionListSelected: '',
        editTramsform:{enable: 1, transform_id: "", transform_params: {coef:"",data_key:"",offset:""}, transform_result: ""},
        coef:'',
        offset:''
      };
    }
    componentWillReceiveProps(nextProps){
      
      if(nextProps.functionListSelected){
        this.setState({ functionListSelected:nextProps.functionListSelected })
      }
      // nextProps.functionListSelected?this.setState({ functionListSelected:nextProps.functionListSelected }):""
      if(nextProps.editTramsform.length!==0){
        this.setState({ editTramsform:nextProps.editTramsform })
      }
 
      if(_.isEmpty(nextProps.functionListupdate)!==true){
        
        this.setState({ coef:nextProps.functionListupdate.coef,offset:nextProps.functionListupdate.offset })
        
      }else{
        this.setState({ coef:'',offset:'' })
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
          title="Function Settings"
          okText="OK"
          onCancel={onCancel}
          onOk={onCreate}
          width={660}
        >
          <Form>
            <Row>
                <Col span={12} offset={3}><img alt="example" src="../img/aio.jpg" /></Col>
            </Row>
            <Divider orientation="left">{this.state.functionListSelected}</Divider>
            <FormItem label="Coefficient" {...formItemLayout}>
              {getFieldDecorator('coef',{initialValue:this.state.coef})(<Input type="number"/>)}
            </FormItem>
            <FormItem {...formItemLayout} label="Offset">
              {getFieldDecorator('offset',{initialValue:this.state.offset})(<Input type="number"/>)} 
            </FormItem>
            <FormItem {...formItemLayout} label="transform_id" style={{display:'None'}}>
              {getFieldDecorator('transform_id', {initialValue:this.state.functionListSelected.transform_name})(<Input />)} 
            </FormItem>
          </Form>
    
        </Modal>
      );
    }
  }
);
export default funvtionSetting;