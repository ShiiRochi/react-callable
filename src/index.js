// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import type { CreateCallableOptions } from "../flow-types/CreateCallableOptions";

let outerRoot = null;

const render = (component, root = outerRoot, native = false) => {
    const resultRoot = typeof root === "function" ? root() : root;

    if (!native) {
        ReactDOM.render(component, resultRoot);
        return;
    }

    resultRoot.appendChild(component);
};

const destroy = (component, root, native = false) => {
    const resultRoot = typeof root === "function" ? root() : root;

    if (!native) {
        ReactDOM.unmountComponentAtNode(resultRoot);
        return;
    }

    resultRoot.removeChild(component);
};

/**
 * creates global root for callable
 * first of all we're trying to find already created root
 */
const createOuterRoot = () => {
    const existedRoot = document.querySelector('body > #outer-root');

    const createdRoot = !existedRoot ? document.createElement('div') : null;

    if (createdRoot) {
        createdRoot.setAttribute('id', 'outer-root');

        render(createdRoot, document.body, true);
    }

    outerRoot = existedRoot || createdRoot;
};

export const createCallable = (options: CreateCallableOptions = {}) => {
    const { arguments: callableArguments, customRoot, async, dynamicRoot, callableId } = options;

    // in this section we will predefine all required function,
    // thus, we can create such things in SSR and call it on callable call
    return Component => {
        let container;

        const createContainer = () => {
            const elem = document.createElement('div');

            if (callableId) {
                elem.setAttribute('id', `callable-${callableId}`);
            }

            return elem;
        };

        const renderCallable = (jsx, root) => {
            container = createContainer();

            render(container, root, true);

            render(jsx, container);
        };

        const destroyCallable = (root) => {
            destroy(null, container);

            destroy(container, root, true);
        };

        const propsGetter = (props) => !callableArguments ? props : callableArguments.reduce((result, argName, argIndex) => {
            const prop = props && props[argIndex] ? props[argIndex] : null;

            return {
                ...result,
                [argName]: prop
            };
        }, {});

        return (...args) => {
            let root;

            const isArgumentsPassed = arguments && arguments.length > 0;

            let rootFromProps = null;

            if (dynamicRoot) {
                rootFromProps = isArgumentsPassed ? args[args.length - 1] : args[1];
            }

            // here we calculate final props, what will be then passed to callableComponent
            const props = isArgumentsPassed ? propsGetter(args) : args[0];

            if (dynamicRoot && (typeof rootFromProps === 'function' && rootFromProps()) || rootFromProps) {
                root = rootFromProps;
            }

            if (!outerRoot && !dynamicRoot && !customRoot) {
                createOuterRoot();
            }

            if (!root) {
                root = customRoot || outerRoot;
            }


            // create conclude function, that is used as a sign,
            // that callable call has been completed
            const conclude = (response) => {
                // first of all, we need to destroy callable if it is required
                destroyCallable(root);

                // if response, passed to conclude if a function,
                // we call it
                if (typeof response === 'function') {
                    response();
                }
            };

            if (!async) {
                const callableComponent = <Component {...props} conclude={conclude} />;

                renderCallable(callableComponent, root);

                return;
            }

            return new Promise((resolve, reject) => {
                const asyncConclude = (response) => conclude(resolve(response));

                try {
                    const callableComponent = <Component {...props} conclude={asyncConclude} />;

                    renderCallable(callableComponent, root);
                } catch (e) {
                    console.error('Cannot render callable component');
                    reject(e);
                }
            });
        };
    };
};
