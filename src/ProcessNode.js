import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import p5 from 'p5';
import 'p5/lib/addons/p5.dom';

export default class ProcessNode extends React.PureComponent {
  static propTypes = {
    inputs: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onFinished: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
  }

  componentDidMount = () => {
    const node = ReactDOM.findDOMNode(this);
    let sketch = p => {
      p.setup = () => this.setup(p);
      p.draw = () => this.draw(p);
    };
    this.sketch = new p5(sketch, node);
  }

  setup = p => {
    p.createCanvas();
    p.noLoop();

    const { nextKey, inputs } = this.props;
    const { palette } = inputs;
    document.body.addEventListener('keydown', e => {
      this.draw(p);
    });
  }

  setupHook = p => {}

  draw = p => {
    const { inputs, onFinished } = this.props;
    const { input } = inputs;
    p.background(0);
    const result = p.get();
    onFinished(result);
  }

  updateSize = (p, w, h) => {
    const node = ReactDOM.findDOMNode(this);
    const ratio = h /  w;
    const rw = node.offsetWidth;
    const rh = node.offsetWidth * ratio;

    this.scale = rw / w;

    if (p.width !== rw || p.height !== rh) {
      p.resizeCanvas(rw, rh);
    }
  }

  setAbsoluteSize = (p, w, h) => {
    if (p.width !== w || p.height !== h) {
      p.resizeCanvas(w, h);
    }
  }

  getScale = () => {
    return this.scale || 1;
  }

  render() {
    return (
      <div></div>
    );
  }
}
