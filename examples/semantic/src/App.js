import React, { useEffect, Fragment, Component } from 'react';
import { createCallable } from "./callable";

const modal = createCallable({ dynamicRoot: true, directInjection: true })(props => {

  useEffect(() => {
    if (props.root) {
      props.root.classList.add('active');
    }

    return () => props.root ? props.root.classList.remove('active') : null;
  }, []);

  return (
      <Fragment>
        <div onClick={props.conclude} style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }} />
        <div className="ui visible active modal">
          <div className="header">Header</div>
          <div className="content">
            <p></p>
            <p></p>
            <p></p>
          </div>
        </div>
      </Fragment>
  );
});

class App extends Component {
    dimmerRef = null;

    componentDidMount () {
        this.dimmerRef = document.querySelector('body > #modals-container');
    }

    render () {
        return (
            <div className="ui page fluid container">
                <div className="ui padded middle aligned grid">
                    <div className="ui green middle aligned column">
                        <button onClick={() => modal({ container: this.dimmerRef }, this.dimmerRef)} className="ui primary button">open</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
