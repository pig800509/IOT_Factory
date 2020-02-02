
// var host=window.location.href
// export default {
//   apiUrl: 'https://'+host+'/api',
//   baseUrl: 'https://iotdev.wiccs.net',

// };

const version="V181114.T02";


// const plServerUrl="https://t02.iotcomm.net";
// const devServerUrl="https://t02.iotcomm.net";
// const logServerUrl="https://t02.iotcomm.net";
// const accountServerUrl="https://t02.iotcomm.net";
// const dashboardServerUrl="https://t02.iotcomm.net";
// const systemServerUrl="https://t02.iotcomm.net";
// const dataServerUrl="https://t02.iotcomm.net";

// const plApiUrl="https://t02.iotcomm.net/api";
// const devApiUrl="https://t02.iotcomm.net/api";
// const logApiUrl="https://t02.iotcomm.net/api";
// const accountApiUrl="https://t02.iotcomm.net/api";
// const dashboardApiUrl="https://t02.iotcomm.net/api";
// const systemApiUrl="https://t02.iotcomm.net/api";
// const dataApiUrl="https://t02.iotcomm.net/api";


const plServerUrl="https://apipl.iotcomm.net";
const devServerUrl="https://iotdev.wiccs.net";
const logServerUrl="https://apilog.iotcomm.net";
const accountServerUrl="https://apiaccount.iotcomm.net";
const dashboardServerUrl="https://apidashboard.iotcomm.net";
const systemServerUrl="https://apisystem.iotcomm.net";
const dataServerUrl="https://apidata.iotcomm.net";

const plApiUrl="https://apipl.iotcomm.net/api";
const devApiUrl="https://iotdev.wiccs.net/api";
const logApiUrl="https://apilog.iotcomm.net/api";
const accountApiUrl="https://apiaccount.iotcomm.net/api";
const dashboardApiUrl="https://apidashboard.iotcomm.net/api";
const systemApiUrl="https://apisystem.iotcomm.net/api";
const dataApiUrl="https://apidata.iotcomm.net/api";

const logTypeData = {"error":"error", "info":"info","debug":"debug"};
const heartbeatData = ["1", "2", "3","5","10","15","30","60","90","120","180","300"];
const logLevelData = ["debug", "info","error"];
const syncModeData = ["None","NTP","Server"];
const timezoneData = ["UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00", "UTC-07:00", "UTC-06:00", "UTC-05:00", "UTC-04:00", "UTC-03:30", "UTC-03:00", "UTC-02:00", "UTC-01:00", "UTC+00:00", "UTC+01:00", "UTC+02:00", "UTC+03:00", "UTC+03:30", "UTC+04:00", "UTC+04:30", "UTC+05:00", "UTC+05:30", "UTC+05:45", "UTC+06:00", "UTC+06:30", "UTC+07:00", "UTC+08:00", "UTC+09:00", "UTC+09:30", "UTC+10:00", "UTC+11:00", "UTC+12:00", "UTC+13:00"];
const cameraTypeData = ["webCam"];
const streamTypeData = ["wowza"];

const siteConfig = {
  siteName: 'wiDM',
  siteIcon: 'ion-flash',
  footerText: 'wiDM ©2018 Wistron',
};
const themeConfig = {
  topbar: 'themedefault',
  sidebar: 'themedefault',
  layout: 'themedefault',
  theme: 'themedefault',
};
const language = 'english';

const provinceData = ['Linux', 'RTOS'];
const agentData = {
  Linux: ['NO','YES'],
  RTOS: ['NO'],
};
const registertypeData = {
  YES: ['By Security Key', 'By Mac Address'],
  NO: ['None'],
};
const plconfig={
  plvalue:'0999b859e75edb92b112abc',
  // machine_value:'20180910055444',
  machine_value:'20180912053450',
  dataimg:'http://via.placeholder.com/216x144',
  dataname:'Printer',
  dataid:'20180912025011',
  pl_id:'20180912051821'
}
const transformData={
  "Transform":[
    {Transform_id:"TF_AIOPress",Transform_name:"AIO Press/ Oxygen Concentration"},
    {Transform_id:"TF_CycleTime",Transform_name:"Cycle Time"},
    // {Transform_id:"TF_CopyData",Transform_name:"CopyData"}
  ]
}

export {
  plServerUrl,
  devServerUrl,
  logServerUrl,
  accountServerUrl,
  dashboardServerUrl,
  systemServerUrl,
  dataServerUrl,
  plApiUrl,
  devApiUrl,
  logApiUrl,
  accountApiUrl,
  dashboardApiUrl,
  systemApiUrl,
  dataApiUrl,
  logTypeData,
  version,
  // transmissionData,
  heartbeatData,
  logLevelData,
  syncModeData,
  timezoneData,
  cameraTypeData,
  streamTypeData,
  siteConfig,
  language,
  themeConfig,
  provinceData,
  agentData,
  registertypeData,
  plconfig,
  transformData,
};
