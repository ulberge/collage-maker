import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';

import Grid from '@material-ui/core/Grid';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

import FileNode from './FileNode';
import MaskNode from './MaskNode';
import PieceNode from './PieceNode';
import CropPieceNode from './CropPieceNode';

export default class SourceToPieceFlow extends Component {
  static propTypes = {
    inputs: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onFinished: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
  }

  state = {
    srcImg: null,
    mask: null,
    piece: null,
    coords: []
  }

  render() {
    const { onFinished, inputs } = this.props;
    const { src, pieceSize, palette } = inputs;
    const { srcImg, mask, piece, coords } = this.state;

    return (
      <Grid container spacing={16}>
        { !srcImg &&
          (<Grid item xs={5} ref="source">
            <Card>
              <CardHeader
                title="Source"
              />
              <CardContent>
                <FileNode
                  onFinished={srcImg => this.setState({ srcImg })}
                  inputs={{ src }}
                />
              </CardContent>
            </Card>
          </Grid>)
        }
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Mask"
            />
            <CardContent>
              <MaskNode
                onFinished={(newMask, newCoords) => this.setState({ mask: newMask, coords: newCoords })}
                inputs={ srcImg ? { w: srcImg.width, h: srcImg.height, size: pieceSize, palette, srcImg } : {}}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3} style={{ display: 'none' }}>
          <Card>
            <CardHeader
              title="Piece"
            />
            <CardContent>
              <PieceNode
                onFinished={piece => this.setState({ piece })}
                inputs={{ srcImg, mask }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3} style={{ visibility: 'hidden' }}>
          <Card>
            <CardHeader
              title="Piece"
            />
            <CardContent>
              <CropPieceNode
                onFinished={onFinished}
                inputs={{ piece, coords }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}
