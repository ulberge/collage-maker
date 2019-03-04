import React, { Component } from 'react';
import './App.css';

import Grid from '@material-ui/core/Grid';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import Selection from './selection/Selection';
import Palette from './palette/Palette';
import Collage from './collage/Collage';

window.PIECE_ID = 0;

class App extends Component {

  state = {
    src: null,
    pieces: [],
    processedPieces: {},
    placedPieces: [],
    placedPiecesData: {},
    selectionScale: 100,
    pieceScale: 30,
    savedPiecesData: null
  };

  componentDidMount() {
    this.load();
  }

  componentDidUpdate() {
    // save to localStorage
    this.save();
  }

  onUpdatePieces = pieces => {
    const { processedPieces } = this.state;
    console.log('onUpdatePieces');
    pieces.forEach(piece => {
      if (piece.dirty) {
        console.log('is dirty: ' + piece.id, piece.dirty);
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

    console.log('added piece to collage!');

    this.setState({
      placedPieces: update
    });
  }

  selectPiece = id => {
    const { pieces } = this.state;
    // const updated = pieces.slice();

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
    console.log('processed piece:' + id);
    const { processedPieces, pieces } = this.state;
    //console.log('ready!');
    const updated = Object.assign({}, processedPieces);
    updated[id].dataURL = dataURL;

    pieces.forEach(piece => {
      if (piece.id === id) {
        piece.dirty = false;
        console.log(piece.id, 'clean');
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
    //console.log('save', JSON.stringify(toSave));
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
    console.log('clear');
  }

  render() {
    const { src, pieces, processedPieces, placedPieces, pieceScale, selectionScale, savedPiecesData, placedPiecesData } = this.state;

    return (
      <div className="App" style={{ padding: '40px 100px', background: '#e0e0e0', minHeight: '1000px' }}>
        <Typography variant="h3" gutterBottom>
          Collage Maker
        </Typography>
        <Grid container spacing={24}>
          <Grid item xs={3}>
            <Grid container>
              <Card style={{ width: '100%' }}>
                <CardHeader
                  title="Source"
                />
                <CardContent>
                  <Selection
                    pieces={pieces}
                    src={src}
                    onUpdatePieces={this.onUpdatePieces}
                    onUpdateSrc={src => {
                      console.log('onUpdateSrc');
                      this.setState({ src });
                    }}
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
              <Card style={{ width: '100%' }}>
                <CardHeader
                  title="Palette"
                />
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
          <Grid item xs={5}>
            <Grid container>
              <Card style={{ width: '100%' }}>
                <CardHeader
                  title="Collage"
                />
                <CardContent>
                  { src && savedPiecesData && <Collage
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
          <Grid item xs={2}>
            <Grid container>
              <Card style={{ width: '100%' }}>
                <CardHeader
                  title="Calculator"
                />
                <CardContent>
                  Calculate stuff
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
