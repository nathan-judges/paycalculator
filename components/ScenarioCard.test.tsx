/**
 * ScenarioCard — component tests.
 *
 * Tests rendering, expand/collapse, store interaction, and net pay updates.
 * Uses the real Zustand store (reset before each test).
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useComparisonStore } from '@/store/comparisonStore';
import { ScenarioCard } from './ScenarioCard';

/**
 * Reset store to defaults before each test.
 * We use the store's setState to ensure a clean slate.
 */
beforeEach(() => {
  act(() => {
    useComparisonStore.setState({
      version: 1,
      displayFrequency: 'annual',
      financialYear: '2025-26',
      scenarios: [
        {
          id: 's1',
          label: 'Current salary',
          salary: 90_000,
          superInclusive: false,
          hasHecs: false,
          hasPrivateHealth: false,
        },
      ],
    });
  });
});

describe('ScenarioCard', () => {
  it('renders the scenario label and formatted salary', () => {
    render(<ScenarioCard scenarioId="s1" />);

    expect(screen.getByText('Current salary')).toBeInTheDocument();
    expect(screen.getByText('$90,000')).toBeInTheDocument();
  });

  it('displays the net take-home pay', () => {
    render(<ScenarioCard scenarioId="s1" />);

    const netPay = screen.getByTestId('net-pay');
    expect(netPay).toBeInTheDocument();
    // Should show a dollar amount (we don't check exact value — that's the engine's job)
    expect(netPay.textContent).toMatch(/\$[\d,]+/);
  });

  it('shows an Edit button that expands the card', async () => {
    const user = userEvent.setup();
    render(<ScenarioCard scenarioId="s1" />);

    // Card should start collapsed (no expanded inputs)
    expect(screen.queryByTestId('expanded-inputs')).not.toBeInTheDocument();

    // Click Edit
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Expanded view should now be visible
    expect(screen.getByTestId('expanded-inputs')).toBeInTheDocument();
  });

  it('shows all toggle switches when expanded', async () => {
    const user = userEvent.setup();
    render(<ScenarioCard scenarioId="s1" />);

    await user.click(screen.getByRole('button', { name: /edit/i }));

    // Check toggles exist
    expect(
      screen.getByRole('switch', { name: /salary includes super/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: /hecs-help debt/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: /private health insurance/i }),
    ).toBeInTheDocument();
  });

  it('updates the store when a toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<ScenarioCard scenarioId="s1" />);

    // Expand
    await user.click(screen.getByRole('button', { name: /edit/i }));

    // Toggle HECS
    const hecsToggle = screen.getByRole('switch', { name: /hecs-help debt/i });
    await user.click(hecsToggle);

    // Check store was updated
    const storeState = useComparisonStore.getState();
    const scenario = storeState.scenarios.find((s) => s.id === 's1');
    expect(scenario?.hasHecs).toBe(true);
  });

  it('updates net pay when salary changes', async () => {
    render(<ScenarioCard scenarioId="s1" />);

    // Get initial net pay
    const netPayEl = screen.getByTestId('net-pay');
    const initialText = netPayEl.textContent;

    // Update salary via the store directly (since salary input blur is complex)
    act(() => {
      useComparisonStore.getState().updateScenario('s1', { salary: 120_000 });
    });

    // Net pay should change
    expect(netPayEl.textContent).not.toBe(initialText);
  });

  it('collapses when the Done button is clicked', async () => {
    const user = userEvent.setup();
    render(<ScenarioCard scenarioId="s1" />);

    // Expand
    await user.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByTestId('expanded-inputs')).toBeInTheDocument();

    // Collapse
    await user.click(screen.getByRole('button', { name: /collapse/i }));
    expect(screen.queryByTestId('expanded-inputs')).not.toBeInTheDocument();
  });

  it('returns null for a non-existent scenario', () => {
    const { container } = render(<ScenarioCard scenarioId="s2" />);
    expect(container.firstChild).toBeNull();
  });
});
