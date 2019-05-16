# react-callable
Callable components, that can be called from anywhere in your application.

[![Build Status](https://travis-ci.org/ShiiRochi/react-callable.png?branch=master)](https://travis-ci.org/ShiiRochi/react-callable)

[![Dependency Status](https://david-dm.org/ShiiRochi/react-callable.svg)](https://david-dm.org/ShiiRochi/react-callable)
[![devDependencies Status](https://david-dm.org/ShiiRochi/react-callable/dev-status.svg)](https://david-dm.org/ShiiRochi/react-callable?type=dev)

[![Inline docs](http://inch-ci.org/github/ShiiRochi/react-callable.svg?branch=master)](http://inch-ci.org/github/ShiiRochi/react-callable)

[![https://nodei.co/npm/react-callable.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/react-callable.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/react-callable)

# Table of Contents
1. [Why?](#why)
2. [Concept](#concept)
3. [Usage](#usage)
    - [Installation](#installation)
    - [API](#api)
4. [Examples](#examples)
    - [Async](#1---async-callable)
    - [Callbacks](#2---callbacks-callable)
    - [Dynamic Root](#3---dynamic-root)
    - [Plain callable](#4---plain-callable)

# Why?
There are already a few libs that allows you to do the same things, however...this lib proposes another approach to the matter. It is another interpretation of a library, that allows you to create callable components.

Main purpose of that library is to allow the creation of any type of components. 
In ideal, that means, that you're able to create your own callable modal dialogs, messages on different screensides, tooltips, popovers and so on. 

It does not mean, that react-callable will do all the stuff. 
It just gives some sort of help.

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

###### 1. async
Type: `boolean`  
Defines, whether callable will return promise

###### 2. arguments
Type: `Array<string>`  
If defined, then on callable call you should pass arguments in the same order as defined in your arguments property.

###### 3. callableId
Type: `number | string`  
Is used in callable container creation.

###### 4. customRoot
Type: `element | function | string`  
By default callable is rendered in outside-root, 
that is created when first createCallable is called. 
But sometimes, we would want to render it in some other place. 
To make this we can use customRoot.  
It accepts three type of data:
1. string
2. node reference
3. function

String will be used as a query selector to find dom node.  
Function will be resolved on callable call and should return dom node.  

###### 5. dynamicRoot 
Type: `boolean`  
It allows to pass reference to a target element as the very last argument into a call (at least it should be second arg, take it into account, examples below)

###### 6. directInjection
Type: `boolean`  
If passed, then callable will be rendered without any wrappers inside specified customRoot

Also you can pass no params at all into createCallable. (see [Plain callable](#4---plain-callable))

### Examples

### 1 - Async Callable:

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

### 2 - Callbacks Callable:

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

### 3 - Dynamic Root

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

### 4 - Plain callable

```javascript
import { createCallable } from "react-callable";

// create confirm with 4 arguments and enable passing root as very last argument
const confirmCreator = createCallable();

// assume that Confirm was already defined somewhere
const confirm = confirmCreator(Confirm);

// as soon as we didn't declare arguments createCallable
// callable will assume, that the very first argument of confirm call is your props 
// and will be pass as is to the component + callable special `conclude` prop for concluding itself
confirm({
    title: 'Are you sure?', 
    description: "You're going to do something?", 
    onSubmit: () => alert('Just do it!'), 
    onCancel: () => alert("It's time to stop!"), 
})
```

## TODO:
- [x] Optional callableId
- [x] Optimize roots logic
- [x] Allow to pass root in a call function
- [X] Direct node injection
- [X] React Portals Support
- [ ] Access root and container inside callable
- [ ] More examples: semantic
- [ ] Callable update
- [ ] Callable chain

## P.S.

To be honest, I made this package for self-usage, but I will be proud, if someone else will find it useful.
