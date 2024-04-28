/**
 * Model
 */
class Model {
  constructor() {
      this.tabs = JSON.parse(sessionStorage.getItem('tabs')) || [];
      if (this.tabs.length === 0) {
        // Add a default tab if tabs array is empty
        this.tabs.push({
            id: 1,
            text: "New Tab",
            active: true, // Assuming the first tab should be active
            url: "search.html"
        });
        sessionStorage.setItem('tabs', JSON.stringify(this.tabs));
    }
  }

  bindTabListChanged(callback) {
      this.onTabListChanged = callback;
  }

  _commit(tabs) {
      this.onTabListChanged(tabs);
      sessionStorage.setItem('tabs', JSON.stringify(tabs));
  }

  addTab(tabText) {
    this.tabs = this.tabs.map(tab => ({ ...tab, active: false, url: tab.url }));
      const tab = {
          id: this.tabs.length > 0 ? this.tabs[this.tabs.length - 1].id + 1 : 1,
          text: tabText,
          active: true,
          url: "search.html"
      };
      this.tabs.push(tab);
      this._commit(this.tabs);
  }
  clickTab(id){
      this.tabs = this.tabs.map(tab =>
          tab.id === id ? { id: tab.id, text: tab.text, active: true, url: tab.url } : { id: tab.id, text: tab.text, active: false, url: tab.url }
      );
      this._commit(this.tabs);
  }

  editTab(id, updatedURL) {
    const heading = updatedURL.split(".")[1] || "default";
      this.tabs = this.tabs.map(tab =>
          tab.id === id ? { id: tab.id, text: heading, active: tab.active, url: updatedURL } : tab
      );

      this._commit(this.tabs);
  }

  deleteTab(id) {
      this.tabs = this.tabs.filter(tab => tab.id !== id);
      this._commit(this.tabs);
  }
}

/**
* View
*/
class View {
  constructor() {
      this.app = $('#root');
      this.form = $('#input-form');
      this.input = $('#input-url');
      this.submitButton = $('#submit-button');
      this.tabs = $('#tabs');
      this.frame = $('#if1');
      this.addButton = $('.add-tab');
      this._temporaryTabText = '';
      this.activeTabId = null;

  }

  displayTabs(tabs) {
      this.tabs.empty();
          tabs.forEach(tab => {
            // <li class="tab">Tab 2 <span class="close-tab">x</span></li>
              const li = $('<li></li>').addClass("tab").attr('id', tab.id).text(tab.text);
              if(tab.active){
                li.addClass("active");
                this.activeTabId = tab.id;
                this.frame.attr('src',tab.url);  
              }
              const span = $('<span></span>').addClass('close-tab').text('x');
              li.append( span);
              this.tabs.append(li);
          });
          const addButton = $('<li></li>').addClass('add-tab').text("+");
          this.tabs.append(addButton);
      }

  bindAddTab(handler) {
      this.tabs.on('click', '.add-tab', event => {
          handler("New Tab");
      })
  }

  bindDeleteTab(handler) {
      this.tabs.on('click', '.close-tab', event => {
          const id = parseInt($(event.target).closest('li').attr('id'));
          handler(id);
      });
  }
  bindSearchTab(handler) {
    this.form.on('submit', event => {
      event.preventDefault();
      const searchText = this.input.val();
      if (this.activeTabId !== null) {
          handler(this.activeTabId, searchText); // Pass the active tab ID to the handler
      }

      this.input.val('');
  })
  }

bindClickTab(handler) {
  this.tabs.on('click','.tab',event => {
    const id = parseInt($(event.target).closest('li').attr('id'));
    handler(id);        
  });
}
}

/**
* Controller
*/
class Controller {
  constructor(model, view) {
      this.model = model;
      this.view = view;

      this.model.bindTabListChanged(this.onTabsChanged.bind(this));
      this.view.bindAddTab(this.handleAddTab.bind(this));
      this.view.bindDeleteTab(this.handleDeleteTab.bind(this));
      this.view.bindClickTab(this.handleClickTab.bind(this));
      this.view.bindSearchTab(this.handleSearchTab.bind(this));
      this.onTabsChanged(this.model.tabs);
  }

  onTabsChanged(tab) {
      this.view.displayTabs(tab);
  }

  handleAddTab(tabText) {
      this.model.addTab(tabText);
  }

  handleDeleteTab(id) {
      this.model.deleteTab(id);
  }
  handleClickTab(id){
    this.model.clickTab(id);
  }
  handleSearchTab(id, updatedURL) {
    this.model.editTab(id,updatedURL);
  }
}

$(document).ready(function() {
  const app = new Controller(new Model(), new View());
});
