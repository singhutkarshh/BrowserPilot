const  SettingsSlice = {  
  openAIKey: REACT_APP_OPENAI_API_KEY || '',  
  selectedModel: 'gpt-4',  
  actions: {  
    update: function(values) {  
      SettingsSlice = {  
        ...SettingsSlice,  
        ...values  
      };  
    }  
  }  
};  

export { SettingsSlice  }; 