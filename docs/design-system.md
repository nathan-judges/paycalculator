# Design System Additions

## SalaryInput

The `SalaryInput` component is the primary entry point for first-run interaction.

### Behaviour

- Always visible in the main flow.
- Uses an inline `$` affordance to communicate currency context.
- Formats values with `en-AU` thousands separators while storing raw numeric state in Zustand.
- Sanitises to digits only.

### Variants and states

- **Default**: neutral border, white background.
- **Hover**: subtle emphasis from surrounding container styles.
- **Focus**: indigo border + ring for WCAG-visible keyboard focus.
- **Error**: not currently used (future validation extension).

### Accessibility

- `type="text"` with `inputMode="numeric"` and `pattern="[0-9]*"`.
- Explicit label: "Annual salary".

## OnboardingTooltip

The `OnboardingTooltip` component provides first-visit guidance for salary editing.

### Behaviour

- Appears once per browser profile.
- Dismisses on first interaction (click, keypress, blur) or after 5 seconds.
- Persists dismissal via localStorage key `hasSeenSalaryTooltip`.

### Variants and states

- **Visible**: bordered indigo guidance card below salary input.
- **Dismissed**: removed from render tree.

### Accessibility

- Uses `role="tooltip"` and links target input via `aria-describedby`.
- Includes a keyboard-accessible dismiss button.
