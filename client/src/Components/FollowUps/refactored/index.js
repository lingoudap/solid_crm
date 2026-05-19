/**
 * Follow-Up Module Exports
 * Central export point for all components, hooks, and utilities
 */

// Pages
export { default as FollowUpPage } from './pages/FollowUpPage';

// Common Components
export { default as FollowUpTabs } from './components/common/FollowUpTabs';
export { default as FollowUpTable } from './components/common/FollowUpTable';
export { default as FollowUpModal } from './components/common/FollowUpModal';
export { default as FollowUpFilters } from './components/common/FollowUpFilters';
export { default as FollowUpDrawer } from './components/common/FollowUpDrawer';

// Feature Components
export { default as DashboardCards } from './components/features/DashboardCards';
export { default as FollowUpTimeline } from './components/features/FollowUpTimeline';

// Custom Hooks
export { useFollowUps, default as useFollowUpsDefault } from './hooks/useFollowUps';

// Services
export { default as followUpService } from './services/followUpService';

// Utilities
export * from './utils/helpers';

// Constants
export * from './constants/config';
