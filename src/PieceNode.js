import ProcessNode from './ProcessNode';

export default class PieceNode extends ProcessNode {
  draw = p => {
    const { inputs, onFinished } = this.props;
    const { srcImg, mask } = inputs;

    this.setAbsoluteSize(p, srcImg.width, srcImg.height);

    if (!p.width || !p.height) {
      return;
    }

    p.image(srcImg, 0, 0);

    const toFilter = p.get();
    toFilter.mask(mask);
    toFilter.filter(p.GRAY);
    // this.brighten(p, toFilter, 0.5);
    // toFilter.filter(p.POSTERIZE, 6);

    p.background(0);
    p.image(toFilter, 0, 0);

    onFinished(toFilter);
  }

  // brighten = (p, toFilter, amt) => {
  //   toFilter.loadPixels();

  //   for (let y = 0; y < toFilter.height; y++) {
  //     for (let x = 0; x < toFilter.width; x++) {
  //       const loc = x + y*toFilter.width;

  //       // The functions red(), green(), and blue() pull out the 3 color components from a pixel.
  //       let r = toFilter.pixels[loc];
  //       let g = toFilter.pixels[loc+1];
  //       let b = toFilter.pixels[loc+2];

  //       // Image Processing would go here
  //       // If we were to change the RGB values, we would do it here,
  //       // before setting the pixel in the display window.
  //       r = Math.min(255, 255 - ((255 - r) * amt));
  //       g = Math.min(255, 255 - ((255 - g) * amt));
  //       b = Math.min(255, 255 - ((255 - b) * amt));

  //       // Set the display pixel to the image pixel
  //       toFilter.pixels[loc] =  r;
  //       toFilter.pixels[loc+1] =  g;
  //       toFilter.pixels[loc+2] =  b;
  //     }
  //   }
  //   toFilter.updatePixels();
  // }
}
