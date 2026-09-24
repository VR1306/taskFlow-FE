'use client';

import React, { memo, useState, useCallback, useEffect, useId, useMemo } from 'react';
import { Drawer } from '@/components/ui';
import { useAppDispatch, useAppSelector, createProjectThunk, fetchMemberCandidates } from '@/store';
import { useCurrentUser } from '@/helpers';
import { PROJECTS_CONSTANTS } from '@/constants';
import {
  ProjectDrawerFooter,
  ProjectNameInput,
  ProjectDescriptionTextarea,
  ProjectLeadSelect,
  ProjectMemberSelector,
  formatLeadOptions,
  toggleMemberSelection,
} from './ProjectFormFields';

export interface CreateProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateProjectDrawer = memo(function CreateProjectDrawer({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectDrawerProps) {
  const dispatch = useAppDispatch();
  const currentUser = useCurrentUser();
  const { isActionLoading, memberCandidates, isMemberCandidatesLoading } = useAppSelector(
    (state) => state.projects
  );

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [leadId, setLeadId] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; general?: string }>({});

  const nameInputId = useId();
  const keyInputId = useId();
  const descInputId = useId();
  const leadSelectId = useId();

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchMemberCandidates());
      setLeadId(currentUser?.id || '');
    }
  }, [isOpen, dispatch, currentUser?.id]);

  const resetForm = useCallback(() => {
    setName('');
    setKey('');
    setDescription('');
    setLeadId(currentUser?.id || '');
    setMemberIds([]);
    setErrors({});
  }, [currentUser?.id]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const toggleMember = useCallback((id: string) => {
    setMemberIds((prev) => toggleMemberSelection(prev, id));
  }, []);

  const leadOptions = useMemo(() => formatLeadOptions(memberCandidates), [memberCandidates]);

  const handleSubmit = useCallback(
    async (e?: React.SyntheticEvent) => {
      e?.preventDefault();
      if (!name.trim()) {
        setErrors((prev) => ({ ...prev, name: 'Project name is required' }));
        return;
      }

      const resultAction = await dispatch(
        createProjectThunk({
          name: name.trim(),
          key: key.trim() || undefined,
          description: description.trim() || undefined,
          leadId: leadId || undefined,
          memberIds,
        })
      );

      if (createProjectThunk.fulfilled.match(resultAction)) {
        handleClose();
        onSuccess?.();
      } else {
        setErrors((prev) => ({
          ...prev,
          general: (resultAction.payload as string) || PROJECTS_CONSTANTS.createDrawer.defaultError,
        }));
      }
    },
    [dispatch, name, key, description, leadId, memberIds, handleClose, onSuccess]
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={PROJECTS_CONSTANTS.createDrawer.title}
      description={PROJECTS_CONSTANTS.createDrawer.description}
      width="md"
      footer={
        <ProjectDrawerFooter
          onClose={handleClose}
          onSubmit={handleSubmit}
          isLoading={isActionLoading}
          cancelText={PROJECTS_CONSTANTS.createDrawer.cancelButtonText}
          submitText={PROJECTS_CONSTANTS.createDrawer.submitButtonText}
          submitIcon="/icons/plus-white.svg"
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

        <div>
          <label htmlFor={keyInputId} className="block text-xs font-bold text-slate-700 mb-1.5">
            {PROJECTS_CONSTANTS.createDrawer.keyLabel}
          </label>
          <input
            id={keyInputId}
            placeholder={PROJECTS_CONSTANTS.createDrawer.keyPlaceholder}
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            disabled={isActionLoading}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all uppercase"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            {PROJECTS_CONSTANTS.createDrawer.keyHint}
          </p>
        </div>

        <ProjectDescriptionTextarea
          id={descInputId}
          value={description}
          onChange={setDescription}
          disabled={isActionLoading}
        />

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

CreateProjectDrawer.displayName = 'CreateProjectDrawer';
export default CreateProjectDrawer;
