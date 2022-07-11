import {
  createDOM,
  addClass,
  style,
  appendChildren,
  fractionalSize,
  clientSize,
  absoluteCoordinates,
  offsetSize,
  scrollLeft,
  XY,
  removeAttr,
  removeElements,
  windowSize,
  equalBCRWH,
  getBoundingClientRect,
  assignDeep,
  cssProperty,
  createCache,
  equalXY,
  createEventListenerHub,
  EventListener,
} from 'support';
import {
  classNameEnvironment,
  classNameEnvironmentFlexboxGlue,
  classNameEnvironmentFlexboxGlueMax,
  classNameViewportScrollbarStyling,
} from 'classnames';
import { Options, defaultOptions } from 'options';
import { PartialOptions } from 'typings';
import { InitializationStrategy } from 'initialization';

export interface EnvironmentListenersNameArgsMap {
  _: undefined;
}

export interface InternalEnvironment {
  readonly _nativeScrollbarSize: XY;
  readonly _nativeScrollbarIsOverlaid: XY<boolean>;
  readonly _nativeScrollbarStyling: boolean;
  readonly _rtlScrollBehavior: { n: boolean; i: boolean };
  readonly _flexboxGlue: boolean;
  readonly _cssCustomProperties: boolean;
  readonly _defaultInitializationStrategy: InitializationStrategy;
  readonly _defaultDefaultOptions: Options;
  _addListener(listener: EventListener<EnvironmentListenersNameArgsMap, '_'>): () => void;
  _getInitializationStrategy(): InitializationStrategy;
  _setInitializationStrategy(newInitializationStrategy: Partial<InitializationStrategy>): void;
  _getDefaultOptions(): Options;
  _setDefaultOptions(newDefaultOptions: PartialOptions<Options>): void;
}

let environmentInstance: InternalEnvironment;
const { abs, round } = Math;

const diffBiggerThanOne = (valOne: number, valTwo: number): boolean => {
  const absValOne = abs(valOne);
  const absValTwo = abs(valTwo);
  return !(absValOne === absValTwo || absValOne + 1 === absValTwo || absValOne - 1 === absValTwo);
};

const getNativeScrollbarSize = (
  body: HTMLElement,
  measureElm: HTMLElement,
  measureElmChild: HTMLElement
): XY => {
  appendChildren(body, measureElm);

  const cSize = clientSize(measureElm);
  const oSize = offsetSize(measureElm);
  const fSize = fractionalSize(measureElmChild);

  return {
    x: oSize.h - cSize.h + fSize.h,
    y: oSize.w - cSize.w + fSize.w,
  };
};

const getNativeScrollbarStyling = (testElm: HTMLElement): boolean => {
  let result = false;
  const revertClass = addClass(testElm, classNameViewportScrollbarStyling);
  try {
    result =
      style(testElm, cssProperty('scrollbar-width')) === 'none' ||
      window.getComputedStyle(testElm, '::-webkit-scrollbar').getPropertyValue('display') ===
        'none';
  } catch (ex) {}
  revertClass();
  return result;
};

const getRtlScrollBehavior = (
  parentElm: HTMLElement,
  childElm: HTMLElement
): { i: boolean; n: boolean } => {
  const strHidden = 'hidden';
  style(parentElm, { overflowX: strHidden, overflowY: strHidden, direction: 'rtl' });
  scrollLeft(parentElm, 0);

  const parentOffset = absoluteCoordinates(parentElm);
  const childOffset = absoluteCoordinates(childElm);
  scrollLeft(parentElm, -999); // https://github.com/KingSora/OverlayScrollbars/issues/187
  const childOffsetAfterScroll = absoluteCoordinates(childElm);
  return {
    /**
     * origin direction = determines if the zero scroll position is on the left or right side
     * 'i' means 'invert' (i === true means that the axis must be inverted to be correct)
     * true = on the left side
     * false = on the right side
     */
    i: parentOffset.x === childOffset.x,
    /**
     * negative = determines if the maximum scroll is positive or negative
     * 'n' means 'negate' (n === true means that the axis must be negated to be correct)
     * true = negative
     * false = positive
     */
    n: childOffset.x !== childOffsetAfterScroll.x,
  };
};

const getFlexboxGlue = (parentElm: HTMLElement, childElm: HTMLElement): boolean => {
  const revertFbxGlue = addClass(parentElm, classNameEnvironmentFlexboxGlue);
  const minOffsetsizeParent = getBoundingClientRect(parentElm);
  const minOffsetsize = getBoundingClientRect(childElm);
  const supportsMin = equalBCRWH(minOffsetsize, minOffsetsizeParent, true);

  const revertFbxGlueMax = addClass(parentElm, classNameEnvironmentFlexboxGlueMax);
  const maxOffsetsizeParent = getBoundingClientRect(parentElm);
  const maxOffsetsize = getBoundingClientRect(childElm);
  const supportsMax = equalBCRWH(maxOffsetsize, maxOffsetsizeParent, true);

  revertFbxGlue();
  revertFbxGlueMax();

  return supportsMin && supportsMax;
};

const getWindowDPR = (): number => {
  // eslint-disable-next-line
  // @ts-ignore
  const dDPI = window.screen.deviceXDPI || 0;
  // eslint-disable-next-line
  // @ts-ignore
  const sDPI = window.screen.logicalXDPI || 1;
  return window.devicePixelRatio || dDPI / sDPI;
};

const createEnvironment = (): InternalEnvironment => {
  const { body } = document;
  const envDOM = createDOM(`<div class="${classNameEnvironment}"><div></div></div>`);
  const envElm = envDOM[0] as HTMLElement;
  const envChildElm = envElm.firstChild as HTMLElement;
  const [addEvent, , triggerEvent] = createEventListenerHub<EnvironmentListenersNameArgsMap>();
  const [updateNativeScrollbarSizeCache, getNativeScrollbarSizeCache] = createCache({
    _initialValue: getNativeScrollbarSize(body, envElm, envChildElm),
    _equal: equalXY,
  });
  const [nativeScrollbarSize] = getNativeScrollbarSizeCache();
  const nativeScrollbarStyling = getNativeScrollbarStyling(envElm);
  const nativeScrollbarIsOverlaid = {
    x: nativeScrollbarSize.x === 0,
    y: nativeScrollbarSize.y === 0,
  };
  const initializationStrategy = {
    _padding: !nativeScrollbarStyling,
    _content: false,
  };
  const defaultDefaultOptions = assignDeep({}, defaultOptions);

  const env: InternalEnvironment = {
    _nativeScrollbarSize: nativeScrollbarSize,
    _nativeScrollbarIsOverlaid: nativeScrollbarIsOverlaid,
    _nativeScrollbarStyling: nativeScrollbarStyling,
    _cssCustomProperties: style(envElm, 'zIndex') === '-1',
    _rtlScrollBehavior: getRtlScrollBehavior(envElm, envChildElm),
    _flexboxGlue: getFlexboxGlue(envElm, envChildElm),
    _addListener: (listener) => addEvent('_', listener),
    _getInitializationStrategy: assignDeep<InitializationStrategy, InitializationStrategy>.bind(
      0,
      {} as InitializationStrategy,
      initializationStrategy
    ),
    _setInitializationStrategy(newInitializationStrategy) {
      assignDeep(initializationStrategy, newInitializationStrategy);
    },
    _getDefaultOptions: assignDeep<Options, Options>.bind(0, {} as Options, defaultDefaultOptions),
    _setDefaultOptions(newDefaultOptions) {
      assignDeep(defaultDefaultOptions, newDefaultOptions);
    },
    _defaultInitializationStrategy: assignDeep({}, initializationStrategy),
    _defaultDefaultOptions: assignDeep({}, defaultDefaultOptions),
  };

  removeAttr(envElm, 'style');
  removeElements(envElm);

  if (!nativeScrollbarStyling && (!nativeScrollbarIsOverlaid.x || !nativeScrollbarIsOverlaid.y)) {
    let size = windowSize();
    let dpr = getWindowDPR();

    window.addEventListener('resize', () => {
      const sizeNew = windowSize();
      const deltaSize = {
        w: sizeNew.w - size.w,
        h: sizeNew.h - size.h,
      };

      if (deltaSize.w === 0 && deltaSize.h === 0) return;

      const deltaAbsSize = {
        w: abs(deltaSize.w),
        h: abs(deltaSize.h),
      };
      const deltaAbsRatio = {
        w: abs(round(sizeNew.w / (size.w / 100.0))),
        h: abs(round(sizeNew.h / (size.h / 100.0))),
      };
      const dprNew = getWindowDPR();
      const deltaIsBigger = deltaAbsSize.w > 2 && deltaAbsSize.h > 2;
      const difference = !diffBiggerThanOne(deltaAbsRatio.w, deltaAbsRatio.h);
      const dprChanged = dprNew !== dpr && dpr > 0;
      const isZoom = deltaIsBigger && difference && dprChanged;

      if (isZoom) {
        const [scrollbarSize, scrollbarSizeChanged] = updateNativeScrollbarSizeCache(
          getNativeScrollbarSize(body, envElm, envChildElm)
        );

        assignDeep(environmentInstance._nativeScrollbarSize, scrollbarSize); // keep the object same!
        removeElements(envElm);

        if (scrollbarSizeChanged) {
          triggerEvent('_');
        }
      }

      size = sizeNew;
      dpr = dprNew;
    });
  }

  return env;
};

const getEnvironment = (): InternalEnvironment => {
  if (!environmentInstance) {
    environmentInstance = createEnvironment();
  }
  return environmentInstance;
};

export { getEnvironment };
