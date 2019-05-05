// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import type { CreateCallableOptions } from "../flow-types/CreateCallableOptions";

let outerRoot = null;

const render = (component, root = outerRoot, native = false) => {
    // thus we allow to pass functions as customRoot,
    // thus on server may be no errors
    // TODO: test for SSR-ready
    const resultRoot = typeof root === "function" ? root() : root;

    if (!native) {
        ReactDOM.render(component, resultRoot);
        return;
    }

    resultRoot.appendChild(component);
};

const destroy = (component, root, native = false) => {
    // thus we allow to pass functions as customRoot,
    // thus on server may be no errors
    // TODO: test for SSR-ready
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

    if (createdRoot) createdRoot.setAttribute('id', 'outer-root');

    outerRoot = existedRoot || render(createdRoot, document.body, true);
};

const processCallableContainerOptions = ({ customRoot, callableId, dynamicRoot }: CreateCallableOptions = {}) => {
    const container = document.createElement('div');

    if (callableId) {
        container.setAttribute('id', `callable-${callableId}`);
    }

    const destroyCallableContainer = !customRoot ?
        (root) => destroy(container, dynamicRoot ? root || outerRoot : outerRoot, true) :
        (root) => destroy(container, dynamicRoot ? root || customRoot : customRoot, true);

    const renderCallableContainer = !customRoot ?
        (root) => render(container, dynamicRoot ? root || outerRoot : outerRoot, true) :
        (root) => render(container, dynamicRoot ? root || customRoot : customRoot, true);

    return { container, renderCallableContainer, destroyCallableContainer, root: !customRoot ? outerRoot : customRoot };
};

export const createCallable = (options: CreateCallableOptions = {}) => {
    const { arguments: callableArguments, customRoot, async, dynamicRoot } = options;

    const {
        container,
        renderCallableContainer,
        destroyCallableContainer
    } = processCallableContainerOptions(options);

    return Component => {
        const renderCallable = (jsx, forcedRoot) => {
            renderCallableContainer(forcedRoot);

            render(jsx, container);
        };

        const destroyCallable = (forcedRoot) => {
            destroy(null, container);

            destroyCallableContainer(forcedRoot);
        };

        const propsGetter = (props) => !callableArguments ? props : callableArguments.reduce((result, argName, argIndex) => {
            const prop = props && props[argIndex] ? props[argIndex] : null;

            return {
                ...result,
                [argName]: prop
            };
        }, {});

        return (...args) => {
            // check if customRoot is not passed
            // check if outerRoot is not created
            if (!customRoot && !outerRoot && !dynamicRoot) {
                createOuterRoot();
            }

            // shouldCreateContainer
            // if (shouldCreateContainer) {
            //   renderCallableContainer();
            // }

            // create conclude function, that is used as a sign,
            // that callable call has been completed
            const conclude = (response) => {
                // first of all, we need to destroy callable if it is required
                destroyCallable();

                // if response, passed to conclude if a function,
                // we call it
                if (typeof response === 'function') {
                    response();
                }
            };

            // here we calculate final props, what will be then passed to callableComponent
            const usePropsGetter = arguments && arguments.length > 0;
            const props = usePropsGetter ? propsGetter(args) : args[0];

            const passedRoot = usePropsGetter ? args[args.length - 1] : args[1];


            if (!async) {
                const callableComponent = <Component {...props} conclude={conclude} />;

                renderCallable(callableComponent, passedRoot);

                return;
            }

            return new Promise((resolve, reject) => {
                const asyncConclude = (response) => conclude(resolve(response));

                try {
                    const callableComponent = <Component {...props} conclude={asyncConclude} />;

                    renderCallable(callableComponent, passedRoot);
                } catch (e) {
                    console.error('Cannot render callable component');
                    reject(e);
                }
            });
        };
    };
};
