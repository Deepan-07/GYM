import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import Button from '../../components/Button';

const disabledInputClass = 'input-field bg-gray-800/60 text-gray-500 cursor-not-allowed';

const buildFormState = (data) => {
  const socialLinks = data?.gym?.socialMediaLinks || [];
  const getSocialLink = (platform) => socialLinks.find((item) => item.platform === platform)?.url || '';

  return {
    gym: {
      ...data.gym,
      operatingDaysText: (data.gym?.operatingDays || []).join(', '),
      operatingOpen: data.gym?.operatingHours?.open || '',
      operatingClose: data.gym?.operatingHours?.close || '',
      instagramUrl: getSocialLink('instagram'),
      facebookUrl: getSocialLink('facebook'),
      websiteUrl: getSocialLink('website')
    },
    owner: data.owner
  };
};

const ProfileSection = ({ title, editing, onEdit, onCancel, onSave, saving, children }) => (
  <div className="card space-y-5">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-gray-800 pb-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="flex gap-2">
        {editing ? (
          <>
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="button" onClick={onSave} isLoading={saving}>Save</Button>
          </>
        ) : (
          <Button type="button" variant="secondary" onClick={onEdit}>Edit</Button>
        )}
      </div>
    </div>
    {children}
  </div>
);

const Field = ({ label, value, onChange, disabled = false, textarea = false }) => {
  const Component = textarea ? 'textarea' : 'input';
  const disabledClassName = `${disabledInputClass} ${textarea ? 'h-24 resize-none' : ''}`.trim();
  const enabledClassName = `input-field ${textarea ? 'h-24 resize-none' : ''}`.trim();

  return (
    <label className="space-y-1 block">
      <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
      <Component
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={disabled ? disabledClassName : enabledClassName}
      />
    </label>
  );
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [formState, setFormState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState('');
  const [savingSection, setSavingSection] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gym/profile');
      setProfile(res.data.data);
      setFormState(buildFormState(res.data.data));
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const setSectionValue = (section, key, value) => {
    setFormState((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value
      }
    }));
  };

  const cancelSection = () => {
    setFormState(buildFormState(profile));
    setEditingSection('');
  };

  const saveSection = async (section) => {
    setSavingSection(section);

    try {
      const payload = {};

      if (section === 'gym') {
        payload.gymData = {
          gymName: formState.gym.gymName,
          gst: formState.gym.gst,
          tagline: formState.gym.tagline,
          address: formState.gym.address,
          location: formState.gym.location,
          gymEmail: formState.gym.gymEmail,
          gymContact: formState.gym.gymContact,
          gymType: formState.gym.gymType,
          socialMediaLinks: [
            { platform: 'instagram', url: formState.gym.instagramUrl },
            { platform: 'facebook', url: formState.gym.facebookUrl },
            { platform: 'website', url: formState.gym.websiteUrl }
          ].filter((item) => item.url),
          operatingDays: (formState.gym.operatingDaysText || '').split(',').map((item) => item.trim()).filter(Boolean),
          operatingHours: {
            open: formState.gym.operatingOpen,
            close: formState.gym.operatingClose
          }
        };
      }

      if (section === 'owner') {
        payload.ownerData = {
          name: formState.owner.name,
          mobileNo: formState.owner.mobileNo,
          mailId: formState.owner.mailId
        };
      }

      if (section === 'reminder') {
        payload.gymData = {
          reminderSettings: {
            whatsappNumber: formState.gym.reminderSettings?.whatsappNumber,
            phoneNumber: formState.gym.reminderSettings?.phoneNumber,
            gmail: formState.gym.reminderSettings?.gmail
          }
        };
      }

      if (section === 'billing') {
        payload.gymData = {
          billingInfo: {
            ...formState.gym.billingInfo
          }
        };
      }

      const res = await api.put('/gym/profile', payload);
      const updatedProfile = {
        gym: res.data.data.gym || profile.gym,
        owner: res.data.data.owner || profile.owner
      };

      updatedProfile.gym = {
        ...updatedProfile.gym,
        operatingDaysText: (updatedProfile.gym.operatingDays || []).join(', '),
        operatingOpen: updatedProfile.gym.operatingHours?.open || '',
        operatingClose: updatedProfile.gym.operatingHours?.close || '',
        instagramUrl: updatedProfile.gym.socialMediaLinks?.find((item) => item.platform === 'instagram')?.url || '',
        facebookUrl: updatedProfile.gym.socialMediaLinks?.find((item) => item.platform === 'facebook')?.url || '',
        websiteUrl: updatedProfile.gym.socialMediaLinks?.find((item) => item.platform === 'website')?.url || ''
      };

      setProfile(updatedProfile);
      setFormState(updatedProfile);
      setEditingSection('');
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingSection('');
    }
  };

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFormState(buildFormState(profile));
  }, [profile]);

  if (loading || !formState) {
    return <div className="flex flex-col h-full bg-dark"><div className="flex-1 flex justify-center items-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></div>;
  }

  return (
    <div className="flex bg-dark h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 pt-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gym Profile</h1>
          <p className="text-gray-400 mt-1">Manage gym details, owner information, reminder settings, and billing configuration.</p>
        </div>

        <ProfileSection
          title="Gym Info"
          editing={editingSection === 'gym'}
          onEdit={() => setEditingSection('gym')}
          onCancel={cancelSection}
          onSave={() => saveSection('gym')}
          saving={savingSection === 'gym'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Gym ID" value={formState.gym.gymId} disabled />
            <Field label="Gym ID Prefix" value={formState.gym.gymIdPrefix} disabled />
            <Field label="Gym Name" value={formState.gym.gymName} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'gymName', event.target.value)} />
            <Field label="Gym Type" value={formState.gym.gymType} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'gymType', event.target.value)} />
            <Field label="Tagline" value={formState.gym.tagline} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'tagline', event.target.value)} />
            <Field label="GST" value={formState.gym.gst} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'gst', event.target.value)} />
            <Field label="Gym Email" value={formState.gym.gymEmail} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'gymEmail', event.target.value)} />
            <Field label="Gym Contact" value={formState.gym.gymContact} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'gymContact', event.target.value)} />
            <Field label="Location" value={formState.gym.location} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'location', event.target.value)} />
            <Field label="Operating Days" value={formState.gym.operatingDaysText} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'operatingDaysText', event.target.value)} />
            <Field label="Instagram URL" value={formState.gym.instagramUrl} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'instagramUrl', event.target.value)} />
            <Field label="Facebook URL" value={formState.gym.facebookUrl} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'facebookUrl', event.target.value)} />
            <Field label="Website URL" value={formState.gym.websiteUrl} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'websiteUrl', event.target.value)} />
            <Field label="Open Time" value={formState.gym.operatingOpen} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'operatingOpen', event.target.value)} />
            <Field label="Close Time" value={formState.gym.operatingClose} disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'operatingClose', event.target.value)} />
            <div className="md:col-span-2">
              <Field label="Address" value={formState.gym.address} textarea disabled={editingSection !== 'gym'} onChange={(event) => setSectionValue('gym', 'address', event.target.value)} />
            </div>
          </div>
        </ProfileSection>

        <ProfileSection
          title="Owner Info"
          editing={editingSection === 'owner'}
          onEdit={() => setEditingSection('owner')}
          onCancel={cancelSection}
          onSave={() => saveSection('owner')}
          saving={savingSection === 'owner'}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Owner Name" value={formState.owner?.name} disabled={editingSection !== 'owner'} onChange={(event) => setSectionValue('owner', 'name', event.target.value)} />
            <Field label="Mobile Number" value={formState.owner?.mobileNo} disabled={editingSection !== 'owner'} onChange={(event) => setSectionValue('owner', 'mobileNo', event.target.value)} />
            <Field label="Email" value={formState.owner?.mailId} disabled={editingSection !== 'owner'} onChange={(event) => setSectionValue('owner', 'mailId', event.target.value)} />
          </div>
        </ProfileSection>

        <ProfileSection
          title="Reminder Settings"
          editing={editingSection === 'reminder'}
          onEdit={() => setEditingSection('reminder')}
          onCancel={cancelSection}
          onSave={() => saveSection('reminder')}
          saving={savingSection === 'reminder'}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="WhatsApp Number" value={formState.gym.reminderSettings?.whatsappNumber} disabled={editingSection !== 'reminder'} onChange={(event) => setFormState((current) => ({ ...current, gym: { ...current.gym, reminderSettings: { ...current.gym.reminderSettings, whatsappNumber: event.target.value } } }))} />
            <Field label="SMS Number" value={formState.gym.reminderSettings?.phoneNumber} disabled={editingSection !== 'reminder'} onChange={(event) => setFormState((current) => ({ ...current, gym: { ...current.gym, reminderSettings: { ...current.gym.reminderSettings, phoneNumber: event.target.value } } }))} />
            <Field label="Sender Email" value={formState.gym.reminderSettings?.gmail} disabled={editingSection !== 'reminder'} onChange={(event) => setFormState((current) => ({ ...current, gym: { ...current.gym, reminderSettings: { ...current.gym.reminderSettings, gmail: event.target.value } } }))} />
          </div>
        </ProfileSection>

        <ProfileSection
          title="Billing Info"
          editing={editingSection === 'billing'}
          onEdit={() => setEditingSection('billing')}
          onCancel={cancelSection}
          onSave={() => saveSection('billing')}
          saving={savingSection === 'billing'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Billing Prefix" value={formState.gym.billingInfo?.billingIdPrefix} disabled={editingSection !== 'billing'} onChange={(event) => setFormState((current) => ({ ...current, gym: { ...current.gym, billingInfo: { ...current.gym.billingInfo, billingIdPrefix: event.target.value } } }))} />
            <Field label="Help Contact" value={formState.gym.billingInfo?.helpContact} disabled={editingSection !== 'billing'} onChange={(event) => setFormState((current) => ({ ...current, gym: { ...current.gym, billingInfo: { ...current.gym.billingInfo, helpContact: event.target.value } } }))} />
            <Field label="Billing GST" value={formState.gym.billingInfo?.gst} disabled={editingSection !== 'billing'} onChange={(event) => setFormState((current) => ({ ...current, gym: { ...current.gym, billingInfo: { ...current.gym.billingInfo, gst: event.target.value } } }))} />
            <Field label="Logo Path" value={formState.gym.billingInfo?.logo} disabled />
            <div className="md:col-span-2">
              <Field label="Address On Bill" value={formState.gym.billingInfo?.addressOnBill} textarea disabled={editingSection !== 'billing'} onChange={(event) => setFormState((current) => ({ ...current, gym: { ...current.gym, billingInfo: { ...current.gym.billingInfo, addressOnBill: event.target.value } } }))} />
            </div>
            <Field label="Regards" value={formState.gym.billingInfo?.regards} disabled={editingSection !== 'billing'} onChange={(event) => setFormState((current) => ({ ...current, gym: { ...current.gym, billingInfo: { ...current.gym.billingInfo, regards: event.target.value } } }))} />
            <Field label="Greeting Text" value={formState.gym.billingInfo?.greetingText} disabled={editingSection !== 'billing'} onChange={(event) => setFormState((current) => ({ ...current, gym: { ...current.gym, billingInfo: { ...current.gym.billingInfo, greetingText: event.target.value } } }))} />
          </div>
        </ProfileSection>
      </div>
    </div>
  );
};

export default Profile;
