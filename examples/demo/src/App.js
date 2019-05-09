import React, {Component} from 'react';
import asyncConfirm from './components/Confirms/AsyncConfirm';
import directConfirm from './components/Confirms/DirectInjectionConfirm';
import plainConfirm from './components/Confirms/NoSettingsConfirm';
import confirm from './components/Confirms/Confirm';

class App extends Component {

  openConfirm = (type = null) => {
    switch (type) {
      case 'async':
        asyncConfirm('Hello World', 'Called by React Callable', 'submitted', 'cancelled').then((response) => alert(response));
        break;
      case 'directInjection':
        directConfirm('Hello World', 'Called by React Callable', () => alert('submitted'), () => alert('cancelled'));
        break;
      case 'plain':
        plainConfirm({
          title: 'Hello World',
          description: 'Called by React Callable',
          submitStatus: () => alert('submitted'),
          cancelStatus: () => alert('cancelled')
        });
        break;
      default:
        confirm('Hello World', 'Called by React Callable', () => alert('submitted'), () => alert('cancelled'));
    }
  };

  render() {
    return (
      <div className="app">
        <div className="flex column equal" style={{ flex: 1, width: '100%' }}>
          <div className="flex row align evenly">
            <div className="flex column align center align items center">
              <button className="btn large" onClick={() => this.openConfirm('async')}>
                Confirm me with async
              </button>
            </div>
            <div className="flex column align center align items center">
              <button className="btn large" onClick={() => this.openConfirm('plain')}>
                Confirm me in plain
              </button>
            </div>
          </div>
          <div className="flex row align center">
            <div className="flex column align center align items center">
              <button className="btn large" onClick={() => this.openConfirm('directInjection')}>
                Confirm me with direct injection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
