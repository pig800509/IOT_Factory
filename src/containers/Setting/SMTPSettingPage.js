import React ,{PureComponent} from 'react';
import {Layout} from 'antd';
import PropTypes from 'prop-types';
import _ from "lodash";
import {Link} from 'react-router-dom';
import MenuBar from '../../component/Menu';
import Title from '../../component/Title';
import Footer from '../../component/Footer';
import {settingPages} from './SettingConfig';
import SMTPForm from './SMTP';
const {Header, Content} = Layout;

//進入點
//Template 由Jerry 定義, 資料從 SettingConfig.js 抓取, 結構跟Log是一樣的
class SMTPSettingPage extends PureComponent {
    render() {
        const {location,userData} = this.props;
        return (
            <Layout className="layout" style={{
                height: "100vh", overflowY:"scroll"
            }}>
                <Header>
                <MenuBar defaultSelectedKeys='6'/>
                </Header>
                <Content style={{
                padding: '0 50px'
                }}>
                    <Title 
                        linkName={
                        _.find(settingPages, ['path', location.pathname]) ?
                        _.find(settingPages, ['path', location.pathname]).name : settingPages[0].name
                        } 
                        titlename={
                        _.find(settingPages, ['path', location.pathname]) ? 
                        _.find(settingPages, ['path', location.pathname]).title : settingPages[0].title
                        }/>
                    <div className="demo-nav" style={{display:"inline-block"}}>
                        {settingPages.map((obj, index) => {
                            return obj.category?
                            <Link className={obj.path===location.pathname?"linkTabSelected":"linkTab"} 
                                key={index} 
                                to={obj.path}>{obj.title}
                            </Link>:null;
                        })}
                    </div>
                    <SMTPForm className="settingform" token={_.get(userData,'token',false)}/>
                </Content>
                <Footer/>
            </Layout>
        )
    }
}

SMTPSettingPage.propTypes = {
  location: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired
};

export default SMTPSettingPage;
