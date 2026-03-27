import {
  HomeIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  BookOpenIcon,
  DocumentTextIcon,
  BookmarkIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: HomeIcon },
  { label: 'Habits', path: '/habits', icon: CheckCircleIcon },
  { label: 'To-Do', path: '/todo', icon: ClipboardDocumentListIcon },
  { label: 'Chores', path: '/chores', icon: SparklesIcon },
  { label: 'Journal', path: '/journal', icon: BookOpenIcon },
  { label: 'Notes', path: '/notes', icon: DocumentTextIcon },
  { label: 'Books', path: '/books', icon: BookmarkIcon },
  { label: 'Workouts', path: '/workouts', icon: BoltIcon },
]
