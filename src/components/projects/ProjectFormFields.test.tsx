import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  formatLeadOptions,
  toggleMemberSelection,
  ProjectDrawerFooter,
  ProjectNameInput,
  ProjectDescriptionTextarea,
  ProjectLeadSelect,
  ProjectMemberSelector,
} from './ProjectFormFields';

describe('ProjectFormFields and helper functions', () => {
  describe('toggleMemberSelection', () => {
    it('appends member id when not present and removes it when already present', () => {
      const initial = ['user-1', 'user-2'];
      const added = toggleMemberSelection(initial, 'user-3');
      expect(added).toEqual(['user-1', 'user-2', 'user-3']);

      const removed = toggleMemberSelection(added, 'user-2');
      expect(removed).toEqual(['user-1', 'user-3']);
    });
  });

  describe('formatLeadOptions', () => {
    it('formats options correctly across different candidate formats', () => {
      const candidates = [
        { _id: 'c1', firstName: 'Alice', lastName: 'Smith' },
        { id: 'c2', firstName: 'Bob', lastName: '' },
        { _id: 'c3', lastName: 'Jones' },
        { id: 'c4', email: 'charlie@example.com' },
        { _id: 'c5' },
        { firstName: 'NoId' },
      ];

      const options = formatLeadOptions(candidates);
      expect(options).toEqual([
        { value: 'c1', label: 'Alice Smith' },
        { value: 'c2', label: 'Bob' },
        { value: 'c3', label: 'Jones' },
        { value: 'c4', label: 'charlie@example.com' },
        { value: 'c5', label: 'Unnamed' },
        { value: '', label: 'NoId' },
      ]);
    });
  });

  describe('ProjectDrawerFooter', () => {
    it('handles clicks and renders submitIcon when provided', () => {
      const handleClose = jest.fn();
      const handleSubmit = jest.fn();

      const { rerender } = render(
        <ProjectDrawerFooter
          onClose={handleClose}
          onSubmit={handleSubmit}
          isLoading={false}
          cancelText="Cancel"
          submitText="Create"
          submitIcon="/icons/plus.svg"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(handleClose).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Create' }));
      expect(handleSubmit).toHaveBeenCalledTimes(1);

      rerender(
        <ProjectDrawerFooter
          onClose={handleClose}
          onSubmit={handleSubmit}
          isLoading={true}
          cancelText="Cancel"
          submitText="Create"
        />
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });

  describe('ProjectNameInput', () => {
    it('renders with label, handles onChange, and displays error when present', () => {
      const handleChange = jest.fn();

      const { rerender } = render(
        <ProjectNameInput
          id="test-name"
          value="Task"
          onChange={handleChange}
          error="Name error"
          disabled={false}
        />
      );

      expect(screen.getByText('Name error')).toBeInTheDocument();
      fireEvent.change(screen.getByDisplayValue('Task'), { target: { value: 'New Task' } });
      expect(handleChange).toHaveBeenCalledWith('New Task');

      rerender(
        <ProjectNameInput
          id="test-name"
          value=""
          onChange={handleChange}
          label="Custom Label"
          placeholder="Custom Placeholder"
        />
      );

      expect(screen.getByText(/Custom Label/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Custom Placeholder')).toBeInTheDocument();
    });
  });

  describe('ProjectDescriptionTextarea', () => {
    it('renders and handles input change', () => {
      const handleChange = jest.fn();

      const { rerender } = render(
        <ProjectDescriptionTextarea
          id="test-desc"
          value="Initial desc"
          onChange={handleChange}
          disabled={false}
        />
      );

      fireEvent.change(screen.getByDisplayValue('Initial desc'), {
        target: { value: 'Updated desc' },
      });
      expect(handleChange).toHaveBeenCalledWith('Updated desc');

      rerender(
        <ProjectDescriptionTextarea
          id="test-desc"
          value=""
          onChange={handleChange}
          label="Custom Desc"
          placeholder="Enter description..."
        />
      );

      expect(screen.getByText('Custom Desc')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter description...')).toBeInTheDocument();
    });
  });

  describe('ProjectLeadSelect', () => {
    it('renders with options and triggers change', () => {
      const handleChange = jest.fn();
      const options = [
        { value: 'u1', label: 'User 1' },
        { value: 'u2', label: 'User 2' },
      ];

      render(
        <ProjectLeadSelect
          id="test-lead"
          value="u1"
          onChange={handleChange}
          options={options}
          placeholder="Pick a lead"
        />
      );

      expect(screen.getByText('User 1')).toBeInTheDocument();
    });
  });

  describe('ProjectMemberSelector', () => {
    it('renders empty text when candidates list is empty', () => {
      render(
        <ProjectMemberSelector
          memberCandidates={[]}
          memberIds={[]}
          leadId=""
          toggleMember={jest.fn()}
          emptyText="No candidates available"
        />
      );

      expect(screen.getByText('No candidates available')).toBeInTheDocument();
    });

    it('renders members list, shows lead tag, and toggles selection', () => {
      const toggleMember = jest.fn();
      const candidates = [
        { id: 'lead-1', firstName: 'Lead', lastName: 'User' },
        { id: 'mem-1', firstName: 'Member', lastName: 'One' },
        { _id: 'mem-2', email: 'mem2@test.com' },
        { id: 'mem-3', firstName: 'SoloFirst' },
        { id: 'mem-4', lastName: 'SoloLast' },
        { _id: 'mem-5' },
        { firstName: 'NoId' },
      ];

      render(
        <ProjectMemberSelector
          memberCandidates={candidates}
          memberIds={['mem-1']}
          leadId="lead-1"
          toggleMember={toggleMember}
        />
      );

      expect(screen.getByText('Lead User')).toBeInTheDocument();
      expect(screen.getByText('Lead')).toBeInTheDocument();
      expect(screen.getByText('Member One')).toBeInTheDocument();
      expect(screen.getByText('mem2@test.com')).toBeInTheDocument();
      expect(screen.getByText('SoloFirst')).toBeInTheDocument();
      expect(screen.getByText('SoloLast')).toBeInTheDocument();
      expect(screen.getByText('Unnamed')).toBeInTheDocument();

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeDisabled(); // lead is disabled from manual unchecking
      expect(checkboxes[1]).toBeChecked(); // mem-1 is checked

      fireEvent.click(checkboxes[1]);
      expect(toggleMember).toHaveBeenCalledWith('mem-1');
    });
  });
});
