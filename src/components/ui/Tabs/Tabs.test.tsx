import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabPanel, TabItem } from './Tabs';

describe('Tabs Component', () => {
  const items: TabItem[] = [
    { key: 'active', label: 'Active Projects', badge: 5 },
    { key: 'archived', label: 'Archived Projects', badge: 2 },
    { key: 'disabled', label: 'Disabled Tab', disabled: true },
  ];

  it('renders all tab items with labels and badges', () => {
    render(<Tabs items={items} activeKey="active" onChange={jest.fn()} />);

    expect(screen.getByRole('tab', { name: /active projects/i })).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /archived projects/i })).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /disabled tab/i })).toBeInTheDocument();
  });

  it('calls onChange with the key of the clicked tab', () => {
    const handleChange = jest.fn();
    render(<Tabs items={items} activeKey="active" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('tab', { name: /archived projects/i }));
    expect(handleChange).toHaveBeenCalledWith('archived');
  });

  it('does not trigger onChange when clicking a disabled tab', () => {
    const handleChange = jest.fn();
    render(<Tabs items={items} activeKey="active" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('tab', { name: /disabled tab/i }));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('sets appropriate aria attributes', () => {
    render(
      <Tabs items={items} activeKey="active" onChange={jest.fn()} ariaLabel="Project Views" />
    );

    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Project Views');

    const activeTab = screen.getByRole('tab', { name: /active projects/i });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    expect(activeTab).toHaveAttribute('tabIndex', '0');

    const inactiveTab = screen.getByRole('tab', { name: /archived projects/i });
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
    expect(inactiveTab).toHaveAttribute('tabIndex', '-1');

    const disabledTab = screen.getByRole('tab', { name: /disabled tab/i });
    expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
  });

  it('supports keyboard navigation with arrow keys, Home, and End', () => {
    const handleChange = jest.fn();
    render(<Tabs items={items} activeKey="active" onChange={handleChange} />);

    const activeTab = screen.getByRole('tab', { name: /active projects/i });

    // ArrowRight navigates to next enabled tab
    fireEvent.keyDown(activeTab, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith('archived');

    // ArrowDown also navigates to next enabled tab
    fireEvent.keyDown(activeTab, { key: 'ArrowDown' });
    expect(handleChange).toHaveBeenCalledWith('archived');

    // ArrowLeft navigates backwards
    fireEvent.keyDown(activeTab, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenCalledWith('archived'); // (0 - 1 + 2) % 2 = 1

    // ArrowUp also navigates backwards
    fireEvent.keyDown(activeTab, { key: 'ArrowUp' });
    expect(handleChange).toHaveBeenCalledWith('archived');

    // Home jumps to first enabled tab
    fireEvent.keyDown(activeTab, { key: 'Home' });
    expect(handleChange).toHaveBeenCalledWith('active');

    // End jumps to last enabled tab (skipping disabled)
    fireEvent.keyDown(activeTab, { key: 'End' });
    expect(handleChange).toHaveBeenCalledWith('archived');

    // Unrelated key ignored
    fireEvent.keyDown(activeTab, { key: 'Escape' });
  });

  it('renders tabs with icon', () => {
    render(
      <Tabs
        items={[
          { key: 'with-icon', label: 'Icon Tab', icon: <span data-testid="tab-icon">★</span> },
        ]}
        activeKey="with-icon"
        onChange={jest.fn()}
      />
    );
    expect(screen.getByTestId('tab-icon')).toBeInTheDocument();
  });

  it('renders underline and pills variants without error', () => {
    const { rerender } = render(
      <Tabs items={items} activeKey="active" onChange={jest.fn()} variant="underline" />
    );
    expect(screen.getByRole('tablist')).toHaveClass('border-b');

    rerender(<Tabs items={items} activeKey="active" onChange={jest.fn()} variant="pills" />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders with fullWidth style', () => {
    render(<Tabs items={items} activeKey="active" onChange={jest.fn()} fullWidth />);
    expect(screen.getByRole('tablist')).toHaveClass('w-full');
  });
});

describe('TabPanel Component', () => {
  const TestComponent = () => {
    const [active, setActive] = useState('one');
    return (
      <div>
        <Tabs
          items={[
            { key: 'one', label: 'Tab One' },
            { key: 'two', label: 'Tab Two' },
          ]}
          activeKey={active}
          onChange={setActive}
        />
        <TabPanel tabKey="one" activeKey={active}>
          <div>Content One</div>
        </TabPanel>
        <TabPanel tabKey="two" activeKey={active}>
          <div>Content Two</div>
        </TabPanel>
      </div>
    );
  };

  it('renders active tab panel content and switches on tab click', () => {
    render(<TestComponent />);

    expect(screen.getByText('Content One')).toBeInTheDocument();
    expect(screen.queryByText('Content Two')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /tab two/i }));

    expect(screen.queryByText('Content One')).not.toBeInTheDocument();
    expect(screen.getByText('Content Two')).toBeInTheDocument();
  });

  it('keeps mounted when keepMounted is true', () => {
    render(
      <TabPanel tabKey="inactive" activeKey="active" keepMounted>
        <div>Hidden Content</div>
      </TabPanel>
    );
    const panel = screen.getByRole('tabpanel', { hidden: true });
    expect(panel).toHaveAttribute('hidden');
    expect(screen.getByText('Hidden Content')).toBeInTheDocument();
  });
});
