/*eslint no-unused-vars: 0*/
/*eslint ignore: TimelineMax*/

import { Catcher as CatcherGame } from './Catcher.js';
let myCatcher = new CatcherGame({
  container: '#gameBox',
  elements: {
    basket: '#catcher',
    gift: '.gift',
    scoreBoard: '#score-board',
  }
});

