// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import type { CreateCallableOptions } from "../flow-types/CreateCallableOptions";

let outerRoot = null;

const render = (component, root: Node = outerRoot, engine: 'native' | 'portal' | null = null) => {
    let resultRoot = null;

    switch (typeof root) {
        case 'function':
            resultRoot = root();
            break;
        case 'string':
            resultRoot = document.querySelector(root);
            break;
        default: resultRoot = root;
    }

    switch (engine) {
        case 'portal':
            return ReactDOM.createPortal(
                component,
                resultRoot
            );
        case 'native':
            resultRoot.appendChild(component);
            break;
        default:
            ReactDOM.render(component, resultRoot);
    }
};

const destroy = (component, root, engine: 'native' | null = null) => {
    let resultRoot = null;

    switch (typeof root) {
        case 'function':
            resultRoot = root();
            break;
        case 'string':
            resultRoot = document.querySelector(root);
            break;
        default: resultRoot = root;
    }

    switch (engine) {
        case 'native':
            resultRoot.removeChild(component);
            break;
        default:
            ReactDOM.unmountComponentAtNode(resultRoot);
    }
};

// resolves passed node targeter
const nodeResolver = (nodeTargeter: string | Function | Node) => {
    switch (typeof nodeTargeter) {
        case "string":
            return document.querySelector(nodeTargeter);
        case "function":
            return nodeTargeter();
        default:
            return nodeTargeter;
    }
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

        render(createdRoot, document.body, 'native');
    }

    outerRoot = existedRoot || createdRoot;
};

export const createCallable = (options: CreateCallableOptions = {}) => {
    const { arguments: callableArguments, customRoot, async, dynamicRoot: dynamicRootEnabled, callableId, directInjection } = options;

    // in this section we will predefine all required function,
    // thus, we can create such things in SSR and call it on callable call
    return Component => {
        let ProxyComponent = !directInjection ? Component : class extends React.Component {
            state = { visible: true };

            conclude = (response) => {
                const { conclude: proxyConclude } = this.props;

                this.toggle(() => proxyConclude(response));
            }

            toggle = (callback) => {
                this.setState(prevState => ({ visible: !prevState.visible }), callback);
            };

            render () {
                const { root } = this.props;
                if (!this.state.visible) return null;

                return render(
                    <Component {...this.props} />,
                    root || customRoot || outerRoot,
                    'portal'
                );
            }
        };

        let container;

        const createContainer = () => {
            const elem = document.createElement('div');

            if (callableId && !directInjection) {
                elem.setAttribute('id', `callable-${callableId}`);
            }

            if (directInjection) {
                elem.setAttribute('id', callableId ? `callable-proxy-${callableId}` : 'callable-proxy');
            }

            return elem;
        };

        /**
         * @param jsx
         * @param containerRoot
         */
        const renderCallable = (jsx, containerRoot) => {
            container = createContainer();

            render(container, containerRoot, 'native');

            render(jsx, container);
        };

        /**
         * @param containerRoot
         */
        const destroyCallable = (containerRoot) => {
            destroy(null, container);

            destroy(container, containerRoot, 'native');
        };

        const isArgumentsPassed = Array.isArray(callableArguments) && callableArguments.length > 0;

        const propsGetter = callArgs => !isArgumentsPassed ? callArgs[0] : callableArguments.reduce((result, argName, argIndex) => {
            const prop = callArgs && callArgs[argIndex] ? callArgs[argIndex] : null;

            return {
                ...result,
                [argName]: prop
            };
        }, {});

        return (...args) => {
            let componentRoot, containerRoot;

            let dynamicRoot;

            if (dynamicRootEnabled) {
                dynamicRoot = isArgumentsPassed ? args[args.length - 1] : args[1];
            }

            const props = propsGetter(args);

            // we should create outer root if direct injection is enabled
            // if custom root is not passed
            // if dynamicRoot is enabled, but dynamic root is not present
            const shouldCreateOuterRoot = directInjection || (dynamicRootEnabled && !dynamicRoot) || !customRoot;

            if (shouldCreateOuterRoot) {
                createOuterRoot();
            }

            componentRoot = dynamicRoot || customRoot || outerRoot;

            if (directInjection) {
                containerRoot = outerRoot;
            } else {
                containerRoot = dynamicRoot || customRoot || outerRoot;
            }

            // create conclude function, that is used as a sign,
            // that callable call has been completed
            const conclude = (response) => {
                // first of all, we need to destroy callable if it is required
                destroyCallable(containerRoot);

                // if response, passed to conclude if a function,
                // we call it
                if (typeof response === 'function') {
                    response();
                }
            };

            if (!async) {
                const callableComponent = <ProxyComponent {...props} root={componentRoot} conclude={conclude} />;

                renderCallable(callableComponent, containerRoot);

                return;
            }

            const asyncCallable = new Promise((resolve, reject) => {
                const asyncConclude = (response) => conclude(resolve(response));

                try {
                    const callableComponent = <ProxyComponent {...props} root={componentRoot} conclude={asyncConclude} />;

                    renderCallable(callableComponent, containerRoot);
                } catch (e) {
                    console.error('Cannot render callable component');
                    reject(e);
                }
            });

            return asyncCallable;
        };
    };
};
