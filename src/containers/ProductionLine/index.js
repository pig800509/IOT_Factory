import React, { Component } from 'react';

import { Avatar, Form, Select, Modal, Tooltip, Layout,  Input, Button, Row, Col } from 'antd';

import './App.css';
// import `antd/style/index.less`;
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

import MenuBar from '../../component/Menu';
import Title from '../../component/Title';
import Footer from '../../component/Footer';
import CheckError from '../../component/handleErrors';
import AttachedDevices from './attachedDevices';
import { plApiUrl,accountApiUrl } from '../../config';
// import CreateProductionLine from './createProductionLine';

import _ from 'lodash';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


const Option = Select.Option;
let PICOption = [];
const FormItem = Form.Item;
const {Search} = Input;
const { Header, Content } = Layout;
const confirmModal = Modal.confirm;
let delconform={};
let proLineSortData={}


class App extends Component {
  constructor(props) {
    super(props);
    const userData =  props.userData;
    //editable  0 disable, 1 enable, 2 unvisible
    this.state = {
      token:{"headers":{"Authorization":_.get(userData, 'token',false)}},

      // 只有1 能看，其他都是false，(還沒處理到2)
      ProductionLine_Management_Attach_Devices: (props.userData.permission_settings.EquipmentManagement.ProductionLine_Management_Attach_Devices === 1) ? true : false,
      ProductionLine_Management_Create: (props.userData.permission_settings.EquipmentManagement.ProductionLine_Management_Create === 1) ? true : false,
      ProductionLine_Management_Data_Process_Rules: (props.userData.permission_settings.EquipmentManagement.ProductionLine_Management_Data_Process_Rules === 1) ? true : false,
      ProductionLine_Management_Delete: (props.userData.permission_settings.EquipmentManagement.ProductionLine_Management_Delete === 1) ? true : false,
      ProductionLine_Management_Edit: (props.userData.permission_settings.EquipmentManagement.ProductionLine_Management_Edit === 1) ? true : false,
      ProductionLine_Management_Publish_Unpublish: (props.userData.permission_settings.EquipmentManagement.ProductionLine_Management_Publish_Unpublish === 1) ? true : false,
      ProductionLine_Management_View: (props.userData.permission_settings.EquipmentManagement.ProductionLine_Management_View === 1) ? true : false,

      Account_View: (props.userData.permission_settings.AccountManagement.Account_View === 1) ? true : false,

      // token:_.get(userData, 'token',false),
      showCreateProLineModal: false,
      showEditProLineModal: false,
      showCreateMachineModal: false,
      showEditMachineModal:false,
      showAttachDeviceModal:false,
      showAttachedDevicesModal:false,
      proLineNameDuplicate:null,
      machineNameDuplicate:null,
      // for Drag MachineType pass data
      eventTargetId:'',
      currentMachineType:{}, 
      currentMachineData:{},
      machineTypeList:[],
      proLineList:[],
      proLineData:{
        pl_name:"",
        description:"",
        machine_list:[],
      },
      // proLineSortData:{}
    };
  }
  


  componentDidMount() {
      const url=`${plApiUrl}/machineTypes?active_status=1`
      fetch(url,this.state.token)
      .then(CheckError.resCheck)
      .then((data) => { 
        console.log(data,'machineTypes');
        this.setState({ machineTypeList: data.machine_type_list });
      }).catch((err) => {console.log(err)}) ;  
      
      fetch(`${plApiUrl}/productionLines/`,this.state.token)
      .then(CheckError.resCheck)
      .then((data) => {
        this.setState({proLineList:data.pl_list })
      }).catch((err) => {console.log(err,"CATCHER")}) 
      
      if(this.state.Account_View){
        fetch(`${accountApiUrl}/accounts?role_name=EE`,this.state.token)
        .then(CheckError.resCheck )
        .then((data) => {
          console.log(data,'accounts');
  
          this.setState({ piclist:data.account_list });
          PICOption=[]
          _.each(data.account_list ,(account)=>(
            PICOption.push(<Option key={account.user_id}>{account.username}[{account.role_name}]</Option>)
          ))
        }) 
      } 

  }
  savefunctionSettingRuleFormRef = (formRef) => {
    this.formRef = formRef;
  }

  // 1 show create model
  setProLineData = () => {
    this.setState({
      showCreateProLineModal: true,
    });
  }

  // 1-2 Create Production Line
  modifyProLine =(evt, method )=>{
    evt.preventDefault()
    // console.log( this.props.form,' this.props.form');
    this.props.form.validateFields((err, values) => {

      if (!err) {
        console.log(values,'values');

        const body =  {"pl_name":values.pl_name, "description":values.line_number} 

        let url = `${plApiUrl}/productionLines/`;
        if(method==="PUT") {
          url = `${plApiUrl}/productionLines/${this.state.proLineData.pl_id}`

          if(this.state.proLineData.pl_name===values.pl_name) delete body.pl_name
        } 
        
        fetch(url, {...this.state.token, method: method,body: JSON.stringify(body)})
        .then(CheckError.resCheck)
        .then((res) => {
          if (res.results.status==="Fail"){ 
            console.log("FASL RESSSS",res);
            this.setState({ proLineNameDuplicate: "error" })
            return false;
          }

          // this.setState({visible: false});
            fetch(`${plApiUrl}/productionLines/`,this.state.token)
            .then(CheckError.resCheck)
            .then((data) => {

              this.setState({
                proLineList: data.pl_list, 
                showCreateProLineModal: false,
                showEditProLineModal: false,
                proLineNameDuplicate:null,

              })
              this.props.form.resetFields()
            })
            
          }
        );

      }
    });

  }
  onDargItemClick=()=>{
    console.log('dragitme');
  }
  // 1-3 Save Production Line (after add  )
  saveAfterMachineAdd =(proLine)=>{
    console.log('saveAfterMachineAdd==========', proLine);
    const url=`${plApiUrl}/productionLines/actions/addMachines/${proLine.pl_id}`
    let data={
      "machine_list": proLine.machine_list
    }
    fetch(url, {
      ...this.state.token,
      method: 'PUT',
      body:JSON.stringify(data)
    }).then(CheckError.resCheck )
    .then((res) => { 
        console.log(res,'saveAfterMachineAdd resresres');
        // this.setState({ machineTypeList: res.machine_list });
    });     

  }

  // 1-4 Save Production Line (after delete  )
  saveAfterMachineDelete =(proLine)=>{
    console.log('saveAfterMachineAdd', proLine);
    const url=`${plApiUrl}/productionLines/actions/addMachines/${proLine.pl_id}`
    let data={
      "machine_list": proLine.machine_list
    }
    fetch(url, {
      ...this.state.token,
      method: 'PUT',
      body:JSON.stringify(data)
    }).then(CheckError.resCheck)
    .then((res) => { 
        console.log(res,'resresres');
        // this.setState({ machineTypeList: res.machine_list });
    });     

  }

  // 1-5 Save Production Line (click save button )
  showSaveInfoModel=(proLine)=>{

    console.log('saveAfterMachineAdd');

    delconform=confirmModal({
      title:"Are you sure to save this temporary operation?",
      content: "It won't show on dashboard.",
      okText: 'OK',
      cancelText: 'Cancel',
      visible:true,
      onOk:(e) => this.saveProLine(proLine) ,
    });
  }

  saveProLine(proLine){
    console.log('saveProLine',proLine);
    const url=`${plApiUrl}/productionLines/actions/addMachines/${proLine.pl_id}`
    let data={
      "machine_list": proLine.machine_list
    }
    console.log(data,'saveProLine');
    // return true;
    fetch(url,  {
      ...this.state.token,
      method: 'PUT',
      body:JSON.stringify(data)
    })
    .then(CheckError.resCheck )
    .then((res) => { 
      delconform.destroy();

    });     
  }


  // 1-3 Edit Production Line
  setEditProLineData =(proLine)=>{

    this.setState({
      showEditProLineModal: true,
      proLineData:proLine
    })
  }

  // 1-4-1 Unpublish Production Line
  showPublishWarning =(proLine)=>{
    delconform=confirmModal({
      title:'Are you sure you want to publish this production line ?',
      okText: 'OK',
      cancelText: 'Cancel',
      visible:true,
      onOk:(e) => this.setPublish(proLine) ,
    });
  }


  // 1-4-2 Publish Production Line
  setPublish =(proLine)=>{
    delconform.destroy();
    const url=`${plApiUrl}/productionLines/actions/publish/${proLine.pl_id}`
    fetch(url, {
      ...this.state.token,
      method: 'PUT',
      body: JSON.stringify({"published":"1"})
    }).then(CheckError.resCheck)
    .then((res) => { 
      
      // console.log(res.results.pl_id,"uploaduploaduploadupload")

      fetch(`${plApiUrl}/productionLines/${proLine.pl_id}`, this.state.token).then(CheckError.resCheck)
      .then((data) => {
        console.log(data,'setPublish');
        let index = _.findIndex(this.state.proLineList, {pl_id: proLine.pl_id});
        // this.state.proLineList.slice
        const newList = this.state.proLineList.slice() //copy the array
        newList[index].published=1
        this.setState({proLineList:newList })
      })
    })
  }


  // 1-5 Unpublish Production Line
  showUnpublishWarning =(proLine)=>{
    delconform=confirmModal({
      title:'Are you sure you want to unpublish this production line ?',
      okText: 'OK',
      cancelText: 'Cancel',
      visible:true,
      onOk:(e) => this.setUnpublish(proLine) ,
    });
  }

  // 1-6 Unpublish Production Line
  setUnpublish =(proLine)=>{
    console.log("Production line set Unpublish",proLine);
    delconform.destroy();

    const url=`${plApiUrl}/productionLines/actions/publish/${proLine.pl_id}`
    fetch(url, {
      ...this.state.token,
      method: 'PUT',
      body: JSON.stringify({"published":"0"})
    }).then(CheckError.resCheck )
    .then((res) => { 
      fetch(`${plApiUrl}/productionLines/${proLine.pl_id}` ,this.state.token).then(CheckError.resCheck)
      .then((data) => {

        let index = _.findIndex(this.state.proLineList, {pl_id: proLine.pl_id});

        const newList = this.state.proLineList.slice() //copy the array
        newList[index].published=0
        this.setState({proLineList:newList })
        // this.state.proLineList[index].published=0
        // this.state.proLineList.splice(index, 1, data);
        // this.setState({proLineList:this.state.proLineList })
      })
    });    
  }

  // 1-6 Delete Production Line
  showDeleteProLineWarning =(proLine)=>{
    delconform=confirmModal({
      title:'Are you sure you want to delete this production line ?',
      okText: 'OK',
      cancelText: 'Cancel',
      visible:true,
      onOk:(e) => this.deleteFunction(proLine.pl_id) ,
    });
  }

  deleteFunction(pl_id){
    console.log('pl_id',pl_id);
    const url=`${plApiUrl}/productionLines/${pl_id}`
    fetch(url, {
      ...this.state.token,
      method: 'DELETE'
    }).then(CheckError.resCheck)
    .then((res) => { 
      delconform.destroy();
      fetch(`${plApiUrl}/productionLines/` ,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        this.setState({proLineList:data.pl_list })
      })
    });     
  }

  // 2- Attach machine to Production Line
  modifyMachine =(evt,method)=>{
    console.log(this.props.form,"modifyMachine");
    this.props.form.validateFields((err, values) => {

      if (!err) {
        console.log(this.state.currentMachineList,'this.state.currentMachineList');
        let machine_list = this.state.currentMachineList;

        const data={
          "machine_name":values.machine_name,
          "description":values.description,
          "machine_type_id":values.machine_type_id,
          "pl_id":this.state.proLineData.pl_id,
          "serial_no":values.serial_no,
          "PIC":values.PIC,
        }
        console.log(data,'data___data');


        console.log(this.state.currentMachineData,"this.state.this.state.currentMachineData");
        const url=(method==="POST")?`${plApiUrl}/machines/`:`${plApiUrl}/machines/${this.state.currentMachineData.machine_id}`
        fetch(url ,{
          ...this.state.token,
          "method": method,
          body: JSON.stringify(data)
        })
        .then(CheckError.resCheck)
        .then((res)=>{  
          console.log(res,method,"MODIFY RESULT");
          if (res.results.status==="Fail"){ 
            this.setState({ machineNameDuplicate: "error" })
            return false;
          }
          
          // 新增 要判斷  currentmachine 的位置
          console.log(this.state.eventTargetId,'eventTargetId');
          let idx= _.findIndex(this.state.currentMachineList, {"machine_id":this.state.eventTargetId});
          if(method==="POST"){
            const pushMachine={
              // "id":uniqid(),
              "machine_id": res.results.machine_id,
              "machine_name": values.machine_name,
              "machine_type_id": values.machine_type_id,
              "description":values.description,
              "serial_no":values.serial_no,
              "machine_type_name": res.results.machine_type_name,
              "num_of_devices": 0,
              "photo_preview_url": this.state.currentMachineData.photo_preview_url              
            }
            console.log(idx,'idx');
            (idx===-1)?machine_list.push(pushMachine):machine_list.splice(idx, 0, pushMachine); 

          }
          /* Update To Account  */ 
          let accountData={account_list:[]} 
          _.each(values.PIC,(user_id)=>{
            const obj={"user_id":user_id};
            accountData.account_list.push(obj);
          })
          fetch(`${plApiUrl}/machines/actions/updateAccounts/${res.results.machine_id}`,{
            ...this.state.token,
            method: 'PUT',
            body: JSON.stringify(accountData)
          })
          .then(CheckError.resCheck)
          // .then((res)=>{  })
          console.log(this.state.currentMachineData,'POST currentMachineData ');

          //save current production line
          this.saveAfterMachineAdd(this.state.proLineData)
          
          this.setState({
            showCreateMachineModal: false,
            showEditMachineModal: false,
            machineNameDuplicate:null,
            // currentMachineData:

          }) 
          this.props.form.resetFields()
        }) 
      }
    })
  }
  // 2-1  Attach Machine 
  setAttachDeviceData =(proLine,machine)=>{
    this.setState({showAttachedDevicesModal:true,currentMachineData:machine});
    localStorage.plId = proLine.pl_id;
    localStorage.machineId = machine.machine_id;
    localStorage.machineTypeId = machine.machine_type_id;
  }

  // 2-5  Delete Machine 
  setDeleteMachineWarning =(proLine, machine)=>{
    console.log(machine,'machineeeee');
      delconform=confirmModal({
        title:'Are you sure you want to delete this machine ?',
        okText: 'OK',
        cancelText: 'Cancel',
        visible:true,
        onOk:(e) => this.deleteMachine( proLine,machine.machine_id,) ,
      });
    }
  
  // after delete need to save to machine list
  deleteMachine(proLine, machine_id){

    const url=`${plApiUrl}/machines/${machine_id}`
    fetch(url,{
      ...this.state.token,
      method: 'DELETE'
    }).then(CheckError.resCheck )
    .then((res) => { 

      console.log('saveProLine',proLine);
      // let machine_list= _.remove(proLine.machine_list, { 'machine_id': machine_id });

      const url=`${plApiUrl}/productionLines/actions/addMachines/${proLine.pl_id}`
      let data={
        "machine_list": proLine.machine_list
      }
      console.log(data,'deleteMachine');
      // return true;
      fetch(url,  {
        ...this.state.token,
        method: 'PUT',
        body:JSON.stringify(data)
      }).then(CheckError.resCheck )
      .then((res) => { 
        delconform.destroy();

        let idx = _.findIndex(this.state.proLineList, {pl_id: proLine.pl_id});
        this.state.proLineList.splice(idx, 1, proLine);    
        this.setState({proLineList:this.state.proLineList })

        // fetch(`${plApiUrl}/productionLines').then(CheckError.resCheck)
        // .then((data) => {
        //   this.setState({proLineList:data.pl_list })
        // })
      }); 

    })
  }

    // 3 search production line
    search = (value) => {
      console.log(value)
      let url = (value==='')?`${plApiUrl}/productionLines/`:`${plApiUrl}/productionLines?pl_name=${value}`
  
      fetch(url,this.state.token).then(CheckError.resCheck)
      .then((data) => {
        this.setState({
          proLineList:data.pl_list,
        }) 
      }).catch((error) => {console.error(error)})  
      
    }

  // on Machine Drag to Production Line
  onMachineTypeDrag(evt, machineType) {
      this.setState({currentMachineType:machineType})
      // Add the target element's id to the data transfer object
      console.log(machineType,'machineType')
      console.log(evt.target.value,'VALUE')
      console.log(evt.target.id,'targetid')
      evt.dataTransfer.setData("text", evt.target.id);
      evt.dataTransfer.setData("id", evt.target.id);
      // evt.dataTransfer.setData("url", evt.target.url);
      evt.dataTransfer.setData("value", evt.target.value);

      // evt.dropEffect = "move";
  }
  onDragOver=(evt)=>{
    console.log(evt,'evtevtevtevtevtON DRAG OVER');
  }
  // 8- if is machine type show Edit Device Modal or don"t show edit Device Modal
  onMachineDrop = (event,proLine) =>{
 
    // 判斷 是由 machine type 拉下來，還是由 machine 自己換位置
    let showCreateMachineModal=(event.dataTransfer.getData("id")==="")?false:true

    // checked for machine postion


    this.setState({
      eventTargetId:event.target.id,
      showCreateMachineModal: showCreateMachineModal,
      currentMachineList:proLine.machine_list,
      // currentMachineImg:event.dataTransfer.getData("value"),
      // currentMachineTypeId:event.dataTransfer.getData("id"),
      currentMachineData:{
        machine_type_name:this.state.currentMachineType.machine_type_name,
        machine_type_id:event.dataTransfer.getData("id"),
        photo_preview_url:this.state.currentMachineType.photo_url
      },
      proLineData:proLine
      
    })

  }

  // 9- show Edit Device Modal 
  setEditDeviceModal=(proLine, machine)=>{
    console.log(machine,'machine=======');


    // Need To Get Machine Detial  
    
    const machineUrl=`${plApiUrl}/machines/${machine.machine_id}`
    const url=`${plApiUrl}/machines/accountList/${machine.machine_id}`

    fetch(machineUrl, this.state.token).then(CheckError.resCheck)
    .then((machineData) => { 
      console.log(  machineData, 'Machinedata');

      fetch(url, this.state.token).then(CheckError.resCheck)
      .then((data) => {
        // console.log(data,'data account list');
        machine.machine_type_name=machineData.machine_type_name

        machine.machine_name=machineData.machine_name
        machine.description=machineData.description
        machine.serial_no=machineData.serial_no
        machine.PIC=data.account_list
        machine.PICSelected= _.map(data.account_list, 'user_id')

        console.log( _.map(data.account_list, 'user_id'),"dddddddd");
  
        this.setState({
          showEditMachineModal: true,
          currentMachineData:machine,
    
          proLineData:proLine,
          currentMachineList:proLine.machine_list,
           
        })
      })


    })

    // Need To Get  PIC Detial


 

  }

  
  
  onCancelBtnClick = (e) => {
    console.log(this.props.form,'this.props.form');
    // this.setState({ visible: false,  modal2Visible: false});
    this.setState({
      // machineTypeList: data.machine_type_list, 
      proLineNameDuplicate:null,
      machineNameDuplicate:null,
      showCreateProLineModal: false,
      showEditProLineModal: false,
      showCreateMachineModal: false,
      showEditMachineModal:false,
      showAttachedDevicesModal:false,
      // proLineList:[],
      proLineData:{ },
      currentMachineData:{ },
    })

    this.props.form.resetFields()
  }

  allowDrop(e){
    // console.log(e,'allowDrop');
    // console.log(e,"ALLOWWWW");
    e.preventDefault();
  }
  onMachineClick= (evt)=>{
    console.log(evt,'evtn');
  }

  submitAttacheddevices = () => {
    // const form = this.formRef.props.form;
    // form.resetFields();
    this.setState({ showAttachedDevicesModal: false });
  }

  onSortEnd = ({index, oldIndex, newIndex, collection}) => {
    let changedMachineList=arrayMove(proLineSortData.machine_list, oldIndex, newIndex)
    proLineSortData.machine_list= changedMachineList;
    let idx = _.findIndex(this.state.proLineList, {pl_id: proLineSortData.pl_id});
    this.state.proLineList.splice(idx, 1, proLineSortData);
    this.setState({proLineList:this.state.proLineList })
  };


 
 
  render() {
    const tooltipBtnGroup=(proLine, machine)=>(
      <Row>
        
        {/* <Tooltip trigger={(this.state.editable)?"hover":"false"} title="Edit"   >
          <Button disabled={!this.state.editable} shape="circle" onClick={() => this.setModifyAccountModal(record.user_id)} icon="edit" className="addColor"/>
        </Tooltip>  */}
        {/* <Tooltip trigger={(this.state.deletable && !record.active_status) ? "hover" : "false"} title="Delete"> <Button disabled={!this.state.deletable || record.active_status} shape="circle" onClick={() => this.showConfirm(record.user_id)} icon="delete" className="addColor" /> </Tooltip> */}

        <Tooltip  trigger={(this.state.ProductionLine_Management_Edit)?"hover":"false"}  title="Edit">
          <Button disabled={!this.state.ProductionLine_Management_Edit}  style={{width:'26px',height: '26px'}} size="small" shape="circle" onClick={() => this.setEditDeviceModal(proLine, machine)} icon="edit"className="addColor"/>
        </Tooltip>
        <Tooltip trigger={(proLine.published && this.state.ProductionLine_Management_Data_Process_Rules)?"hover":"false"} title="Link">
          <Button disabled={!proLine.published || !this.state.ProductionLine_Management_Data_Process_Rules}  style={{width:'26px',height: '26px'}} size="small" shape="circle" onClick={() => this.setAttachDeviceData(proLine,machine)} icon="link" className="addColor"/>
        </Tooltip>
        <Tooltip trigger={(!proLine.published && this.state.ProductionLine_Management_Delete )?"hover":"false"} title="Delete">
          <Button disabled={proLine.published || !this.state.ProductionLine_Management_Delete}  style={{width:'26px',height: '26px', marginRight:'0px' }} size="small" shape="circle" onClick={() => this.setDeleteMachineWarning(proLine, machine)} icon="delete" className="addColor"/>
        </Tooltip>
      </Row> 
    )
    // const uploadButton = (
    //   <div>
    //      {/* <Avatar size={164} icon="user" /> */}
    //     <Icon type={this.state.loading ? 'loading' : 'user'}   style={{ fontSize: 206, color: '#ddd' }}  />
    //     <div className="ant-upload-text">Photo</div>
    //   </div>
    //   );

    const SortableItem = SortableElement(({proLine, machine, index, value,key,   drop, allowDrop}) =>

      // <li style={{float:"left", minWidth:"0px",height:"50px"}}>{machine.machine_name}</li>
      // <li className="list-group-item reorder-box item"  onDrop={drop} onDragOver={allowDrop} id={machine.machine_id} >
      <li className="list-group-item reorder-box item" style={{float:"left"}} onDrop={drop} onDragOver={allowDrop} id={machine.machine_id} >

              <div id={machine.machine_id}  style={{float:"left", borderRadius:"9px",width:"18px",height:"18px",backgroundColor:"#000" , color:"silver",textAlign:"center",fontSize:"8px",position:"relative",top:"60px",left:"40px"}}>{machine.num_of_devices}</div>
              <Tooltip title={tooltipBtnGroup(proLine,machine)}>
                <img id={machine.machine_id} draggable={false}  style={{float:"left"}} alt="machine_img" src={`https://${machine.photo_preview_url}`} width={60} height={60} />
              </Tooltip>
              <p id={machine.machine_id} style={{float:"left", width:"60px"}}>{machine.machine_name}</p>
      </li>
 
       
    );
    // const SortableItem = SortableElement(({value}) => <li>{value}</li>);

    const SortableList = SortableContainer(({proLine, removeItem,popUp,drop,allowDrop}) => {
      //  console.log(proLine,'machine_listmachine_list');
       proLineSortData=proLine
      // this.setState({proLineSortData:proLine})
 
      return (
        
      //   <ul className="list-inline">
      //   { 
      //     ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'].map((value, index) => (
      //     <SortableItem key={`item-${index}`} index={index} value={value} />
      //   ))}
      // </ul>
      
 
            <div style={{display:"inline-block"}} key={proLine.pl_id} className="list-inline container">
                {_.map(proLine.machine_list, (machine,index)=>(
                  <SortableItem disabled={(proLine.published)? true:false}  proLine={proLine} machine={machine} index={index}   drop={drop} allowDrop={allowDrop} key={index} onSortEnd={this.onSortEnd}   />
                ))}
                { (proLine.published)?null:<Avatar style={{float:"left", height:"118px", border:"#FFF 1px dotted", backgroundColor:"rgba(255, 0, 0, 0)"}}  onDrop={drop} onDragOver={allowDrop} shape="square" size={64} icon="plus" />}
            </div>
 
         
      );
    });
    
    // const { getFieldDecorator } = this.props.form;
    const { getFieldDecorator } = this.props.form;
    // const machine_name_error = getFieldError('machine_name_error')
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
    const settings = {
      dots: false,
      infinite: false,

      speed: 500,
      slidesToShow: 8,
      slidesToScroll: 1
    };


    return (
      
    <Layout className="layout" style={{height:"100vh",overflowY:"scroll"}}>
    <Header>
      <MenuBar defaultSelectedKeys='2' /> 
    </Header>
    <Content style={{ padding: '0 50px' }}>
    <Title linkName="Production Line" titlename="Production Line" />
      <Row style={{marginBottom:"12px"}}>
        <Search onSearch={(value) => this.search(value)} style={{ width: 200, float:"left" }} className="searchColor"/> 
        <Tooltip trigger={( this.state.ProductionLine_Management_Create)?"hover":"false"} placement="top" title="Add"><Button disabled={!this.state.ProductionLine_Management_Create} shape="circle" style={{  float:"left" }}  onClick={this.setProLineData}  icon="plus" className="addColor"></Button></Tooltip>
      </Row>
      {/* Foreach Production Line */}
      
      {
        this.state.proLineList.map((proLine)=>(

          <Row key={proLine.pl_id} style={{backgroundColor:"rgba(255, 255, 255, 0.1)", borderRadius:"14px", marginBottom:"4px" }}>
          <Col span={2}>
          <div style={{paddingTop:"72px" }}>
              <h2 style={{color:"white", textAlign:"center",whiteSpace:"nowrap", textOverflow:"ellipsis", width:'120px', overflow:'hidden' }}>{proLine.pl_name}</h2>
              <h3 style={{color:"white", textAlign:"center",whiteSpace:"nowrap", textOverflow:"ellipsis", width:'120px', overflow:'hidden' }}>{proLine.description}</h3>
          </div>
              
          </Col>
          <Col span={22}>
              <Row style={{marginTop:"18px"}}>
                  <Col span={19} >
                      <Slider {...settings}>
                      {
                        this.state.machineTypeList.map((machineType) => (
                          // <div >
                            <div  className="slickItem"  key={machineType.machine_type_id} id={machineType.machine_type_id}   index={2}  draggable={(proLine.published )?false:true} onDragStart={(evt)=>this.onMachineTypeDrag(evt, machineType)} url={machineType.photo_url} value={machineType.photo_url}> 
                              <img style={{float:"left"}} draggable={false} alt="printer" width="33" drag="false" height="33"  src={`https://${machineType.photo_preview_url}`} />
                              <div style={{margin:"5px 0px 0px 38px", whiteSpace:"nowrap", textOverflow:"ellipsis", width:'50px', overflow:'hidden', textAlign:"left"}} >{machineType.machine_type_name}</div>
                            </div>
                          // </div>
                            // <button id="printer" className="primary" index={2}  draggable="true" onDragStart={this.onMachineTypeDrag}>   <img draggable={false} alt="printer" width="60" drag="false" height="60"  src="img/printer.png" /></button>  
                        ))
                      }
                      </Slider>
 
                  </Col>

                  <Col offset={1} span={4}>
                  <div className="reorder">
                      {/* <SortableListBtn addItem={this.addItem.bind(this)} addItemNew={this.addItemNew.bind(this)} /> */}

                      <Tooltip trigger={(this.state.ProductionLine_Management_Edit)?"hover":"false"} title="Save">
                          <Button  disabled={!this.state.ProductionLine_Management_Edit}   shape="circle" onClick={() => this.showSaveInfoModel(proLine)} icon="save" className="addColor"/>
                      </Tooltip>
                      <Tooltip trigger={(this.state.ProductionLine_Management_Edit)?"hover":"false"} title="Edit">
                        <Button  disabled={!this.state.ProductionLine_Management_Edit}  shape="circle" onClick={() => this.setEditProLineData(proLine)} icon="edit" className="addColor"/>
                      </Tooltip>
          
                
                      <Tooltip trigger={(!proLine.published && this.state.ProductionLine_Management_Delete)?"hover":"false"}  title="Delete">
                        <Button  disabled={ proLine.published || !this.state.ProductionLine_Management_Delete} shape="circle" onClick={() => this.showDeleteProLineWarning(proLine)} icon="delete" className="addColor"/>
                      </Tooltip>           

                      
                      {/* {(proLine.published===0)? <Tooltip title="Publish"><Button shape="circle" onClick={() => this.showPublishWarning(proLine)} icon="upload" className="addColor"/></Tooltip>: <Button shape="circle" disabled icon="upload" className="addColor"/>}              */}
                      <Tooltip  trigger={(!proLine.published && this.state.ProductionLine_Management_Publish_Unpublish)?"hover":"false"}  title="Publish">
                        <Button disabled={ proLine.published || !this.state.ProductionLine_Management_Publish_Unpublish} shape="circle" onClick={() => this.showPublishWarning(proLine)} icon="upload" className="addColor"/>
                      </Tooltip>

                      {/* {(proLine.published===1)? <Tooltip title="Unpublish"><Button shape="circle" onClick={() => this.showUnpublishWarning(proLine)} icon="download" className="addColor"/></Tooltip>: <Button shape="circle" disabled icon="download" className="addColor"/>}              */}
                      
                      <Tooltip  trigger={(proLine.published && this.state.ProductionLine_Management_Publish_Unpublish)?"hover":"false"} title="Unpublish">
                        <Button disabled={ !proLine.published || !this.state.ProductionLine_Management_Publish_Unpublish} shape="circle" onClick={() => this.showUnpublishWarning(proLine)} icon="download" className="addColor"/>
                      </Tooltip>
 
                      
                  </div>
                  </Col>
              </Row>
              <Row>
                  
                  <SortableList 
                          key={proLine.pl_id}
                          proLine={proLine}
                          onSortEnd={this.onSortEnd}
                          onSortStart={this.onSortStart}
                          // getContainer={this.getContainer(proLine)}
                          axis={"xy"}
                          removeItem={(index) => this.removeItem(index)}
                          popUp={(index) => this.popUp(index)}
                          drop={(evt) => this.onMachineDrop(evt,proLine )}
                          allowDrop={this.allowDrop.bind(this)}

                      />
              </Row>
            </Col>
          </Row>

        ))
      }


      {/*Add Production Line*/}
      {/* <CreateProductionLine 
          wrappedComponentRef={this.savefunctionSettingRuleFormRef}
          visible={this.state.visible}
          onCancel={this.onCancelBtnClick}
          onOk={() => this.modifyMachine()}
      /> */}
      {/* <Modal title="Create Account" width={640} visible={this.state.visible} onOk={this.modifyMachine('POST')} onCancel={this.onCancelBtnClick}> */}
            
      
      <Modal title="Create Production Line" width={640} visible={this.state.showCreateProLineModal} onOk={(evt) => this.modifyProLine(evt,'POST')} onCancel={this.onCancelBtnClick}>
 
        < FormItem { ...formItemLayout} label = "Name" validateStatus={this.state.proLineNameDuplicate} help={(this.state.proLineNameDuplicate==="error")?"Duplicate production line name":null}>
          {getFieldDecorator('pl_name', {rules: [{
                required: true,
                message: 'Please input your name!'
              }],
            } ,  {initialValue: this.state.proLineData.pl_name})( <Input />)}
        </FormItem>
        < FormItem { ...formItemLayout} label = "Line Number"  >
          {getFieldDecorator('line_number', {rules: [{
                // required: true,
                message: 'Please input your line number!'
              }],
            },  {initialValue: this.state.proLineData.description})( <Input />)} 
        </FormItem>
      </Modal>

      {/*Edit Production Line*/}
      {/* <Modal title="Create Account" width={640} visible={this.state.visible} onOk={this.modifyMachine('POST')} onCancel={this.onCancelBtnClick}> */}
      <Modal title="Edit Production Line" width={640}  visible={this.state.showEditProLineModal} onOk={(evt) => this.modifyProLine(evt,'PUT')} onCancel={this.onCancelBtnClick}>
            
        < FormItem { ...formItemLayout} label = "Name" validateStatus={this.state.proLineNameDuplicate} help={(this.state.proLineNameDuplicate==="error")?"Duplicate production line name":null}>
          {getFieldDecorator('pl_name', {initialValue: this.state.proLineData.pl_name})( <Input />)}

        </FormItem>
        < FormItem { ...formItemLayout} label = "Line Number" >
          {getFieldDecorator('line_number', {initialValue: this.state.proLineData.description})( <Input />)}
        </FormItem>
      </Modal>

      {/*Show Create Machine */}
      <Modal title="Create Machine" width={640}  visible={this.state.showCreateMachineModal} onOk={(evt) => this.modifyMachine(evt,'POST')} onCancel={this.onCancelBtnClick}>
 
        <FormItem >
            <Col span={8}  offset={6}>
              <img alt="example" width="127" height="127" src={`https://${this.state.currentMachineData.photo_preview_url}`} />
            </Col>
        </FormItem>
        <FormItem style={{display:"none"}} label="Machine Type" {...formItemLayout}>
          {getFieldDecorator('machine_type_id', {initialValue: this.state.currentMachineData.machine_type_id})(<Input disabled />)}
        </FormItem>
        <FormItem label="Machine Type" {...formItemLayout}>
          {getFieldDecorator('machine_type_name', {initialValue: this.state.currentMachineData.machine_type_name})(<Input disabled />)}
        </FormItem>

        < FormItem { ...formItemLayout} label = "Machine Name" validateStatus={this.state.machineNameDuplicate} help={(this.state.machineNameDuplicate==="error")?"Duplicate machine name":null}>
             {getFieldDecorator('machine_name')(<Input />)} 
        </FormItem>
        <FormItem {...formItemLayout} label="Description">
            {getFieldDecorator('description')(<Input />)} 
        </FormItem>
        <FormItem {...formItemLayout} label="Serial No">
            {getFieldDecorator('serial_no')(<Input />)} 
        </FormItem>
        <FormItem {...formItemLayout} label="PIC">
            {getFieldDecorator('PIC')(<Select mode="multiple" style={{ width: '100%' }} placeholder="Please select">{PICOption}</Select>)} 
        </FormItem>
      </Modal>

      {/*Show Edit Machine */}
      <Modal title={this.state.proLineData.published===1?"Machine Information":"Edit Machine"} width={640}  visible={this.state.showEditMachineModal} onOk={(evt) => this.modifyMachine(evt,'PUT')} onCancel={this.onCancelBtnClick}>
 
        <FormItem >
            <Col span={8}  offset={6}>
              <img alt="example" width="127" height="127" src={`https://${this.state.currentMachineData.photo_preview_url}`} />
            </Col>
        </FormItem>

        <FormItem style={{display:"none"}}  label="Machine Type" {...formItemLayout}>
          {getFieldDecorator('machine_type_id', {initialValue: this.state.currentMachineData.machine_type_id})(<Input disabled />)}
        </FormItem>
        <FormItem label="Machine Type" {...formItemLayout}>
          {getFieldDecorator('machine_type_name', {initialValue: this.state.currentMachineData.machine_type_name})(<Input disabled />)}
        </FormItem>

        < FormItem { ...formItemLayout} label = "Machine Name" validateStatus={this.state.machineNameDuplicate} help={(this.state.machineNameDuplicate==="error")?"Duplicate machine name":null}>
            {getFieldDecorator('machine_name', {initialValue: this.state.currentMachineData.machine_name})(<Input disabled={this.state.proLineData.published===1} />)} 
        </FormItem>
        <FormItem {...formItemLayout} label="Description">
            {getFieldDecorator('description', {initialValue: this.state.currentMachineData.description})(<Input disabled={this.state.proLineData.published===1}/>)} 
        </FormItem>
        <FormItem {...formItemLayout} label="Serial No">
            {getFieldDecorator('serial_no', {initialValue: this.state.currentMachineData.serial_no})(<Input disabled={this.state.proLineData.published===1}/>)} 
        </FormItem>

 

        <FormItem {...formItemLayout} label="PIC">
          {getFieldDecorator('PIC', {initialValue: this.state.currentMachineData.PICSelected})(
                <Select  disabled={this.state.proLineData.published===1}  mode="multiple" style={{ width: '100%' }}>
                {PICOption}
                </Select>
                )} 
        </FormItem>


        {/* <FormItem {...formItemLayout} label="PIC">
            <Select  defaultValue={["3f03e7c0-db4f-11e8-bd48-231dbd751880"]}  disabled={this.state.proLineData.published===1} mode="multiple" style={{ width: '100%' }} placeholder="Please select">{PICOption}</Select>
        </FormItem>
        <FormItem {...formItemLayout} label="PIC">
            {getFieldDecorator('PIC')(<Select mode="multiple" style={{ width: '100%' }} placeholder="Please select">{PICOption}</Select>)} 
        </FormItem> */}
      </Modal>

    
      <AttachedDevices
        wrappedComponentRef={this.saveAttacheddevicesFormRef}
        visible={this.state.showAttachedDevicesModal}
        machine={this.state.currentMachineData}
        onCancel={this.onCancelBtnClick}
        token={this.state.token}
        onCreate={() => this.submitAttacheddevices()}
      />
      {/* 

      <Modal visible={this.state.showCreateMachineModal} title="Create Attached Devices" okText="OK" onCancel={onCancel} onOk={this.onCreate.bind(this)} width={691} >
      <Form>
        <FormItem label="Name">
          {getFieldDecorator('selectedRowKeys')(<Table  columns={columns} dataSource={dataSource} pagination={false} rowSelection={rowSelection} rowKey={data => data.device_id} className="popuprow"/>)}
        </FormItem>
      </Form>
      </Modal>

      */}

     </Content>
 
    <Footer/>
  </Layout>
    );
  }
}

const ProductionLine = Form.create()(App);
export default ProductionLine;
