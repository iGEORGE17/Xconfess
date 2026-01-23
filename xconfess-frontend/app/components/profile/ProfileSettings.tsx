import React, { useState } from "react";
import { UserProfile } from "../../api/user.api";

interface Props {
  profile: UserProfile;
  saveProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const ProfileSettings = ({ profile, saveProfile }: Props) => {
  const [isAnonymous, setIsAnonymous] = useState(profile.isAnonymous);

  const handleSave = async () => {
    await saveProfile({ isAnonymous });
    alert("Profile updated!");
  };

  return (
    <div className="p-6 bg-gray-800 rounded space-y-4">
      <h2 className="text-xl font-bold">Profile Settings</h2>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        Stay Anonymous
      </label>
      <button
        onClick={handleSave}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Save Settings
      </button>
    </div>
  );
};

export default ProfileSettings;
