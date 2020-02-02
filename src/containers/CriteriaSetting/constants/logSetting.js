exports.logColumns = [{
    title: 'Date / Time',
    dataIndex: 'log_time',
    width: '20%'
}, {
    title: 'Log Level',
    dataIndex: 'level',
    width: '20%'
}, {
    title: 'Logger',
    dataIndex: 'logger',
    width: '20%'
}, {
    title: 'Message',
    dataIndex: 'message',
    width: '20%'
},
{
    title: 'Status',
    dataIndex: 'status',
    width: '20%'
}
];

exports.logTabs = [{
    title: "Operation Log",
    type: "operation"
}, {
    title: "System Log",
    type: "system"
}, {
    title: "Event Log",
    type: "event"
}, {
    title: "Device Log",
    type: "device"
}];