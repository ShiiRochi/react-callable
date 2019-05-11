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
    const { arguments: callableArguments, customRoot, async, dynamicRoot, callableId, directInjection } = options;

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

        const renderCallable = (jsx, root) => {
            container = createContainer();

            render(container, root, 'native');

            render(jsx, container);
        };

        const destroyCallable = (root) => {
            destroy(null, container);

            destroy(container, root, 'native');
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

            const isArgumentsPassed = callableArguments && callableArguments.length > 0;

            let rootFromProps = null;

            if (dynamicRoot) {
                rootFromProps = isArgumentsPassed ? args[args.length - 1] : args[1];
            }

            // here we calculate final props, what will be then passed to callableComponent
            const props = isArgumentsPassed ? propsGetter(args) : args[0];

            if (!directInjection && dynamicRoot && (typeof rootFromProps === 'function' && rootFromProps() || rootFromProps)) {
                root = rootFromProps;
            }

            if (!outerRoot && !dynamicRoot && !customRoot || directInjection) {
                createOuterRoot();
            }

            if (!root) {
                // using direct injection,
                // we're rendering proxy container inside outerRoot
                root = directInjection ? outerRoot : customRoot || outerRoot;
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
                const callableComponent = <ProxyComponent {...props} root={dynamicRoot ? rootFromProps : root} conclude={conclude} />;

                renderCallable(callableComponent, root);

                return;
            }

            return new Promise((resolve, reject) => {
                const asyncConclude = (response) => conclude(resolve(response));

                try {
                    const callableComponent = <ProxyComponent {...props} root={dynamicRoot ? rootFromProps : root} conclude={asyncConclude} />;

                    renderCallable(callableComponent, root);
                } catch (e) {
                    console.error('Cannot render callable component');
                    reject(e);
                }
            });
        };
    };
};
