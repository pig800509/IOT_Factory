import React from "react";

// set the defaults
const LanguageContext = React.createContext({
  language: "en",
  setLanguage: value => {
    this.language = value;
  }
});

export default LanguageContext;
