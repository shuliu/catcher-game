/*eslint no-unused-vars: 0*/
/*eslint ignore: TimelineMax*/

import { Catcher as CatcherGame } from './Catcher.js';

document.addEventListener("DOMContentLoaded", () => {

  let myCatcher = new CatcherGame({
    container: '#gameBox',
    elements: {
      basket: '#catcher',
      gift: '.gift',
      scoreBoard: '#score-board',
      boom: '.BoomAnimate',
    },
    total: 20000,
    billList: [1000, 800, 600, 400, 200],
  });

});