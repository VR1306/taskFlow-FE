import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecentUsersWidget } from './RecentUsersWidget';
import { RecentUserItem } from '@/types';

const baseUser: RecentUserItem = {
  id: 'u-1',
  userId: 'USR001',
  name: 'Alice Johnson',
  email: 'alice.johnson@taskflow.io',
  role: 'Taskflow Admin',
  isActive: true,
  createdAt: new Date().toISOString(),
};

describe('RecentUsersWidget Component', () => {
  it('renders the empty state when there are no recent users', () => {
    render(<RecentUsersWidget users={[]} />);
    expect(screen.getByText('No Recent Members')).toBeInTheDocument();
  });

  it('renders the empty state by default when no users prop is provided', () => {
    render(<RecentUsersWidget />);
    expect(screen.getByText('No Recent Members')).toBeInTheDocument();
  });

  it('renders a list of recent users with role badges and active/inactive indicators', () => {
    const users: RecentUserItem[] = [
      baseUser,
      {
        ...baseUser,
        id: 'u-2',
        userId: 'USR002',
        name: 'Bob Smith',
        email: 'bob.smith@taskflow.io',
        role: 'Member',
        isActive: false,
      },
    ];
    render(<RecentUsersWidget users={users} />);

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('Taskflow Admin')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
  });

  it('falls back to empty first/last name fragments when a user has no name', () => {
    const users: RecentUserItem[] = [
      { ...baseUser, id: 'u-3', userId: 'USR003', name: '', email: 'noname@taskflow.io' },
    ];
    render(<RecentUsersWidget users={users} />);

    expect(screen.getByText('noname@taskflow.io')).toBeInTheDocument();
  });
});
