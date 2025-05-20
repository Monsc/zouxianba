import { Metadata } from 'next';
import { SettingsForm } from '@/components/SettingsForm';

export const metadata: Metadata = {
  title: '设置',
  description: '管理你的账户设置',
};

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            设置
          </h1>
        </div>
        <div className="p-6">
          <SettingsForm />
        </div>
      </div>
    </div>
  );
} 