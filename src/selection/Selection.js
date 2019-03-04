import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/lab/Slider';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import LoadFile from './LoadFile';
import Overlay from './Overlay';

// Load an image
// Adjust piece scale (resets collage)
// Add and remove pieces
// Rotate and position pieces
// calls update function when pieces update
export default class Selection extends React.PureComponent {
  // pieces={pieces}
  // src={src}
  // onUpdatePieces={pieces => this.setState({ pieces })}
  // onUpdateSrc={src => this.setState({ src })}
  // onUpdateSelected={selected => this.setState({ selected })}
  static propTypes = {
    onUpdatePieces: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
    onUpdateSrc: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
  }

  render() {
    const { src, pieces, onUpdatePieces, onUpdateSrc, onUpdateSelected, selectionScale, onScaleChange, addPiece, placedPiecesData } = this.props;

    console.log('selection render');

    return (
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <div style={{ position: 'relative' }}>
            <LoadFile onLoad={onUpdateSrc} defaultImage="imgs/wood2_s.png" />
            { !!src &&
              (<div style={{ position: 'absolute', top: 0 }}>
                <Overlay scale={selectionScale} pieces={pieces} onUpdatePieces={onUpdatePieces} onUpdateSelected={onUpdateSelected} addPiece={addPiece} placedPiecesData={placedPiecesData} />
              </div>)
            }
            <div style={{ marginTop: '22px' }}>
                <Slider
                  value={selectionScale}
                  aria-labelledby="selectionScale"
                  min={2}
                  max={200}
                  onChange={(event, value) => onScaleChange(value)}
                />
            </div>
          </div>
        </Grid>
      </Grid>
    );
  }
}
