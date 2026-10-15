import { describe, it, expect } from 'vitest';
import { decideScrollCollapse } from '../useScrollCollapse';

const THRESHOLDS = {
  hideAfter: 200,
  hideDelta: 100,
  showDelta: 80,
  teleportThreshold: 250,
};

function simulate(
  ys: number[],
  start: { startY: number; peakY: number; lastY: number }
) {
  let { startY, peakY, lastY } = start;
  let toggle: 'hide' | 'show' | null = null;
  for (const y of ys) {
    const decision = decideScrollCollapse(
      { y, frameDelta: y - lastY, startY, peakY },
      THRESHOLDS
    );
    startY = decision.startY;
    peakY = decision.peakY;
    lastY = y;
    if (decision.toggle) toggle = decision.toggle;
  }
  return { startY, peakY, toggle };
}

describe('decideScrollCollapse', () => {
  it('mantiene visible y reinicia referencias cerca del tope', () => {
    const decision = decideScrollCollapse(
      { y: 180, frameDelta: -30, startY: 240, peakY: 260 },
      THRESHOLDS
    );
    expect(decision.toggle).toBe('show');
    expect(decision.startY).toBe(180);
    expect(decision.peakY).toBe(180);
  });

  it('oculta tras un arrastre sostenido hacia abajo', () => {
    const { toggle } = simulate(
      [310, 330, 350, 370, 390, 400],
      { startY: 300, peakY: 300, lastY: 300 }
    );
    expect(toggle).toBe('hide');
  });

  it('no oculta si el arrastre hacia abajo es menor al umbral', () => {
    const { toggle } = simulate([350, 370, 390], {
      startY: 300,
      peakY: 300,
      lastY: 300,
    });
    expect(toggle).toBeNull();
  });

  it('ignora el jitter de pocos píxeles típico del scroll táctil', () => {
    const { toggle } = simulate(
      [403, 398, 404, 399, 405, 400, 406, 401],
      { startY: 400, peakY: 400, lastY: 400 }
    );
    expect(toggle).toBeNull();
  });

  it('acumula el gesto aunque haya micro-reversiones', () => {
    const { toggle } = simulate(
      [512, 520, 517, 530, 528, 545, 560, 575, 590, 601],
      { startY: 500, peakY: 500, lastY: 500 }
    );
    expect(toggle).toBe('hide');
  });

  it('muestra tras un arrastre sostenido hacia arriba desde el pico', () => {
    const { toggle } = simulate(
      [795, 780, 760, 740, 725, 715],
      { startY: 800, peakY: 800, lastY: 800 }
    );
    expect(toggle).toBe('show');
  });

  it('no muestra si el rebote hacia arriba es menor al umbral', () => {
    const { toggle } = simulate([790, 770, 750, 730], {
      startY: 800,
      peakY: 800,
      lastY: 800,
    });
    expect(toggle).toBeNull();
  });

  it('re-baselinea sin alternar ante un salto programático', () => {
    const decision = decideScrollCollapse(
      { y: 1500, frameDelta: 1200, startY: 300, peakY: 300 },
      THRESHOLDS
    );
    expect(decision.toggle).toBeNull();
    expect(decision.startY).toBe(1500);
    expect(decision.peakY).toBe(1500);
  });

  it('reinicia las referencias en el punto de alternancia', () => {
    const decision = decideScrollCollapse(
      { y: 400, frameDelta: 10, startY: 300, peakY: 390 },
      THRESHOLDS
    );
    expect(decision.toggle).toBe('hide');
    expect(decision.startY).toBe(400);
    expect(decision.peakY).toBe(400);
  });
});