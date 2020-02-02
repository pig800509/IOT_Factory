// Make sure the shape of the default value passed to
// createContext matches the shape that the consumers expect!
import React, { Component } from 'react';


// const store = {
//   state = {
//     foo: 1,
//     bar: 1,
//   },
//   update(cb) {
//     this.state = cb(this.state);
//   }
// };

// export const themes = {
//   light: {
//     foreground: '#000000',
//     background: '#eeeeee',
//   },
//   dark: {
//     foreground: '#ffffff',
//     background: '#222222',
//   },
// };

// export const ThemeContext = React.createContext(
//   themes.dark // default value
// );

export const ThemeContext = React.createContext({
  username: 'user',
  // state: {
  //   foo: 1,
  //   bar: 1,
  // },
  // data:{
   //   username:"ggg"
  // },
  // toggleTheme: () => {console.log('CONTEXT CLICK');},
  setLanguage: () => {}

});
// export const ThemeContext = React.createContext({
//   themes: 'edit',
//   iconType: 'user',
//   state: {
//     foo: 1,
//     bar: 1,
//   },
//   data:{
//     username:"ggg"
//   },
//   toggleTheme: () => {console.log('CONTEXT CLICK');},
//   update(cb) {
//     this.state = cb(this.state);
//   }

// });

 

// const ThemeContext = React.createContext('light')
// class ThemeProvider extends React.Component {
//   state = {theme: 'light'}
//   toggleTheme = () => {
//     this.setState(({theme}) => ({
//       theme: theme === 'light' ? 'dark' : 'light',
//     }))
//   }
//   render() {
//     return (
//       <ThemeContext.Provider value={this.state.theme}>
//         <button onClick={this.toggleTheme}>toggle theme</button>
//         {this.props.children}
//       </ThemeContext.Provider>
//     )
//   }
// }