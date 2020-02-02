import React from 'react';
import { Layout, Table, Button, Tooltip, Modal,message } from 'antd';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import '../../App.css';
import './App.css';
import _ from 'lodash'; 
import CreateMachineConfig from './createMachineConfig';
import MenuBar from '../../component/Menu'
import Title from '../../component/Title';
import Footer from '../../component/Footer';
import { Link } from "react-router-dom";
import {dashboardApiUrl} from '../../config';
import CheckError from '../../component/handleErrors';


const { Header, Content } = Layout;
const confirmModal = Modal.confirm;
let delconform;

function dragDirection(
  dragIndex,
  hoverIndex,
  initialClientOffset,
  clientOffset,
  sourceClientOffset,
) {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;
  if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
    return 'downward';
  }
  if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
    return 'upward';
  }
}
class BodyRow extends React.Component {
  render() {
    const {
      isOver,
      connectDragSource,
      connectDropTarget,
      moveRow,
      dragRow,
      clientOffset,
      sourceClientOffset,
      initialClientOffset,
      ...restProps
    } = this.props;

    const style = { ...restProps.style, cursor: 'move' };

    let className = restProps.className;
    if (isOver && initialClientOffset) {
      const direction = dragDirection(
        dragRow.index,
        restProps.index,
        initialClientOffset,
        clientOffset,
        sourceClientOffset
      );
      if (direction === 'downward') {
        className += ' drop-over-downward';
      }
      if (direction === 'upward') {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(
        <tr
          {...restProps}
          className={className}
          style={style}
        />
      )
    );
  }
}

const rowSource = {
  beginDrag(props) {
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset(),
}))(
  DragSource('row', rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    dragRow: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
  }))(BodyRow)
);




class App extends React.Component {
  constructor(props) {
    super(props);
    const userData =  props.userData;
    this.state = {  
      token:{"headers":{"Authorization":_.get(userData, 'token',false)}},  
      data:[],
      visible: false ,
      itemLength:''
    };
  }

  componentDidMount() { 
    fetch(`${dashboardApiUrl}/dashboardConfigs/machineDashboard/machineTypeItems`,this.state.token).then(CheckError.resCheck)
    .then((data) => {
      // if(data.item_list.length===0){data.item_list.push({})}
      let itemLength={}
      if(data.item_list.length===0)  itemLength={"order":1}
      else  itemLength=_.maxBy(data.item_list, 'order');
      console.log(itemLength);
      this.setState({data:data.item_list,itemLength:itemLength.order}) 
    })
  } 
  confirm(model_id) {
    delconform=confirmModal({
      title:'Are you sure you want to delete this item ?',
      okText: 'OK',
      cancelText: 'Cancel',
      visible:true,
      onOk:(e) => this.deleteFunction(model_id) ,
    });
   
  }
  deleteFunction(value){
    delconform.destroy();
    var url = `${dashboardApiUrl}/dashboardConfigs/machineDashboard/machineTypeItems/${value}`;
    fetch(url, {
        ...this.state.token,
        method: 'DELETE',
      }).then(CheckError.resCheck)
      .then((response) => {
        delconform.destroy();
        message.success('Deleted!',2);
      })
      .then(()=>{
        fetch(`${dashboardApiUrl}/dashboardConfigs/machineDashboard/machineTypeItems`,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        this.setState({data:data.item_list}) 
      })
 
    }) 

  }
  components = {
    body: {
      row: DragableBodyRow,
    },
  }

  moveRow = (dragIndex, hoverIndex) => {
    const { data } = this.state;
    const dragRow = data[dragIndex];

    this.setState(
      update(this.state, {
        data: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }),
    );
  }
 
  createMachineConfig = () => {
    this.setState({
      visible: true,
    });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  }

  handleCreate = (array) => {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      // console.log(array)
      // console.log('Received values of form: ', values);
      let Data={
        "machine_type_id" : values.machine_type_id,
        "attribute_name" : values.attribute_name,
        "rule_id" : array[0]?array[0].rule_id:'',
        "order":parseInt(this.state.itemLength,10)+1
      }
      var url=`${dashboardApiUrl}/dashboardConfigs/machineDashboard/machineTypeItems/`;
      

      fetch(url,{
        ...this.state.token,
        method: 'POST',
        body: JSON.stringify(Data)
      }).then(CheckError.resCheck)
      .then((userData)=>{  
        console.log(userData,"userData ...");
        fetch(`${dashboardApiUrl}/dashboardConfigs/machineDashboard/machineTypeItems`,this.state.token).then(CheckError.resCheck)
        .then((data) => {
          const itemLength=_.maxBy(data.item_list, 'order');
          this.setState({data:data.item_list,itemLength:itemLength.order}) 
        })
 
      })

      form.resetFields();
      this.setState({ visible: false });
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }
  conditionFunction(value){
    if(value==='greater_than'){return <span>&gt;</span>}
    else if(value==='less_than'){return <span>&lt;</span>}
    else if(value==='equal_to'){return <span>=</span>}
    else if(value==='greater_than_or_equal_to'){return <span>&ge;</span>}
    else if(value==='less_than_or_equal_to'){return <span>&le;</span>}
    else if(value==='range'){return <span>range</span>}
    else if(value==='not_equal_to'){return <span>!=</span>}
  }
  saveSort = () =>{
   
    let newSort=[]
    this.state.data.map((value,key)=>{
      return newSort.push({"order":value.order,"item_id":value.item_id})
    })
    
  
   
    var url=`${dashboardApiUrl}/dashboardConfigs/machineDashboard/machineTypeItems/order`;
    fetch(url,{
      ...this.state.token,
      method: 'PUT',
      body: JSON.stringify({"orders":newSort})
    }).then(CheckError.resCheck)
  }
  
  render() { 
    
    const columns = [
    // {
    //   title: 'Equipment',
    //   dataIndex: 'equipment',
    //   key: 'equipment',
    //   render: (text, record, index) => {
    //     return(<span>No.{record.order}</span>)
    //   } 
    // }, 
    {
      title: 'Machine Type',
      dataIndex: 'machine_type_name',
      key: 'machine_type_name',
    }, {
      title: 'Data Attribute',
      dataIndex: 'attribute_name',
      key: 'attribute_name',
    }, {
      title: 'Critical',
      dataIndex: 'critical',
      key: 'critical',
      render: (text, record) => {
        const operator_id=record.datacriteria_settings?record.datacriteria_settings.criteria_items[2].condition.operator_id:''
        const condition=this.conditionFunction(operator_id)
        if(operator_id==='range'){
          return(<span>{record.datacriteria_settings.criteria_items[2].condition.min}&lt; ~ &lt;{record.datacriteria_settings.criteria_items[2].condition.max}</span>)
        }
        return(<div>{condition}<span>{record.datacriteria_settings?record.datacriteria_settings.criteria_items[2].condition.value:''}</span></div>)
      } 
    }, {
      title: 'Warning',
      dataIndex: 'warning',
      key: 'warning',
      render: (text, record) => {
        const operator_id=record.datacriteria_settings?record.datacriteria_settings.criteria_items[1].condition.operator_id:''
        const condition=this.conditionFunction(operator_id)
        if(operator_id==='range'){
          return(<span>{record.datacriteria_settings.criteria_items[1].condition.min}&lt; ~ &lt;{record.datacriteria_settings.criteria_items[1].condition.max}</span>)
        }
        return(<div>{condition}<span>{record.datacriteria_settings?record.datacriteria_settings.criteria_items[1].condition.value:''}</span></div>)
      } 
    }, {
      title: 'Normal',
      dataIndex: 'normal',
      key: 'normal',
      render: (text, record) => {
        const operator_id=record.datacriteria_settings?record.datacriteria_settings.criteria_items[0].condition.operator_id:''
        const condition=this.conditionFunction(operator_id)
        if(operator_id==='range'){
          return(<span>{record.datacriteria_settings.criteria_items[0].condition.min}&lt; ~ &lt;{record.datacriteria_settings.criteria_items[0].condition.max}</span>)
        }
        return(<div>{condition}<span>{record.datacriteria_settings?record.datacriteria_settings.criteria_items[0].condition.value:''}</span></div>)
      } 
    },{
      title: 'Action',
      dataIndex: 'action',
      render: (text, record) => {
          return(<span> 
            <Button shape="circle"  icon="delete" className="addColor" onClick={() => this.confirm(record.item_id)}  />
          </span>)
        }  
    }];
   
    const min=window.innerHeight-106+'px';
    return (   
      <Layout className="layout">
        <Header>
          <MenuBar defaultSelectedKeys='6:1' />
        </Header>
        <Content style={{ padding: '0 50px',minHeight:min }} >
          <Title titlename="Machine Dashboard Configuration" linkName="Configurations"/>
          <div className="demo-nav">
            <Link to="/machineSetting" className="linkTabSelected">Machine</Link>
            <Link to="/criteriaSetting" className="linkTab">Cycle Time</Link>
            <Tooltip title="Add">  <Button  shape="circle" style={{  float:"right" }}  onClick={this.createMachineConfig}  icon="plus" className="addColor"></Button> </Tooltip>   
          </div>
          <Table
            columns={columns}
            dataSource={this.state.data}
            components={this.components}
            onRow={(record, index) => ({
              index,
              moveRow: this.moveRow,
            })}
            pagination={false}
            rowKey={data => data.item_id}
          />
          <Button type="primary" style={{float:'right',marginTop:'15px'}} onClick={this.saveSort}>OK</Button>
          <CreateMachineConfig
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={(value) => this.handleCreate(value)}
            token={this.state.token}
          />
        </Content>
        <Footer />
      </Layout>
    );
  }
}
const Demo = DragDropContext(HTML5Backend)(App);
export default Demo;
