import { attachDebugger, detachDebugger } from '../helpers/chromeDebugger';
import {
  disableIncompatibleExtensions,
  reenableExtensions,
} from '../helpers/disableExtensions';
import { callDOMAction } from '../helpers/domActions';
import {
  parseResponse,
} from '../helpers/parseResponse';
import { determineNextAction } from '../helpers/determineNextAction';
import templatize from '../helpers/shrinkHTML/templatize';
import { getSimplifiedDom } from '../helpers/simplifyDom';
import { sleep } from '../helpers/utils';

var CurrentTaskSlice = {  
  tabId: -1,  
  instructions: null,  
  history: [],  
  status: 'idle',  
  actionStatus: 'idle',  
  actions: {  
    runTask: async function(onError) {  
      var wasStopped = function() {  
        return CurrentTaskSlice.status !== 'running';  
      };  
      var setActionStatus = function(status) {  
        CurrentTaskSlice.actionStatus = status;  
      };  
  
      var instructions = CurrentTaskSlice.instructions;  
  
      if (!instructions || CurrentTaskSlice.status === 'running') return;  
  
      CurrentTaskSlice.instructions = instructions;  
      CurrentTaskSlice.history = [];  
      CurrentTaskSlice.status = 'running';  
      CurrentTaskSlice.actionStatus = 'attaching-debugger';  
  
      try {  
        var activeTab = (  
          await chrome.tabs.query({ active: true, currentWindow: true })  
        )[0];  
  
        if (!activeTab.id) throw new Error('No active tab found');  
        var tabId = activeTab.id;  
        CurrentTaskSlice.tabId = tabId;  
  
        await attachDebugger(tabId);  
        await disableIncompatibleExtensions();  
  
        while (true) {  
          if (wasStopped()) break;  
  
          setActionStatus('pulling-dom');  
          var pageDOM = await getSimplifiedDom();  
          if (!pageDOM) {  
            CurrentTaskSlice.status = 'error';  
            break;  
          }  
          var html = pageDOM.outerHTML;  
  
          if (wasStopped()) break;  
          setActionStatus('transforming-dom');  
          var currentDom = templatize(html);  
  
          var previousActions = CurrentTaskSlice.history.map(function(entry) {  
            return entry.action;  
          });  
  
          setActionStatus('performing-query');  
  
          var query = await determineNextAction(  
            instructions,  
            previousActions.filter(function(pa) {  
              return !('error' in pa);  
            }),  
            currentDom,  
            3,  
            onError  
          );  
  
          if (!query) {  
            CurrentTaskSlice.status = 'error';  
            break;  
          }  
  
          if (wasStopped()) break;  
  
          setActionStatus('performing-action');  
          var action = parseResponse(query.response);  
  
          CurrentTaskSlice.history.push({  
            prompt: query.prompt,  
            response: query.response,  
            action: action,  
            usage: query.usage,  
          });  
  
          if ('error' in action) {  
            onError(action.error);  
            break;  
          }  
  
          if (  
            action === null ||  
            action.parsedAction.name === 'finish' ||  
            action.parsedAction.name === 'fail'  
          ) {  
            break;  
          }  
  
          if (action.parsedAction.name === 'click') {  
            await callDOMAction('click', action.parsedAction.args);  
          } else if (action.parsedAction.name === 'setValue') {  
            await callDOMAction('setValue', action.parsedAction.args);  
          } else if (action.parsedAction.name === 'navigate') {  
            await callDOMAction('navigate', action.parsedAction.args);  
          }  
  
          if (wasStopped()) break;  
  
          if (CurrentTaskSlice.history.length >= 50) {  
            break;  
          }  
  
          setActionStatus('waiting');  
          await sleep(2000);  
        }  
        CurrentTaskSlice.status = 'success';  
      } catch (e) {  
        onError(e.message);  
        CurrentTaskSlice.status = 'error';  
      } finally {  
        await detachDebugger(CurrentTaskSlice.tabId);  
        await reenableExtensions();  
      }  
    },  
    interrupt: function() {  
      CurrentTaskSlice.status = 'interrupted';  
    },  
  },  
};  

export default CurrentTaskSlice;