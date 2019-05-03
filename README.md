# react-callable
Callable components, that can be called from anywhere in your application.

## WARNING: Work In Progress
This respository still in `work in progress` state.

## Usage:

### Example 1 - Async:

##### Confirm/index.js
```javascript
import { createCallable } from "react-callable";

const confirmCreator = createCallable({ async: true, arguments: ['title', 'description', 'submitStatus', 'cancelStatus'], callableId: 1 });

const Confirm = ({ title, description, submitStatus, cancelStatus, conclude }) => {
  return (
    <div className={styles.confirmWrapper}>
      <div className={styles.confirmBackdrop} onClick={() => { conclude(cancelStatus); }} />
      <div className={styles.confirm}>
        <div className="header">
          <h1>
            {title}
          </h1>
        </div>
        <div className="content">
          <p>
            {description}
          </p>
        </div>
        <div className="actions">
          <div className="btn-group" style={{ float: 'right' }}>
            <button className="btn" onClick={() => conclude(submitStatus)}>Submit</button>
            <button className="btn" onClick={() => conclude(cancelStatus)}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const confirm = confirmCreator(Confirm);

export default confirm;
```

##### App.js

```javascript
import React, {Component} from 'react';
import confirm from './components/Confirm';
import classNames from './styles.module.scss';

class App extends Component {

  openConfirm = () => {
    confirm('Hello World', 'Called by React Callable', 'submitted', 'cancelled').then((response) => alert(`confirm is ${response}`));
  };

  render() {
    return (
      <div className={classNames.app}>
        <button className="btn large" onClick={this.openConfirm}>
          Confirm me
        </button>
      </div>
    );
  }
}

export default App;
```

### Example 2 - Callbacks:

##### Confirm/index.js
```javascript
import { createCallable } from "react-callable";

const confirmCreator = createCallable({ async: true, arguments: ['title', 'description', 'onSubmit', 'onCancel'], callableId: 1 });

const Confirm = ({ title, description, onSubmit, onCancel, conclude }) => {
  return (
    <div className={styles.confirmWrapper}>
      <div className={styles.confirmBackdrop} onClick={() => { onCancel(); conclude(); }} />
      <div className={styles.confirm}>
        <div className="header">
          <h1>
            {title}
          </h1>
        </div>
        <div className="content">
          <p>
            {description}
          </p>
        </div>
        <div className="actions">
          <div className="btn-group" style={{ float: 'right' }}>
            <button className="btn" onClick={() => {onSubmit(); conclude();}}>Submit</button>
            <button className="btn" onClick={() => {onCancel(); conclude();}}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const confirm = confirmCreator(Confirm);

export default confirm;
```

##### App.js

```javascript
import React, {Component} from 'react';
import confirm from './components/Confirm';
import classNames from './styles.module.scss';

class App extends Component {

  openConfirm = () => {
    confirm('Hello World', 'Called by React Callable', () => console.log('Harry'), () => console.log('Volan'));
  };

  render() {
    return (
      <div className={classNames.app}>
        <button className="btn large" onClick={this.openConfirm}>
          Confirm me
        </button>
      </div>
    );
  }
}

export default App;
```
