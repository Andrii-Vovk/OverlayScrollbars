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
  removeAttr,
  removeElements,
  equalBCRWH,
  getBoundingClientRect,
  assignDeep,
  cssProperty,
  createCache,
  equalXY,
  createEventListenerHub,
  debounce,
} from '~/support';
import {
  classNameEnvironment,
  classNameEnvironmentFlexboxGlue,
  classNameEnvironmentFlexboxGlueMax,
  classNameViewportScrollbarHidden,
} from '~/classnames';
import { defaultOptions } from '~/options';
import { getPlugins, scrollbarsHidingPluginName } from '~/plugins';
import type { XY, EventListener } from '~/support';
import type { Options, PartialOptions } from '~/options';
import type { ScrollbarsHidingPluginInstance } from '~/plugins';
import type { Initialization, PartialInitialization } from '~/initialization';

type EnvironmentEventArgs = {
  z: [];
  r: [];
};

/**
 * Describes the OverlayScrollbars environment.
 */
export interface Environment {
  /** The native scrollbars size of the browser / system. */
  scrollbarsSize: XY<number>;
  /** Whether the native scrollbars are overlaid. */
  scrollbarsOverlaid: XY<boolean>;
  /** Whether the browser supports native scrollbars hiding. */
  scrollbarsHiding: boolean;
  /** The rtl scroll behavior of the browser. */
  rtlScrollBehavior: { n: boolean; i: boolean };
  /** Whether the browser supports all needed Flexbox features for OverlayScrollbars to work in a more performant way. */
  flexboxGlue: boolean;
  /** Whether the browser supports custom css properties. (also known as css variables) */
  cssCustomProperties: boolean;
  /** The default Initialization to use if nothing else is specified. */
  staticDefaultInitialization: Initialization;
  /** The default Options to use if nothing else is specified. */
  staticDefaultOptions: Options;

  /** Returns the current default Initialization. */
  getDefaultInitialization(): Initialization;
  /** Returns the current default Options. */
  getDefaultOptions(): Options;

  /**
   * Sets a new default Initialization.
   * If the new default Initialization is partially filled, its deeply merged with the current default Initialization.
   * @param newDefaultInitialization The new default Initialization.
   * @returns The current default Initialization.
   */
  setDefaultInitialization(newDefaultInitialization: PartialInitialization): Initialization;
  /**
   * Sets new default Options.
   * If the new default Options are partially filled, they're deeply merged with the current default Options.
   * @param newDefaultOptions The new default Options.
   * @returns The current default options.
   */
  setDefaultOptions(newDefaultOptions: PartialOptions): Options;
}

export interface InternalEnvironment {
  readonly _nativeScrollbarsSize: XY;
  readonly _nativeScrollbarsOverlaid: XY<boolean>;
  readonly _nativeScrollbarsHiding: boolean;
  readonly _rtlScrollBehavior: { n: boolean; i: boolean };
  readonly _flexboxGlue: boolean;
  readonly _cssCustomProperties: boolean;
  readonly _staticDefaultInitialization: Initialization;
  readonly _staticDefaultOptions: Options;
  _addZoomListener(listener: EventListener<EnvironmentEventArgs, 'z'>): () => void;
  _addResizeListener(listener: EventListener<EnvironmentEventArgs, 'r'>): () => void;
  _getDefaultInitialization(): Initialization;
  _setDefaultInitialization(newInitialization: PartialInitialization): Initialization;
  _getDefaultOptions(): Options;
  _setDefaultOptions(newDefaultOptions: PartialOptions): Options;
}

let environmentInstance: InternalEnvironment;

const getNativeScrollbarSize = (
  body: HTMLElement,
  measureElm: HTMLElement,
  measureElmChild: HTMLElement,
  clear?: boolean
): XY => {
  appendChildren(body, measureElm);

  const cSize = clientSize(measureElm);
  const oSize = offsetSize(measureElm);
  const fSize = fractionalSize(measureElmChild);

  clear && removeElements(measureElm);

  return {
    x: oSize.h - cSize.h + fSize.h,
    y: oSize.w - cSize.w + fSize.w,
  };
};

const getNativeScrollbarsHiding = (testElm: HTMLElement): boolean => {
  let result = false;
  const revertClass = addClass(testElm, classNameViewportScrollbarHidden);
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

const createEnvironment = (): InternalEnvironment => {
  const { body } = document;
  const envDOM = createDOM(`<div class="${classNameEnvironment}"><div></div></div>`);
  const envElm = envDOM[0] as HTMLElement;
  const envChildElm = envElm.firstChild as HTMLElement;
  const [addEvent, , triggerEvent] = createEventListenerHub<EnvironmentEventArgs>();
  const [updateNativeScrollbarSizeCache, getNativeScrollbarSizeCache] = createCache(
    {
      _initialValue: getNativeScrollbarSize(body, envElm, envChildElm),
      _equal: equalXY,
    },
    getNativeScrollbarSize.bind(0, body, envElm, envChildElm, true)
  );
  const [nativeScrollbarsSize] = getNativeScrollbarSizeCache();
  const nativeScrollbarsHiding = getNativeScrollbarsHiding(envElm);
  const nativeScrollbarsOverlaid = {
    x: nativeScrollbarsSize.x === 0,
    y: nativeScrollbarsSize.y === 0,
  };
  const staticDefaultInitialization: Initialization = {
    elements: {
      host: null,
      padding: !nativeScrollbarsHiding,
      viewport: (target) =>
        nativeScrollbarsHiding && target === target.ownerDocument.body && target,
      content: false,
    },
    scrollbars: {
      slot: true,
    },
    cancel: {
      nativeScrollbarsOverlaid: false,
      body: null,
    },
  };
  const staticDefaultOptions = assignDeep({}, defaultOptions);
  const getDefaultOptions = (assignDeep as typeof assignDeep<Options, Options>).bind(
    0,
    {} as Options,
    staticDefaultOptions
  );
  const getDefaultInitialization = (
    assignDeep as typeof assignDeep<Initialization, Initialization>
  ).bind(0, {} as Initialization, staticDefaultInitialization);

  const env: InternalEnvironment = {
    _nativeScrollbarsSize: nativeScrollbarsSize,
    _nativeScrollbarsOverlaid: nativeScrollbarsOverlaid,
    _nativeScrollbarsHiding: nativeScrollbarsHiding,
    _cssCustomProperties: style(envElm, 'zIndex') === '-1',
    _rtlScrollBehavior: getRtlScrollBehavior(envElm, envChildElm),
    _flexboxGlue: getFlexboxGlue(envElm, envChildElm),
    _addZoomListener: addEvent.bind(0, 'z'),
    _addResizeListener: addEvent.bind(0, 'r'),
    _getDefaultInitialization: getDefaultInitialization,
    _setDefaultInitialization: (newInitializationStrategy) =>
      assignDeep(staticDefaultInitialization, newInitializationStrategy) &&
      getDefaultInitialization(),
    _getDefaultOptions: getDefaultOptions,
    _setDefaultOptions: (newDefaultOptions) =>
      assignDeep(staticDefaultOptions, newDefaultOptions) && getDefaultOptions(),
    _staticDefaultInitialization: assignDeep({}, staticDefaultInitialization),
    _staticDefaultOptions: assignDeep({}, staticDefaultOptions),
  };
  const windowAddEventListener = window.addEventListener;
  const debouncedWindowResize = debounce((zoom: boolean) => triggerEvent(zoom ? 'z' : 'r'), {
    _timeout: 33,
    _maxDelay: 99,
  });

  removeAttr(envElm, 'style');
  removeElements(envElm);

  // needed in case content has css viewport units
  windowAddEventListener('resize', debouncedWindowResize.bind(0, false));

  if (!nativeScrollbarsHiding && (!nativeScrollbarsOverlaid.x || !nativeScrollbarsOverlaid.y)) {
    let resizeFn: undefined | ReturnType<ScrollbarsHidingPluginInstance['_envWindowZoom']>;
    windowAddEventListener('resize', () => {
      const scrollbarsHidingPlugin = getPlugins()[scrollbarsHidingPluginName] as
        | ScrollbarsHidingPluginInstance
        | undefined;

      resizeFn = resizeFn || (scrollbarsHidingPlugin && scrollbarsHidingPlugin._envWindowZoom());
      resizeFn &&
        resizeFn(env, updateNativeScrollbarSizeCache, debouncedWindowResize.bind(0, true));
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
