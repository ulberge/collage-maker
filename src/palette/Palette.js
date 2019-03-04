import React from 'react';

import Grid from '@material-ui/core/Grid';

import PaletteItem from './PaletteItem';

export default class Palette extends React.PureComponent {

  render() {
    console.log('Palette render');
    const { pieces, src, onPieceReady, processedPieces, placedPieces, togglePiece, selectionScale } = this.props;

    const processEls = pieces.map(piece => <Grid key={'process' + piece.id} item xs={4}><PaletteItem piece={piece} src={src} onPieceReady={onPieceReady} selectionScale={selectionScale} /></Grid>);

    const reverse = pieces.slice();
    reverse.reverse();
    const displayEls = reverse.map(piece => {
      if (!processedPieces || !processedPieces[piece.id] || ! processedPieces[piece.id].dataURL) {
        return null;
      }
      const isAdded = placedPieces.includes(piece.id);
      const style = {
        width: '100%',
        boxShadow: 'none',
        padding: '2px'
      };
      if (piece.selected) {
        style.border = '1px solid rgba(0,0,0,0.75)';
      }
      if (isAdded) {
        style.boxShadow = '1px 1px 11px -4px rgba(0,0,0,0.75)';
      }
      return (<Grid key={'display' + piece.id} item xs={4}><img onClick={() => togglePiece(piece.id)} style={style} src={processedPieces[piece.id].dataURL} alt="piece"/></Grid>)
    });

    return (
      <Grid container spacing={16}>
        {displayEls}
        <div style={{ position: 'absolute', left: '-10000px'}} >
          {processEls}
        </div>
      </Grid>
    );
  }
}
