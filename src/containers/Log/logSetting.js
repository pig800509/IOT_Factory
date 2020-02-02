//頁面的constant data, 用於切換不同logTable頁使用
exports.logColumns = [{                  
    title: 'Date / Time',
    dataIndex: 'log_time',
    width: '15%',
    'sorter': (a, b) => Date.parse(a.log_time) - Date.parse(b.log_time),
    defaultSortOrder: 'descend'
}, {
    title: 'Log Level',
    dataIndex: 'level',
    width: '10%'
}, {
    title: 'Logger',
    dataIndex: 'logger',
    width: '20%'
}, {
    title: 'Message',
    dataIndex: 'message',
    width: '35%'
},
{
    title: 'Status',
    dataIndex: 'status',
    width: '20%'
}
];
//頁面的constant data, 用於切換不同log頁使用
exports.logPages = [
    {
        path:"/log",
        title:"Log",
        name:"log"
    },
    {
        path:"/log/operation",
        title:"Operation Log",
        name:"Log / Operation",
        category:"operation"
    },
    {
        path:"/log/system",
        title:"System Log",
        name:"Log / System",
        category:"system"
    },
    {
        path: "/log/event",
        title:"Event Log",
        name:"Log / Event",
        category:"event"
    },
    {
        path:"/log/device",
        title:"Device Log",
        name:"Log / Device",
        category:"device"
    }
];
