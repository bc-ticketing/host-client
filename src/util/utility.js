import store from '../store';

function getEvent(address) {
  const es = store.state.events;
  if (es.length == 0) {
    console.log("no events found");
  } else {
    for (let i = 0; i < es.length; i++) {
      if (es[i].contractAddress == address) {
        console.log(es[i]);
        return es[i];
      }
    }
  }
}

export default getEvent;
