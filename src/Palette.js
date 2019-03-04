import React from 'react';

import Grid from '@material-ui/core/Grid';

import PaletteItem from './PaletteItem';

export default class Palette extends React.PureComponent {

  render() {
    const { items } = this.props;

    const els = items.map(item => <Grid key={item.id} item xs={4}><PaletteItem img={item.img} /></Grid>);

    return (
      <Grid container spacing={16}>
        {els}
      </Grid>
    );
  }
}
