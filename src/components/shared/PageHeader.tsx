import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { PageHeaderProps } from '@/types/shared';

export const PageHeader: React.FC<PageHeaderProps> = React.memo(({
  title,
  description,
  icon,
  actions,
  breadcrumbs
}) => {
  return (
    <div className="w-full space-y-3 font-sans select-none text-left">
      {/* ─── Breadcrumbs ─── */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <ShadcnBreadcrumb className="mb-2">
          <BreadcrumbList className="flex-wrap">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage className="font-extrabold text-zinc-900 dark:text-white text-[11px] sm:text-xs">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        asChild
                        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 text-[11px] sm:text-xs font-semibold"
                      >
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="text-zinc-400 dark:text-zinc-650 size-2.5 sm:size-3" />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </ShadcnBreadcrumb>
      )}

      {/* ─── Main Header Info ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-primary shrink-0 size-5 sm:size-6 flex items-center justify-center">{icon}</div>}
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-white truncate">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-450 mt-1 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* ─── Actions Panel ─── */}
        {actions && (
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-start sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
});

PageHeader.displayName = 'PageHeader';
