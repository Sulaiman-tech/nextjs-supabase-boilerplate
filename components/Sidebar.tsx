import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
      <nav>
        <ul>
          <li><Link href="/dashboard/analytics">Analytics</Link></li>
          <li><Link href="/dashboard/settings">Settings</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
