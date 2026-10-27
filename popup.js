document.getElementById('start').addEventListener('click', async () => {
  const status=document.getElementById('status');
  try {
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.url || !/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/my-items\/saved-posts\/?/.test(tab.url)) {
      status.textContent='Open linkedin.com/my-items/saved-posts/ in this tab first.';return;
    }
    await chrome.scripting.executeScript({target:{tabId:tab.id},files:['export.js']});
    window.close();
  }catch(e){status.textContent='Could not start the extension: '+e.message;}
});
