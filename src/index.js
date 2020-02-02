import React from 'react';
import ReactDOM from 'react-dom';
 import { Form,   Input, Button, message} from 'antd';
import 'antd/dist/antd.css';
import './App.css';
import registerServiceWorker from './registerServiceWorker';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
} from "react-router-dom";

 import productionLineMonitor from './containers/ProductionLineMonitor';
import machineMonitor from './containers/MachineMonitor';
import account from './containers/Account';
// import dashboard from './containers/Dashboard';
import cycleTime from './containers/CycleTime';
import device from './containers/Device';
// import deviceModel from './containers/DeviceModel';
import machineType from './containers/MachineType';
import machine from './containers/Machine';
import productionLine from './containers/ProductionLine';
import log from './containers/Log';
import SMTPSetting from './containers/Setting/SMTPSettingPage';
import timeSyncSetting from './containers/Setting/TimeSyncSettingPage';
import criteriaSetting from './containers/CriteriaSetting';
import machineSetting from './containers/MachineSetting';
import eventAlert from './containers/EventAlert';
import systemInfo from './containers/SystemInfo';
import openSocket from 'socket.io-client';
import { accountApiUrl,accountServerUrl, version } from './config';
import CheckError from './component/handleErrors';
 
// import machineMonitor from './containers/MachineDashboard'
// const socket = openSocket(`${accountServerUrl}`, {transports: ['websocket']});
const socket = openSocket(`${accountServerUrl}`, {path:"/account", transports: ['websocket'] });

const FormItem = Form.Item;

const PrivateRoute = ({ component: Component, ...rest }) => (
  
  <Route
    {...rest}
    render={
      props => {

        let userData = JSON.parse(sessionStorage.getItem('userData'));
        props.userData = userData;
        console.log(props.userData,"USER DATA IN LOGIN");

        return (userData)?  <Component {...props}  /> :  <Redirect to={{pathname: "/", state: { from: props.location }}}/>

      }
    }
  />
);

class App extends React.Component {
  state = {
    redirectToReferrer: false  };

  handleSubmit = (e) => {
    console.log(e,'HANDSUBMIT');
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', `${accountApiUrl}/accounts/login/`);
        // console.log('Received values of form: ', values);
        fetch(`${accountApiUrl}/accounts/login/`, {
          method: "POST",
          body: JSON.stringify(values)
        })
        .then(CheckError.resCheck)
        .then(({results}) => {

          console.log(results,"LOGINNNNN");
          if(results.status==="OK"){
            // results={ a: 1, b: 2 }

          /* For Server Kickout Some One */
          socket.on('connect', function(){ console.log("socket shot connect"); });

          socket.on('account/'+results.user_id, (res)=>{
            console.log(res,"ACCOUNT ");
            if(res.topic==="logout"){    
              message.error(res.data.msg)
               this.setState({ redirectToReferrer: false });
              window.location.replace('/');
            }
          })
            sessionStorage.setItem('userData', JSON.stringify(results));
            this.setState(()=>({redirectToReferrer: true }))
            console.log(this.state,'state');
          }
          else message.error(results.status_msg)
        })
      }
    });
  } 

  login = () => {
    fakeAuth.authenticate(() => {
      this.setState({ redirectToReferrer: true });
    });
  };

  render() {
    // const { from } = this.props.location.state || { from: { pathname: "/" } };
    const { redirectToReferrer } = this.state;
    // console.log(from,'frommmmm',redirectToReferrer);
    if (redirectToReferrer) {
      // console.log('redirectToReferrer',redirectToReferrer);
      return <Redirect to={"/productionLineMonitor"} />;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      // <div>
      //   <p>You must log in to view the page at {from.pathname}</p>
      //   <button onClick={this.login}>Log in</button>
      // </div>
      <div className="backgroundImg"  style={{height:"100vh"}}  >
        <div className="backgroundPatten">
          <div className="backgroundBottom"style={{height:"100vh"}}>
            <div className="login-form">
              <Form onSubmit={this.handleSubmit}   autoComplete="on">
                
                <h2 style={{textAlign:"center"}}><img src="./img/logo.svg" width="203px" height="34px"  alt="logo"/></h2>
                <FormItem  label="Account">
                  {getFieldDecorator('username' )(
                    <Input size="large"/>
                  )}
                </FormItem>
                <FormItem label="Password">
                  {getFieldDecorator('password')(
                    <Input   size="large" type="password" autoComplete="on" />
                  )}
                </FormItem>
                <FormItem>
                   <Button  size="large" type="primary" htmlType="submit" className="login-form-button">
                    Login
                  </Button>
                 </FormItem>
              </Form>
              <br/>
              <br/>
              <h5 style={{color:"gray", textAlign:"center" }}> © 2018 Wistron All rights reserved  </h5>
              <h5 style={{color:"gray", textAlign:"center" }}> {version} </h5>
            </div>
          </div>
        </div>
      </div>

    );
  }
}
const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true;

    setTimeout(cb, 100); // fake async
  },
  signout(cb) {
    this.isAuthenticated = false;
    setTimeout(cb, 100);
  }
};

const Login = Form.create()(App);
export default Login;


ReactDOM.render(
  (
  <Router>
    {/* {renderRoutes(routes)} */}
    <div>

      <Route path="/" component={Login} exact />
      {/* <Route path="/login" component={Login} /> */}

      <PrivateRoute path="/productionLineMonitor" component={productionLineMonitor} exact/>
      <PrivateRoute path="/cycletimeMonitor" component={cycleTime} exact/>
      <PrivateRoute path="/machineMonitor" component={machineMonitor} exact/>

      <PrivateRoute path="/productionLine" component={productionLine} exact/>
      
      <PrivateRoute path="/machine" component={machine} isAuthed={true} />
      <PrivateRoute path="/machineType" component={machineType} />

      <PrivateRoute path="/device" component={device} exact/>
      {/* <PrivateRoute path="/devicemodel" component={deviceModel} exact/> */}

      <PrivateRoute path="/account" component={account} exact/>

      <PrivateRoute path="/setting/systemInfo" component={systemInfo} exact/>
      <PrivateRoute path="/setting/smtp" component={SMTPSetting} exact/>
      <PrivateRoute path="/setting/timesync" component={timeSyncSetting} exact/>
      <PrivateRoute path="/setting/eventAlert" component={eventAlert} exact/>

      <PrivateRoute path="/log/operation" component={log} exact/>
      <PrivateRoute path="/log/system" component={log} exact/>
      <PrivateRoute path="/log/event" component={log} exact/>
      <PrivateRoute path="/log/device" component={log} exact/>

      <PrivateRoute path="/criteriaSetting" component={criteriaSetting} exact/>
      <PrivateRoute path="/machineSetting" component={machineSetting} exact/>
      {/* <PrivateRoute path="/machineSetting" component={machineSetting} exact/> */}

      {/* <PrivateRoute path="/productionLineMonitor" component={productionLineMonitor} exact/> */}


    </div>

  </Router>
  ), document.getElementById('root'),
);


registerServiceWorker();

