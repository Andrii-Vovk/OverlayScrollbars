import { on, runEachAndClear, parent, scrollLeft, scrollTop, selfClearTimeout } from '~/support';
import { getEnvironment } from '~/environment';
import { createState, createOptionCheck } from '~/setups/setups';
import { createScrollbarsSetupEvents } from '~/setups/scrollbarsSetup/scrollbarsSetup.events';
import { createScrollbarsSetupElements } from '~/setups/scrollbarsSetup/scrollbarsSetup.elements';
import {
  classNameScrollbarThemeNone,
  classNameScrollbarVisible,
  classNameScrollbarUnusable,
  classNameScrollbarCornerless,
  classNameScrollbarAutoHidden,
  classNameScrollbarHandleInteractive,
  classNameScrollbarTrackInteractive,
  classNameScrollbarRtl,
} from '~/classnames';
import type {
  ScrollbarsSetupElementsObj,
  ScrollbarStructure,
} from '~/setups/scrollbarsSetup/scrollbarsSetup.elements';
import type { StructureSetupUpdateHints } from '~/setups/structureSetup/structureSetup.update';
import type {
  ReadonlyOptions,
  ScrollbarsVisibilityBehavior,
  ScrollbarsAutoHideBehavior,
} from '~/options';
import type { Setup, StructureSetupState, StructureSetupStaticState } from '~/setups';
import type { InitializationTarget } from '~/initialization';
import type { DeepPartial, OverflowStyle, StyleObject } from '~/typings';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ScrollbarsSetupState {}

export interface ScrollbarsSetupStaticState {
  _elements: ScrollbarsSetupElementsObj;
  _appendElements: () => void;
}

export const createScrollbarsSetup = (
  target: InitializationTarget,
  options: ReadonlyOptions,
  structureSetupState: (() => StructureSetupState) & StructureSetupStaticState,
  onScroll: (event: Event) => void
): Setup<
  ScrollbarsSetupState,
  ScrollbarsSetupStaticState,
  [DeepPartial<StructureSetupUpdateHints>]
> => {
  let autoHideIsMove: boolean;
  let autoHideIsLeave: boolean;
  let autoHideNotNever: boolean;
  let mouseInHost: boolean | undefined;
  let prevTheme: string | null | undefined;
  let globalAutoHideDelay = 0;

  const state = createState({});
  const [getState] = state;
  const [requestMouseMoveAnimationFrame, cancelMouseMoveAnimationFrame] = selfClearTimeout();
  const [requestScrollAnimationFrame, cancelScrollAnimationFrame] = selfClearTimeout();
  const [scrollTimeout, clearScrollTimeout] = selfClearTimeout(100);
  const [auotHideMoveTimeout, clearAutoHideTimeout] = selfClearTimeout(100);
  const [auotHideTimeout, clearAutoTimeout] = selfClearTimeout(() => globalAutoHideDelay);
  const [elements, appendElements, destroyElements] = createScrollbarsSetupElements(
    target,
    structureSetupState._elements,
    createScrollbarsSetupEvents(options, structureSetupState)
  );
  const {
    _host,
    _viewport,
    _scrollOffsetElement,
    _scrollEventElement,
    _viewportIsTarget,
    _isBody,
  } = structureSetupState._elements;
  const {
    _horizontal,
    _vertical,
    _scrollbarsAddRemoveClass,
    _refreshScrollbarsHandleLength,
    _refreshScrollbarsHandleOffset,
  } = elements;
  const { _handleStyle: styleHorizontal } = _horizontal;
  const { _handleStyle: styleVertical } = _vertical;
  const styleScrollbarPosition = (structure: ScrollbarStructure) => {
    const { _scrollbar } = structure;
    const elm = _viewportIsTarget && !_isBody && parent(_scrollbar) === _viewport && _scrollbar;
    return [
      elm,
      {
        transform: elm
          ? `translate(${scrollLeft(_scrollOffsetElement)}px, ${scrollTop(_scrollOffsetElement)}px)`
          : '',
      },
    ] as [HTMLElement | false, StyleObject];
  };
  const manageScrollbarsAutoHide = (removeAutoHide: boolean, delayless?: boolean) => {
    clearAutoTimeout();
    if (removeAutoHide) {
      _scrollbarsAddRemoveClass(classNameScrollbarAutoHidden);
    } else {
      const hide = () => _scrollbarsAddRemoveClass(classNameScrollbarAutoHidden, true);
      if (globalAutoHideDelay > 0 && !delayless) {
        auotHideTimeout(hide);
      } else {
        hide();
      }
    }
  };
  const onHostMouseEnter = () => {
    mouseInHost = autoHideIsLeave;
    mouseInHost && manageScrollbarsAutoHide(true);
  };

  const destroyFns: (() => void)[] = [
    clearScrollTimeout,
    clearAutoTimeout,
    clearAutoHideTimeout,
    cancelScrollAnimationFrame,
    cancelMouseMoveAnimationFrame,
    destroyElements,

    on(_host, 'pointerover', onHostMouseEnter, { _once: true }),
    on(_host, 'pointerenter', onHostMouseEnter),
    on(_host, 'pointerleave', () => {
      mouseInHost = false;
      autoHideIsLeave && manageScrollbarsAutoHide(false);
    }),
    on(_host, 'pointermove', () => {
      autoHideIsMove &&
        requestMouseMoveAnimationFrame(() => {
          clearScrollTimeout();
          manageScrollbarsAutoHide(true);
          auotHideMoveTimeout(() => {
            autoHideIsMove && manageScrollbarsAutoHide(false);
          });
        });
    }),
    on(_scrollEventElement, 'scroll', (event) => {
      requestScrollAnimationFrame(() => {
        _refreshScrollbarsHandleOffset(structureSetupState());

        autoHideNotNever && manageScrollbarsAutoHide(true);
        scrollTimeout(() => {
          autoHideNotNever && !mouseInHost && manageScrollbarsAutoHide(false);
        });
      });

      onScroll(event);

      _viewportIsTarget && styleHorizontal(styleScrollbarPosition);
      _viewportIsTarget && styleVertical(styleScrollbarPosition);
    }),
  ];
  const scrollbarsSetupState = getState.bind(0) as (() => ScrollbarsSetupState) &
    ScrollbarsSetupStaticState;
  scrollbarsSetupState._elements = elements;
  scrollbarsSetupState._appendElements = appendElements;

  return [
    (changedOptions, force, structureUpdateHints) => {
      const {
        _overflowEdgeChanged,
        _overflowAmountChanged,
        _overflowStyleChanged,
        _directionChanged,
      } = structureUpdateHints;
      const { _nativeScrollbarsOverlaid } = getEnvironment();
      const checkOption = createOptionCheck(options, changedOptions, force);
      const currStructureSetupState = structureSetupState();
      const { _overflowAmount, _overflowStyle, _directionIsRTL } = currStructureSetupState;
      const [showNativeOverlaidScrollbarsOption, showNativeOverlaidScrollbarsChanged] =
        checkOption<boolean>('showNativeOverlaidScrollbars');
      const [theme, themeChanged] = checkOption<string | null>('scrollbars.theme');
      const [visibility, visibilityChanged] =
        checkOption<ScrollbarsVisibilityBehavior>('scrollbars.visibility');
      const [autoHide, autoHideChanged] =
        checkOption<ScrollbarsAutoHideBehavior>('scrollbars.autoHide');
      const [autoHideDelay] = checkOption<number>('scrollbars.autoHideDelay');
      const [dragScroll, dragScrollChanged] = checkOption<boolean>('scrollbars.dragScroll');
      const [clickScroll, clickScrollChanged] = checkOption<boolean>('scrollbars.clickScroll');

      const updateHandle = _overflowEdgeChanged || _overflowAmountChanged || _directionChanged;
      const updateVisibility = _overflowStyleChanged || visibilityChanged;
      const showNativeOverlaidScrollbars =
        showNativeOverlaidScrollbarsOption &&
        _nativeScrollbarsOverlaid.x &&
        _nativeScrollbarsOverlaid.y;

      const setScrollbarVisibility = (overflowStyle: OverflowStyle, isHorizontal: boolean) => {
        const isVisible =
          visibility === 'visible' || (visibility === 'auto' && overflowStyle === 'scroll');
        _scrollbarsAddRemoveClass(classNameScrollbarVisible, isVisible, isHorizontal);
        return isVisible;
      };

      globalAutoHideDelay = autoHideDelay;

      if (showNativeOverlaidScrollbarsChanged) {
        _scrollbarsAddRemoveClass(classNameScrollbarThemeNone, showNativeOverlaidScrollbars);
      }
      if (themeChanged) {
        _scrollbarsAddRemoveClass(prevTheme);
        _scrollbarsAddRemoveClass(theme, true);

        prevTheme = theme;
      }
      if (autoHideChanged) {
        autoHideIsMove = autoHide === 'move';
        autoHideIsLeave = autoHide === 'leave';
        autoHideNotNever = autoHide !== 'never';
        manageScrollbarsAutoHide(!autoHideNotNever, true);
      }
      if (dragScrollChanged) {
        _scrollbarsAddRemoveClass(classNameScrollbarHandleInteractive, dragScroll);
      }
      if (clickScrollChanged) {
        _scrollbarsAddRemoveClass(classNameScrollbarTrackInteractive, clickScroll);
      }
      if (updateVisibility) {
        const xVisible = setScrollbarVisibility(_overflowStyle.x, true);
        const yVisible = setScrollbarVisibility(_overflowStyle.y, false);
        const hasCorner = xVisible && yVisible;

        _scrollbarsAddRemoveClass(classNameScrollbarCornerless, !hasCorner);
      }
      if (updateHandle) {
        _refreshScrollbarsHandleLength(currStructureSetupState);
        _refreshScrollbarsHandleOffset(currStructureSetupState);

        _scrollbarsAddRemoveClass(classNameScrollbarUnusable, !_overflowAmount.x, true);
        _scrollbarsAddRemoveClass(classNameScrollbarUnusable, !_overflowAmount.y, false);
        _scrollbarsAddRemoveClass(classNameScrollbarRtl, _directionIsRTL && !_isBody);
      }
    },
    scrollbarsSetupState,
    runEachAndClear.bind(0, destroyFns),
  ];
};
