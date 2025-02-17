import { useState } from 'react';
import { describe, test, afterEach, expect, vitest, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverlayScrollbars } from 'overlayscrollbars';
import { OverlayScrollbarsComponent } from '~/overlayscrollbars-react';
import type { RefObject } from 'react';
import type { OverlayScrollbarsComponentRef } from '~/overlayscrollbars-react';

vi.useFakeTimers({
  toFake: [
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'requestIdleCallback',
    'cancelIdleCallback',
  ],
});

describe('OverlayScrollbarsComponent', () => {
  afterEach(() => cleanup());

  describe('correct rendering', () => {
    test('correct root element with instance', () => {
      const elementA = 'code';
      const elementB = 'span';
      let osInstance;
      const { container, rerender } = render(<OverlayScrollbarsComponent />);

      expect(container).not.toBeEmptyDOMElement();
      expect(container.querySelector('div')).toBe(container.firstElementChild); // default is div

      expect(OverlayScrollbars.valid(osInstance)).toBe(false);
      osInstance = OverlayScrollbars(container.firstElementChild as HTMLElement);
      expect(osInstance).toBeDefined();
      expect(OverlayScrollbars.valid(osInstance)).toBe(true);

      rerender(<OverlayScrollbarsComponent element={elementA} />);
      expect(container.querySelector(elementA)).toBe(container.firstElementChild);

      expect(OverlayScrollbars.valid(osInstance)).toBe(false); // prev instance is destroyed
      osInstance = OverlayScrollbars(container.firstElementChild as HTMLElement);
      expect(osInstance).toBeDefined();
      expect(OverlayScrollbars.valid(osInstance)).toBe(true);

      rerender(<OverlayScrollbarsComponent element={elementB} />);
      expect(container.querySelector(elementB)).toBe(container.firstElementChild);

      expect(OverlayScrollbars.valid(osInstance)).toBe(false); // prev instance is destroyed
      osInstance = OverlayScrollbars(container.firstElementChild as HTMLElement);
      expect(osInstance).toBeDefined();
      expect(OverlayScrollbars.valid(osInstance)).toBe(true);
    });

    test('data-overlayscrollbars-initialize', async () => {
      const { container } = render(<OverlayScrollbarsComponent />);

      expect(container.querySelector('[data-overlayscrollbars-initialize]')).toBeTruthy();
    });

    test('children', () => {
      const { container } = render(
        <OverlayScrollbarsComponent>
          hello <span>react</span>
        </OverlayScrollbarsComponent>
      );
      expect(screen.getByText(/hello/)).toBeInTheDocument();
      expect(screen.getByText(/react/)).toBeInTheDocument();
      expect(screen.getByText(/react/).parentElement).not.toBe(container.firstElementChild);
    });

    test('dynamic children', async () => {
      const Test = () => {
        const [elements, setElements] = useState(1);
        return (
          <>
            <OverlayScrollbarsComponent>
              {elements === 0 ? 'empty' : null}
              {[...Array(elements).keys()].map((i) => (
                <span key={i}>{i}</span>
              ))}
            </OverlayScrollbarsComponent>
            <button onClick={() => setElements((curr) => curr + 1)}>add</button>
            <button onClick={() => setElements((curr) => curr - 1)}>remove</button>
          </>
        );
      };
      render(<Test />);

      const addBtn = screen.getByText('add');
      const removeBtn = screen.getByText('remove');
      const initialElement = screen.getByText('0');
      expect(initialElement).toBeInTheDocument();

      const initialElementParent = initialElement.parentElement;
      expect(initialElementParent).toBeInTheDocument();

      userEvent.click(addBtn);
      expect((await screen.findByText('1')).parentElement).toBe(initialElementParent);

      userEvent.click(removeBtn);
      userEvent.click(removeBtn);
      expect(await screen.findByText('empty')).toBe(initialElementParent);
    });

    test('className', () => {
      const { container, rerender } = render(
        <OverlayScrollbarsComponent className="overlay scrollbars" />
      );

      expect(container.firstElementChild).toHaveClass('overlay', 'scrollbars');

      rerender(<OverlayScrollbarsComponent className="overlay scrollbars react" />);

      expect(container.firstElementChild).toHaveClass('overlay', 'scrollbars', 'react');
    });

    test('style', () => {
      const { container, rerender } = render(
        <OverlayScrollbarsComponent style={{ width: '22px' }} />
      );

      expect(container.firstElementChild).toHaveStyle({ width: '22px' });

      rerender(<OverlayScrollbarsComponent style={{ height: '33px' }} />);

      expect(container.firstElementChild).toHaveStyle({ height: '33px' });
    });
  });

  describe('deferred initialization', () => {
    test('basic defer', () => {
      const { container } = render(<OverlayScrollbarsComponent defer />);

      expect(OverlayScrollbars(container.firstElementChild! as HTMLElement)).toBeUndefined();

      vi.advanceTimersByTime(2000);

      expect(OverlayScrollbars(container.firstElementChild! as HTMLElement)).toBeDefined();
    });

    test('options defer', () => {
      const { container } = render(<OverlayScrollbarsComponent defer={{ timeout: 0 }} />);

      expect(OverlayScrollbars(container.firstElementChild! as HTMLElement)).toBeUndefined();

      vi.advanceTimersByTime(2000);

      expect(OverlayScrollbars(container.firstElementChild! as HTMLElement)).toBeDefined();
    });

    test('defer with unsupported Idle', () => {
      const original = window.requestIdleCallback;
      // @ts-ignore
      window.requestIdleCallback = undefined;

      const { container } = render(<OverlayScrollbarsComponent defer />);

      expect(OverlayScrollbars(container.firstElementChild! as HTMLElement)).toBeUndefined();

      vi.advanceTimersByTime(2000);

      expect(OverlayScrollbars(container.firstElementChild! as HTMLElement)).toBeDefined();

      window.requestIdleCallback = original;
    });
  });

  test('ref', () => {
    const ref: RefObject<OverlayScrollbarsComponentRef> = { current: null };
    const { container } = render(<OverlayScrollbarsComponent ref={ref} />);

    const { osInstance, getElement } = ref.current!;
    expect(osInstance).toBeTypeOf('function');
    expect(getElement).toBeTypeOf('function');
    expect(OverlayScrollbars.valid(osInstance())).toBe(true);
    expect(getElement()).toBe(container.firstElementChild);
  });

  test('options', () => {
    const ref: RefObject<OverlayScrollbarsComponentRef> = { current: null };
    const { rerender } = render(
      <OverlayScrollbarsComponent
        options={{ paddingAbsolute: true, overflow: { y: 'hidden' } }}
        ref={ref}
      />
    );
    const instance = ref.current!.osInstance()!;

    const opts = instance.options();
    expect(opts.paddingAbsolute).toBe(true);
    expect(opts.overflow.y).toBe('hidden');

    rerender(<OverlayScrollbarsComponent options={{ overflow: { x: 'hidden' } }} ref={ref} />);

    const newOpts = instance.options();
    expect(newOpts.paddingAbsolute).toBe(false); //switches back to default because its not specified in the new options
    expect(newOpts.overflow.x).toBe('hidden');
    expect(newOpts.overflow.y).toBe('scroll'); //switches back to default because its not specified in the new options

    // instance didn't change
    expect(instance).toBe(ref.current!.osInstance());

    rerender(
      <OverlayScrollbarsComponent
        element="span"
        options={{ overflow: { x: 'hidden', y: 'hidden' } }}
        ref={ref as any as RefObject<OverlayScrollbarsComponentRef<'span'>>}
      />
    );

    const newElementInstance = ref.current!.osInstance()!;
    const newElementNewOpts = newElementInstance.options();
    expect(newElementInstance).not.toBe(instance);
    expect(newElementNewOpts.paddingAbsolute).toBe(false);
    expect(newElementNewOpts.overflow.x).toBe('hidden');
    expect(newElementNewOpts.overflow.y).toBe('hidden');

    // reset options with `undefined`, `null`, `false` or `{}`
    rerender(
      <OverlayScrollbarsComponent
        element="span"
        options={undefined}
        ref={ref as any as RefObject<OverlayScrollbarsComponentRef<'span'>>}
      />
    );

    const resetOpts = newElementInstance.options();
    expect(newElementInstance).toBe(ref.current!.osInstance());
    expect(resetOpts.paddingAbsolute).toBe(false);
    expect(resetOpts.overflow.x).toBe('scroll');
    expect(resetOpts.overflow.y).toBe('scroll');
  });

  test('events', () => {
    const onUpdatedInitial = vitest.fn();
    const onUpdated = vitest.fn();
    const ref: RefObject<OverlayScrollbarsComponentRef> = { current: null };
    const { rerender } = render(
      <OverlayScrollbarsComponent events={{ updated: onUpdatedInitial }} ref={ref} />
    );
    const instance = ref.current!.osInstance()!;

    expect(onUpdatedInitial).toHaveBeenCalledTimes(1);

    rerender(<OverlayScrollbarsComponent events={{ updated: onUpdated }} ref={ref} />);

    expect(onUpdated).not.toHaveBeenCalled();

    instance.update(true);
    expect(onUpdatedInitial).toHaveBeenCalledTimes(1);
    expect(onUpdated).toHaveBeenCalledTimes(1);

    rerender(
      <OverlayScrollbarsComponent events={{ updated: [onUpdated, onUpdatedInitial] }} ref={ref} />
    );

    instance.update(true);
    expect(onUpdatedInitial).toHaveBeenCalledTimes(2);
    expect(onUpdated).toHaveBeenCalledTimes(2);

    // unregister with `[]`, `null` or `undefined`
    rerender(<OverlayScrollbarsComponent events={{ updated: null }} ref={ref} />);

    instance.update(true);
    expect(onUpdatedInitial).toHaveBeenCalledTimes(2);
    expect(onUpdated).toHaveBeenCalledTimes(2);

    // instance didn't change
    expect(instance).toBe(ref.current!.osInstance());

    rerender(
      <OverlayScrollbarsComponent
        element="span"
        events={{ updated: [onUpdated, onUpdatedInitial] }}
        ref={ref as any as RefObject<OverlayScrollbarsComponentRef<'span'>>}
      />
    );

    const newElementInstance = ref.current!.osInstance()!;
    expect(newElementInstance).not.toBe(instance);
    expect(onUpdatedInitial).toHaveBeenCalledTimes(3);
    expect(onUpdated).toHaveBeenCalledTimes(3);

    // reset events with `undefined`, `null`, `false` or `{}`
    rerender(
      <OverlayScrollbarsComponent
        element="span"
        events={undefined}
        ref={ref as any as RefObject<OverlayScrollbarsComponentRef<'span'>>}
      />
    );

    newElementInstance.update(true);
    expect(newElementInstance).toBe(ref.current!.osInstance());
    expect(onUpdatedInitial).toHaveBeenCalledTimes(3);
    expect(onUpdated).toHaveBeenCalledTimes(3);
  });

  test('destroy', () => {
    const ref: RefObject<OverlayScrollbarsComponentRef> = { current: null };
    const { unmount } = render(<OverlayScrollbarsComponent ref={ref} />);

    const { osInstance } = ref.current!;

    expect(OverlayScrollbars.valid(osInstance())).toBe(true);

    unmount();

    expect(osInstance()).toBeDefined();
    expect(OverlayScrollbars.valid(osInstance())).toBe(false);
  });
});
