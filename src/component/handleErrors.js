import { message } from "antd";


const CheckError = {
  
  resCheck: (res) => {
    if(!res.ok ){
      if(res.status ===401) {throw res.json().then( (data)=>{
          message.error(data.results.status_msg)
          window.location.replace('/');
      })}

      if(res.status ===503) {throw res.json().then( (data)=>{
        message.error(data.results.status_msg)
        window.location.replace('/');
      })}
      if(res.status ===400) {throw res.json().then( (data)=>{
        message.error(data.results.status_msg)
        // window.location.replace('/');
      })}
      if(res.status ===403) {throw res.json().then( (data)=>{
        message.error(data.results.status_msg)
        // window.location.replace('/');
      })}
       // console.log(_.has(res., 'json()'),'ddddddd');

      throw res.text().then( (data)=> (message.error(`${res.status}: ${data}`) ))

    }else{
      return res.json();

    }
    
  }
  
};
export default CheckError;
// const CheckError = {
//   resCheck: (res) => {
//     console.log(res,'ressss');
//     if(res.ok){
//       return res.json();
//     }
//     else if(res.status===401){
//       throw "401";
//     }else{
//       throw "other error"
//     }
//   },
// }
// export default CheckError;

