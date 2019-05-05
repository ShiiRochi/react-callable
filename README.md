# react-callable
Callable components, that can be called from anywhere in your application.

## WARNING: WIP
This repository still in `work in progress` state.
This repository is not production tested yet.
This repository is not fully described. (Sorry, I will finish it as soon as possible)

# Why?
Even when there is a very interesting package like ```react-confirm```, I wanted to reinvent bicycle and create another interpretation of a library, allowing you, me and everybody else to create callable components.

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

### Installation

```bash
npm i --save react-callable
```
or
```bash
yarn add react-callable
```

### API

##### createCallable
```javascript
import { createCallable } from 'react-callable';
```
Function that accepts an object of settings with following structure:
1. async [boolean]  
Defines, whether callable will return promise
2. arguments [Array\<string>]  
If defined, then on callable call you should pass arguments in the same order as defined in your arguments property.
3. callableId [number]  
Is used in callable container creation.
4. customRoot [element or function]  
By default callable is rendered in outside-root, that is created when first createCallable is called. But sometimes, we would want to render it in some other place. To make this we can use customRoot. It should be any DOM element reference. If passed, then callable will be rendered in customRoot.  
`customRoot` can also be a function, that will be resolved when callable is called.
It should return reference to a DOM element.
5. dynamicRoot [boolean]  
`dynamicRoot` is a special mechanism, 
that allows you to pass reference to a target element as the very last argument into a call (at least it should be second arg, take it into account, examples below)

### Examples

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

Now I will try to show only main differences. Sorry, but code takes a lot of space.

### Example 3 - Dynamic Root

```javascript
import { createCallable } from "react-callable";

// create confirm with 4 arguments and enable passing root as very last argument
const confirmCreator = createCallable({ 
    arguments: [
        'title', 
        'description', 
        'onSubmit', 
        'onCancel'
    ], 
    dynamicRoot: true 
});

// assume that Confirm was already defined somewhere
const confirm = confirmCreator(Confirm);

// because we turned on dynamicRoot, 
// confirm will look for the very last argument, 
// i.e. argument, that is be placed after all arguments, 
// described in createCallable function
confirm(
    'Are you sure?', 
    "You're going to do something?", 
    () => alert('Just do it!'), 
    () => alert("It's time to stop!"), 
    document.querySelector('body > .custom-container')
)
```

## TODO:
- [x] Optional callableId
- [x] Optimize roots logic
- [x] Allow to pass root in a call function
- [ ] Direct node injection (no wrappers for callable, hope I will do it, first draft is ready)
- [ ] React Portals Support
- [ ] More examples: semantic
- [ ] Callable chain (not very soon, but want so much to do it)

## P.S.

To be honest, I made this package for self-usage, but I will be proud, if someone else will find it useful.
