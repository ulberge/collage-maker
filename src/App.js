import React, { Component } from 'react';
import './App.css';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';

import Selection from './selection/Selection';
import Palette from './palette/Palette';
import Collage from './collage/Collage';

window.PIECE_ID = 0;

class App extends Component {

  state = {
    src: null,
    pieces: [], // Created by selection
    processedPieces: {}, // Created by palette
    placedPieces: [], // Created by collage
    placedPiecesData: {}, //
    selectionScale: 0.25,
    pieceScale: 0.025,
    savedPiecesData: null
  };

  componentDidMount() {
    this.load();

    document.body.addEventListener('keydown', e => {
      if (e.key === 's') {
        const image = document.querySelector('#selection .lower-canvas').toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.

        window.location.href = image; // it will save locally

        setTimeout(() => {
          const render = document.querySelector('#render .lower-canvas').toDataURL("image/png").replace("image/png", "image/octet-stream");
          window.location.href = render; // it will save locally
          window.prompt("Copy to clipboard: Ctrl+C, Enter", localStorage.getItem('collageMakerState'));
        }, 1);
      }
    });
  }

  componentDidUpdate() {
    // save to localStorage
    this.save();
  }

  onUpdatePieces = pieces => {
    const { processedPieces } = this.state;
    pieces.forEach(piece => {
      if (piece.dirty) {
        processedPieces[piece.id] = {
          pre: piece
        };
      }
    });
    this.setState({ pieces, processedPieces });
  }

  togglePiece = id => {
    const { placedPieces } = this.state;

    const update = placedPieces.slice();
    const i = update.indexOf(id);
    if (i > -1) {
      // remove
      update.splice(i, 1);
    } else {
      // add
      update.push(id);
    }

    this.setState({
      placedPieces: update
    });
  }

  selectPiece = id => {
    const { pieces } = this.state;

    const updated = [];
    let selected = null;
    pieces.forEach(piece => {
      if (piece.id === id) {
        piece.selected = true;
        selected = piece;
      } else {
        piece.selected = false;
        updated.push(piece);
      }
    });
    updated.push(selected);
    this.setState({ pieces: updated });
  }

  onPieceReady = (id, dataURL) => {
    const { processedPieces, pieces } = this.state;
    const updated = Object.assign({}, processedPieces);
    updated[id].dataURL = dataURL;

    pieces.forEach(piece => {
      if (piece.id === id) {
        piece.dirty = false;
      }
    });

    this.setState({
      processedPieces: updated,
      pieces
    });
  }

  save = () => {
    const { pieces, placedPieces, pieceScale, placedPiecesData, selectionScale } = this.state;
    const toSave = {
      pieces, placedPieces, pieceScale, placedPiecesData, selectionScale
    };
    localStorage.setItem('collageMakerState', JSON.stringify(toSave));
  }

  load = () => {
    const toLoad = localStorage.getItem('collageMakerState');
    if (toLoad) {
      const { pieces, placedPieces, pieceScale, placedPiecesData, selectionScale } = JSON.parse(toLoad);

      pieces.forEach(piece => {
        piece.dirty = true
      });

      this.onUpdatePieces(pieces);
      this.setState({ placedPieces, pieceScale, selectionScale, placedPiecesData, savedPiecesData: placedPiecesData || {} });
    }
  }

  clear = () => {
    this.setState({
      pieces: [],
      processedPieces: {},
      placedPieces: [],
      placedPiecesData: {},
      savedPiecesData: {}
    });
  }

  render() {
    const { src, pieces, processedPieces, placedPieces, pieceScale, selectionScale, savedPiecesData, placedPiecesData } = this.state;

    return (
      <div className="App" style={{ background: '#e0e0e0', minHeight: '1000px' }}>
        <AppBar position="static" color="inherit">
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit">
              Wood Grain Collage Maker
            </Typography>
          </Toolbar>
        </AppBar>
        <Grid container spacing={24} style={{ padding: '20px 100px' }}>
          <Grid item xs={3}>
            <Grid container>
              <Card style={{ width: '100%' }}>
                <CardContent>
                  <Selection
                    pieces={pieces}
                    src={src}
                    onUpdatePieces={this.onUpdatePieces}
                    onUpdateSrc={src => this.setState({ src })}
                    selectionScale={selectionScale}
                    onScaleChange={selectionScale => this.setState({ selectionScale })}
                    addPiece={id => this.togglePiece(id)}
                    placedPiecesData={placedPiecesData}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <Grid container>
              <Card style={{ width: '100%', minHeight: '200px' }}>
                <CardContent>
                  { src && <Palette
                    pieces={pieces}
                    processedPieces={processedPieces}
                    placedPieces={placedPieces}
                    src={src}
                    onPieceReady={this.onPieceReady}
                    togglePiece={this.togglePiece}
                    selectionScale={selectionScale}
                  /> }
                </CardContent>
              </Card>
              <div style={{ margin: '22px' }}>
                <Button variant="contained" onClick={this.clear}>
                  Clear
                </Button>
              </div>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container>
              <Card style={{ width: '100%' }}>
                <CardContent>
                  { <Collage
                    pieces={pieces}
                    processedPieces={processedPieces}
                    src={src}
                    placedPieces={placedPieces}
                    savedPiecesData={savedPiecesData}
                    onPiecePlacedUpdate={placedPiecesData => this.setState({ placedPiecesData })}
                    onSelectPiece={this.selectPiece}
                    scale={pieceScale}
                    updatePieceScale={pieceScale => this.setState({ pieceScale })}
                  /> }
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
