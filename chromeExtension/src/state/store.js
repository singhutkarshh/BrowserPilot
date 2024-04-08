import merge from 'lodash/merge';
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';
import { createCurrentTaskSlice } from './currentTask';
import { createUiSlice } from './ui';
import { createSettingsSlice } from './settings';
  
var useAppState = create(  
  persist(  
    immer(  
      devtools(function() {  
        return {  
          currentTask: createCurrentTaskSlice(),  
          ui: createUiSlice(),  
          settings: createSettingsSlice(),  
        };  
      })  
    ),  
    {  
      name: 'app-state',  
      storage: createJSONStorage(function() {  
        return localStorage;  
      }),  
      partialize: function(state) {  
        return {  
          ui: {  
            instructions: state.ui.instructions,  
          },  
          settings: {  
            openAIKey: state.settings.openAIKey,  
            selectedModel: state.settings.selectedModel,  
          },  
        };  
      },  
      merge: function(persistedState, currentState) {  
        return merge(currentState, persistedState);  
      },  
    }  
  )  
);  
  
// used for debugging  
window.getState = useAppState.getState;  

export { useAppState };

