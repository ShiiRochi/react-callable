# react-callable
Callable components, that can be called from anywhere in your application.

## WARNING: Work In Progress
This respository still in `work in progress` state.

## Usage
Example:
```
import confirm from './confirm';

class App extends React.Component {
    showConfirm = () => {
        const params = { // here your params come };
        confirm({
            ...params
        });
    };
    render() {
        return (
            <div className="my-app">
                <button onClick={this.showConfirm}>show confirm</button>
            </div>
        );
    }
}
