import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DynamicPermissionsSelector from './DynamicPermissionsSelector';
import type { PermissionModule } from '@/types';

const catalogue: PermissionModule[] = [
  {
    moduleKey: 'users',
    moduleName: 'Accounts',
    description: 'Account controls',
    permissions: [
      { id: 'users.read', name: 'View users', action: 'read', description: 'Inspect team members' },
      { id: 'users.update', name: 'Edit users', action: 'update', description: 'Modify a profile' },
    ],
  },
  {
    moduleKey: 'projects',
    moduleName: 'Projects',
    description: '',
    permissions: [
      {
        id: 'projects.create',
        name: 'Create project',
        action: 'create',
        description: 'Start a workspace',
      },
    ],
  },
];
function EditableSelector() {
  const [permissions, setPermissions] = useState<string[]>([]);
  return (
    <DynamicPermissionsSelector
      permissionsCatalogue={catalogue}
      selectedPermissions={permissions}
      onChange={setPermissions}
    />
  );
}

it('toggles individual permissions, modules, and all permissions without duplicates', () => {
  render(<EditableSelector />);
  fireEvent.click(screen.getByRole('checkbox', { name: 'View users' }));
  expect(screen.getByText('1 of 3 Granted (33%)')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all Accounts' }));
  expect(screen.getByText('2 of 3 Granted (67%)')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all Accounts' }));
  expect(screen.getByText('0 of 3 Granted (0%)')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Select All Permissions' }));
  expect(screen.getByText('3 of 3 Granted (100%)')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Edit users' }));
  expect(screen.getByText('2 of 3 Granted (67%)')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Select All Permissions' }));
  fireEvent.click(screen.getByRole('button', { name: 'Deselect All' }));
  expect(screen.getByText('0 of 3 Granted (0%)')).toBeInTheDocument();
});

it.each(['users.read', 'Inspect team', 'Accounts', 'View users'])(
  'searches names, IDs, descriptions and modules: %s',
  (query) => {
    render(<EditableSelector />);
    fireEvent.change(screen.getByPlaceholderText(/Filter permissions by keyword/), {
      target: { value: query },
    });
    expect(screen.getByRole('checkbox', { name: 'View users' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Create project' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filter search' }));
    expect(screen.getByRole('checkbox', { name: 'Create project' })).toBeInTheDocument();
  }
);

it('filters by action and resets unmatched searches', () => {
  render(<EditableSelector />);
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  expect(screen.getByRole('checkbox', { name: 'Edit users' })).toBeInTheDocument();
  expect(screen.queryByRole('checkbox', { name: 'View users' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByPlaceholderText(/Filter permissions by keyword/), {
    target: { value: 'no matching permission' },
  });
  expect(screen.getByText('No permissions match your filter criteria.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear Filters' }));
  expect(screen.getByRole('checkbox', { name: 'View users' })).toBeInTheDocument();
});

it.each([{ disabled: true }, { isReadOnly: true }])(
  'prevents editing when controls are locked: %s',
  (props) => {
    const onChange = jest.fn();
    render(
      <DynamicPermissionsSelector permissionsCatalogue={catalogue} onChange={onChange} {...props} />
    );
    const permission = screen.getByRole('checkbox', { name: 'View users' });
    expect(permission).toBeDisabled();
    fireEvent.click(permission);
    expect(onChange).not.toHaveBeenCalled();
  }
);

it('shows an empty catalogue message', () => {
  render(<DynamicPermissionsSelector onChange={jest.fn()} />);
  expect(screen.getByText('No permissions catalogue available from server.')).toBeInTheDocument();
});

it('treats a module with no permissions array as having zero permissions', () => {
  const catalogueWithMissingPermissions = [
    ...catalogue,
    { moduleKey: 'billing', moduleName: 'Billing' } as unknown as PermissionModule,
  ];
  render(
    <DynamicPermissionsSelector
      permissionsCatalogue={catalogueWithMissingPermissions}
      selectedPermissions={[]}
      onChange={jest.fn()}
    />
  );
  // Billing module contributes 0 permissions, so totals still reflect only the other modules.
  expect(screen.getByText('0 of 3 Granted (0%)')).toBeInTheDocument();
  expect(screen.queryByText('Billing')).not.toBeInTheDocument();
});

it('ignores clicks on a disabled module select-all checkbox', () => {
  const onChange = jest.fn();
  render(
    <DynamicPermissionsSelector
      permissionsCatalogue={catalogue}
      selectedPermissions={[]}
      onChange={onChange}
      disabled={true}
    />
  );
  const moduleSelectAll = screen.getByRole('checkbox', { name: 'Select all Accounts' });
  fireEvent.click(moduleSelectAll);
  expect(onChange).not.toHaveBeenCalled();
});

it('ignores clicks on the global select-all button when disabled', () => {
  const onChange = jest.fn();
  render(
    <DynamicPermissionsSelector
      permissionsCatalogue={catalogue}
      selectedPermissions={[]}
      onChange={onChange}
      disabled={true}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Select All Permissions' }));
  expect(onChange).not.toHaveBeenCalled();
});
