import React from 'react';
import ReactDOM from 'react-dom';
import GameWindow from './components/game-window';
import 'normalize.css/normalize.css'; // reset all browser conventions
import './styles/styles.scss';

ReactDOM.render(<GameWindow />, document.getElementById('app'));