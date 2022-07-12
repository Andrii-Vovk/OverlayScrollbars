import { hasClass, isFunction, isHTMLElement } from 'support';
import { dataAttributeHost } from 'classnames';
import { InternalEnvironment } from 'environment';
import {
  createStructureSetupElements,
  StructureSetupElementsObj,
} from 'setups/structureSetup/structureSetup.elements';
import type { InitializationTarget, InitializtationElementStrategy } from 'initialization';
import type {
  StructureInitialization,
  StructureStaticInitializationElement,
  StructureDynamicInitializationElement,
} from 'setups/structureSetup/structureSetup.initialization';

const mockGetEnvironment = jest.fn();
jest.mock('environment', () => ({
  getEnvironment: jest.fn().mockImplementation(() => mockGetEnvironment()),
}));

jest.mock('support/compatibility/apis', () => {
  const originalModule = jest.requireActual('support/compatibility/apis');
  return {
    ...originalModule,
    ResizeObserverConstructor: true,
  };
});

interface StructureSetupElementsProxy {
  input: InitializationTarget;
  elements: StructureSetupElementsObj;
  destroy: () => void;
}

const textareaId = 'textarea';
const textareaHostId = 'host';
const elementId = 'target';
const dynamicContent = 'text<p>paragraph</p>';
const textareaContent = `<textarea id="${textareaId}">text</textarea>`;
const getSnapshot = () => document.body.innerHTML;
const getTarget = (textarea?: boolean) =>
  document.getElementById(textarea ? textareaId : elementId)!;
const fillBody = (textarea?: boolean, customDOM?: (content: string, hostId: string) => string) => {
  document.body.innerHTML = `
    <nav></nav>
    ${
      customDOM
        ? customDOM(
            textarea ? textareaContent : dynamicContent,
            textarea ? textareaHostId : elementId
          )
        : textarea
        ? textareaContent
        : `<div id="${elementId}">${dynamicContent}</div>`
    }
    <footer></footer>
  `;
  return getSnapshot();
};
const clearBody = () => {
  document.body.innerHTML = '';
};

const getElements = (textarea?: boolean) => {
  const target = getTarget(textarea);
  const host = document.querySelector('[data-overlayscrollbars]')!;
  const padding = document.querySelector('.os-padding')!;
  const viewport = document.querySelector('.os-viewport')!;
  const content = document.querySelector('.os-content')!;

  return {
    target,
    host,
    padding,
    viewport,
    content,
  };
};

const assertCorrectDOMStructure = (textarea: boolean, viewportIsTarget: boolean) => {
  const { target, host, padding, viewport, content } = getElements(textarea);

  if (viewportIsTarget) {
    expect(target).toBe(host);
    expect(host).toBeTruthy();
    expect(padding).toBeFalsy();
    expect(viewport).toBeFalsy();
    expect(content).toBeFalsy();
  } else {
    expect(host).toBeTruthy();
    expect(viewport).toBeTruthy();
    expect(viewport.parentElement).toBe(padding || host);

    if (content) {
      expect(content.parentElement).toBe(viewport);
    }
    if (padding) {
      expect(padding.parentElement).toBe(host);
    }

    expect(host.parentElement).toBe(document.body);
    expect(host.previousElementSibling).toBe(document.querySelector('nav'));
    expect(host.nextElementSibling).toBe(document.querySelector('footer'));

    const contentElm = content || viewport;
    if (textarea) {
      expect(target.parentElement).toBe(contentElm);
      expect(contentElm.innerHTML).toBe(textareaContent);
    } else {
      expect(target).toBe(host);
      expect(contentElm.innerHTML).toBe(dynamicContent);
    }
  }
};

const createStructureSetupProxy = (
  target: InitializationTarget | StructureInitialization
): StructureSetupElementsProxy => {
  const [elements, appendElements, destroy] = createStructureSetupElements(target);
  appendElements();
  return {
    input: target,
    elements,
    destroy,
  };
};

const assertCorrectSetupElements = (
  textarea: boolean,
  setupElementsProxy: StructureSetupElementsProxy,
  environment: InternalEnvironment
): [StructureSetupElementsObj, () => void] => {
  const { input, elements, destroy } = setupElementsProxy;
  const {
    _target,
    _host,
    _padding,
    _viewport,
    _content,
    _viewportIsTarget,
    _viewportHasClass,
    _viewportAddRemoveClass,
  } = elements;
  const { target, host, padding, viewport, content } = getElements(textarea);
  const isTextarea = target.matches('textarea');
  const isBody = target.matches('body');

  expect(textarea).toBe(isTextarea);

  expect(_target).toBe(target);
  expect(_host).toBe(host);

  if (_viewportIsTarget) {
    expect(padding).toBeFalsy();
    expect(_padding).toBeFalsy();
  } else if (padding || _padding) {
    expect(_padding).toBe(padding);
  } else {
    expect(padding).toBeFalsy();
    expect(_padding).toBeFalsy();
  }

  if (_viewportIsTarget) {
    expect(_viewport).toBe(_target);
  } else if (viewport || _viewport) {
    expect(_viewport).toBe(viewport);
  } else {
    expect(viewport).toBeFalsy();
    expect(_viewport).toBeFalsy();
  }

  if (_viewportIsTarget) {
    expect(content).toBeFalsy();
    expect(_content).toBeFalsy();
  } else if (content || _content) {
    expect(_content).toBe(content);
  } else {
    expect(content).toBeFalsy();
    expect(_content).toBeFalsy();
  }

  const { _isTextarea, _isBody, _bodyElm, _htmlElm, _documentElm, _windowElm } = elements;

  expect(_isTextarea).toBe(isTextarea);
  expect(_isBody).toBe(isBody);
  expect(_windowElm).toBe(document.defaultView);
  expect(_documentElm).toBe(document);
  expect(_htmlElm).toBe(document.body.parentElement);
  expect(_bodyElm).toBe(document.body);

  expect(typeof destroy).toBe('function');

  const { _nativeScrollbarStyling, _cssCustomProperties, _getInitializationStrategy } = environment;
  const {
    _host: hostInitStrategy,
    _viewport: viewportInitStrategy,
    _padding: paddingInitStrategy,
    _content: contentInitStrategy,
  } = _getInitializationStrategy();
  const inputIsElement = isHTMLElement(input);
  const inputAsObj = input as StructureInitialization;
  const styleElm = document.querySelector('style');
  const checkStrategyDependendElements = (
    elm: Element | null,
    inputStrategy: StructureStaticInitializationElement | StructureDynamicInitializationElement,
    isStaticStrategy: boolean,
    strategy:
      | InitializtationElementStrategy<StructureStaticInitializationElement>
      | InitializtationElementStrategy<StructureDynamicInitializationElement>,
    kind: 'padding' | 'viewport' | 'content' | 'host'
  ) => {
    const input = isFunction(inputStrategy) ? inputStrategy(target) : inputStrategy;
    if (input) {
      if (!_viewportIsTarget) {
        expect(elm).toBeTruthy();
      }
    } else {
      if (input === false) {
        expect(elm).toBeFalsy();
      }
      if (input === undefined) {
        if (isStaticStrategy) {
          strategy =
            strategy as InitializtationElementStrategy<StructureStaticInitializationElement>;
          if (typeof strategy === 'function') {
            const result = strategy(target);
            if (_viewportIsTarget) {
              if (kind === 'host') {
                expect(elm).toBeTruthy();
              } else {
                expect(elm).toBeFalsy();
              }
            } else if (result && !isTextarea) {
              expect(result).toBe(elm);
            } else {
              expect(elm).toBeTruthy();
            }
          } else {
            expect(elm).toBeTruthy();
          }
        } else {
          strategy =
            strategy as InitializtationElementStrategy<StructureDynamicInitializationElement>;

          if (typeof strategy === 'function') {
            const result = strategy(target);
            const resultIsBoolean = typeof result === 'boolean';
            if (_viewportIsTarget) {
              if (kind === 'host') {
                expect(elm).toBeTruthy();
              } else {
                expect(elm).toBeFalsy();
              }
            } else if (resultIsBoolean) {
              if (result) {
                expect(elm).toBeTruthy();
              } else {
                expect(elm).toBeFalsy();
              }
            } else if (result) {
              expect(elm).toBe(result);
            }
          } else {
            const strategyIsBoolean = typeof strategy === 'boolean';
            if (strategyIsBoolean) {
              if (strategy) {
                expect(elm).toBeTruthy();
              } else {
                expect(elm).toBeFalsy();
              }
            }
          }
        }
      }
    }
  };

  if (_nativeScrollbarStyling || _cssCustomProperties) {
    expect(styleElm).toBeFalsy();
  } else {
    expect(styleElm).toBeTruthy();
  }

  if (inputIsElement) {
    checkStrategyDependendElements(padding, undefined, false, paddingInitStrategy, 'padding');
    checkStrategyDependendElements(content, undefined, false, contentInitStrategy, 'content');
    checkStrategyDependendElements(viewport, undefined, true, viewportInitStrategy, 'viewport');
    checkStrategyDependendElements(host, undefined, true, hostInitStrategy, 'host');
  } else {
    const {
      padding: inputPadding,
      content: inputContent,
      viewport: inputViewport,
      host: inputHost,
    } = inputAsObj;
    checkStrategyDependendElements(padding, inputPadding, false, paddingInitStrategy, 'padding');
    checkStrategyDependendElements(content, inputContent, false, contentInitStrategy, 'content');
    checkStrategyDependendElements(viewport, inputViewport, true, viewportInitStrategy, 'viewport');
    checkStrategyDependendElements(host, inputHost, true, hostInitStrategy, 'host');
  }

  const className = 'clazz';
  const attrName = 'attr';

  _viewportAddRemoveClass(className, attrName, true);
  if (_viewportIsTarget) {
    expect(_host.getAttribute(dataAttributeHost)!.indexOf(attrName) >= 0).toBe(true);
    expect(_viewportHasClass('', attrName)).toBe(true);
  } else {
    expect(hasClass(_viewport, className)).toBe(true);
    expect(_viewportHasClass(className, '')).toBe(true);
  }
  _viewportAddRemoveClass(className, attrName);
  if (_viewportIsTarget) {
    expect(_host.getAttribute(dataAttributeHost)!.indexOf(attrName) >= 0).toBe(false);
    expect(_viewportHasClass('', attrName)).toBe(false);
  } else {
    expect(hasClass(_viewport, className)).toBe(false);
    expect(_viewportHasClass(className, '')).toBe(false);
  }

  return [elements, destroy];
};

const assertCorrectDestroy = (snapshot: string, destroy: () => void) => {
  destroy();

  // remove empty class attr
  const elms = document.querySelectorAll('*');
  Array.from(elms).forEach((elm) => {
    const classAttr = elm.getAttribute('class');
    if (classAttr === '') {
      elm.removeAttribute('class');
    }
  });

  expect(snapshot).toBe(getSnapshot());
};

const env: InternalEnvironment = jest.requireActual('environment').getEnvironment();
const envDefault = {
  name: 'default',
  env,
};
const envNativeScrollbarStyling = {
  name: 'native scrollbar styling',
  env: {
    ...env,
    _nativeScrollbarStyling: true,
  },
};
const envCssCustomProperties = {
  name: 'custom css properties',
  env: {
    ...env,
    _cssCustomProperties: true,
  },
};
const envInitStrategyMin = {
  name: 'initialization strategy min',
  env: {
    ...env,
    _getInitializationStrategy: () => ({
      _host: null,
      _viewport: () => null,
      _content: () => false,
      _padding: false,
    }),
  },
};
const envInitStrategyMax = {
  name: 'initialization strategy max',
  env: {
    ...env,
    _getInitializationStrategy: () => ({
      _host: null,
      _viewport: null,
      _content: true,
      _padding: () => true,
    }),
  },
};
const envInitStrategyAssigned = {
  name: 'initialization strategy assigned',
  env: {
    ...env,
    _getInitializationStrategy: () => ({
      _host: () => document.querySelector('#host1') as HTMLElement,
      _viewport: (target: HTMLElement) => target.querySelector('#viewport') as HTMLElement,
      _content: (target: HTMLElement) => target.querySelector<HTMLElement>('#content'),
      _padding: (target: HTMLElement) => target.querySelector<HTMLElement>('#padding'),
    }),
  },
};
const envInitStrategyViewportIsTarget = {
  name: 'initialization strategy assigned',
  env: {
    ...env,
    _nativeScrollbarStyling: true,
    _getInitializationStrategy: () => ({
      _viewport: (target: HTMLElement) => target,
    }),
  },
};

describe('structureSetup', () => {
  afterEach(() => clearBody());

  [
    envDefault,
    envNativeScrollbarStyling,
    envCssCustomProperties,
    envInitStrategyMin,
    envInitStrategyMax,
    envInitStrategyAssigned,
    envInitStrategyViewportIsTarget,
  ].forEach((envWithName) => {
    const { env: currEnv, name } = envWithName;
    describe(`Environment: ${name}`, () => {
      beforeAll(() => {
        mockGetEnvironment.mockImplementation(() => currEnv);
      });

      [false, true].forEach((isTextarea) => {
        describe(isTextarea ? 'textarea' : 'element', () => {
          describe('basic', () => {
            test('Element', () => {
              const snapshot = fillBody(isTextarea);
              const [elements, destroy] = assertCorrectSetupElements(
                isTextarea,
                createStructureSetupProxy(getTarget(isTextarea)),
                currEnv
              );
              assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
              assertCorrectDestroy(snapshot, destroy);
            });

            test('Object', () => {
              const snapshot = fillBody(isTextarea);
              const [elements, destroy] = assertCorrectSetupElements(
                isTextarea,
                createStructureSetupProxy({ target: getTarget(isTextarea) }),
                currEnv
              );
              assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
              assertCorrectDestroy(snapshot, destroy);
            });
          });

          describe('complex', () => {
            describe('single assigned', () => {
              test('padding', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="padding">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: () => document.querySelector<HTMLElement>('#padding')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: () => document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('content', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="content">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    content: document.querySelector<HTMLElement>('#content')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });
            });

            describe('multiple assigned', () => {
              test('padding viewport content', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="padding"><div id="viewport"><div id="content">${content}</div></div></div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: document.querySelector<HTMLElement>('#padding')!,
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                    content: () => document.querySelector<HTMLElement>('#content')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('padding viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="padding"><div id="viewport">${content}</div></div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: () => document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: document.querySelector<HTMLElement>('#padding')!,
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('padding content', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="padding"><div id="content">${content}</div></div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: () => document.querySelector<HTMLElement>('#padding')!,
                    content: document.querySelector<HTMLElement>('#content')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('viewport content', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport"><div id="content">${content}</div></div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                    content: () => document.querySelector<HTMLElement>('#content')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });
            });

            describe('single false', () => {
              test('padding', () => {
                const snapshot = fillBody(isTextarea);
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    target: getTarget(isTextarea),
                    padding: false,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('content', () => {
                const snapshot = fillBody(isTextarea);
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    target: getTarget(isTextarea),
                    content: () => false,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });
            });

            describe('single true', () => {
              test('padding', () => {
                const snapshot = fillBody(isTextarea);
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    target: getTarget(isTextarea),
                    padding: () => true,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('content', () => {
                const snapshot = fillBody(isTextarea);
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    target: getTarget(isTextarea),
                    content: true,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });
            });

            describe('multiple false', () => {
              test('padding & content', () => {
                const snapshot = fillBody(isTextarea);
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    target: getTarget(isTextarea),
                    padding: false,
                    content: false,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });
            });

            describe('multiple true', () => {
              test('padding & content', () => {
                const snapshot = fillBody(isTextarea);
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    target: getTarget(isTextarea),
                    padding: true,
                    content: true,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });
            });

            describe('mixed', () => {
              test('false: padding & content | assigned: viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: false,
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                    content: false,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('true: padding & content | assigned: viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: true,
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                    content: true,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('true: content | false: padding | assigned: viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: () => false,
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                    content: () => true,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('true: padding | false: content | assigned: viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: true,
                    viewport: () => document.querySelector<HTMLElement>('#viewport')!,
                    content: false,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('false: padding | assigned: content', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="content">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: false,
                    content: document.querySelector<HTMLElement>('#content')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('true: padding | assigned: content', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="content">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: true,
                    content: document.querySelector<HTMLElement>('#content')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('false: padding | assigned: viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: () => false,
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('true: padding | assigned: viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: true,
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('false: padding | assigned: viewport & content', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport"><div id="content">${content}</div></div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                    padding: false,
                    content: () => document.querySelector<HTMLElement>('#content')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('true: padding | assigned: viewport & content', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport"><div id="content">${content}</div></div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    viewport: () => document.querySelector<HTMLElement>('#viewport')!,
                    padding: true,
                    content: document.querySelector<HTMLElement>('#content')!,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('false: content | assigned: padding', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="padding">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: document.querySelector<HTMLElement>('#padding')!,
                    content: false,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('true: content | assigned: padding', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="padding">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: () => document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: document.querySelector<HTMLElement>('#padding')!,
                    content: true,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('false: content | assigned: viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    viewport: () => document.querySelector<HTMLElement>('#viewport')!,
                    content: false,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('true: content | assigned: viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="viewport">${content}</div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                    content: true,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('false: content | assigned: padding & viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="padding"><div id="viewport">${content}</div></div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: () => document.querySelector<HTMLElement>('#padding')!,
                    viewport: document.querySelector<HTMLElement>('#viewport')!,
                    content: () => false,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });

              test('true: content | assigned: padding & viewport', () => {
                const snapshot = fillBody(
                  isTextarea,
                  (content, hostId) =>
                    `<div id="${hostId}"><div id="padding"><div id="viewport">${content}</div></div></div>`
                );
                const [elements, destroy] = assertCorrectSetupElements(
                  isTextarea,
                  createStructureSetupProxy({
                    host: () => document.querySelector<HTMLElement>('#host')!,
                    target: getTarget(isTextarea),
                    padding: document.querySelector<HTMLElement>('#padding')!,
                    viewport: () => document.querySelector<HTMLElement>('#viewport')!,
                    content: true,
                  }),
                  currEnv
                );
                assertCorrectDOMStructure(isTextarea, elements._viewportIsTarget);
                assertCorrectDestroy(snapshot, destroy);
              });
            });
          });
        });
      });
    });
  });
});
