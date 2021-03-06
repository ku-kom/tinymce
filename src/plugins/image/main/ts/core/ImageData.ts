/**
 * ImageData.ts
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Utils from 'tinymce/plugins/image/core/Utils';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Merger } from '@ephox/katamari';
import { HTMLElement, Node, document } from '@ephox/dom-globals';

const DOM = DOMUtils.DOM;

interface ImageData {
  src: string;
  alt: string;
  decorative: boolean;
  title: string;
  width: string;
  height: string;
  class: string;
  style: string;
  caption: boolean;
  hspace: string;
  vspace: string;
  border: string;
  borderStyle: string;
  alignment: string;
}

type CssNormalizer = (css: string) => string;

const getHspace = (image: HTMLElement): string => {
  if (image.style.marginLeft && image.style.marginRight && image.style.marginLeft === image.style.marginRight) {
    return Utils.removePixelSuffix(image.style.marginLeft);
  } else {
    return '';
  }
};

const getVspace = (image: HTMLElement): string => {
  if (image.style.marginTop && image.style.marginBottom && image.style.marginTop === image.style.marginBottom) {
    return Utils.removePixelSuffix(image.style.marginTop);
  } else {
    return '';
  }
};

const getBorder = (image: HTMLElement): string => {
  if (image.style.borderWidth) {
    return Utils.removePixelSuffix(image.style.borderWidth);
  } else {
    return '';
  }
};

const getAttrib = (image: HTMLElement, name: string): string => {
  if (image.hasAttribute(name)) {
    return image.getAttribute(name);
  } else {
    return '';
  }
};

const getStyle = (image: HTMLElement, name: string): string => {
  return image.style[name] ? image.style[name] : '';
};

const hasCaption = (image: HTMLElement): boolean => {
  return image.parentNode !== null && image.parentNode.nodeName === 'FIGURE';
};

const isDecorative = (image: HTMLElement): boolean => {
  return image.getAttribute('decorative') === 'true';
};

const setAttrib = (image: HTMLElement, name: string, value: string) => {
  image.setAttribute(name, value);
};

const wrapInFigure = (image: HTMLElement) => {
  const figureElm = DOM.create('figure', { class: 'image' });
  DOM.insertAfter(figureElm, image);

  figureElm.appendChild(image);
  figureElm.appendChild(DOM.create('figcaption', { contentEditable: true }, 'Caption'));
  figureElm.contentEditable = 'false';
};

const removeFigure = (image: HTMLElement) => {
  const figureElm = image.parentNode;
  DOM.insertAfter(image, figureElm);
  DOM.remove(figureElm);
};

const toggleCaption = (image: HTMLElement) => {
  if (hasCaption(image)) {
    removeFigure(image);
  } else {
    wrapInFigure(image);
  }
};

const normalizeStyle = (image: HTMLElement, normalizeCss: CssNormalizer) => {
  const attrValue = image.getAttribute('style');
  const value = normalizeCss(attrValue !== null ? attrValue : '');

  if (value.length > 0) {
    image.setAttribute('style', value);
    image.setAttribute('data-mce-style', value);
  } else {
    image.removeAttribute('style');
  }
};

const setSize = (name: string, normalizeCss: CssNormalizer) => {
  return (image: HTMLElement, name: string, value: string) => {
    if (image.style[name]) {
      image.style[name] = Utils.addPixelSuffix(value);
      normalizeStyle(image, normalizeCss);
    } else {
      setAttrib(image, name, value);
    }
  };
};

const getSize = (image: HTMLElement, name: string): string => {
  if (image.style[name]) {
    return Utils.removePixelSuffix(image.style[name]);
  } else {
    return getAttrib(image, name);
  }
};

const setHspace = (image: HTMLElement, value: string) => {
  const pxValue = Utils.addPixelSuffix(value);
  image.style.marginLeft = pxValue;
  image.style.marginRight = pxValue;
};

const setVspace = (image: HTMLElement, value: string) => {
  const pxValue = Utils.addPixelSuffix(value);
  image.style.marginTop = pxValue;
  image.style.marginBottom = pxValue;
};

const setBorder = (image: HTMLElement, value: string) => {
  const pxValue = Utils.addPixelSuffix(value);
  image.style.borderWidth = pxValue;
};

const setBorderStyle = (image: HTMLElement, value: string) => {
  image.style.borderStyle = value;
};

const getBorderStyle = (image: HTMLElement) => getStyle(image, 'borderStyle');

const isFigure = (elm: Node) => elm.nodeName === 'FIGURE';
const isImage = (elm: Node) => elm.nodeName === 'IMG';

const defaultData = (): ImageData => {
  return {
    src: '',
    alt: '',
    decorative: false,
    title: '',
    width: '',
    height: '',
    class: '',
    style: '',
    caption: false,
    hspace: '',
    vspace: '',
    border: '',
    borderStyle: '',
    alignment: '',
  };
};

const getStyleValue = (normalizeCss: CssNormalizer, data: ImageData): string => {
  const image = document.createElement('img');

  setAttrib(image, 'style', data.style);

  if (getHspace(image) || data.hspace !== '') {
    setHspace(image, data.hspace);
  }

  if (getVspace(image) || data.vspace !== '') {
    setVspace(image, data.vspace);
  }

  if (getBorder(image) || data.border !== '') {
    setBorder(image, data.border);
  }

  if (getBorderStyle(image) || data.borderStyle !== '') {
    setBorderStyle(image, data.borderStyle);
  }

  return normalizeCss(image.getAttribute('style'));
};

const getAlignment = (image: HTMLElement): string => {
  if (hasCaption(image)) {
    const figureClass = getAttrib(image.parentNode as HTMLElement, 'class');
    const match = figureClass.match(/\balign-(center|left|right)\b/);
    if (match) {
      return match[1];
    }
  } else {
    const styleValue = getStyle(image, 'float') || '';
    if (styleValue === 'left' || styleValue === 'right') {
      return styleValue;
    } else {
      if (getStyle(image, 'margin-left') === 'auto' &&
         getStyle(image, 'margin-right') === 'auto') {
        return 'center';
      }
    }
    return '';
  }
};

const create = (normalizeCss: CssNormalizer, data: ImageData): HTMLElement => {
  const image = document.createElement('img');
  write(normalizeCss, Merger.merge(data, { caption: false }), image);

  // Always set alt even if data.alt is an empty string
  setAttrib(image, 'alt', data.alt);

  if (data.caption) {
    const figure = DOM.create('figure', { class: 'image' });

    figure.appendChild(image);
    figure.appendChild(DOM.create('figcaption', { contentEditable: true }, 'Caption'));
    figure.contentEditable = 'false';

    // Re-trigger updating of alignment, this time with the correct caption
    // setting.
    updateAlignment(image, Merger.merge(read(normalizeCss, image), { caption: false }), data);

    return figure;
  } else {
    return image;
  }
};

const read = (normalizeCss: CssNormalizer, image: HTMLElement): ImageData => {
  return {
    src: getAttrib(image, 'data-obvius-src') || getAttrib(image, 'src'),
    alt: getAttrib(image, 'alt'),
    decorative: isDecorative(image),
    title: getAttrib(image, 'title'),
    width: getSize(image, 'width'),
    height: getSize(image, 'height'),
    class: getAttrib(image, 'class'),
    style: normalizeCss(getAttrib(image, 'style')),
    caption: hasCaption(image),
    hspace: getHspace(image),
    vspace: getVspace(image),
    border: getBorder(image),
    borderStyle: getStyle(image, 'borderStyle'),
    alignment: getAlignment(image)
  };
};

const updateProp = (image: HTMLElement, oldData: ImageData, newData: ImageData, name: string, set: (image: HTMLElement, name: string, value: string) => void) => {
  if (newData[name] !== oldData[name]) {
    set(image, name, newData[name]);
  }
};

const updateImageAlignment = (image: HTMLElement, newValue: string) => {
  // Remove any float: left or right
  if (newValue === 'left' || newValue === 'right') {
    image.style.cssFloat = newValue;
  } else {
    const float = image.style.cssFloat || '';
    if (float === 'left' || float === 'right') {
      image.style.cssFloat = null;
    }
  }

  // Get list of existing classes
  let classes = image.className ? image.className.split(/\s+/) : [];
  // Filter out any img-* classes
  classes = classes.filter((elem) => !elem.match(/^img-/));
  // Add new class, if needed
  if (newValue !== null) {
    if (newValue === '' || newValue === 'none') {
      classes.push('img-default');
    } else {
      classes.push('img-' + newValue);
    }
  }
  // Store new list of classes back on the image
  image.className = classes.join(' ');

  if (newValue === 'center') {
    image.style.marginLeft = 'auto';
    image.style.marginRight = 'auto';
    image.style.display = 'block';
  } else {
    if (image.style.marginLeft && image.style.marginLeft === 'auto') {
      image.style.marginLeft = null;
    }
    if (image.style.marginRight && image.style.marginRight === 'auto') {
      image.style.marginRight = null;
    }
    if (image.style.display && image.style.display === 'block') {
      image.style.display = null;
    }
  }

};

const updateCaptionAlignment = (figure: HTMLElement, newValue: string) => {
  // Get list of existing classes
  let classes = figure.className ? figure.className.split(/\s+/) : [];
  // Filter out any align-* and img-* classes
  classes = classes.filter((elem) => !elem.match(/^(align|img)-/));
  // Add new class, if needed
  if (newValue === '' || newValue === 'none') {
    classes.push('img-default');
  } else {
    classes.push('align-' + newValue);
    classes.push('img-' + newValue);
  }
  figure.className = classes.join(' ');
};

const updateAlignment = (image: HTMLElement, oldData: ImageData, newData: ImageData) => {
  if (newData.caption) {
    if (!oldData.caption) {
      // If a caption was added remove alignment from the image itself
      updateImageAlignment(image, null);
      // And set alignment on the new caption
      updateCaptionAlignment(image.parentNode as HTMLElement, newData.alignment);
    } else {
      // Only change alignment of caption if it was changed
      if (newData.alignment !== oldData.alignment) {
        updateCaptionAlignment(image.parentNode as HTMLElement, newData.alignment);
      }
    }
  } else {
    // Update if we previously had a caption or if alignment has changed
    if (oldData.caption || newData.alignment !== oldData.alignment) {
      updateImageAlignment(image, newData.alignment);
    }
  }
};

const normalized = (set: (image: HTMLElement, value: string) => void, normalizeCss: CssNormalizer) => {
  return (image: HTMLElement, name: string, value: string) => {
    set(image, value);
    normalizeStyle(image, normalizeCss);
  };
};

const validateAlt = (newData: ImageData): boolean => {
  if (newData.alt === '' && !newData.decorative) {
    return false;
  } else {
    return true;
  }
};

const write = (normalizeCss: CssNormalizer, newData: ImageData, image: HTMLElement) => {
  const oldData = read(normalizeCss, image);

  updateProp(image, oldData, newData, 'caption', (image, _name, _value) => toggleCaption(image));
  updateProp(image, oldData, newData, 'src', setAttrib);
  // Always set alt even if data.alt is an empty string
  setAttrib(image, 'alt', newData.alt);
  updateProp(image, oldData, newData, 'decorative', setAttrib);
  updateProp(image, oldData, newData, 'title', setAttrib);
  updateProp(image, oldData, newData, 'width', setSize('width', normalizeCss));
  updateProp(image, oldData, newData, 'height', setSize('height', normalizeCss));
  updateProp(image, oldData, newData, 'class', setAttrib);
  updateAlignment(image, oldData, newData);
  updateProp(image, oldData, newData, 'style', normalized((image, value) => setAttrib(image, 'style', value), normalizeCss));
  updateProp(image, oldData, newData, 'hspace', normalized(setHspace, normalizeCss));
  updateProp(image, oldData, newData, 'vspace', normalized(setVspace, normalizeCss));
  updateProp(image, oldData, newData, 'border', normalized(setBorder, normalizeCss));
  updateProp(image, oldData, newData, 'borderStyle', normalized(setBorderStyle, normalizeCss));
};

export {
  ImageData,
  getStyleValue,
  defaultData,
  isFigure,
  isImage,
  create,
  read,
  write,
  validateAlt
};
