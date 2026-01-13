export default function SettingsPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Profile section */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <p className="mt-1 text-sm text-gray-600">
            Your personal information
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <select className="mt-1 block w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option>UTC</option>
                <option>America/New_York</option>
                <option>America/Los_Angeles</option>
                <option>Europe/London</option>
              </select>
            </div>
          </div>
        </section>

        {/* Study settings */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Study Settings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Customize your learning experience
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Daily Review Goal
              </label>
              <input
                type="number"
                min="1"
                max="500"
                defaultValue={20}
                className="mt-1 block w-32 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <p className="mt-1 text-xs text-gray-500">Cards per day</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Cards Per Day
              </label>
              <input
                type="number"
                min="0"
                max="100"
                defaultValue={10}
                className="mt-1 block w-32 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <p className="mt-1 text-xs text-gray-500">
                New cards introduced per day
              </p>
            </div>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end">
          <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
