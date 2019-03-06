import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/lab/Slider';

import LoadFile from '../LoadFile';
import SelectionOverlay from './SelectionOverlay';

// Load an image
// Adjust piece scale (resets collage)
// Add and remove pieces
// Rotate and position pieces
// calls update function when pieces update
export default class Selection extends React.PureComponent {
  static propTypes = {
    onUpdatePieces: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
    onUpdateSrc: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
  }

  render() {
    const { src, pieces, onUpdatePieces, onUpdateSrc, onUpdateSelected, selectionScale, onScaleChange, addPiece, placedPiecesData } = this.props;

    return (
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <div style={{ position: 'relative' }}>
            <LoadFile onLoad={onUpdateSrc} defaultImage="imgs/wood2_s.png" />
            { !!src &&
              (<div style={{ position: 'absolute', top: 0, width: '100%' }} id="selection" >
                <SelectionOverlay scale={selectionScale} pieces={pieces} onUpdatePieces={onUpdatePieces} onUpdateSelected={onUpdateSelected} addPiece={addPiece} placedPiecesData={placedPiecesData} />
              </div>)
            }
            <div style={{ marginTop: '22px' }}>
                <Slider
                  value={selectionScale}
                  aria-labelledby="selectionScale"
                  min={0.1}
                  max={1}
                  onChange={(event, value) => onScaleChange(value)}
                />
            </div>
          </div>
        </Grid>
      </Grid>
    );
  }
}
