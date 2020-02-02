import React, { Component } from "react";

import LanguageContext from "./language-context";

class LanguageSwitcher extends Component {
  render() {
    return (
      <LanguageContext.Consumer>
        {({ language, setLanguage }) => (
          <button onClick={() =>{
            setLanguage("jp")
            console.log(LanguageContext,'languagecontext');
          }}>
            Switch Language (Current: {language})
          </button>
        )}
      </LanguageContext.Consumer>
    );
  }
}

export default LanguageSwitcher;