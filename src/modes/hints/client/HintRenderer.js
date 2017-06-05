import { Component, render, h } from 'preact';
// import { findHints } from './findHints';
import { mouseEvent } from 'lib/dom';
import { horizontalPlacement, verticalPlacement } from './index';

export let showHints;
export let hideHints;
export let advanceHints;

class HintRenderer extends Component {
  constructor () {
    super();
    this.state = {
      hints: [],
      filteredHints: [],
      inputKeys: []
    };
  }
  componentDidMount () {
    showHints = (hints, hintStrings) => {
      const labeledHints = hints.map((hint, i) => Object.assign(hint, { hintString: hintStrings[i] }));
      this.setState({
        hints: labeledHints,
        filteredHints: labeledHints,
        inputKeys: ''
      });
    };
    advanceHints = (key) => {
      const hints = this.state.hints;
      const inputKeys = this.state.inputKeys + key;
      const filteredHints = this.state.hints.filter((hint) => {
        return hint.hintString.startsWith(inputKeys);
      });
      if (filteredHints.length === 1 && inputKeys === filteredHints[0].hintString) {
        return activateHint(filteredHints[0]);
      }
      this.setState({
        hints,
        filteredHints,
        inputKeys
      });
      return filteredHints.length === 0 ? 'Filtered' : 'Same';
    };
    hideHints = () => {
      this.setState({
        hints: [],
        filteredHints: [],
        inputKeys: ''
      });
    };
  }
  render () {
    return (
      <div style={{ position: 'absolute', left: '0', top: '0' }}>
        {this.state.filteredHints.map((hint) => (
          <Hint
            hintString={hint.hintString}
            rect={hint.rect}
            horizontalPlacement={horizontalPlacement}
            verticalPlacement={verticalPlacement}
            seen={this.state.inputKeys.length} />
        ))}
      </div>
    );
  }
}

function computeHintPositionStyle (rect, horizontalPlacement, verticalPlacement) {
  const style = { position: 'absolute' };
  const translate = { x: 0, y: 0 };
  switch (horizontalPlacement) {
    case 'left':
      style.left = `${window.scrollX + rect.left}px`;
      break;
    case 'right':
      style.left = `${window.scrollX + rect.left + rect.width}px`;
      translate.x = -100;
      break;
    default: // center
      style.left = `${window.scrollX + rect.left + rect.width / 2}px`;
      translate.x = -50;
  }
  switch (verticalPlacement) {
    case 'top':
      style.top = `${window.scrollY + rect.top}px`;
      break;
    case 'bottom':
      style.top = `${window.scrollY + rect.top + rect.height}px`;
      translate.y = -100;
      break;
    default: // center
      style.top = `${window.scrollY + rect.top + rect.height / 2}px`;
      translate.y = -50;
  }
  style.transform = `translate3d(${translate.x}%, ${translate.y}%, 0)`;
  return style;
}

const Hint = ({ hintString, rect, horizontalPlacement, verticalPlacement, seen }) => (
  <div
    className='saka-hint-body'
    style={computeHintPositionStyle(rect, horizontalPlacement, verticalPlacement)}>
    { hintString.split('').map((char, i) => (
      <span
        className={i >= seen
          ? 'saka-hint-normal-char'
          : 'saka-hint-active-char'}
      >
        {char}
      </span>
    ))}
  </div>
);

function activateHint (hint) {
  mouseEvent('click', hint.element);
  hint.element.focus();
  return 'Reset';
}

export function setHintStyle (hintCSS, normalCharCSS, activeCharCSS) {
  document.querySelector('#sakaHintStyle').innerText = `
.saka-hint-body {
  ${hintCSS}
}
.saka-hint-normal-char {
  ${normalCharCSS}
}
.saka-hint-active-char {
  ${activeCharCSS}
}`;
}

const hintContainer = document.createElement('div');

// Ideally, should use shadow dom, but only chrome supports it (3/2017)
// fallback is to reset styles on all child hints (see styles.js)
// if (SAKA_PLATFORM === 'chrome') {
//   const shadow = hintContainer.attachShadow({mode: 'open'});
//   shadow.innerHTML = `<style id='sakaHintStyle'>${style}</style>`;
//   render(<HintRenderer />, shadow);
// } else {
hintContainer.innerHTML = `
<style> @font-face {
  font-family: Roboto; -moz-osx-font-smoothing: grayscale; -webkit-font-smoothing: antialiased;
  font-style: normal; font-weight: normal; src: url(${chrome.runtime.getURL('Roboto-Regular.tff')}) format('tff');}
</style>
<style id='sakaHintStyle'></style>`;
document.documentElement.appendChild(hintContainer);
render(<HintRenderer />, hintContainer);
// }
