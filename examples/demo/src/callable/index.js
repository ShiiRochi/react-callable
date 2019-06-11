"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCallable = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var outerRoot = null;

var _render = function render(component) {
  var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : outerRoot;
  var engine = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var resultRoot = null;

  switch (_typeof(root)) {
    case 'function':
      resultRoot = root();
      break;

    case 'string':
      resultRoot = document.querySelector(root);
      break;

    default:
      resultRoot = root;
  }

  switch (engine) {
    case 'portal':
      return _reactDom["default"].createPortal(component, resultRoot);

    case 'native':
      resultRoot.appendChild(component);
      break;

    default:
      _reactDom["default"].render(component, resultRoot);

  }
};

var destroy = function destroy(component, root) {
  var engine = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var resultRoot = null;

  switch (_typeof(root)) {
    case 'function':
      resultRoot = root();
      break;

    case 'string':
      resultRoot = document.querySelector(root);
      break;

    default:
      resultRoot = root;
  }

  switch (engine) {
    case 'native':
      resultRoot.removeChild(component);
      break;

    default:
      _reactDom["default"].unmountComponentAtNode(resultRoot);

  }
}; // resolves passed node targeter


var nodeResolver = function nodeResolver(nodeTargeter) {
  switch (_typeof(nodeTargeter)) {
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


var createOuterRoot = function createOuterRoot() {
  var existedRoot = document.querySelector('body > #outer-root');
  var createdRoot = !existedRoot ? document.createElement('div') : null;

  if (createdRoot) {
    createdRoot.setAttribute('id', 'outer-root');

    _render(createdRoot, document.body, 'native');
  }

  outerRoot = existedRoot || createdRoot;
};

var createCallable = function createCallable() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var callableArguments = options.arguments,
      customRoot = options.customRoot,
      async = options.async,
      dynamicRootEnabled = options.dynamicRoot,
      callableId = options.callableId,
      directInjection = options.directInjection; // in this section we will predefine all required function,
  // thus, we can create such things in SSR and call it on callable call

  return function (Component) {
    var _temp;

    var ProxyComponent = !directInjection ? Component : (_temp =
    /*#__PURE__*/
    function (_React$Component) {
      _inherits(_temp, _React$Component);

      function _temp() {
        var _getPrototypeOf2;

        var _this;

        _classCallCheck(this, _temp);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(_temp)).call.apply(_getPrototypeOf2, [this].concat(args)));

        _defineProperty(_assertThisInitialized(_this), "state", {
          visible: true
        });

        _defineProperty(_assertThisInitialized(_this), "conclude", function (response) {
          var proxyConclude = _this.props.conclude;

          _this.toggle(function () {
            return proxyConclude(response);
          });
        });

        _defineProperty(_assertThisInitialized(_this), "toggle", function (callback) {
          _this.setState(function (prevState) {
            return {
              visible: !prevState.visible
            };
          }, callback);
        });

        return _this;
      }

      _createClass(_temp, [{
        key: "render",
        value: function render() {
          var root = this.props.root;
          if (!this.state.visible) return null;
          return _render(_react["default"].createElement(Component, this.props), root || customRoot || outerRoot, 'portal');
        }
      }]);

      return _temp;
    }(_react["default"].Component), _temp);
    var container;

    var createContainer = function createContainer() {
      var elem = document.createElement('div');

      if (callableId && !directInjection) {
        elem.setAttribute('id', "callable-".concat(callableId));
      }

      if (directInjection) {
        elem.setAttribute('id', callableId ? "callable-proxy-".concat(callableId) : 'callable-proxy');
      }

      return elem;
    };
    /**
     * @param jsx
     * @param containerRoot
     */


    var renderCallable = function renderCallable(jsx, containerRoot) {
      container = createContainer();

      _render(container, containerRoot, 'native');

      _render(jsx, container);
    };
    /**
     * @param containerRoot
     */


    var destroyCallable = function destroyCallable(containerRoot) {
      destroy(null, container);
      destroy(container, containerRoot, 'native');
    };

    var isArgumentsPassed = Array.isArray(callableArguments) && callableArguments.length > 0;

    var propsGetter = function propsGetter(callArgs) {
      return !isArgumentsPassed ? callArgs[0] : callableArguments.reduce(function (result, argName, argIndex) {
        var prop = callArgs && callArgs[argIndex] ? callArgs[argIndex] : null;
        return _objectSpread({}, result, _defineProperty({}, argName, prop));
      }, {});
    };

    return function () {
      var componentRoot, containerRoot;
      var dynamicRoot;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      if (dynamicRootEnabled) {
        dynamicRoot = isArgumentsPassed ? args[args.length - 1] : args[1];
      }

      var props = propsGetter(args); // we should create outer root if direct injection is enabled
      // if custom root is not passed
      // if dynamicRoot is enabled, but dynamic root is not present

      var shouldCreateOuterRoot = directInjection || dynamicRootEnabled && !dynamicRoot || !customRoot;

      if (shouldCreateOuterRoot) {
        createOuterRoot();
      }

      componentRoot = dynamicRoot || customRoot || outerRoot;

      if (directInjection) {
        containerRoot = outerRoot;
      } else {
        containerRoot = dynamicRoot || customRoot || outerRoot;
      } // create conclude function, that is used as a sign,
      // that callable call has been completed


      var conclude = function conclude(response) {
        // first of all, we need to destroy callable if it is required
        destroyCallable(containerRoot); // if response, passed to conclude if a function,
        // we call it

        if (typeof response === 'function') {
          response();
        }
      };

      if (!async) {
        var callableComponent = _react["default"].createElement(ProxyComponent, _extends({}, props, {
          root: componentRoot,
          conclude: conclude
        }));

        renderCallable(callableComponent, containerRoot);
        return;
      }

      var asyncCallable = new Promise(function (resolve, reject) {
        var asyncConclude = function asyncConclude(response) {
          return conclude(resolve(response));
        };

        try {
          var _callableComponent = _react["default"].createElement(ProxyComponent, _extends({}, props, {
            root: componentRoot,
            conclude: asyncConclude
          }));

          renderCallable(_callableComponent, containerRoot);
        } catch (e) {
          console.error('Cannot render callable component');
          reject(e);
        }
      });
      return asyncCallable;
    };
  };
};

exports.createCallable = createCallable;