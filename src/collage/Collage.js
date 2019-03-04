import React from 'react';

import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/lab/Slider';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import LoadFile from './LoadFile';
import Overlay from './Overlay';

export default class Collage extends React.PureComponent {
  // pieces={pieces}
  // processedPieces={processedPieces}
  // src={src}
  state = {
    target: null,
    isRender: false
  };

  render() {
    console.log('selection collage');
    const { target, isRender } = this.state;
    const { pieces, processedPieces, placedPieces, onPiecePlacedUpdate, onSelectPiece, scale, updatePieceScale, savedPiecesData } = this.props;

    let style = {};
    if (isRender) {
      style = { visibility: 'hidden' };
    }

    return (
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <div style={{ position: 'relative' }}>
            <div style={style}>
              <LoadFile onLoad={target => this.setState({ target })} defaultImage="imgs/sketch4.png" />
            </div>
            { !!target &&
              (<div id="render" style={{ position: 'absolute', top: 0 }}>
                <Overlay
                  pieces={pieces}
                  processedPieces={processedPieces}
                  placedPieces={placedPieces}
                  onPiecePlacedUpdate={onPiecePlacedUpdate}
                  onSelectPiece={onSelectPiece}
                  savedPiecesData={savedPiecesData}
                  scale={scale}
                  isRender={isRender}
                />
              </div>)
            }
          </div>
          <div style={{ padding: '22px', marginTop: '22px' }}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Switch
                    checked={isRender}
                    onChange={() => this.setState({ isRender: !isRender })}
                    value="isRender"
                    color="primary"
                  />
                }
                label="Render"
              />
            </FormGroup>
            <div style={{ marginTop: '22px' }}>
                <Slider
                  value={scale}
                  aria-labelledby="scale"
                  min={2}
                  max={50}
                  onChange={(event, value) => updatePieceScale(value)}
                />
            </div>
          </div>
        </Grid>
      </Grid>
    );
  }
}
