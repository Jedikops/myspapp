import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WebPartProperties } from 'src/WebPartProperties';
import App from './App';


it('renders without crashing', () => {
  const props: WebPartProperties = { title: 'test', description: 'desc' };
  const div = document.createElement('div');
  ReactDOM.render(<App {...props} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
