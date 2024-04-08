const  SettingsSlice = {  
  openAIKey: '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',  
  selectedModel: 'gpt-3.5-turbo',  
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