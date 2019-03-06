import React from 'react';

import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/lab/Slider';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import LoadFile from '../LoadFile';
import CollageOverlay from './CollageOverlay';

export default class Collage extends React.PureComponent {
  state = {
    target: null,
    isRender: false
  };

  render() {
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
              <LoadFile onLoad={target => this.setState({ target })} defaultImage="imgs/sketch1.png" />
            </div>
            { !!target &&
              (<div id="render" style={{ position: 'absolute', top: 0, width: '100%' }}>
                <CollageOverlay
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
          <div style={{ padding: '22px' }}>
            <Grid container spacing={8}>
              <Grid item xs={2}>
                <Switch
                  checked={isRender}
                  onChange={() => this.setState({ isRender: !isRender })}
                  value="isRender"
                  color="primary"
                />
              </Grid>
              <Grid item xs={10}>
                <div style={{ marginTop: '22px', width: '100%' }}>
                  <Slider
                      value={scale}
                      aria-labelledby="scale"
                      min={0.003}
                      max={0.05}
                      onChange={(event, value) => updatePieceScale(value)}
                    />
                </div>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    );
  }
}
