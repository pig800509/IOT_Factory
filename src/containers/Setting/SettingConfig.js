//頁面的constant data, 用於切換不同setting頁使用
export const settingPages = [
    {
        path:"/setting",
        title:"Setting",
        name:"setting"
    }
    ,
    {
        path: "/setting/systemInfo",
        title:"Information",
        name:"Setting / SystemInfo",
        category:"systemInfo"
    },
    {
        path:"/setting/smtp",
        title:"SMTP",
        name:"Setting / Smtp",
        category:"smtp"
    },
    {
        path:"/setting/timesync",
        title:"Time Sync",
        name:"Setting / Timesync",
        category:"timesync"
    },
    {
        path: "/setting/eventAlert",
        title:"Event alert",
        name:"Setting / EventAlert",
        category:"eventAlert"
    }
];
//form的欄位RWD
export const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
      md: { span: 8 },
      lg: { span: 8 },
      xl: { span: 8 }
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
      md: { span: 10 },
      lg: { span: 10 },
      xl: { span: 8 }
    }
};
//form的尾欄位RWD
export const tailFormItemLayout = {
    wrapperCol: {
      xs: { span: 24 ,offset: 0},
      sm: { span: 24 ,offset: 6},
      md: { span: 24 ,offset: 8}
    }
};
