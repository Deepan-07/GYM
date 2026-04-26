import React, { useMemo, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../hooks/useAuth';

const phoneError = 'Enter a valid 10-digit Indian mobile number';
const phoneRegex = /^[6-9]\d{9}$/;
const passwordError = 'Password must be at least 8 characters with 1 uppercase and 1 number';
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const handlePhoneInput = (e) => {
  let val = e.target.value.replace(/\D/g, '');
  e.target.value = val.slice(0, 10);
};

// TimeInput: stores time as "H:MM AM" / "H:MM PM" directly — no 24h conversion
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ['00', '15', '30', '45'];

const TimeInput = ({ fieldHour, fieldMinute, fieldAmpm, register, setValue, watch }) => {
  const hour = watch(fieldHour) || '6';
  const minute = watch(fieldMinute) || '00';
  const ampm = watch(fieldAmpm) || 'AM';

  return (
    <div className="flex items-center gap-2">
      <select
        {...register(fieldHour)}
        onChange={e => setValue(fieldHour, e.target.value)}
        className="input-field py-2 appearance-none cursor-pointer flex-1"
      >
        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-gray-400 font-bold">:</span>
      <select
        {...register(fieldMinute)}
        onChange={e => setValue(fieldMinute, e.target.value)}
        className="input-field py-2 appearance-none cursor-pointer flex-1"
      >
        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select
        {...register(fieldAmpm)}
        onChange={e => setValue(fieldAmpm, e.target.value)}
        className="input-field py-2 appearance-none cursor-pointer w-20"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

const optionalUrl = yup.string().trim().test(
  'optional-url',
  'Please enter a valid URL',
  (value) => !value || /^https?:\/\/.+/i.test(value)
);

const schema = yup.object({
  gymIdPrefix: yup.string().trim().required('Gym ID prefix is required').max(3, 'Max 3 chars').matches(/^[A-Z]{3}$/, 'Exactly 3 uppercase letters'),
  gymName: yup.string().trim().required('Gym name is required').max(20, 'Max 20 chars'),
  gymEmail: yup.string().trim().email('Please enter a valid email address').required('Gym email is required'),
  gymContact: yup.string().matches(phoneRegex, phoneError).required(phoneError),
  address: yup.string().trim().required('Address is required').max(100, 'Max 100 chars'),
  location: yup.string().trim().required('Location is required').max(20, 'Max 20 chars'),
  gst: yup.string().trim().nullable(),
  gymType: yup.string().trim().nullable().max(20, 'Max 20 chars'),
  tagline: yup.string().trim().nullable().max(20, 'Max 20 chars'),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  websiteUrl: optionalUrl,
  operatingDays: yup.array().of(yup.string()).nullable(),
  operatingOpenHour: yup.string().nullable(),
  operatingOpenMinute: yup.string().nullable(),
  operatingOpenAmpm: yup.string().nullable(),
  operatingCloseHour: yup.string().nullable(),
  operatingCloseMinute: yup.string().nullable(),
  operatingCloseAmpm: yup.string().nullable(),
  password: yup.string().min(8, passwordError).max(20, 'Max 20 chars').matches(/^(?=.*[A-Z])(?=.*\d).+$/, passwordError).required(passwordError),
  confirmPassword: yup.string().max(20, 'Max 20 chars').oneOf([yup.ref('password')], 'Passwords do not match').required('Please confirm your password'),
  name: yup.string().trim().required('Owner name is required').max(20, 'Max 20 chars'),
  mobileNo: yup.string().matches(phoneRegex, phoneError).required(phoneError),
  mailId: yup.string().trim().email('Please enter a valid email address').required('Email is required'),
  whatsappNumber: yup.string().matches(phoneRegex, phoneError).required(phoneError),
  phoneNumber: yup.string().matches(phoneRegex, phoneError).required(phoneError),
  gmail: yup.string().trim().email('Please enter a valid email address').required('Email is required'),
  billingIdPrefix: yup.string().trim().required('Billing prefix is required').max(5, 'Max 5 chars').matches(/^[A-Za-z0-9]+$/, 'Alphanumeric only'),
  helpContact: yup.string().matches(phoneRegex, phoneError).required(phoneError),
  addressOnBill: yup.string().trim().required('Billing address is required').max(100, 'Max 100 chars'),
  regards: yup.string().trim().required('Regards text is required').max(20, 'Max 20 chars'),
  greetingText: yup.string().trim().required('Greeting text is required').max(20, 'Max 20 chars'),
  logo: yup.mixed().nullable()
});

const stepRequiredFields = {
  1: ['gymIdPrefix', 'gymName', 'gymEmail', 'gymContact', 'address', 'location', 'password', 'confirmPassword'],
  2: ['name', 'mobileNo', 'mailId'],
  3: ['whatsappNumber', 'phoneNumber', 'gmail'],
  4: ['billingIdPrefix', 'helpContact', 'addressOnBill', 'regards', 'greetingText']
};

const stepAllFields = {
  1: ['gymIdPrefix', 'gymName', 'gymEmail', 'gymContact', 'address', 'location', 'gst', 'gymType', 'tagline', 'instagramUrl', 'facebookUrl', 'websiteUrl', 'operatingDays', 'operatingOpenHour', 'operatingOpenMinute', 'operatingOpenAmpm', 'operatingCloseHour', 'operatingCloseMinute', 'operatingCloseAmpm', 'password', 'confirmPassword'],
  2: ['name', 'mobileNo', 'mailId'],
  3: ['whatsappNumber', 'phoneNumber', 'gmail'],
  4: ['billingIdPrefix', 'helpContact', 'addressOnBill', 'regards', 'greetingText', 'logo']
};

const GymRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [logoName, setLogoName] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    trigger,
    handleSubmit,
    watch,
    setValue,
    setError,
    setFocus,
    formState: { errors, touchedFields, isSubmitted }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      operatingDays: []
    },
    mode: 'onTouched',
    reValidateMode: 'onChange'
  });

  const values = watch();

  const showFieldError = (field) => Boolean(errors[field]);
  const fieldClassName = (field, extra = '') => `input-field ${extra} ${showFieldError(field) ? 'border-red-500 focus:ring-2 focus:ring-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : ''}`.trim();

  const isFieldFilled = (field) => {
    const value = values[field];

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== undefined && value !== null && String(value).trim() !== '';
  };

  const isStepDisabled = useMemo(() => {
    const requiredFields = stepRequiredFields[step];
    const fieldsForErrors = stepAllFields[step];
    const hasMissingRequired = requiredFields.some((field) => !isFieldFilled(field));
    const hasStepErrors = fieldsForErrors.some((field) => Boolean(errors[field]));

    return hasMissingRequired || hasStepErrors || loading;
  }, [errors, loading, step, values]);

  const handleNext = async () => {
    const isStepValid = await trigger(stepRequiredFields[step]);

    if (isStepValid) {
      if (step === 1) {
        setLoading(true);
        try {
          await api.post('/auth/check-exists', { email: values.gymEmail, phone: values.gymContact });
          setStep((currentStep) => currentStep + 1);
        } catch (err) {
          if (err.response?.status === 409) {
            toast.error(err.response.data.message);
            if (err.response.data.message.toLowerCase().includes('email')) {
              setError('gymEmail', { type: 'manual', message: 'Email already exists' });
            } else {
              setError('gymContact', { type: 'manual', message: 'Phone number already exists' });
            }
          }
        } finally {
          setLoading(false);
        }
      } else {
        setStep((currentStep) => currentStep + 1);
      }
    } else {
      setTimeout(() => {
        const firstErrorField = stepRequiredFields[step].find(field => document.querySelector(`[name="${field}"]`)?.classList.contains('border-red-500'));
        if (firstErrorField) {
          setFocus(firstErrorField);
          document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  const handlePrev = () => setStep((currentStep) => currentStep - 1);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const formData = new FormData();
      const socialMediaLinks = [
        { platform: 'instagram', url: data.instagramUrl?.trim() },
        { platform: 'facebook', url: data.facebookUrl?.trim() },
        { platform: 'website', url: data.websiteUrl?.trim() }
      ].filter((item) => item.url);

      const buildTime = (hour, minute, ampm) => {
        if (!hour) return '';
        return `${hour}:${minute || '00'} ${ampm || 'AM'}`;
      };

      const operatingHours = {
        open: buildTime(data.operatingOpenHour, data.operatingOpenMinute, data.operatingOpenAmpm),
        close: buildTime(data.operatingCloseHour, data.operatingCloseMinute, data.operatingCloseAmpm)
      };

      Object.entries({
        gymIdPrefix: data.gymIdPrefix,
        gymName: data.gymName,
        gymEmail: data.gymEmail,
        gymContact: data.gymContact,
        address: data.address,
        location: data.location,
        gst: data.gst || '',
        gymType: data.gymType || '',
        tagline: data.tagline || '',
        password: data.password,
        confirmPassword: data.confirmPassword,
        name: data.name,
        mobileNo: data.mobileNo,
        mailId: data.mailId,
        whatsappNumber: data.whatsappNumber,
        phoneNumber: data.phoneNumber,
        gmail: data.gmail,
        billingIdPrefix: data.billingIdPrefix,
        helpContact: data.helpContact,
        addressOnBill: data.addressOnBill,
        regards: data.regards,
        greetingText: data.greetingText,
        socialMediaLinks: JSON.stringify(socialMediaLinks),
        operatingDays: JSON.stringify(data.operatingDays || []),
        operatingHours: JSON.stringify(operatingHours)
      }).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (data.logo?.[0]) {
        formData.append('logo', data.logo[0]);
      }

      const res = await api.post('/auth/gym/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { gymId, token } = res.data.data;

      login(token, 'owner');

      toast.success('Registration successful');
      navigate('/registration-success', { state: { gymId } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark to-slate-900 py-12 px-4">
      <div className="card w-full max-w-3xl relative z-10 backdrop-blur-xl bg-card/80 border-gray-700/50">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Gym Owner Registration</h2>

        {/* Progress Bar */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -z-10 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 transform -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          {[1, 2, 3, 4].map(num => (
            <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= num ? 'bg-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-gray-800 text-gray-400 border border-gray-600'}`}>
              {num}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2"><h3 className="text-xl text-white mb-2 border-b border-gray-700 pb-2">Gym Details</h3></div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Client ID Prefix <span className="text-red-500">*</span></p>
                <input {...register('gymIdPrefix')} placeholder="E.g. DNB" className={fieldClassName('gymIdPrefix', 'uppercase')} maxLength="3" />
                <p className="text-[10px] text-gray-500 mt-0.5 whitespace-nowrap">This prefix will be used for all member IDs in your gym.</p>
                {showFieldError('gymIdPrefix') && <p className="text-red-500 text-xs mt-1">{errors.gymIdPrefix.message}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Gym Name <span className="text-red-500">*</span></p>
                <input {...register('gymName')} placeholder="Gym Name" className={fieldClassName('gymName')} maxLength="20" />
                {showFieldError('gymName') && <p className="text-red-500 text-xs mt-1">{errors.gymName.message}</p>}
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Gym Email <span className="text-red-500">*</span></p>
                <input {...register('gymEmail')} type="email" placeholder="Gym Email" className={fieldClassName('gymEmail')} />
                {showFieldError('gymEmail') && <p className="text-red-500 text-xs mt-1">{errors.gymEmail.message}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Gym Contact <span className="text-red-500">*</span></p>
                <input {...register('gymContact')} type="tel" placeholder="10-digit contact number" className={fieldClassName('gymContact')} onInput={handlePhoneInput} maxLength="10" />
                {showFieldError('gymContact') && <p className="text-red-500 text-xs mt-1">{errors.gymContact.message}</p>}
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 mb-1">Address <span className="text-red-500">*</span></p>
                <textarea {...register('address')} placeholder="Full address" className={fieldClassName('address', 'h-20 resize-none')} maxLength="100" />
                {showFieldError('address') && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Location <span className="text-red-500">*</span></p>
                <input {...register('location')} placeholder="City / Location" className={fieldClassName('location')} maxLength="20" />
                {showFieldError('location') && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">GST Number (Optional)</p>
                <input {...register('gst')} placeholder="GST Number" className="input-field" />
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Gym Type (Optional)</p>
                <input {...register('gymType')} placeholder="E.g. CrossFit, Fitness Studio" className="input-field" maxLength="20" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Tagline (Optional)</p>
                <input {...register('tagline')} placeholder="Short brand tagline" className="input-field" maxLength="20" />
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Instagram URL (Optional)</p>
                <input {...register('instagramUrl')} placeholder="https://instagram.com/yourgym" className={fieldClassName('instagramUrl')} />
                {showFieldError('instagramUrl') && <p className="text-red-500 text-xs mt-1">{errors.instagramUrl.message}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Facebook URL (Optional)</p>
                <input {...register('facebookUrl')} placeholder="https://facebook.com/yourgym" className={fieldClassName('facebookUrl')} />
                {showFieldError('facebookUrl') && <p className="text-red-500 text-xs mt-1">{errors.facebookUrl.message}</p>}
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 mb-1">Website URL (Optional)</p>
                <input {...register('websiteUrl')} placeholder="https://yourgym.com" className={fieldClassName('websiteUrl')} />
                {showFieldError('websiteUrl') && <p className="text-red-500 text-xs mt-1">{errors.websiteUrl.message}</p>}
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 mb-2">Operating Days (Optional)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {weekDays.map((day) => (
                    <label key={day} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
                      <input type="checkbox" value={day} {...register('operatingDays')} className="accent-primary" />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Opening Time (Optional)</p>
                <TimeInput
                  fieldHour="operatingOpenHour"
                  fieldMinute="operatingOpenMinute"
                  fieldAmpm="operatingOpenAmpm"
                  register={register}
                  setValue={setValue}
                  watch={watch}
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Closing Time (Optional)</p>
                <TimeInput
                  fieldHour="operatingCloseHour"
                  fieldMinute="operatingCloseMinute"
                  fieldAmpm="operatingCloseAmpm"
                  register={register}
                  setValue={setValue}
                  watch={watch}
                />
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Password <span className="text-red-500">*</span></p>
                <input {...register('password')} type="password" placeholder="Password" className={fieldClassName('password')} maxLength="20" />
                {showFieldError('password') && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Confirm Password <span className="text-red-500">*</span></p>
                <input {...register('confirmPassword')} type="password" placeholder="Confirm Password" className={fieldClassName('confirmPassword')} maxLength="20" />
                {showFieldError('confirmPassword') && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2"><h3 className="text-xl text-white mb-2 border-b border-gray-700 pb-2">Owner Details</h3></div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Owner Full Name <span className="text-red-500">*</span></p>
                <input {...register('name')} placeholder="Owner Full Name" className={fieldClassName('name')} maxLength="20" />
                {showFieldError('name') && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Personal Mobile Number <span className="text-red-500">*</span></p>
                <input {...register('mobileNo')} type="tel" placeholder="10-digit mobile number" className={fieldClassName('mobileNo')} onInput={handlePhoneInput} maxLength="10" />
                {showFieldError('mobileNo') && <p className="text-red-500 text-xs mt-1">{errors.mobileNo.message}</p>}
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 mb-1">Personal Email <span className="text-red-500">*</span></p>
                <input {...register('mailId')} type="email" placeholder="Owner email address" className={fieldClassName('mailId')} />
                {showFieldError('mailId') && <p className="text-red-500 text-xs mt-1">{errors.mailId.message}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2"><h3 className="text-xl text-white mb-2 border-b border-gray-700 pb-2">Reminder Settings</h3></div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-400 mb-4">These contacts are used by the reminder system for outbound communication.</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">WhatsApp Number <span className="text-red-500">*</span></p>
                <input {...register('whatsappNumber')} type="tel" placeholder="10-digit WhatsApp number" className={fieldClassName('whatsappNumber')} onInput={handlePhoneInput} maxLength="10" />
                {showFieldError('whatsappNumber') && <p className="text-red-500 text-xs mt-1">{errors.whatsappNumber.message}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">SMS Source Number <span className="text-red-500">*</span></p>
                <input {...register('phoneNumber')} type="tel" placeholder="10-digit SMS number" className={fieldClassName('phoneNumber')} onInput={handlePhoneInput} maxLength="10" />
                {showFieldError('phoneNumber') && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 mb-1">Sender Email <span className="text-red-500">*</span></p>
                <input {...register('gmail')} type="email" placeholder="Email used for reminders" className={fieldClassName('gmail')} />
                {showFieldError('gmail') && <p className="text-red-500 text-xs mt-1">{errors.gmail.message}</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="md:col-span-2"><h3 className="text-xl text-white mb-2 border-b border-gray-700 pb-2">Billing Details</h3></div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Billing Prefix <span className="text-red-500">*</span></p>
                <input {...register('billingIdPrefix')} placeholder="E.g. INV" className={fieldClassName('billingIdPrefix', 'uppercase')} maxLength="5" />
                {showFieldError('billingIdPrefix') && <p className="text-red-500 text-xs mt-1">{errors.billingIdPrefix.message}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Helpdesk Contact <span className="text-red-500">*</span></p>
                <input {...register('helpContact')} type="tel" placeholder="10-digit support number" className={fieldClassName('helpContact')} onInput={handlePhoneInput} maxLength="10" />
                {showFieldError('helpContact') && <p className="text-red-500 text-xs mt-1">{errors.helpContact.message}</p>}
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 mb-1">Address on Bill <span className="text-red-500">*</span></p>
                <textarea {...register('addressOnBill')} placeholder="Address visible on invoices" className={fieldClassName('addressOnBill', 'h-20 resize-none')} maxLength="25" />
                {showFieldError('addressOnBill') && <p className="text-red-500 text-xs mt-1">{errors.addressOnBill.message}</p>}
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Regards Text <span className="text-red-500">*</span></p>
                <input {...register('regards')} placeholder="Regards, Team Example Gym" className={fieldClassName('regards')} maxLength="20" />
                {showFieldError('regards') && <p className="text-red-500 text-xs mt-1">{errors.regards.message}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Greeting Message <span className="text-red-500">*</span></p>
                <input {...register('greetingText')} placeholder="Thank you for training with us" className={fieldClassName('greetingText')} maxLength="20" />
                {showFieldError('greetingText') && <p className="text-red-500 text-xs mt-1">{errors.greetingText.message}</p>}
              </div>

              <div className="md:col-span-2">
                <p className="text-xs text-gray-400 mb-1">Logo Upload (Optional)</p>
                <label className="block border border-dashed border-gray-600 rounded-lg px-4 py-4 bg-gray-800/40 cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register('logo')}
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setValue('logo', event.target.files, { shouldDirty: true });
                      setLogoName(file ? file.name : '');
                    }}
                  />
                  <span className="text-sm text-white">{logoName || 'Choose a logo file'}</span>
                  <p className="text-xs text-gray-400 mt-1">Accepted formats: image files up to 5MB</p>
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-gray-700 mt-6">
            {step > 1 ? (
              <Button type="button" variant="secondary" onClick={handlePrev}>Back</Button>
            ) : <div></div>}

            {step < 4 ? (
              <Button type="button" onClick={handleNext} className="ml-auto" isLoading={loading}>Next</Button>
            ) : (
              <Button type="button" onClick={async () => {
                const valid = await trigger(stepRequiredFields[step]);
                if (valid) handleSubmit(onSubmit)();
              }} isLoading={loading} className="ml-auto">Complete Registration</Button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Already registered? <Link to="/login" className="text-primary hover:underline ml-1">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default GymRegister;
