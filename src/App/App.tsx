import * as React from 'react';
import { WebPartProperties } from 'src/WebPartProperties';
import logo from '../logo.svg';
import styles from './App.scss';


class App extends React.Component<WebPartProperties> {
  public render() {
    return (
      <div className={styles.App}>
        <header className={styles.header}>
          <img src={logo} className={styles.logo} alt="logo" />
          <h1 className={styles.title}>Welcome to React</h1>
        </header>
        <p className={styles.intro}>
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <p>Hey, one more thig! </p>
        <p>{this.props.title}</p>
        <p>{this.props.description}</p>
      </div>); 
  }
}
export default App;
