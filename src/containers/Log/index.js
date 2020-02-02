import React from 'react';
import {Layout} from 'antd';
import PropTypes from 'prop-types';
import _ from "lodash";
import { Link, Switch } from 'react-router-dom';
import MenuBar from '../../component/Menu';
import Title from '../../component/Title';
import Footer from '../../component/Footer';
import {logPages} from './logSetting';
import LogPage from './log'
const {Header, Content} = Layout;

//進入點
//Template 由Jerry 定義, 資料從 logSetting.js 抓取
//Switch 切換 LogPage 的 props
const LogBufferPage = ({ location, match, userData }) => (
  <Layout className="layout" style={{
    height: "100vh" ,overflowY:"scroll"
  }}>
    <Header>
      <MenuBar defaultSelectedKeys='6'/>
    </Header>
    <Content style={{
      padding: '0 50px'
    }}>
      <Title 
        linkName={
          _.find(logPages, ['path', location.pathname]) ?
          _.find(logPages, ['path', location.pathname]).name : logPages.name
        } 
        titlename={
          _.find(logPages, ['path', location.pathname]) ? 
          _.find(logPages, ['path', location.pathname]).title : logPages.title
        }/>
      <div className="demo-nav" style={{display:"inline-block"}}>
        {logPages.map((obj, index) => {
            return obj.category?
            <Link className={obj.path===location.pathname?"linkTabSelected":"linkTab"} 
              key={index} 
              to={obj.path}>{obj.title}
            </Link>:null;
        })}
      </div>
      <Switch>
        {
          logPages.map(
            (obj,index)=>{
              return obj.category ? 
              <LogPage 
                key={index}
                location={`${match.url}/${obj.category}`} 
                token={_.get(userData,'token',false)} />
              : null
            }
          )
        }
        />
      </Switch>    
    </Content>
    <Footer/>
  </Layout>
);

LogBufferPage.propTypes = {
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired
};

export default LogBufferPage;
