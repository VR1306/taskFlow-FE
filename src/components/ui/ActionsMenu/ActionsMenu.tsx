'use client';

import React, { memo } from 'react';
import { createPortal } from 'react-dom';
import { Image } from '@/components/ui/Image';
import { useMounted, useDropdownMenu } from '@/helpers';

export interface ActionMenuItem {
  key: string;
  label: string;
  icon?: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'default' | 'danger';
  hasDividerBefore?: boolean;
}

export interface ActionsMenuProps {
  ariaLabel: string;
  items: (ActionMenuItem | null | false | undefined)[];
  menuTestId?: string;
  triggerClassName?: string;
}

export const ActionsMenuItemButton = memo(function ActionsMenuItemButton({
  item,
  onClose,
}: {
  item: ActionMenuItem;
  onClose: () => void;
}) {
  const isDanger = item.variant === 'danger';

  return (
    <>
      {item.hasDividerBefore && <div className="my-1 border-t border-slate-100" />}
      <button
        type="button"
        role="menuitem"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
          item.onClick(e);
        }}
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
          isDanger
            ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
            : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        {item.icon && <Image src={item.icon} alt="" width={15} height={15} />}
        <span>{item.label}</span>
      </button>
    </>
  );
});

ActionsMenuItemButton.displayName = 'ActionsMenuItemButton';

export const ActionsMenu = memo(function ActionsMenu({
  ariaLabel,
  items,
  menuTestId,
  triggerClassName,
}: ActionsMenuProps) {
  const mounted = useMounted();
  const { isOpen, coords, triggerRef, menuRef, handleToggle, handleClose } = useDropdownMenu();

  const validItems = items.filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={
          triggerClassName ||
          `inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/70 transition-all duration-150 cursor-pointer shadow-2xs ${
            isOpen ? 'bg-slate-100 text-slate-700 ring-2 ring-blue-500/20' : ''
          }`
        }
      >
        <Image src="/icons/more-vertical.svg" alt="Actions" width={16} height={16} />
      </button>

      {mounted &&
        isOpen &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            data-testid={menuTestId}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: '180px',
              zIndex: 9999,
            }}
            className="rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl backdrop-blur-md transition-all duration-150 animate-in fade-in zoom-in-95 focus:outline-none"
          >
            {validItems.map((item) => (
              <ActionsMenuItemButton key={item.key} item={item} onClose={handleClose} />
            ))}
          </div>,
          document.body
        )}
    </>
  );
});

ActionsMenu.displayName = 'ActionsMenu';
