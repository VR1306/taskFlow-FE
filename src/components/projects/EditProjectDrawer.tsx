'use client';

import React, { memo, useState, useEffect, useCallback, useId, useMemo } from 'react';
import { Drawer, Select } from '@/components/ui';
import { useAppDispatch, useAppSelector, updateProjectThunk, fetchMemberCandidates } from '@/store';
import { PROJECTS_CONSTANTS, PROJECT_STATUS_FORM_OPTIONS } from '@/constants';
import { Project, ProjectMember } from '@/types';
import {
  ProjectDrawerFooter,
  ProjectNameInput,
  ProjectDescriptionTextarea,
  ProjectLeadSelect,
  ProjectMemberSelector,
  formatLeadOptions,
  toggleMemberSelection,
} from './ProjectFormFields';

export interface EditProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess?: () => void;
}

const resolveMemberId = (member: ProjectMember | string): string =>
  typeof member === 'string' ? member : member._id || member.id || '';

export const EditProjectDrawer = memo(function EditProjectDrawer({
  isOpen,
  onClose,
  project,
  onSuccess,
}: EditProjectDrawerProps) {
  const dispatch = useAppDispatch();
  const { isActionLoading, memberCandidates, isMemberCandidatesLoading } = useAppSelector(
    (state) => state.projects
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [leadId, setLeadId] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; general?: string }>({});

  const nameInputId = useId();
  const descInputId = useId();
  const statusSelectId = useId();
  const leadSelectId = useId();

  useEffect(() => {
    if (project && isOpen) {
      dispatch(fetchMemberCandidates());
      setName(project.name || '');
      setDescription(project.description || '');
      setStatus(project.status === 'archived' ? 'archived' : 'active');
      setLeadId(project.leadId ? resolveMemberId(project.leadId) : '');
      setMemberIds((project.members || []).map(resolveMemberId));
      setErrors({});
    }
  }, [project, isOpen, dispatch]);

  const toggleMember = useCallback((id: string) => {
    setMemberIds((prev) => toggleMemberSelection(prev, id));
  }, []);

  const leadOptions = useMemo(() => formatLeadOptions(memberCandidates), [memberCandidates]);

  const handleSubmit = useCallback(
    async (e?: React.SyntheticEvent) => {
      e?.preventDefault();

      const sanitizedName = name.trim();
      if (!sanitizedName) {
        setErrors((prev) => ({ ...prev, name: 'Project name is required' }));
        return;
      }

      const projectIdentifier = project?.projectId || project?.id || project?._id;
      if (!projectIdentifier) return;

      const memberSet = new Set(memberIds);
      if (leadId) memberSet.add(leadId);

      const resultAction = await dispatch(
        updateProjectThunk({
          id: projectIdentifier,
          data: {
            name: sanitizedName,
            description: description.trim(),
            status,
            leadId: leadId || undefined,
            memberIds: [...memberSet],
          },
        })
      );

      if (updateProjectThunk.fulfilled.match(resultAction)) {
        onClose();
        onSuccess?.();
      } else {
        setErrors((prev) => ({
          ...prev,
          general: (resultAction.payload as string) || PROJECTS_CONSTANTS.editDrawer.defaultError,
        }));
      }
    },
    [dispatch, project, name, description, status, leadId, memberIds, onClose, onSuccess]
  );

  if (!project) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={PROJECTS_CONSTANTS.editDrawer.title}
      description={`Update configuration for ${project.name}.`}
      width="md"
      footer={
        <ProjectDrawerFooter
          onClose={onClose}
          onSubmit={handleSubmit}
          isLoading={isActionLoading}
          cancelText={PROJECTS_CONSTANTS.editDrawer.cancelButtonText}
          submitText={PROJECTS_CONSTANTS.editDrawer.submitButtonText}
          submitIcon="/icons/edit-white.svg"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.general && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700 font-medium animate-in fade-in"
          >
            {errors.general}
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs">
          <span className="text-slate-500 font-medium">Project Key:</span>
          <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">
            {project.key}
          </span>
        </div>

        <ProjectNameInput
          id={nameInputId}
          value={name}
          onChange={(val) => {
            setName(val);
            if (val.trim()) {
              setErrors((prev) => ({ ...prev, name: undefined, general: undefined }));
            }
          }}
          error={errors.name}
          disabled={isActionLoading}
        />

        <ProjectDescriptionTextarea
          id={descInputId}
          value={description}
          onChange={setDescription}
          disabled={isActionLoading}
        />

        <div>
          <label htmlFor={statusSelectId} className="block text-xs font-bold text-slate-700 mb-1.5">
            {PROJECTS_CONSTANTS.editDrawer.statusLabel}
          </label>
          <Select
            id={statusSelectId}
            value={status}
            onChange={setStatus as (val: 'active' | 'archived') => void}
            isDisabled={isActionLoading}
            options={PROJECT_STATUS_FORM_OPTIONS}
          />
        </div>

        <ProjectLeadSelect
          id={leadSelectId}
          value={leadId}
          onChange={setLeadId}
          options={leadOptions}
          disabled={isActionLoading || isMemberCandidatesLoading}
        />

        <ProjectMemberSelector
          memberCandidates={memberCandidates}
          memberIds={memberIds}
          leadId={leadId}
          toggleMember={toggleMember}
        />
      </form>
    </Drawer>
  );
});

EditProjectDrawer.displayName = 'EditProjectDrawer';
export default EditProjectDrawer;
