import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { UserActionsMenu, CreateUserModal, ViewUserModal, EditUserModal } from './index';
import { apiClient } from '@/services/api';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';
import { UserRecord } from '@/store';

jest.mock('@/services/api');

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      users: usersReducer,
    },
  });
};

const mockUser: UserRecord = {
  _id: 'usr-101',
  userId: 'TF0001',
  firstName: 'Sarah',
  lastName: 'Connor',
  email: 'sarah@resistance.org',
  role: 'SuperAdmin',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('Users Components Unit Tests', () => {
  describe('UserActionsMenu Component', () => {
    it('toggles menu open/close and triggers action handlers', () => {
      const handleView = jest.fn();
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();

      render(
        <UserActionsMenu
          user={mockUser}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );

      const triggerBtn = screen.getByRole('button', { name: /actions for sarah connor/i });
      fireEvent.click(triggerBtn);

      const viewItem = screen.getByRole('menuitem', { name: /view details/i });
      fireEvent.click(viewItem);
      expect(handleView).toHaveBeenCalledWith(mockUser);

      // Re-open and click Edit
      fireEvent.click(triggerBtn);
      const editItem = screen.getByRole('menuitem', { name: /edit user/i });
      fireEvent.click(editItem);
      expect(handleEdit).toHaveBeenCalledWith(mockUser);
    });

    it('disables Delete User button for SuperAdmin', () => {
      render(
        <UserActionsMenu
          user={mockUser}
          onView={jest.fn()}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
        />
      );

      const triggerBtn = screen.getByRole('button', { name: /actions for sarah connor/i });
      fireEvent.click(triggerBtn);

      const deleteItem = screen.getByRole('menuitem', { name: /delete user/i });
      expect(deleteItem).toBeDisabled();
    });
  });

  describe('ViewUserModal Component', () => {
    it('renders user details when open', () => {
      const handleClose = jest.fn();

      render(<ViewUserModal isOpen={true} onClose={handleClose} user={mockUser} />);

      expect(screen.getByText('User Profile Details')).toBeInTheDocument();
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      expect(screen.getByText('sarah@resistance.org')).toBeInTheDocument();
      expect(screen.getByText('TF0001')).toBeInTheDocument();
      expect(screen.getByText('usr-101')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /^close$/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });

    it('returns null if user is null', () => {
      const { container } = render(<ViewUserModal isOpen={true} onClose={jest.fn()} user={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('CreateUserModal Component', () => {
    it('submits valid form data and calls api', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ success: true });
      const store = createMockStore();
      const handleClose = jest.fn();

      render(
        <Provider store={store}>
          <CreateUserModal isOpen={true} onClose={handleClose} />
        </Provider>
      );

      expect(screen.getByText('Create New User')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Kyle' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Reese' } });
      fireEvent.change(screen.getByLabelText(/work email address/i), {
        target: { value: 'kyle@resistance.org' },
      });

      const submitBtn = screen.getByRole('button', { name: /create user/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/users/createUser', {
          firstName: 'Kyle',
          lastName: 'Reese',
          email: 'kyle@resistance.org',
          role: 'User',
        });
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });

  describe('EditUserModal Component', () => {
    it('submits updated user data and calls api', async () => {
      (apiClient.put as jest.Mock).mockResolvedValue({ success: true });
      const store = createMockStore();
      const handleClose = jest.fn();

      const regularUser: UserRecord = {
        _id: 'usr-102',
        userId: 'TF0002',
        firstName: 'John',
        lastName: 'Connor',
        email: 'john@resistance.org',
        role: 'User',
      };

      render(
        <Provider store={store}>
          <EditUserModal isOpen={true} onClose={handleClose} user={regularUser} />
        </Provider>
      );

      expect(screen.getByText('Edit Member Details')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jonathan' } });

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith('/users/updateUser/usr-102', {
          firstName: 'Jonathan',
          lastName: 'Connor',
          email: 'john@resistance.org',
          role: 'User',
        });
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });
});
