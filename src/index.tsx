import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WebPartProperties } from './WebPartProperties';
import App from './App/App';
import registerServiceWorker from './registerServiceWorker';



const addAttribute = (name: string, parentElement: HTMLElement): void => {
  const attrVal = parentElement.getAttribute(name);
  if (attrVal) webpartIdColl.push(attrVal);
}

const webpartIdColl: string[] = [];
let divElement: HTMLElement;

let scriptElement = (document.currentScript as HTMLScriptElement);
if (!scriptElement) {
  const scripts = document.getElementsByTagName('script');
  scriptElement = scripts[scripts.length - 1];
}

const loadWebPartProps = () => {
  const props = new WebPartProperties();
  Object.entries(props).forEach((x) => {
    props[x[0]] = scriptElement.getAttribute(x[0]);
  });
  return props;
}

divElement = scriptElement.parentElement as HTMLElement;
if (divElement) {
  const webpartElement = divElement.parentElement;
  if (webpartElement) {
    addAttribute('webpartid', webpartElement);
    addAttribute('webpartid2', webpartElement);
  }
 
  const props = loadWebPartProps() as WebPartProperties;

  ReactDOM.render(
    <App {...props} />,
    divElement
  );
  registerServiceWorker();
}

