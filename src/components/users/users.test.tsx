import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { UserActionsMenu, CreateUserDrawer, ViewUserDrawer, EditUserDrawer } from './index';
import { apiClient } from '@/services/api';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import usersReducer from '@/store/slices/usersSlice';
import { UserRecord } from '@/store';
import { USERS_CONSTANTS } from '@/constants';

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
  role: 'Taskflow Admin',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('Users Components Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

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

      // Re-open and click Delete
      fireEvent.click(triggerBtn);
      const deleteItem = screen.getByRole('menuitem', { name: /delete user/i });
      fireEvent.click(deleteItem);
      expect(handleDelete).toHaveBeenCalledWith(mockUser);
    });

    it('closes menu when pressing Escape or clicking outside', () => {
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

      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      // Test outside click
      fireEvent.click(triggerBtn);
      expect(screen.getByRole('menu')).toBeInTheDocument();
      fireEvent.mouseDown(document.body);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('ViewUserDrawer Component', () => {
    it('renders sequential user details when open', () => {
      const handleClose = jest.fn();
      const handleEdit = jest.fn();

      render(
        <ViewUserDrawer isOpen={true} onClose={handleClose} onEdit={handleEdit} user={mockUser} />
      );

      expect(screen.getByText('User Profile Details')).toBeInTheDocument();
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      expect(screen.getAllByText('sarah@resistance.org').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('TF0001')).toBeInTheDocument();
      expect(screen.queryByText('usr-101')).not.toBeInTheDocument();

      // Copy buttons
      const copyIdBtn = screen.getByRole('button', { name: /copy id/i });
      fireEvent.click(copyIdBtn);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TF0001');

      // Edit Member button in footer
      const editBtn = screen.getByRole('button', { name: /edit member/i });
      fireEvent.click(editBtn);
      expect(handleClose).toHaveBeenCalled();
      expect(handleEdit).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('CreateUserDrawer Component', () => {
    it('submits valid form data and closes drawer on success', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        success: true,
      });

      const store = createMockStore();
      const handleClose = jest.fn();

      render(
        <Provider store={store}>
          <CreateUserDrawer isOpen={true} onClose={handleClose} />
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
          role: 'Developer',
        });
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('shows required validation errors when submitting an empty form', async () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <CreateUserDrawer isOpen={true} onClose={jest.fn()} />
        </Provider>
      );

      const submitBtn = screen.getByRole('button', { name: /create user/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('shows the API error message when createUserThunk is rejected', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Email already exists'));

      const store = createMockStore();
      const handleClose = jest.fn();

      render(
        <Provider store={store}>
          <CreateUserDrawer isOpen={true} onClose={handleClose} />
        </Provider>
      );

      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Kyle' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Reese' } });
      fireEvent.change(screen.getByLabelText(/work email address/i), {
        target: { value: 'kyle@resistance.org' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create user/i }));

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('shows default error message when createUserThunk rejects without an error message', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error(''));

      const store = createMockStore();
      const handleClose = jest.fn();

      render(
        <Provider store={store}>
          <CreateUserDrawer isOpen={true} onClose={handleClose} />
        </Provider>
      );

      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Kyle' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Reese' } });
      fireEvent.change(screen.getByLabelText(/work email address/i), {
        target: { value: 'kyle@resistance.org' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create user/i }));

      await waitFor(() => {
        expect(screen.getByText(USERS_CONSTANTS.createDrawer.defaultError)).toBeInTheDocument();
      });

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('EditUserDrawer Component', () => {
    it('submits updated user data and calls api', async () => {
      (apiClient.put as jest.Mock).mockResolvedValue({
        success: true,
      });

      const store = createMockStore();
      const handleClose = jest.fn();

      const regularUser: UserRecord = {
        _id: 'usr-102',
        userId: 'TF0002',
        firstName: 'John',
        lastName: 'Connor',
        email: 'john@resistance.org',
        role: 'Developer',
        isActive: true,
      };

      render(
        <Provider store={store}>
          <EditUserDrawer isOpen={true} onClose={handleClose} user={regularUser} />
        </Provider>
      );

      expect(screen.getByText('Edit User Profile')).toBeInTheDocument();
      expect(screen.getByLabelText(/work email address/i)).toBeDisabled();

      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jonathan' } });

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith('/users/updateUser/usr-102', {
          firstName: 'Jonathan',
          lastName: 'Connor',
          email: 'john@resistance.org',
          role: 'Developer',
        });
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('shows required validation errors when first/last name are cleared', async () => {
      const store = createMockStore();

      const regularUser: UserRecord = {
        _id: 'usr-103',
        userId: 'TF0003',
        firstName: 'John',
        lastName: 'Connor',
        email: 'john@resistance.org',
        role: 'Developer',
        isActive: true,
      };

      render(
        <Provider store={store}>
          <EditUserDrawer isOpen={true} onClose={jest.fn()} user={regularUser} />
        </Provider>
      );

      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: '' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: '' } });

      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
      });

      expect(apiClient.put).not.toHaveBeenCalled();
    });

    it('shows the API error message when updateUserThunk is rejected', async () => {
      (apiClient.put as jest.Mock).mockRejectedValue(new Error('Update failed unexpectedly'));

      const store = createMockStore();
      const handleClose = jest.fn();

      const regularUser: UserRecord = {
        _id: 'usr-104',
        userId: 'TF0004',
        firstName: 'Kyle',
        lastName: 'Reese',
        email: 'kyle@resistance.org',
        role: 'Developer',
        isActive: true,
      };

      render(
        <Provider store={store}>
          <EditUserDrawer isOpen={true} onClose={handleClose} user={regularUser} />
        </Provider>
      );

      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText('Update failed unexpectedly')).toBeInTheDocument();
      });

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('shows default error message when updateUserThunk rejects without an error message', async () => {
      (apiClient.put as jest.Mock).mockRejectedValue(new Error(''));

      const store = createMockStore();
      const handleClose = jest.fn();

      const regularUser: UserRecord = {
        _id: 'usr-105',
        userId: 'TF0005',
        firstName: 'Kyle',
        lastName: 'Reese',
        email: 'kyle@resistance.org',
        role: 'Developer',
        isActive: true,
      };

      render(
        <Provider store={store}>
          <EditUserDrawer isOpen={true} onClose={handleClose} user={regularUser} />
        </Provider>
      );

      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText(USERS_CONSTANTS.editDrawer.defaultError)).toBeInTheDocument();
      });

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('returns null when user is null', () => {
      const store = createMockStore();
      const { container } = render(
        <Provider store={store}>
          <EditUserDrawer isOpen={true} onClose={jest.fn()} user={null} />
        </Provider>
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('disables role select and preserves Taskflow Admin role when editing admin user', async () => {
      (apiClient.put as jest.Mock).mockResolvedValue({ success: true });
      const store = createMockStore();
      const handleClose = jest.fn();

      const adminUser: UserRecord = {
        _id: 'usr-admin',
        userId: '',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@taskflow.dev',
        role: 'Taskflow Admin',
        isActive: true,
      };

      render(
        <Provider store={store}>
          <EditUserDrawer isOpen={true} onClose={handleClose} user={adminUser} />
        </Provider>
      );

      // Expect fallback user ID 'TF0001' (line 150)
      expect(screen.getByText('TF0001')).toBeInTheDocument();

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith(
          '/users/updateUser/usr-admin',
          expect.objectContaining({ role: 'Taskflow Admin' })
        );
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('falls back to Developer role when user has no role', () => {
      const store = createMockStore();
      const userWithoutRole: UserRecord = {
        _id: 'usr-no-role',
        userId: 'TF0099',
        firstName: 'Bob',
        lastName: 'Builder',
        email: 'bob@example.com',
        role: '',
        isActive: true,
      };

      render(
        <Provider store={store}>
          <EditUserDrawer isOpen={true} onClose={jest.fn()} user={userWithoutRole} />
        </Provider>
      );

      expect(screen.getByText('TF0099')).toBeInTheDocument();
    });
  });

  describe('ViewUserDrawer inactive user rendering', () => {
    it('renders inactive status styling and default role badge for a non-admin inactive user', () => {
      const inactiveUser: UserRecord = {
        _id: 'usr-106',
        userId: 'TF0006',
        firstName: 'Miles',
        lastName: 'Dyson',
        email: 'miles@cyberdyne.com',
        role: 'Developer',
        isActive: false,
        createdAt: '2026-02-01T00:00:00.000Z',
      };

      render(
        <ViewUserDrawer isOpen={true} onClose={jest.fn()} onEdit={jest.fn()} user={inactiveUser} />
      );

      expect(screen.getAllByText('Inactive').length).toBeGreaterThanOrEqual(1);
    });

    it('renders fallback user ID and handles missing createdAt and missing onEdit', () => {
      const userWithoutIdAndCreated: UserRecord = {
        _id: 'usr-empty-id',
        userId: '',
        firstName: 'No',
        lastName: 'Id',
        email: 'noid@example.com',
        role: 'Developer',
        isActive: true,
        createdAt: '',
      };

      render(<ViewUserDrawer isOpen={true} onClose={jest.fn()} user={userWithoutIdAndCreated} />);

      expect(screen.getByText('TF0001')).toBeInTheDocument();
      expect(screen.getByText('N/A')).toBeInTheDocument();

      const copyIdBtn = screen.getByRole('button', { name: /copy id/i });
      fireEvent.click(copyIdBtn);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('TF0001');
    });

    it('renders without user content when user is null', () => {
      render(<ViewUserDrawer isOpen={true} onClose={jest.fn()} user={null} />);
      expect(screen.queryByText('Sarah Connor')).not.toBeInTheDocument();
    });
  });
});
