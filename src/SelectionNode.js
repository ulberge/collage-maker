import React from 'react';
import ReactDOM from "react-dom";

import { fabric } from 'fabric';

export default class SourceNode extends React.PureComponent {

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);

    const container = node.parentNode.parentElement;
    const w = container.clientWidth;
    const h = container.clientHeight;
    debugger;

    const canvas = new fabric.Canvas(node);


    // canvas should be same ratio

    const triangle = new fabric.Triangle({
      width: 100, height: 100, left: 50, top: 50, stroke: '#333', strokeWidth: 1, fill: ''
    });

    canvas.on({
      'object:moving': onChange,
      'object:rotating': onChange,
    });

    function onChange(options) {
      canvas.forEachObject(function(obj) {
      });
    }

    canvas.add(triangle);
  }

  render() {
    return (
      <canvas width="300" height="300"></canvas>
    );
  }
}
