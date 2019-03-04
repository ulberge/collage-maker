import React, { Component } from 'react';
import './App.css';

import Grid from '@material-ui/core/Grid';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

import FileNode from './FileNode';
import MaskNode from './MaskNode';
import PieceNode from './PieceNode';

export default class NodeFlow extends Component {

  state = {
    srcImg: null,
    mask: null
  }

  render() {
    const { srcImg, mask } = this.state;

    return (
      <Grid container spacing={16}>
        <Grid item xs={4}>
          <Card>
            <CardHeader
              title="Source"
            />
            <CardContent>
              <FileNode
                onFinished={srcImg => this.setState({ srcImg })}
                inputs={{
                  src: 'imgs/wg3_cont.png'
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardHeader
              title="Mask"
            />
            <CardContent>
              <MaskNode
                onFinished={newMask => this.setState({ mask: newMask })}
                inputs={ srcImg ? { w: srcImg.width, h: srcImg.height, size: 50 } : {}}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardHeader
              title="Piece"
            />
            <CardContent>
              <PieceNode
                onFinished={mask => this.setState({ mask })}
                inputs={{ srcImg, mask }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}
