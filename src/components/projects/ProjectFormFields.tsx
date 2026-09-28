'use client';

import React, { memo } from 'react';
import { Select, Button, Image, Avatar } from '@/components/ui';
import { ProjectMember } from '@/types';
import { PROJECTS_CONSTANTS } from '@/constants';

export function formatLeadOptions(candidates: ProjectMember[]): { value: string; label: string }[] {
  return candidates.map((m) => {
    const id = m._id || m.id || '';
    const label = `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || 'Unnamed';
    return { value: id, label };
  });
}

export function toggleMemberSelection(selectedIds: string[], idToToggle: string): string[] {
  return selectedIds.includes(idToToggle)
    ? selectedIds.filter((id) => id !== idToToggle)
    : [...selectedIds, idToToggle];
}

export interface ProjectDrawerFooterProps {
  onClose: () => void;
  onSubmit: (e?: React.SyntheticEvent) => void;
  isLoading: boolean;
  cancelText: string;
  submitText: string;
  submitIcon?: string;
}

export const ProjectDrawerFooter = memo(function ProjectDrawerFooter({
  onClose,
  onSubmit,
  isLoading,
  cancelText,
  submitText,
  submitIcon,
}: ProjectDrawerFooterProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row w-full items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="w-full sm:w-auto justify-center"
      >
        {cancelText}
      </Button>
      <Button
        type="button"
        variant="primary"
        onClick={onSubmit}
        isLoading={isLoading}
        className="w-full sm:w-auto justify-center"
        leftIcon={submitIcon ? <Image src={submitIcon} alt="" width={16} height={16} /> : undefined}
      >
        {submitText}
      </Button>
    </div>
  );
});

ProjectDrawerFooter.displayName = 'ProjectDrawerFooter';

export interface ProjectNameInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export const ProjectNameInput = memo(function ProjectNameInput({
  id,
  value,
  onChange,
  error,
  disabled = false,
  label = PROJECTS_CONSTANTS.createDrawer.nameLabel,
  placeholder = PROJECTS_CONSTANTS.createDrawer.namePlaceholder,
}: ProjectNameInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1.5">
        {label} <span className="text-rose-500">*</span>
      </label>
      <input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full rounded-xl border p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:opacity-50 transition-all ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20'
        }`}
      />
      {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
    </div>
  );
});

ProjectNameInput.displayName = 'ProjectNameInput';

export interface ProjectDescriptionTextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export const ProjectDescriptionTextarea = memo(function ProjectDescriptionTextarea({
  id,
  value,
  onChange,
  disabled = false,
  label = PROJECTS_CONSTANTS.createDrawer.descriptionLabel,
  placeholder = PROJECTS_CONSTANTS.createDrawer.descriptionPlaceholder,
}: ProjectDescriptionTextareaProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1.5">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all resize-none"
      />
    </div>
  );
});

ProjectDescriptionTextarea.displayName = 'ProjectDescriptionTextarea';

export interface ProjectLeadSelectProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export const ProjectLeadSelect = memo(function ProjectLeadSelect({
  id,
  value,
  onChange,
  options,
  disabled = false,
  label = PROJECTS_CONSTANTS.createDrawer.leadLabel,
  placeholder = 'Select project lead...',
}: ProjectLeadSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1.5">
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={onChange}
        isDisabled={disabled}
        options={options}
        placeholder={placeholder}
      />
    </div>
  );
});

ProjectLeadSelect.displayName = 'ProjectLeadSelect';

export interface ProjectMemberSelectorProps {
  memberCandidates: ProjectMember[];
  memberIds: string[];
  leadId: string;
  toggleMember: (id: string) => void;
  label?: string;
  emptyText?: string;
}

export const ProjectMemberSelector = memo(function ProjectMemberSelector({
  memberCandidates,
  memberIds,
  leadId,
  toggleMember,
  label = PROJECTS_CONSTANTS.createDrawer.membersLabel,
  emptyText = 'No eligible members found.',
}: ProjectMemberSelectorProps) {
  return (
    <div>
      <span className="block text-xs font-bold text-slate-700 mb-1.5">{label}</span>
      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
        {memberCandidates.length === 0 ? (
          <p className="p-3 text-xs text-slate-400">{emptyText}</p>
        ) : (
          memberCandidates.map((m) => {
            const id = m._id || m.id || '';
            const memberName =
              `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || 'Unnamed';
            const isLead = id === leadId;
            const checked = memberIds.includes(id) || isLead;
            return (
              <label
                key={id}
                className="flex items-center gap-2.5 p-2.5 text-xs cursor-pointer hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isLead}
                  onChange={() => toggleMember(id)}
                  className="rounded border-slate-300"
                />
                <Avatar firstName={m.firstName} lastName={m.lastName} size="xs" />
                <span className="font-medium text-slate-700">{memberName}</span>
                {isLead && (
                  <span className="ml-auto text-[10px] text-blue-600 font-semibold">Lead</span>
                )}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
});

ProjectMemberSelector.displayName = 'ProjectMemberSelector';
