import React from 'react';
import ReactDOM from 'react-dom';
import type {CallableContainerCreatorArguments} from "./flow-types/CallableContainerCreatorArguments";

// Example 1:
// const Component1 = ({ title, description, onSuccess, onFail }) => <div />
// const callable1 = createCallable({
//    argumentsList: ['title', 'description', 'onSuccess', 'onFail'],
//    callableId: '12'
// })(Component1);

// callable1('John', 'Doe', () => {}, () => {});

let outerRoot = null;

const render = (component, root = outerRoot, native = false) => {
  if (!native) {
    ReactDOM.render(component, root)
    return;
  }

  root.appendChild(component);
};

const destroy = (component, root, native = false) => {
  if (!native) {
    ReactDOM.unmountComponentAtNode(root)
    return;
  };

  root.removeChild(component);
};

/**
 * creates root for callables
 */
const createRoot = () => {
  const el = document.createElement('div');

  el.setAttribute('id', 'outer-root');

  render(el, document.body, true);

  outerRoot = el;
};

const createCallableContainer = ({ customRoot, callableId }: CallableContainerCreatorArguments = {}) => {
  const container = document.createElement('div');

  container.setAttribute('id', `callable-${callableId}`)

  const destroyCallableContainer = !customRoot
    ? () => destroy(container, outerRoot)
    : () => destroy(container, customRoot);

  const renderCallableContainer = !customRoot
    ? () => render(container, outerRoot)
    : () => render(container, customRoot);

  return { container, renderCallableContainer, destroyCallableContainer, root: !customRoot ? outerRoot : customRoot };
};

type CreateCallableOptions = {|
  customRoot: Node,
  arguments: Array<string>,
  callableId: string | number,
  async: boolean
|};

export const createCallable = (options: CreateCallableOptions = {}) => {
  if (!outerRoot) {
    createRoot();
  }

  const { arguments: callableArguments, callableId, customRoot, async } = options;

  const {
    container,
    renderCallableContainer,
    destroyCallableContainer,
  } = createCallableContainer({ callableId, customRoot });

  return Component => {

    const renderCallable = jsx => {
      renderCallableContainer();

      render(jsx, container)
    };

    const destroyCallable = () => {
      destroy(null, container);

      destroyCallableContainer();
    };

    const propsGetter = (props) => callableArguments.reduce((result, argName, argIndex) => {
      const prop = props && props[argIndex] ? props[argIndex] : null;

      return {
        ...result,
        [argName]: prop,
      };
    }, {});

    return (...args) => {

      const conclude = (response) => {
        destroyCallable();

        if (typeof response === 'function') {
          response();
        }
      };

      const props = arguments && arguments.length > 0 ? propsGetter(args) : args[0];


      if (!async) {
        const callableComponent = <Component {...props} conclude={conclude} />;

        renderCallable(callableComponent);

        return;
      }

      return new Promise((resolve, reject) => {

        const asyncConclude = (response) => conclude(resolve(response);

        try {
          const callableComponent = <Component {...props} conclude={asyncConclude} />;

          renderCallable(callableComponent);
        } catch (e) {
          console.error('Cannot render callable component');
          reject(e);
        }
      })

    };
  }
};


const callable1 = createCallable({ callableId:'super-modal-1', arguments:['title', 'description', 'onClick'] });