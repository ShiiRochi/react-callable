# react-callable
Callable components, that can be called from anywhere in your application.

## WARNING: WIP
This repository still in `work in progress` state.
This repository is not production tested yet.
This repository is not fully described. (Sorry, I will finish it as soon as possible)

# Why?
Even when there is a very interested package like ```react-confirm```, I wanted to reinvent bicycle and create another interpretation of a library, allowing you, me and everybody else to create callable components.

However, the main purpose of that library is to allow the creation of any type of components, i.e. modal dialogs, messages on different sides of a screen, tooltips, popovers and so on. 
Actually, it does not mean, that react-callable will do all the stuff. It just gives some sort of help.

## Concept
When imagine what can be done, I made up 5 concepts to be reached.
1. Callable should somehow be called
2. Callable should somehow be closed
3. Callable should somehow be accessed
4. Callable should somehow be updated
5. Callable should somehow be chained

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

## P.S.

To be honest, I made this package for self-usage, but I will be proud, if someone else will find it useful.
