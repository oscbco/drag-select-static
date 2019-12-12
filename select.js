const detectOverlappingElements = (shadow, container) => {
  const shadowOffsets = shadow.getBoundingClientRect();
  if (shadowOffsets.height === 0) {
    return;
  }
  container.childNodes.forEach((elem) => {
    if (elem.dataset) {
      const elemOffsets = elem.getBoundingClientRect();
      const isOverlappingX = (elemOffsets.left > shadowOffsets.left && shadowOffsets.right > elemOffsets.left) || (shadowOffsets.left < elemOffsets.right && shadowOffsets.right > elemOffsets.right);
      const isOverlappingY = (elemOffsets.top > shadowOffsets.top && elemOffsets.top < shadowOffsets.bottom) || (shadowOffsets.top < elemOffsets.bottom && shadowOffsets.bottom > elemOffsets.bottom);
      if (isOverlappingX && isOverlappingY) {
        elem.classList.add('selected');
        flag = true;
      } else {
        elem.classList.remove('selected');
      }
    }
  })
};

const resizeShadowFreely = (e, shadow, container, initialPos, containerOffsets) => {
  if (e.pageX < initialPos.x) {
    shadow.style.left = 'auto';
    shadow.style.right = Math.abs(containerOffsets.left + container.scrollWidth - initialPos.x);
    shadow.style.width = initialPos.x - e.pageX + 'px';
  } else if (e.pageX >= initialPos.x) {
    shadow.style.right = 'auto';
    shadow.style.left = initialPos.x - containerOffsets.left;
    shadow.style.width = e.pageX - initialPos.x + 'px';
  }
  if (e.pageY < initialPos.y) {
    shadow.style.top = 'auto';
    shadow.style.bottom = containerOffsets.bottom - initialPos.y - initialPos.scrollTop;
    shadow.style.height = initialPos.y - e.pageY + (initialPos.scrollTop - container.scrollTop) + 'px';
  }
  if (e.pageY >= initialPos.y) {
    shadow.style.bottom = 'auto';
    shadow.style.top = initialPos.y - containerOffsets.top + initialPos.scrollTop;
    shadow.style.height = e.pageY - initialPos.y + (container.scrollTop - initialPos.scrollTop) + 'px';
  }
};


window.addEventListener('load', () => {
  const iconView = document.getElementsByClassName('icon-view').item(0);
  const topDragOffsets = document.getElementsByClassName('top-drag').item(0).getBoundingClientRect();
  const bottomDragOffsets = document.getElementsByClassName('bottom-drag').item(0).getBoundingClientRect();
  let initialPos = {};
  let shadow;
  let offsets;
  var resizeShadowDebounced;
  var event;
  const debounceDetection = debounce(detectOverlappingElements, 90);

  iconView.addEventListener('mousedown', (e) => {
    offsets = iconView.getBoundingClientRect();
    shadow = document.createElement('div');
    shadow.className = 'shadow';
    initialPos.x = e.pageX;
    initialPos.y = e.pageY;
    initialPos.scrollTop = iconView.scrollTop;
    iconView.append(shadow);

    if (!resizeShadowDebounced) {
      resizeShadowDebounced = setInterval(resizeShadowHeight, 100);
    }
  });

  iconView.addEventListener('mousemove', (e) => {
    if (shadow) {
      resizeShadowFreely(e, shadow, iconView, initialPos, offsets);
      event = e;
      debounceDetection(shadow, iconView);
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (shadow) {
      if (resizeShadowDebounced) {
        clearTimeout(resizeShadowDebounced);
        resizeShadowDebounced = undefined;
      }
    }
    shadow.remove();
    shadow = undefined;
  });

  const resizeShadowHeight = () => {
    if (shadow) {
      if (event.pageY < topDragOffsets.bottom && (iconView.offsetHeight !== iconView.scrollHeight)) {
        iconView.scrollBy(0, -10);
        shadow.style.height =  parseInt(shadow.style.height) + 10 + 'px';
        debounceDetection(shadow, iconView);
      } else if (event.pageY > bottomDragOffsets.top && (iconView.offsetHeight !== iconView.scrollHeight)) {
        iconView.scrollBy(0, 10);
        if ((parseInt(shadow.style.height) + parseInt(shadow.style.top)) < (parseInt(iconView.scrollHeight) - 10)) {
          shadow.style.height =  parseInt(shadow.style.height) + 10 + 'px';
          debounceDetection(shadow, iconView);
        }
      }
    }
  };
});